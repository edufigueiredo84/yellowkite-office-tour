import { Box, Sign, Solid, Floor } from '../primitives'
import { Chair, Monitor, Plant } from '../Furniture'
import { Zone } from '../Zone'

/** Reception desk: the first piece of furniture the visitor sees up close. */
function ReceptionDesk() {
  return <group position={[6.65, 0, -2.1]}>
    <Solid position={[0, 0.76, 0]} size={[2.1, 0.085, 0.9]} color="#c0a17b" rounded />
    {[-0.9, 0.9].map(x => <Box key={x} position={[x, 0.37, 0]} size={[0.065, 0.7, 0.7]} color="#34483c" shadow />)}
    <Solid position={[0.64, 0.35, 0]} size={[0.46, 0.66, 0.68]} color="#d5cfbd" rounded />
    {[0.25, 0.47].map(y => <Box key={y} position={[0.64, y, 0.35]} size={[0.14, 0.018, 0.018]} color="#6b705e" />)}
    <Monitor position={[0.12, 1.17, -0.11]} kind="agenda" />
    <Box position={[0.08, 0.816, 0.26]} size={[0.45, 0.022, 0.16]} color="#525950" rounded />
    <Box position={[0.46, 0.823, 0.26]} size={[0.055, 0.03, 0.085]} color="#525950" rounded />
    <Box position={[-0.67, 0.822, 0.06]} size={[0.26, 0.03, 0.34]} color="#536b57" rotation={[0, -0.13, 0]} />
    <Box position={[-0.67, 0.84, 0.06]} size={[0.23, 0.004, 0.31]} color="#dfd8bd" rotation={[0, -0.13, 0]} />
    <mesh position={[-0.49, 0.88, -0.17]}><cylinderGeometry args={[0.045, 0.035, 0.15, 20]} /><meshStandardMaterial color="#ebd9b3" /></mesh>
    <Box position={[-0.5, 0.97, -0.17]} size={[0.01, 0.19, 0.01]} color="#4d5c47" rotation={[0, 0, 0.16]} />
  </group>
}

export function RH() {
  // Lights stay outside the Zone: toggling a light's visibility rebuilds shader programs.
  return <>
    <pointLight position={[6, 2.7, -2.3]} intensity={13} distance={7} decay={2} color="#fff0d2" />
    <Zone center={[5.9, -2.4]} radius={16}>
    <Floor position={[5.9, 0.009, -2.4]} size={[5.22, 4.62]} wood />
    <Box position={[6.1, 0.019, -2.5]} size={[3.8, 0.009, 3.65]} color="#b7b29b" />
    <Box position={[5.9, 1.6, -4.703]} size={[5.18, 3.15, 0.025]} color="#74836d" />
    <ReceptionDesk />
    <Chair position={[6.92, 0, -3.35]} office />
    <Chair position={[4.17, 0, -3.88]} rotation={0.3} />
    <Solid position={[8.15, 0.49, -2.42]} size={[0.64, 0.95, 2.85]} color="#d6cbb6" rounded />
    {[-3.25, -2.42, -1.58].map(z => <Box key={z} position={[7.821, 0.49, z]} size={[0.015, 0.72, 0.012]} color="#a19c8b" />)}
    <Plant position={[8.08, 0.98, -3.45]} scale={0.53} />
    <Plant position={[4.1, 0, -0.45]} scale={1.13} />
    <Box position={[5.55, 1.91, -4.65]} size={[2.15, 1.12, 0.055]} color="#d0bd91" rounded />
    {[[-0.64, 0.12, '#f1e8ce'], [0, 0.2, '#d1d9c2'], [0.62, 0.06, '#e6be62'], [-0.26, -0.25, '#e8deca']].map(([x, y, c], i) =>
      <Box key={i} position={[5.55 + Number(x), 1.91 + Number(y), -4.61]} size={[0.38, 0.32, 0.004]} color={String(c)} rotation={[0, 0, (i - 1) * 0.08]} />)}
    <Sign text="Ideias em movimento" subtitle="ANOTAR. CONVERSAR. CRIAR." position={[5.55, 2.47, -4.6]} width={1.9} bg="#74836d" />
    <Sign text="Ane" subtitle="RH" position={[5.82, 0.97, -1.63]} width={0.43} bg="#eee6d4" fg="#374635" />
    <Box position={[7.9, 1.02, -2.1]} size={[0.35, 0.06, 0.44]} color="#54694f" />
    <Box position={[7.93, 1.075, -2.1]} size={[0.32, 0.05, 0.4]} color="#d6a94c" rotation={[0, 0.1, 0]} />
    <Box position={[7.96, 1.115, -2.1]} size={[0.29, 0.03, 0.37]} color="#eae2cf" rotation={[0, -0.08, 0]} />
    <Box position={[6.65, 3.08, -2.15]} size={[1.65, 0.07, 0.12]} color="#303c34" />
    <mesh position={[6.65, 3.036, -2.15]} rotation={[Math.PI / 2, 0, 0]}><planeGeometry args={[1.53, 0.065]} /><meshBasicMaterial color="#fff2cb" /></mesh>
    </Zone>
  </>
}
