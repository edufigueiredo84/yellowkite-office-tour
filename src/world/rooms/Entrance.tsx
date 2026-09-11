import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { Box, Brand, Sign, Solid } from '../primitives'
import { Plant } from '../Furniture'
import { Door } from '../Door'

/** Everything the visitor sees before pressing E: facade, glazing and the main door. */
export function Entrance() {
  return <group>
    <Solid position={[0.34, 1.6, 0]} size={[0.68, 3.2, 0.2]} color="#445547" />
    <Solid position={[2.86, 1.6, 0]} size={[0.72, 3.2, 0.2]} color="#445547" />
    <Solid position={[1.6, 2.97, 0]} size={[1.84, 0.54, 0.2]} color="#445547" />
    <Solid position={[5.9, 0.44, 0]} size={[5.4, 0.88, 0.2]} color="#cec7b4" />
    <Solid position={[5.9, 2.94, 0]} size={[5.4, 0.52, 0.2]} color="#445547" />
    <Solid position={[3.65, 1.78, 0]} size={[0.9, 1.8, 0.2]} color="#cec7b4" />
    <Solid position={[8.2, 1.78, 0]} size={[0.8, 1.8, 0.2]} color="#cec7b4" />
    <RigidBody type="fixed" colliders={false}><CuboidCollider position={[5.95, 1.78, 0]} args={[1.85, 0.9, 0.08]} /></RigidBody>
    <Box position={[5.95, 1.78, 0]} size={[3.7, 1.8, 0.025]} color="#a8b8a7" opacity={0.25} />
    {[4.1, 5.95, 7.8].map(x => <Box key={x} position={[x, 1.78, 0.025]} size={[0.055, 1.8, 0.08]} color="#354e3c" />)}
    {Array.from({ length: 8 }, (_, i) => <Box key={i} position={[5.95, 1.04 + i * 0.2, -0.09]} size={[3.65, 0.07, 0.07]} color="#d1c7ad" rotation={[0.3, 0, 0]} />)}
    <Door id="main-door" hinge={[0.75, 0, 0]} />
    <Box position={[4.3, 3.36, 0.5]} size={[8.8, 0.16, 1.5]} color="#36483a" shadow />
    <Brand position={[1.6, 3.02, 0.115]} width={1.65} white />
    <Sign text="Entre. A casa é sua." position={[5.95, 0.48, 0.111]} width={2.05} bg="#cec7b4" fg="#44513d" />
    <Box position={[1.6, 0.012, 0.8]} size={[1.83, 0.02, 0.83]} color="#656454" />
    <Plant position={[-0.85, 0, 0.9]} scale={1.5} />
    <Plant position={[9.1, 0, 0.9]} scale={1.4} />
    <Solid position={[-1.95, 0.38, 3.5]} size={[0.1, 0.76, 7]} color="#7c8574" />
    <Solid position={[9.95, 0.38, 3.5]} size={[0.1, 0.76, 7]} color="#7c8574" />
    <Solid position={[4, 0.38, 6.95]} size={[12, 0.76, 0.1]} color="#7c8574" />
    <Solid position={[-0.99, 1.5, -0.01]} size={[1.9, 3, 0.18]} color="#c2c1ad" />
    <Solid position={[9.29, 1.5, -0.01]} size={[1.42, 3, 0.18]} color="#c2c1ad" />
  </group>
}
