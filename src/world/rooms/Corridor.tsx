import { Box, Brand, Sign, Solid } from '../primitives'
import { Plant } from '../Furniture'
import { shellRooms } from '../../data/layout'

/** Circulation spine: signage, a place to sit and the ceiling line that leads you in. */
export function Corridor() {
  return <group>
    <Brand position={[0.09, 1.94, -3.95]} width={1.72} rotation={[0, Math.PI / 2, 0]} />
    <Solid position={[0.47, 0.45, -6.3]} size={[0.68, 0.15, 2]} color="#b49974" rounded />
    <Box position={[0.22, 0.23, -6.3]} size={[0.12, 0.42, 1.8]} color="#58614e" />
    <Plant position={[0.6, 0, -8.1]} />
    <Plant position={[0.6, 0, -18.4]} scale={1.1} />
    <Solid position={[0.47, 0.45, -20.6]} size={[0.68, 0.15, 2]} color="#b49974" rounded />
    <Box position={[0.22, 0.23, -20.6]} size={[0.12, 0.42, 1.8]} color="#58614e" />

    {/* Emissive strips read as fixtures everywhere; only three carry a real light. */}
    {[-2, -7.5, -12.5, -17.5, -21.2].map(z =>
      <Box key={z} position={[1.6, 3.13, z]} size={[0.09, 0.05, 1.1]} color="#fcf0d3" />)}
    {[-3, -12.5, -21].map(z =>
      <pointLight key={z} position={[1.6, 2.85, z]} color="#ffefce" intensity={10} distance={11} decay={2} />)}

    <Sign text="RH" subtitle="01 / PESSOAS" position={[3.106, 1.7, -3.33]} rotation={[0, -Math.PI / 2, 0]} width={0.84} bg="#eee8d8" fg="#384c39" />
    <Box position={[3.09, 1.7, -3.79]} size={[0.025, 0.25, 0.04]} color="#ecaa26" />
    {shellRooms.map(room => <group key={room.name}>
      <Sign text={room.name} subtitle={`${room.number} / ${room.name.toUpperCase()}`}
        position={[3.106, 1.7, room.z - 1.55]} rotation={[0, -Math.PI / 2, 0]} width={1.05} bg="#eee8d8" fg="#435340" />
      <Box position={[3.09, 1.7, room.z - 2.06]} size={[0.025, 0.25, 0.04]} color="#ecaa26" />
    </group>)}
    <Sign text="Copa" position={[0.45, 1.8, -22.91]} width={0.6} />
    <Sign text="Diretores" position={[7.3, 1.8, -22.91]} width={1.1} />
    <Sign text="Tecnologia + Direção de Arte" position={[8.506, 1.8, -22.6]} rotation={[0, -Math.PI / 2, 0]} width={1.6} />
  </group>
}
