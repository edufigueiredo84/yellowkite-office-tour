import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, Group, LatheGeometry, MeshStandardMaterial, QuadraticBezierCurve3, SphereGeometry, SplineCurve, TubeGeometry, Vector2, Vector3 } from 'three'
import type { Appearance, NPCState, Vec3 } from '../data/characters'
import { useGame } from '../game/store'
import { advanceMotion, characterSeed, clamp, createMotion, damp, eyeOpenness } from './motion'
import type { Attention } from './motion'

// Generic stand-ins, not portraits. Share geometry/materials across the four rigs.
const surfaces = new Map<string, MeshStandardMaterial>()
function material(color: string, roughness: number, shade = 1) {
  const key = `${color}:${roughness}:${shade}`
  if (!surfaces.has(key)) surfaces.set(key, new MeshStandardMaterial({ color: new Color(color).multiplyScalar(shade), roughness }))
  return surfaces.get(key)!
}
const sphere = new SphereGeometry(1, 20, 14)
function profile(points: [number, number][], depth = 1) {
  const curve = new SplineCurve(points.map(([radius, y]) => new Vector2(radius, y)))
  const geometry = new LatheGeometry(curve.getPoints(points.length * 3).map(p => new Vector2(Math.max(0, p.x), p.y)), 24)
  geometry.scale(1, 1, depth)
  return geometry
}
const torso = profile([[0, 0], [.155, 0], [.178, .025], [.168, .13], [.192, .30], [.218, .39], [.211, .435], [.13, .47], [.065, .485], [0, .485]], .62)
const leg = profile([[0, 0], [.052, 0], [.059, .035], [.063, .19], [.066, .34], [.078, .46], [.088, .62], [.079, .73], [0, .75]], 1.08)
const sleeve = profile([[0, -.235], [.056, -.235], [.064, -.18], [.072, -.06], [.061, .025], [0, .05]], 1.05)
const forearm = profile([[0, -.26], [.029, -.26], [.036, -.20], [.046, -.10], [.047, -.025], [.038, 0], [0, .012]], .90)
const skull = profile([[0, .012], [.042, .018], [.068, .047], [.087, .094], [.096, .15], [.093, .208], [.072, .249], [.03, .27], [0, .274]], .94)
const shoe = material('#393c37', .76)
const sole = material('#a39a89', .94)
const eyeWhite = material('#d4c9b3', .65)
const iris = material('#453b2d', .48)
const pupil = material('#181d1b', .42)
const mouth = new TubeGeometry(new QuadraticBezierCurve3(new Vector3(-.026, .067, .073), new Vector3(0, .058, .082), new Vector3(.026, .067, .073)), 12, .0018, 5)

function Form({ position = [0, 0, 0], scale, surface, rotation }: { position?: Vec3; scale: Vec3; surface: MeshStandardMaterial; rotation?: Vec3 }) {
  return <mesh position={position} scale={scale} rotation={rotation} geometry={sphere} material={surface} castShadow receiveShadow dispose={null} />
}

function Hand({ skin, side }: { skin: MeshStandardMaterial; side: number }) {
  return <group>
    <Form position={[0, -.03, 0]} scale={[.032, .047, .018]} surface={skin} />
    {[-1.5, -.5, .5, 1.5].map((finger, index) => <Form key={finger}
      position={[finger * .014, -.083 + Math.abs(finger) * .007, .004]}
      scale={[.008, index === 0 || index === 3 ? .026 : .031, .009]} surface={skin} />)}
    <Form position={[-side * .032, -.035, .009]} scale={[.012, .029, .013]} rotation={[.15, 0, -side * .45]} surface={skin} />
  </group>
}

