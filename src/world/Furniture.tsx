import { useLayoutEffect, useRef } from 'react'
import { InstancedMesh, MeshStandardMaterial, Object3D } from 'three'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { Box, Solid } from './primitives'
import { screenTexture } from './screens'
import type { ScreenKind } from './screens'
import type { Vec3 } from '../data/characters'

/** Screens share one material per content key, so a room full of monitors stays cheap. */
const screenMaterials = new Map<string, MeshStandardMaterial>()
export function screenMaterial(kind: ScreenKind, seed = 0) {
  const key = `${kind}:${seed}`
  let material = screenMaterials.get(key)
  if (!material) {
    const map = screenTexture(kind, seed)
    material = new MeshStandardMaterial({ map, emissiveMap: map, emissive: '#ffffff', emissiveIntensity: 0.24, roughness: 0.5 })
    screenMaterials.set(key, material)
  }
  return material
}

export function Plant({ position, scale = 1 }: { position: Vec3; scale?: number }) {
  const leaves = useRef<InstancedMesh>(null)
  useLayoutEffect(() => {
    const dummy = new Object3D()
    for (let i = 0; i < 9; i++) {
      const angle = i * 2.399
      const height = 0.6 + (i % 3) * 0.2
      dummy.position.set(Math.cos(angle) * 0.19, height, Math.sin(angle) * 0.19)
      dummy.rotation.set(Math.sin(angle) * 0.6, angle, Math.cos(angle) * 0.65)
      dummy.scale.set(0.11, 0.33, 0.045); dummy.updateMatrix()
      leaves.current!.setMatrixAt(i, dummy.matrix)
    }
    leaves.current!.instanceMatrix.needsUpdate = true
  }, [])
  return <group position={position} scale={scale}>
    <mesh position={[0, 0.2, 0]} castShadow receiveShadow><cylinderGeometry args={[0.23, 0.17, 0.4, 24]} /><meshStandardMaterial color="#a17859" roughness={1} /></mesh>
    <mesh position={[0, 0.4, 0]}><cylinderGeometry args={[0.21, 0.21, 0.008, 24]} /><meshStandardMaterial color="#393930" /></mesh>
    <Box position={[0, 0.7, 0]} size={[0.025, 0.6, 0.025]} color="#536144" />
    <instancedMesh ref={leaves} args={[undefined, undefined, 9]} castShadow><sphereGeometry args={[1, 12, 8]} /><meshStandardMaterial color="#566d47" roughness={0.85} /></instancedMesh>
  </group>
}

export function Chair({ position, rotation = 0, office = false }: { position: Vec3; rotation?: number; office?: boolean }) {
  return <group position={position} rotation={[0, rotation, 0]}>
    <RigidBody type="fixed" colliders={false}><CuboidCollider args={[0.29, 0.48, 0.29]} position={[0, 0.48, 0]} /></RigidBody>
    <Box position={[0, 0.47, 0]} size={[0.52, 0.12, 0.5]} color={office ? '#4d5b54' : '#b79b69'} rounded shadow />
    <Box position={[0, 0.77, -0.22]} size={[0.52, 0.57, 0.1]} color={office ? '#4d5b54' : '#b79b69'} rotation={[-0.1, 0, 0]} rounded shadow />
    {office ? <>
      <Box position={[0, 0.23, 0]} size={[0.065, 0.4, 0.065]} color="#444c47" />
      <Box position={[0, 0.06, 0]} size={[0.6, 0.05, 0.075]} color="#444c47" />
      <Box position={[0, 0.06, 0]} size={[0.075, 0.05, 0.6]} color="#444c47" />
    </> : [-0.2, 0.2].flatMap(x => [-0.19, 0.19].map(z => <Box key={`${x}:${z}`} position={[x, 0.23, z]} size={[0.035, 0.43, 0.035]} color="#4a4b41" />))}
  </group>
}

export function Monitor({ position, rotation = 0, kind = 'agenda', seed = 0, width = 0.62, stand = true }:
  { position: Vec3; rotation?: number; kind?: ScreenKind; seed?: number; width?: number; stand?: boolean }) {
  const height = width * 0.625
  return <group position={position} rotation={[0, rotation, 0]}>
    <Box size={[width + 0.055, height + 0.055, 0.045]} color="#303b36" rounded shadow />
    <mesh position={[0, 0, 0.024]} material={screenMaterial(kind, seed)}><planeGeometry args={[width, height]} /></mesh>
    {stand && <>
      <Box position={[0, -(height / 2 + 0.1), -0.008]} size={[0.045, 0.17, 0.04]} color="#49544c" />
      <Box position={[0, -(height / 2 + 0.185), 0.03]} size={[0.26, 0.02, 0.17]} color="#49544c" rounded />
    </>}
  </group>
}

