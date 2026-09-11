import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { Box, Sign } from '../primitives'
import { Chair, CoffeeMachine, Counter, Fridge, Plant } from '../Furniture'
import { CeilingStrip, Pendant, Poster } from '../Decor'
import { Door } from '../Door'
import { RoomLight, Zone } from '../Zone'

function RoundTable({ position }: { position: [number, number, number] }) {
  return <group position={position}>
    <RigidBody type="fixed" colliders={false}><CuboidCollider args={[0.5, 0.37, 0.5]} position={[0, 0.37, 0]} /></RigidBody>
    <mesh position={[0, 0.735, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[0.55, 0.55, 0.05, 28]} /><meshStandardMaterial color="#b49974" roughness={0.8} />
    </mesh>
    <mesh position={[0, 0.36, 0]}><cylinderGeometry args={[0.07, 0.07, 0.72, 14]} /><meshStandardMaterial color="#3d4a41" roughness={0.8} /></mesh>
    <mesh position={[0, 0.025, 0]}><cylinderGeometry args={[0.34, 0.38, 0.05, 20]} /><meshStandardMaterial color="#3d4a41" roughness={0.8} /></mesh>
    <mesh position={[0.17, 0.805, 0.08]}><cylinderGeometry args={[0.045, 0.036, 0.1, 16]} /><meshStandardMaterial color="#e2d3b0" roughness={0.8} /></mesh>
    <mesh position={[-0.2, 0.805, -0.05]}><cylinderGeometry args={[0.045, 0.036, 0.1, 16]} /><meshStandardMaterial color="#cfc0a0" roughness={0.8} /></mesh>
    <Box position={[-0.05, 0.775, 0.2]} size={[0.24, 0.03, 0.2]} color="#dfd8bd" rotation={[0, 0.2, 0]} />
  </group>
}

/** Rosinha's room. The coffee interaction lives on her NPC, not on the scenery. */
export function Copa() {
  return <>
    <RoomLight position={[1.7, 2.6, -25.6]} distance={9} />
    <Door id="door-copa" hinge={[0.65, 0, -23]} width={1.7} label="porta da copa" />
    <Zone center={[1.6, -26]}>
      <Counter position={[0.38, 0, -25.6]} rotation={Math.PI / 2} width={3.4} />
      <CoffeeMachine position={[0.5, 0.935, -24.35]} rotation={Math.PI / 2} />
      {[-27.0, -26.72].map(z => <mesh key={z} position={[0.42, 0.985, z]}>
        <cylinderGeometry args={[0.042, 0.034, 0.095, 16]} /><meshStandardMaterial color="#e2d3b0" roughness={0.8} />
      </mesh>)}
      <Box position={[0.42, 0.97, -24.95]} size={[0.26, 0.07, 0.3]} color="#8a6f4d" rounded />
      <Fridge position={[0.5, 0, -28.35]} rotation={Math.PI / 2} />

      <RoundTable position={[2.1, 0, -25.2]} />
      <Chair position={[2.1, 0, -24.35]} rotation={Math.PI} />
      <Chair position={[2.1, 0, -26.05]} />

      <Plant position={[2.75, 0, -28.4]} scale={1.15} />
      <Poster position={[3.11, 1.72, -24.6]} rotation={[0, -Math.PI / 2, 0]} width={0.58} variant={2} />
      <Poster position={[3.11, 1.72, -27.4]} rotation={[0, -Math.PI / 2, 0]} width={0.58} variant={3} />
      <Sign text="Café e conversa" subtitle="A CASA É SUA" position={[1.6, 2.2, -28.9]} width={1.5} bg="#74836d" />
      <Pendant position={[2.1, 3.2, -25.2]} drop={0.8} />
      <CeilingStrip position={[1.3, 3.19, -24.2]} size={[1.4, 0.1]} rotation={Math.PI / 2} />
      <CeilingStrip position={[1.3, 3.19, -27.4]} size={[1.4, 0.1]} rotation={Math.PI / 2} />
    </Zone>
  </>
}
