import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { Box, Floor } from './primitives'
import { walls } from '../data/layout'
import { Entrance } from './rooms/Entrance'
import { Corridor } from './rooms/Corridor'
import { RH } from './rooms/RH'
import { TeamRoom } from './rooms/TeamRoom'
import { Copa } from './rooms/Copa'
import { Directors } from './rooms/Directors'
import { TechArt } from './rooms/TechArt'

/** Floors, walls and ceilings shared by every room, then each room's own dressing. */
export function Office() {
  return <group>
    <RigidBody type="fixed" colliders={false}>
      <CuboidCollider position={[4.3, -0.15, -14.5]} args={[4.3, 0.15, 14.5]} />
      <CuboidCollider position={[13.3, -0.15, -24.1]} args={[4.7, 0.15, 4.9]} />
      <CuboidCollider position={[4, -0.15, 3.5]} args={[6, 0.15, 3.5]} />
      {walls.map((wall, i) => <CuboidCollider key={i} position={wall.position} args={[wall.size[0] / 2, wall.size[1] / 2, wall.size[2] / 2]} />)}
    </RigidBody>
    <Floor position={[4.3, 0, -14.5]} size={[8.6, 29]} />
    <Floor position={[13.3, 0, -24.1]} size={[9.4, 9.8]} />
    <Floor position={[4, 0, 3.5]} size={[12, 7]} />
    {walls.map((wall, i) => <Box key={i} position={wall.position} size={wall.size} color={wall.color} shadow />)}
    <Box position={[4.3, 3.25, -14.5]} size={[8.6, 0.1, 29]} color="#deded0" />
    <Box position={[13.3, 3.25, -24.1]} size={[9.4, 0.1, 9.8]} color="#deded0" />

    <Entrance />
    <Corridor />
    <RH />
    <TeamRoom z0={-4.8} id="lead-zeppelin" label="sala Lead Zeppelin" seed={2}
      kinds={['kanban', 'calendar', 'deck', 'kanban']} board="whiteboard" posterVariant={0} />
    <TeamRoom z0={-9.6} id="performance" label="sala Performance" seed={6}
      kinds={['dashboard', 'campaigns', 'dashboard', 'campaigns']} second="dashboard"
      wallScreen="dashboard" board="whiteboard" posterVariant={2} />
    <TeamRoom z0={-14.4} id="rocket" label="sala Rocket" seed={10}
      kinds={['kanban', 'deck', 'calendar', 'kanban']} board="moodboard" posterVariant={1} />
    <Copa />
    <Directors />
    <TechArt />
  </group>
}
