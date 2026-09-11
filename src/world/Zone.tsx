import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { ReactNode } from 'react'
import { Group } from 'three'
import { playerRuntime } from '../player/runtime'

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
