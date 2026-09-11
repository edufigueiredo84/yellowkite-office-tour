import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, MeshStandardMaterial, TubeGeometry, QuadraticBezierCurve3, Vector3 } from 'three'
import { Box } from '../world/primitives'
import type { Appearance, NPCState, Vec3 } from '../data/characters'
import { useGame } from '../game/store'

// Placeholder body. It is deliberately generic: it stands in for a person until an
// approved model exists and is not meant to resemble anyone at the agency.

const materials = new Map<string, MeshStandardMaterial>()
function material(color: string, roughness: number) {
  const key = `${color}:${roughness}`
  if (!materials.has(key)) materials.set(key, new MeshStandardMaterial({ color, roughness }))
  return materials.get(key)!
}

const smile = new TubeGeometry(new QuadraticBezierCurve3(
  new Vector3(-0.037, 0, 0), new Vector3(0, -0.017, 0.006), new Vector3(0.037, 0, 0)), 10, 0.003, 5, false)
const dark = new MeshStandardMaterial({ color: '#35332c', roughness: 1 })

function Form({ position, scale, material: surface }: { position: Vec3; scale: Vec3; material: MeshStandardMaterial }) {
  return <mesh position={position} scale={scale} material={surface} castShadow><sphereGeometry args={[1, 20, 14]} /></mesh>
}

export function TemporaryCharacter({ state, appearance }: { state: React.RefObject<NPCState>; appearance: Appearance }) {
  const upperBody = useRef<Group>(null)
  const arm = useRef<Group>(null)
  const time = useRef(0)
  const skin = material(appearance.skin, 0.9)
  const hair = material(appearance.hair, 0.98)
  const shirt = material(appearance.top, 1)
  const trousers = material(appearance.bottom, 0.95)
  useFrame((_, delta) => {
    if (useGame.getState().phase !== 'playing') return
    time.current += delta
    const greeting = state.current === 'LOOK_AT_PLAYER' || state.current === 'PLAYER_NEARBY'
    if (upperBody.current) upperBody.current.position.y = Math.sin(time.current * 1.8) * 0.004
    if (arm.current) {
      const target = greeting ? -2.4 + Math.sin(time.current * 7) * 0.16 : -0.08
      arm.current.rotation.z += (target - arm.current.rotation.z) * Math.min(1, delta * 6)
    }
  })
  return <group>
    {[-0.105, 0.105].map(x => <group key={x}>
      <Form position={[x, 0.63, 0]} scale={[0.091, 0.25, 0.107]} material={trousers} />
      <Form position={[x, 0.28, 0.01]} scale={[0.071, 0.23, 0.076]} material={trousers} />
      <Box position={[x, 0.065, 0.055]} size={[0.16, 0.12, 0.29]} color="#cbbda7" rounded shadow />
    </group>)}
    <Form position={[0, 0.83, 0]} scale={[0.205, 0.15, 0.13]} material={trousers} />
    <group ref={upperBody}>
      <Form position={[0, 1.07, 0]} scale={[0.22, 0.265, 0.143]} material={shirt} />
      <Form position={[0, 1.285, 0]} scale={[0.23, 0.085, 0.13]} material={shirt} />
      <Form position={[0, 1.375, 0]} scale={[0.058, 0.095, 0.055]} material={skin} />
      <Form position={[0, 1.53, 0]} scale={[0.125, 0.165, 0.117]} material={skin} />
      <Form position={[0, 1.59, -0.027]} scale={[0.134, 0.127, 0.12]} material={hair} />
      <Form position={[0, 1.53, -0.133]} scale={[0.083, 0.083, 0.065]} material={hair} />
      <Form position={[-0.106, 1.537, 0.011]} scale={[0.03, 0.073, 0.087]} material={hair} />
      <Form position={[0.106, 1.537, 0.011]} scale={[0.027, 0.073, 0.087]} material={hair} />
      {appearance.hairStyle === 'long' && <>
        <Form position={[0, 1.4, -0.12]} scale={[0.125, 0.14, 0.075]} material={hair} />
        <Form position={[0, 1.26, -0.115]} scale={[0.108, 0.1, 0.062]} material={hair} />
      </>}
      {appearance.hairStyle === 'tied' && <Form position={[0, 1.53, -0.185]} scale={[0.058, 0.058, 0.052]} material={hair} />}
      <Form position={[0, 1.515, 0.111]} scale={[0.019, 0.026, 0.023]} material={skin} />
      {[-0.043, 0.043].map(x => <Form key={x} position={[x, 1.553, 0.107]} scale={[0.009, 0.007, 0.004]} material={dark} />)}
      <mesh geometry={smile} material={dark} position={[0, 1.475, 0.11]} />
      <group position={[-0.225, 1.27, 0]} rotation={[0, 0, -0.07]}>
        <Form position={[0, -0.13, 0]} scale={[0.065, 0.16, 0.07]} material={shirt} />
        <Form position={[0, -0.35, 0.025]} scale={[0.042, 0.13, 0.046]} material={skin} />
        <Form position={[0, -0.47, 0.028]} scale={[0.041, 0.065, 0.026]} material={skin} />
      </group>
      <group ref={arm} position={[0.225, 1.27, 0]}>
        <Form position={[0, -0.13, 0]} scale={[0.065, 0.16, 0.07]} material={shirt} />
        <Form position={[0, -0.35, 0.025]} scale={[0.042, 0.13, 0.046]} material={skin} />
        <Form position={[0, -0.47, 0.028]} scale={[0.041, 0.065, 0.026]} material={skin} />
      </group>
    </group>
  </group>
}
