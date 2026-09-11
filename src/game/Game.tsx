import { Suspense, useEffect, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import { ACESFilmicToneMapping, Raycaster, Vector2 } from 'three'
import type { Object3D, PerspectiveCamera } from 'three'
import { Office } from '../world/Office'
import { Player } from '../player/Player'
import { InteractionManager } from '../interactions/InteractionManager'
import { NPC } from '../characters/NPC'
import { characters } from '../data/characters'
import { useGame } from './store'
import { playerRuntime } from '../player/runtime'
import { doorTelemetry, doorStates } from '../world/Door'

function Diagnostics() {
  const { gl, camera, scene } = useThree()
  const samples = useRef({ elapsed: 0, frames: 0 })
  useEffect(() => {
    useGame.getState().setReady()
    if (!import.meta.env.DEV || !new URLSearchParams(location.search).has('test')) return
    const harness = {
      snapshot: () => ({
        position: playerRuntime.position.toArray(), yaw: playerRuntime.yaw, pitch: playerRuntime.pitch,
        door: { ...doorTelemetry }, doors: { ...doorStates }, game: { ...useGame.getState() },
        render: { calls: gl.info.render.calls, triangles: gl.info.render.triangles, textures: gl.info.memory.textures },
        camera: camera.position.toArray(), fov: (camera as PerspectiveCamera).fov,
        pointerLocked: document.pointerLockElement === gl.domElement,
      }),
      place: (x: number, z: number, yaw = 0, pitch = 0) => {
        playerRuntime.teleport?.(x, z); playerRuntime.yaw = yaw; playerRuntime.pitch = pitch
      },
      /**
       * Points the camera at a world position from wherever the body actually ended up.
       * A teleport can land inside a collider and get pushed clear, so an angle worked
       * out from the requested spot goes stale — this is measured after the fact.
       */
      aim: (x: number, y: number, z: number) => {
        const from = playerRuntime.position
        const dx = x - from.x, dz = z - from.z
        playerRuntime.yaw = Math.atan2(-dx, -dz)
        playerRuntime.pitch = Math.atan2(y - (from.y + 0.78), Math.hypot(dx, dz))
      },
      /** What the interaction ray is actually looking at, nearest first. */
      hits: () => {
        const ray = new Raycaster()
        ray.setFromCamera(new Vector2(), camera)
        ray.far = 3.2
        return ray.intersectObjects(scene.children, true).map(hit => {
          let object: Object3D | null = hit.object
          let id: string | undefined
          let hidden = false
          while (object) {
            if (!object.visible) hidden = true
            id ??= object.userData.interactionId
            object = object.parent
          }
          return { name: hit.object.name || hit.object.type, distance: Number(hit.distance.toFixed(3)), id: id ?? null, hidden }
        })
      },
    }
    Object.assign(window, { __tourTest: harness })
    return () => { Reflect.deleteProperty(window, '__tourTest') }
  }, [gl, camera, scene])
  useFrame((_, delta) => {
    samples.current.elapsed += delta; samples.current.frames++
    if (samples.current.elapsed >= 1) {
      useGame.setState({ fps: Math.round(samples.current.frames / samples.current.elapsed) })
      samples.current = { elapsed: 0, frames: 0 }
    }
  })
  return null
}

/**
 * Vertical FOV has to open up as the viewport gets taller, or a phone held upright
 * shows a keyhole. Portrait is still cramped by nature, so the UI also nudges the
 * visitor to turn the device.
 */
function Framing() {
  const { camera, size } = useThree()
  useEffect(() => {
    const aspect = size.width / Math.max(1, size.height)
    const fov = aspect < 0.85 ? 82 : aspect < 1.35 ? 72 : 65
    const perspective = camera as PerspectiveCamera
    if (perspective.fov !== fov) { perspective.fov = fov; perspective.updateProjectionMatrix() }
    useGame.setState({ portrait: aspect < 1 })
  }, [camera, size])
  return null
}

function World() {
  const paused = useGame(state => state.phase !== 'playing')
  return <Physics gravity={[0, -9.81, 0]} timeStep={1 / 60} paused={paused} colliders={false}>
    <InteractionManager>
      <Office />
      {characters.map(character => <NPC key={character.id} data={character} />)}
      <Player /><Framing /><Diagnostics />
    </InteractionManager>
  </Physics>
}

export default function Game() {
  const quality = useGame(state => state.quality)
  return <Canvas shadows={quality === 'high' ? 'soft' : false} dpr={quality === 'high' ? [1, 1.5] : 1}
    camera={{ fov: 65, near: 0.06, far: 65, position: [1.6, 1.63, 5.3] }}
    gl={{ antialias: true, powerPreference: 'high-performance', toneMapping: ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
    fallback={<div className="fallback">Este navegador precisa de WebGL 2 para abrir o tour.</div>}>
    <color attach="background" args={['#c9d0bf']} />
    <fog attach="fog" args={['#c9d0bf', 23, 60]} />
    <hemisphereLight args={['#f7f0db', '#8a957b', 1.75]} />
    <directionalLight position={[-3, 9, 6]} color="#fff1d2" intensity={2.6} castShadow={quality === 'high'}
      shadow-mapSize={[2048, 2048]} shadow-camera-left={-10} shadow-camera-right={10}
      shadow-camera-top={10} shadow-camera-bottom={-10} shadow-camera-near={0.5} shadow-camera-far={25}
      shadow-bias={-0.0003} shadow-normalBias={0.035} shadow-radius={3} />
    <Suspense fallback={null}><World /></Suspense>
  </Canvas>
}
