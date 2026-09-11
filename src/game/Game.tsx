import { Suspense, useEffect, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import { ACESFilmicToneMapping } from 'three'
import { Office } from '../world/Office'
import { Player } from '../player/Player'
import { InteractionManager } from '../interactions/InteractionManager'
import { NPC } from '../characters/NPC'
import { characters } from '../data/characters'
import { useGame } from './store'
import { playerRuntime } from '../player/runtime'
import { doorTelemetry, doorStates } from '../world/Door'

function Diagnostics() {
  const { gl, camera } = useThree()
  const samples = useRef({ elapsed: 0, frames: 0 })
  useEffect(() => {
    useGame.getState().setReady()
    if (!import.meta.env.DEV || !new URLSearchParams(location.search).has('test')) return
    const harness = {
      snapshot: () => ({
        position: playerRuntime.position.toArray(), yaw: playerRuntime.yaw, pitch: playerRuntime.pitch,
        door: { ...doorTelemetry }, doors: { ...doorStates }, game: { ...useGame.getState() },
        render: { calls: gl.info.render.calls, triangles: gl.info.render.triangles, textures: gl.info.memory.textures },
        camera: camera.position.toArray(), pointerLocked: document.pointerLockElement === gl.domElement,
      }),
      place: (x: number, z: number, yaw = 0, pitch = 0) => {
        playerRuntime.teleport?.(x, z); playerRuntime.yaw = yaw; playerRuntime.pitch = pitch
      },
    }
    Object.assign(window, { __tourTest: harness })
    return () => { Reflect.deleteProperty(window, '__tourTest') }
  }, [gl, camera])
  useFrame((_, delta) => {
    samples.current.elapsed += delta; samples.current.frames++
    if (samples.current.elapsed >= 1) {
      useGame.setState({ fps: Math.round(samples.current.frames / samples.current.elapsed) })
      samples.current = { elapsed: 0, frames: 0 }
    }
  })
  return null
}

function World() {
  const paused = useGame(state => state.phase !== 'playing')
  return <Physics gravity={[0, -9.81, 0]} timeStep={1 / 60} paused={paused} colliders={false}>
    <InteractionManager>
      <Office />
      {characters.map(character => <NPC key={character.id} data={character} />)}
      <Player /><Diagnostics />
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