export function ProceduralCharacter({ state, appearance, attention, id }: {
  state: React.RefObject<NPCState>; appearance: Appearance; attention: React.RefObject<Attention>; id: string
}) {
  const upperBody = useRef<Group>(null)
  const head = useRef<Group>(null)
  const eyes = useRef<Group>(null)
  const rightArm = useRef<Group>(null)
  const leftArm = useRef<Group>(null)
  const elbow = useRef<Group>(null)
  const wrist = useRef<Group>(null)
  const motion = useRef(createMotion())
  const seed = useMemo(() => characterSeed(id), [id])
  const skin = material(appearance.skin, .72)
  const lips = material(appearance.skin, .83, .64)
  const hair = material(appearance.hair, .9)
  const hairLight = material(appearance.hair, .85, 1.12)
  const shirt = material(appearance.top, .97)
  const seam = material(appearance.top, 1, .81)
  const trousers = material(appearance.bottom, .95)

  useFrame((_, delta) => {
    if (useGame.getState().phase !== 'playing') return
    const dt = advanceMotion(motion.current, state.current, attention.current.engaged, delta)
    const t = motion.current.time + seed * 12
    const wave = motion.current.wave
    const talking = state.current === 'TALKING'
    const look = attention.current
    if (upperBody.current) {
      upperBody.current.position.y = .90 + Math.sin(t * 1.55) * .0025
      upperBody.current.rotation.z = Math.sin(t * .65) * .008
      upperBody.current.rotation.y = damp(upperBody.current.rotation.y, clamp(look.yaw * .36, -.42, .42), 2.6, dt)
      upperBody.current.scale.z = 1 + Math.sin(t * 1.55) * .007
    }
    if (head.current) {
      head.current.rotation.y = damp(head.current.rotation.y, clamp(look.yaw - (upperBody.current?.rotation.y ?? 0), -.85, .85), 7, dt)
      const nod = talking ? Math.sin(t * 2.4) * .028 + Math.sin(t * 4.1) * .01 : Math.sin(t * .8) * .008
      head.current.rotation.x = damp(head.current.rotation.x, clamp(look.pitch, -.22, .28) + nod, 6, dt)
      head.current.rotation.z = damp(head.current.rotation.z, talking ? -.025 : Math.sin(t * .6) * .012, 4, dt)
    }
    if (eyes.current) eyes.current.scale.y = eyeOpenness(motion.current.time, seed)
    if (rightArm.current) {
      rightArm.current.rotation.z = damp(rightArm.current.rotation.z, .07 + wave * 1.12, 7, dt)
      rightArm.current.rotation.x = damp(rightArm.current.rotation.x, -.04 - wave * .24 - (talking ? .12 + Math.sin(t * 1.9) * .065 : 0), 6, dt)
    }
    if (elbow.current) {
      elbow.current.rotation.z = damp(elbow.current.rotation.z, wave * 1.28, 7, dt)
      elbow.current.rotation.x = damp(elbow.current.rotation.x, -.12 - (talking ? .30 + Math.sin(t * 1.9) * .16 : 0), 6, dt)
    }
    if (wrist.current) wrist.current.rotation.z = damp(wrist.current.rotation.z, wave * Math.sin(motion.current.greetingTime * 9) * .22, 12, dt)
    if (leftArm.current) leftArm.current.rotation.x = -.07 + Math.sin(t * 1.1) * .016
  })

  return <group name={`character-${id}`} dispose={null}>
    {[-1, 1].map(side => <group key={side} position={[side * .092, 0, 0]} rotation={[0, side * .065, 0]}>
      <mesh position={[0, .145, 0]} geometry={leg} material={trousers} castShadow receiveShadow />
      <Form position={[0, .031, .035]} scale={[.069, .029, .139]} surface={sole} />
      <Form position={[0, .071, .032]} scale={[.065, .052, .13]} surface={shoe} />
      <Form position={[0, .12, -.015]} scale={[.053, .064, .062]} surface={shoe} />
    </group>)}
    <Form position={[0, .877, -.005]} scale={[.18, .105, .116]} surface={trousers} />
    <group ref={upperBody} name="torso" position={[0, .9, 0]}>
      <mesh geometry={torso} material={shirt} castShadow receiveShadow />
      <Form position={[0, .25, .122]} scale={[.008, .185, .003]} surface={seam} />
      {[.13, .23, .33].map(y => <Form key={y} position={[0, y, .127]} scale={[.004, .004, .003]} surface={seam} />)}
      <Form position={[0, .495, 0]} scale={[.049, .065, .05]} surface={skin} />
      {[-1, 1].map(side => <Form key={side} position={[side * .046, .468, .046]}
        scale={[.042, .016, .057]} rotation={[.22, side * -.4, side * -.30]} surface={seam} />)}

      <group ref={head} name="head" position={[0, .53, 0]}>
        <mesh geometry={skull} material={skin} castShadow receiveShadow />
        {[-1, 1].map(side => <Form key={side} position={[side * .095, .125, 0]} scale={[.016, .028, .02]} surface={skin} />)}
        <Form position={[0, .134, .089]} scale={[.013, .035, .019]} surface={skin} />
        <Form position={[0, .11, .105]} scale={[.017, .014, .014]} surface={skin} />
        <mesh geometry={mouth} material={lips} />
        <group ref={eyes} name="eyes" position={[0, .157, 0]}>
          {[-1, 1].map(side => <group key={side} position={[side * .037, 0, .083]} rotation={[0, side * .13, 0]}>
            <Form scale={[.019, .007, .006]} surface={eyeWhite} />
            <Form position={[0, 0, .005]} scale={[.0065, .0065, .0025]} surface={iris} />
            <Form position={[0, 0, .007]} scale={[.003, .004, .001]} surface={pupil} />
          </group>)}
        </group>
        {[-1, 1].map(side => <Form key={side} position={[side * .037, .177, .082]} scale={[.022, .0035, .004]}
          rotation={[0, side * .13, side * -.08]} surface={hair} />)}
        <Form position={[0, .227, -.018]} scale={[.10, .063, .085]} surface={hair} />
        <Form position={[0, .16, -.055]} scale={[.095, .093, .061]} surface={hair} />
        <Form position={[-.027, .222, .046]} scale={[.069, .041, .035]} rotation={[0, 0, -.18]} surface={hairLight} />
        {[-1, 1].map(side => <Form key={side} position={[side * .084, .177, -.01]} scale={[.019, .063, .054]} surface={hair} />)}
        {appearance.hairStyle === 'long' && <>
          <Form position={[0, .013, -.079]} scale={[.10, .14, .048]} surface={hair} />
          {[-1, 1].map(side => <Form key={side} position={[side * .087, .04, -.042]} scale={[.031, .14, .038]} surface={hair} />)}
        </>}
        {appearance.hairStyle === 'tied' && <>
          <Form position={[0, .174, -.128]} scale={[.044, .047, .044]} surface={hairLight} />
          <Form position={[0, .065, -.133]} scale={[.032, .095, .031]} rotation={[-.12, 0, 0]} surface={hair} />
        </>}
      </group>

      {[-1, 1].map(side => <group key={side} ref={side === 1 ? rightArm : leftArm} name={side === 1 ? 'right-shoulder' : 'left-shoulder'}
        position={[side * .216, .434, 0]} rotation={[-.06, 0, side * .07]}>
        <mesh geometry={sleeve} material={shirt} castShadow receiveShadow />
        <Form position={[0, -.25, 0]} scale={[.047, .057, .046]} surface={skin} />
        <group ref={side === 1 ? elbow : undefined} name={side === 1 ? 'right-elbow' : 'left-elbow'} position={[0, -.273, 0]} rotation={[-.12, 0, 0]}>
          <mesh geometry={forearm} material={skin} castShadow receiveShadow />
          <group ref={side === 1 ? wrist : undefined} name={side === 1 ? 'right-wrist' : 'left-wrist'} position={[0, -.258, 0]}>
            <Hand skin={skin} side={side} />
          </group>
        </group>
      </group>)}
    </group>
  </group>
}