export function Laptop({ position, rotation = 0, kind = 'deck', seed = 0 }:
  { position: Vec3; rotation?: number; kind?: ScreenKind; seed?: number }) {
  return <group position={position} rotation={[0, rotation, 0]}>
    <Box position={[0, 0.008, 0]} size={[0.33, 0.016, 0.24]} color="#4c564e" rounded />
    <Box position={[0, 0.012, -0.02]} size={[0.26, 0.004, 0.14]} color="#6a7369" />
    <group position={[0, 0.017, -0.12]} rotation={[-1.15, 0, 0]}>
      <Box position={[0, 0.11, 0]} size={[0.33, 0.22, 0.008]} color="#3a443d" rounded />
      <mesh position={[0, 0.11, 0.006]} material={screenMaterial(kind, seed)}><planeGeometry args={[0.3, 0.188]} /></mesh>
    </group>
  </group>
}

/** Desk, screen, chair and the small things that make a station look used. */
export function Workstation({ position, rotation = 0, kind = 'code', seed = 0, second, mug = true }:
  { position: Vec3; rotation?: number; kind?: ScreenKind; seed?: number; second?: ScreenKind; mug?: boolean }) {
  return <group position={position} rotation={[0, rotation, 0]}>
    <Solid position={[0, 0.755, 0]} size={[1.5, 0.05, 0.72]} color="#c0a17b" rounded />
    {[-0.68, 0.68].map(x => <Box key={x} position={[x, 0.365, 0]} size={[0.06, 0.73, 0.6]} color="#34483c" shadow />)}
    <Box position={[0, 0.6, -0.3]} size={[1.4, 0.31, 0.02]} color="#9d8f74" />
    <Monitor position={second ? [-0.36, 1.06, -0.2] : [0, 1.06, -0.2]} kind={kind} seed={seed} />
    {second && <Monitor position={[0.38, 1.05, -0.22]} rotation={-0.32} kind={second} seed={seed + 3} width={0.54} />}
    <Box position={[0, 0.788, 0.11]} size={[0.42, 0.02, 0.14]} color="#525950" rounded />
    <Box position={[0.33, 0.792, 0.11]} size={[0.055, 0.028, 0.085]} color="#525950" rounded />
    {mug && <mesh position={[-0.52, 0.82, 0.03]}><cylinderGeometry args={[0.042, 0.034, 0.095, 16]} /><meshStandardMaterial color="#e2d3b0" roughness={0.8} /></mesh>}
    <Box position={[0.56, 0.795, -0.02]} size={[0.2, 0.03, 0.27]} color="#dfd8bd" rotation={[0, 0.14, 0]} />
    <Chair position={[0, 0, 0.66]} rotation={Math.PI} office />
  </group>
}

export function Books({ position, rotation = 0, count = 9, seed = 1 }: { position: Vec3; rotation?: number; count?: number; seed?: number }) {
  const colors = ['#8d6f4d', '#54694f', '#b7a37c', '#3d514b', '#c3b48f', '#6d7b64', '#a8723f']
  let value = seed * 7919 + 3
  const random = () => { value = (value * 16807) % 2147483647; return value / 2147483647 }
  return <group position={position} rotation={[0, rotation, 0]}>
    {Array.from({ length: count }, (_, i) => {
      const height = 0.2 + random() * 0.09
      const thickness = 0.025 + random() * 0.022
      return <Box key={i} position={[i * 0.045 - count * 0.022, height / 2, 0]} size={[thickness, height, 0.15]}
        color={colors[i % colors.length]} rotation={[0, 0, i % 5 === 4 ? 0.1 : 0]} />
    })}
  </group>
}

