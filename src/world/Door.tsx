import { useRef } from 'react'
import { useBeforePhysicsStep, RigidBody, CuboidCollider } from '@react-three/rapier'
import type { RapierRigidBody } from '@react-three/rapier'
import { Quaternion, Vector3 } from 'three'
import { useInteraction } from '../interactions/InteractionManager'
import { playerRuntime } from '../player/runtime'
import { useGame } from '../game/store'
import { playSound } from '../audio/audio'
import { wouldSweepPlayer } from './doorMath'
import { Box } from './primitives'

export type DoorState = 'CLOSED' | 'OPENING' | 'OPEN' | 'CLOSING'
export const doorTelemetry = { state: 'CLOSED' as DoorState, angle: 0, reversals: 0 }
export const doorStates: Record<string, { state: DoorState; angle: number }> = {}
const axis = new Vector3(0, 1, 0)
const quaternion = new Quaternion()

interface DoorProps {
  id: string
  hinge: [number, number, number]
  /** Yaw of the closed leaf. The leaf extends along +X when base is 0. */
  base?: number
  /** +1 swings the leaf counter-clockwise from the closed position, -1 clockwise. */
  swing?: number
  width?: number
  height?: number
  label?: string
}

export function Door({ id, hinge, base = 0, swing = 1, width = 1.7, height = 2.65, label = 'porta' }: DoorProps) {
  const body = useRef<RapierRigidBody>(null)
  const angle = useRef(base)
  const targetOpen = useRef(false)
  const state = useRef<DoorState>('CLOSED')
  const closed = base
  const open = base + swing * (Math.PI / 2)
  useInteraction({ id, distance: 2.55,
    label: () => state.current === 'CLOSED' ? `Abrir ${label}` : state.current === 'OPEN' ? `Fechar ${label}` : null,
    execute: () => {
      if (state.current === 'OPENING' || state.current === 'CLOSING') return
      targetOpen.current = !targetOpen.current
      state.current = targetOpen.current ? 'OPENING' : 'CLOSING'
      playSound('door')
    },
  })
  useBeforePhysicsStep(() => {
    if (!body.current || useGame.getState().phase !== 'playing') return
    const target = targetOpen.current ? open : closed
    let next = angle.current + (target - angle.current) * 0.085
    if (Math.abs(next - target) < 0.003) next = target
    const position = playerRuntime.position
    if (wouldSweepPlayer(position.x, position.z, hinge[0], hinge[2], angle.current, next, width)) {
      targetOpen.current = !targetOpen.current
      state.current = targetOpen.current ? 'OPENING' : 'CLOSING'
      doorTelemetry.reversals++
      return
    }
    angle.current = next
    body.current.setNextKinematicRotation(quaternion.setFromAxisAngle(axis, next))
    if (next === target && (state.current === 'OPENING' || state.current === 'CLOSING')) {
      state.current = targetOpen.current ? 'OPEN' : 'CLOSED'
      playSound('latch')
    }
    const travelled = Math.abs(next - closed)
    doorStates[id] = { state: state.current, angle: travelled }
    if (id === 'main-door') { doorTelemetry.state = state.current; doorTelemetry.angle = travelled }
  })

  return <RigidBody ref={body} type="kinematicPosition" position={hinge} rotation={[0, base, 0]} colliders={false}>
    <CuboidCollider args={[width / 2, height / 2, 0.055]} position={[width / 2, height / 2, 0]} friction={0} />
    <group userData={{ interactionId: id }}>
      <Box position={[width / 2, height / 2, 0]} size={[width - 0.1, height - 0.1, 0.045]} color="#91aaa5" opacity={0.32} />
      {[0.045, width - 0.045].map((x) => <Box key={x} position={[x, height / 2, 0]} size={[0.09, height, 0.11]} color="#28332e" />)}
      {[0.045, height - 0.045, 0.45].map((y) => <Box key={y} position={[width / 2, y, 0]} size={[width, 0.09, 0.11]} color="#28332e" />)}
      {[-0.11, 0.11].map((z) => <Box key={z} position={[width - 0.22, 1.17, z]} size={[0.035, 0.43, 0.04]} color="#d0b374" rounded />)}
      <Box position={[width / 2, 1.62, 0.03]} size={[width - 0.14, 0.035, 0.005]} color="#f2f0dc" />
    </group>
  </RigidBody>
}
