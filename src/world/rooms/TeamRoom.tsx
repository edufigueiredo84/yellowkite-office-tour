import { Box, Solid } from '../primitives'
import { Plant, Workstation } from '../Furniture'
import { CeilingStrip, Moodboard, Poster, TV, Whiteboard } from '../Decor'
import { Door } from '../Door'
import { RoomLight, Zone } from '../Zone'
import type { ScreenKind } from '../screens'

interface TeamRoomProps {
  /** Z of the wall the room shares with the room before it. The room runs from z0 to z0 - 4.8. */
  z0: number
  id: string
  label: string
  /** One screen per station, read clockwise from the north-west desk. */
  kinds: [ScreenKind, ScreenKind, ScreenKind, ScreenKind]
  second?: ScreenKind
  wallScreen?: ScreenKind
  board?: 'whiteboard' | 'moodboard'
  posterVariant?: number
  seed?: number
}

/**
 * Shared shell for the three team rooms off the main corridor. The architecture,
 * stations and lighting are identical by design; only the screens and wall pieces
 * differ, because the people and the work of each team are still TODO_CONTENT.
 */
export function TeamRoom({ z0, id, label, kinds, second, wallScreen, board = 'whiteboard', posterVariant = 0, seed = 1 }: TeamRoomProps) {
  const middle = z0 - 2.4
  return <>
    <RoomLight position={[5.9, 2.62, middle]} />
    <Door id={`door-${id}`} hinge={[3.2, 0, z0 - 0.8]} base={Math.PI / 2} swing={-1} label={`porta da ${label}`} />
    <Zone center={[5.9, middle]} radius={15}>
      {/* Stations: two against the back wall, two along the east side.
          -PI/2 puts the seat on the room side, so the screens read from the doorway. */}
      <Workstation position={[4.4, 0, z0 - 4.05]} kind={kinds[0]} seed={seed} second={second} />
      <Workstation position={[6.2, 0, z0 - 4.05]} kind={kinds[1]} seed={seed + 1} />
      <Workstation position={[8.0, 0, z0 - 1.35]} rotation={-Math.PI / 2} kind={kinds[2]} seed={seed + 2} />
      <Workstation position={[8.0, 0, z0 - 3.05]} rotation={-Math.PI / 2} kind={kinds[3]} seed={seed + 3} />

      {/* Credenza under the board, with the clutter of a room in use. */}
      <Solid position={[5.4, 0.39, z0 - 0.38]} size={[2.4, 0.78, 0.48]} color="#cfc7b1" rounded />
      <Box position={[4.6, 0.84, z0 - 0.38]} size={[0.3, 0.12, 0.24]} color="#74836d" rounded />
      <Box position={[5.1, 0.83, z0 - 0.36]} size={[0.26, 0.1, 0.2]} color="#ecaa26" rotation={[0, 0.18, 0]} />
      <Box position={[6.0, 0.805, z0 - 0.4]} size={[0.34, 0.05, 0.26]} color="#dfd8bd" rotation={[0, -0.1, 0]} />
      <mesh position={[6.45, 0.84, z0 - 0.38]}><cylinderGeometry args={[0.048, 0.038, 0.11, 16]} /><meshStandardMaterial color="#e2d3b0" roughness={0.8} /></mesh>

      {board === 'whiteboard'
        ? <Whiteboard position={[5.4, 1.85, z0 - 0.09]} rotation={[0, Math.PI, 0]} width={2.2} seed={seed} />
        : <Moodboard position={[5.4, 1.85, z0 - 0.09]} rotation={[0, Math.PI, 0]} width={2.3} seed={seed} />}
      {wallScreen && <TV position={[8.49, 1.78, middle - 1.1]} rotation={[0, -Math.PI / 2, 0]} width={1.35} kind={wallScreen} seed={seed} />}

      <Poster position={[3.29, 1.72, z0 - 3.45]} rotation={[0, Math.PI / 2, 0]} width={0.6} variant={posterVariant} />
      <Poster position={[3.29, 1.72, z0 - 4.25]} rotation={[0, Math.PI / 2, 0]} width={0.6} variant={posterVariant + 1} />
      <Poster position={[4.4, 2.24, z0 - 4.7]} width={0.55} variant={posterVariant + 2} />
      <Poster position={[6.2, 2.24, z0 - 4.7]} width={0.55} variant={posterVariant + 3} />
      <Plant position={[6.9, 0, z0 - 0.62]} scale={1.05} />

      <CeilingStrip position={[5.4, 3.19, z0 - 1.5]} size={[1.6, 0.1]} />
      <CeilingStrip position={[5.4, 3.19, z0 - 3.4]} size={[1.6, 0.1]} />
    </Zone>
  </>
}