export function Shelf({ position, rotation = 0, width = 1.6, height = 1.85 }:
  { position: Vec3; rotation?: number; width?: number; height?: number }) {
  const levels = [0.42, 0.86, 1.3]
  return <group position={position} rotation={[0, rotation, 0]}>
    <RigidBody type="fixed" colliders={false}><CuboidCollider args={[width / 2, height / 2, 0.17]} position={[0, height / 2, 0]} /></RigidBody>
    <Box position={[0, height / 2, -0.15]} size={[width, height, 0.03]} color="#b1a58a" />
    {[-width / 2, width / 2].map(x => <Box key={x} position={[x, height / 2, 0]} size={[0.04, height, 0.34]} color="#8e7a5c" shadow />)}
    <Box position={[0, height - 0.02, 0]} size={[width, 0.04, 0.34]} color="#8e7a5c" shadow />
    <Box position={[0, 0.02, 0]} size={[width, 0.04, 0.34]} color="#8e7a5c" />
    {levels.map((y, i) => <group key={y}>
      <Box position={[0, y, 0]} size={[width, 0.035, 0.34]} color="#a08a68" shadow />
      <Books position={[-width / 4 + (i % 2) * 0.3, y + 0.018, 0]} count={8 + i} seed={i + 2} />
      <Box position={[width / 4 + 0.1, y + 0.11, 0]} size={[0.3, 0.2, 0.24]} color={i % 2 ? '#d5cfbd' : '#74836d'} rounded />
    </group>)}
  </group>
}

export function Sofa({ position, rotation = 0, width = 1.9 }: { position: Vec3; rotation?: number; width?: number }) {
  return <group position={position} rotation={[0, rotation, 0]}>
    <RigidBody type="fixed" colliders={false}><CuboidCollider args={[width / 2, 0.4, 0.42]} position={[0, 0.4, 0]} /></RigidBody>
    <Box position={[0, 0.36, 0]} size={[width, 0.22, 0.84]} color="#6f7f6d" rounded shadow />
    <Box position={[0, 0.62, -0.33]} size={[width, 0.44, 0.18]} color="#7a8a77" rounded shadow />
    {[-1, 1].map(side => <Box key={side} position={[side * (width / 2 - 0.09), 0.56, 0]} size={[0.18, 0.32, 0.84]} color="#66755f" rounded shadow />)}
    {[-0.42, 0.42].map(x => <Box key={x} position={[x, 0.5, -0.16]} size={[0.36, 0.32, 0.12]} color={x < 0 ? '#d9cfb2' : '#ecaa26'} rounded rotation={[0.25, 0, x < 0 ? 0.1 : -0.1]} />)}
    {[-1, 1].map(side => [-1, 1].map(depth => <Box key={`${side}:${depth}`} position={[side * (width / 2 - 0.16), 0.12, depth * 0.3]} size={[0.05, 0.24, 0.05]} color="#4a4b41" />))}
  </group>
}

export function LowTable({ position, rotation = 0, size = [1.05, 0.6] }: { position: Vec3; rotation?: number; size?: [number, number] }) {
  return <group position={position} rotation={[0, rotation, 0]}>
    <Solid position={[0, 0.4, 0]} size={[size[0], 0.05, size[1]]} color="#b49974" rounded />
    {[-1, 1].map(x => [-1, 1].map(z => <Box key={`${x}:${z}`} position={[x * (size[0] / 2 - 0.1), 0.19, z * (size[1] / 2 - 0.1)]} size={[0.045, 0.38, 0.045]} color="#4a4b41" />))}
    <Box position={[0.16, 0.445, 0.02]} size={[0.25, 0.04, 0.3]} color="#dfd8bd" rotation={[0, 0.2, 0]} />
    <Box position={[-0.22, 0.44, -0.04]} size={[0.22, 0.03, 0.26]} color="#74836d" rotation={[0, -0.12, 0]} />
  </group>
}

export function MeetingTable({ position, rotation = 0, size = [2.6, 1.15] }: { position: Vec3; rotation?: number; size?: [number, number] }) {
  return <group position={position} rotation={[0, rotation, 0]}>
    <Solid position={[0, 0.735, 0]} size={[size[0], 0.06, size[1]]} color="#c0a17b" rounded />
    {[-1, 1].map(x => <Box key={x} position={[x * (size[0] / 2 - 0.26), 0.355, 0]} size={[0.09, 0.72, size[1] - 0.34]} color="#34483c" shadow />)}
    <Box position={[0, 0.12, 0]} size={[size[0] - 0.8, 0.07, 0.09]} color="#34483c" />
  </group>
}

