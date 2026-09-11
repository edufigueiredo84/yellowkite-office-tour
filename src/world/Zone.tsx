import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { ReactNode } from 'react'
import { Group } from 'three'
import { playerRuntime } from '../player/runtime'
import { useGame } from '../game/store'

/**
 * A room light that only exists on the Qualidade tier. Every extra point light costs
 * every lit surface in the scene, which is the first thing a phone GPU feels — so the
 * Desempenho tier keeps the corridor and the two biggest rooms lit and drops the rest
 * onto the hemisphere light. Mounting and unmounting rebuilds shader programs, so this
 * must never be driven by anything that changes while the player is moving.
 */
export function RoomLight(props: { position: [number, number, number]; intensity?: number; distance?: number }) {
  const full = useGame(state => state.quality === 'high')
  if (!full) return null
  return <pointLight position={props.position} intensity={props.intensity ?? 11}
    distance={props.distance ?? 9.5} decay={2} color="#fff0d2" />
}

/**
 * Hides a room's decoration while the player is far enough away that walls already
 * block the view. Colliders keep working while hidden, so physics is unaffected —
 * this only trims draw calls, which is what costs us frames in a building this long.
 */
export function Zone({ center, radius = 19, children }: { center: [number, number]; radius?: number; children: ReactNode }) {
  const group = useRef<Group>(null)
  const elapsed = useRef(0)
  useFrame((_, delta) => {
    elapsed.current += delta
    if (elapsed.current < 0.25 || !group.current) return
    elapsed.current = 0
    const player = playerRuntime.position
    const distance = Math.hypot(player.x - center[0], player.z - center[1])
    // Hysteresis keeps a room from flickering when the player lingers on the boundary.
    const visible = group.current.visible ? distance < radius + 2.5 : distance < radius
    if (group.current.visible !== visible) group.current.visible = visible
  })
  return <group ref={group}>{children}</group>
}