export function Counter({ position, rotation = 0, width = 3.4, sink = true }:
  { position: Vec3; rotation?: number; width?: number; sink?: boolean }) {
  return <group position={position} rotation={[0, rotation, 0]}>
    <Solid position={[0, 0.45, 0]} size={[width, 0.9, 0.6]} color="#cfc7b1" rounded />
    <Box position={[0, 0.915, 0]} size={[width + 0.04, 0.04, 0.64]} color="#8b9384" />
    <Box position={[0, 0.06, 0.02]} size={[width - 0.1, 0.12, 0.56]} color="#9ca394" />
    {Array.from({ length: Math.round(width / 0.85) }, (_, i) => <Box key={i}
      position={[-width / 2 + 0.42 + i * 0.85, 0.63, 0.302]} size={[0.24, 0.014, 0.014]} color="#6b705e" />)}
    {sink && <>
      <Box position={[width / 2 - 0.7, 0.9, 0]} size={[0.5, 0.05, 0.4]} color="#7e8779" />
      <Box position={[width / 2 - 0.7, 1.05, -0.19]} size={[0.035, 0.28, 0.035]} color="#8e978a" />
      <Box position={[width / 2 - 0.7, 1.18, -0.11]} size={[0.03, 0.03, 0.19]} color="#8e978a" />
    </>}
    <Box position={[-width / 2 + 0.55, 1.86, -0.06]} size={[1.3, 0.7, 0.34]} color="#d6cfba" rounded shadow />
    <Box position={[-width / 2 + 0.55, 1.5, 0.06]} size={[1.26, 0.02, 0.1]} color="#8e978a" />
  </group>
}

export function CoffeeMachine({ position, rotation = 0 }: { position: Vec3; rotation?: number }) {
  return <group position={position} rotation={[0, rotation, 0]}>
    <Box position={[0, 0.21, 0]} size={[0.34, 0.42, 0.32]} color="#37423a" rounded shadow />
    <Box position={[0, 0.38, 0.163]} size={[0.16, 0.1, 0.01]} color="#c3caba" />
    <Box position={[0, 0.25, 0.155]} size={[0.22, 0.025, 0.02]} color="#ecaa26" />
    <Box position={[0, 0.115, 0.09]} size={[0.19, 0.012, 0.16]} color="#7f8878" />
    <mesh position={[0, 0.155, 0.09]}><cylinderGeometry args={[0.035, 0.028, 0.08, 14]} /><meshStandardMaterial color="#e6dcc2" roughness={0.8} /></mesh>
    <mesh position={[0.27, 0.055, 0.02]}><cylinderGeometry args={[0.04, 0.033, 0.095, 16]} /><meshStandardMaterial color="#e2d3b0" roughness={0.8} /></mesh>
    <mesh position={[0.27, 0.16, 0.02]}><cylinderGeometry args={[0.04, 0.033, 0.095, 16]} /><meshStandardMaterial color="#cfc0a0" roughness={0.8} /></mesh>
  </group>
}

export function Fridge({ position, rotation = 0 }: { position: Vec3; rotation?: number }) {
  return <group position={position} rotation={[0, rotation, 0]}>
    <Solid position={[0, 0.87, 0]} size={[0.68, 1.74, 0.66]} color="#c8cabd" rounded />
    <Box position={[0, 1.2, 0.335]} size={[0.66, 0.012, 0.012]} color="#7d8577" />
    {[0.72, 1.55].map(y => <Box key={y} position={[0.25, y, 0.345]} size={[0.035, 0.3, 0.035]} color="#7d8577" rounded />)}
    <Box position={[-0.12, 1.45, 0.345]} size={[0.16, 0.19, 0.006]} color="#ecaa26" rotation={[0, 0, 0.06]} />
  </group>
}

export function Printer({ position, rotation = 0 }: { position: Vec3; rotation?: number }) {
  return <group position={position} rotation={[0, rotation, 0]}>
    <Solid position={[0, 0.33, 0]} size={[0.76, 0.66, 0.62]} color="#4e564d" rounded />
    <Box position={[0, 0.67, 0]} size={[0.78, 0.05, 0.64]} color="#3d443c" rounded />
    <Box position={[0.2, 0.7, 0.08]} size={[0.3, 0.012, 0.24]} color="#e8e3d2" rotation={[0.03, 0, 0]} />
    <Box position={[-0.22, 0.585, 0.315]} size={[0.2, 0.09, 0.012]} color="#2f3630" />
    <Box position={[-0.22, 0.585, 0.322]} size={[0.1, 0.04, 0.004]} color="#9dbf95" />
  </group>
}
