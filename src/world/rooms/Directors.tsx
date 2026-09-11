import { Box, Sign } from '../primitives'
import { Chair, Laptop, MeetingTable, Plant, Shelf } from '../Furniture'
import { CeilingStrip, Poster, Rug, TV } from '../Decor'
import { Door } from '../Door'
import { Zone } from '../Zone'

/**
 * Room for Marcos Paulo and Carina. Furniture only — no invented role, history
 * or institutional copy is placed anywhere in here.
 */
export function Directors() {
  return <>
    <pointLight position={[5.9, 2.62, -26]} intensity={12} distance={10} decay={2} color="#fff0d2" />
    <Door id="door-directors" hinge={[4.4, 0, -23]} width={1.75} label="porta da sala dos diretores" />
    <Zone center={[5.9, -26]}>
      <Rug position={[5.9, 0.008, -26.2]} size={[3.9, 2.5]} color="#8a9182" />
      <MeetingTable position={[5.9, 0, -26.2]} size={[2.8, 1.2]} />
      <Laptop position={[5.15, 0.767, -26.35]} rotation={0.12} kind="deck" seed={2} />
      <Laptop position={[6.65, 0.767, -26.0]} rotation={Math.PI - 0.15} kind="kanban" seed={4} />
      <Box position={[5.9, 0.775, -26.6]} size={[0.3, 0.02, 0.22]} color="#dfd8bd" rotation={[0, 0.1, 0]} />
      <mesh position={[6.2, 0.8, -26.55]}><cylinderGeometry args={[0.045, 0.036, 0.1, 16]} /><meshStandardMaterial color="#e2d3b0" roughness={0.8} /></mesh>

      <Chair position={[5.1, 0, -25.15]} rotation={Math.PI} office />
      <Chair position={[6.7, 0, -25.15]} rotation={Math.PI} office />
      <Chair position={[5.1, 0, -27.25]} office />
      <Chair position={[6.7, 0, -27.25]} office />

      <TV position={[3.3, 1.78, -26.3]} rotation={[0, Math.PI / 2, 0]} width={1.6} kind="deck" seed={1} />
      <Shelf position={[8.35, 0, -26.4]} rotation={-Math.PI / 2} width={1.9} />
      <Plant position={[3.75, 0, -28.4]} scale={1.2} />
      <Plant position={[8.1, 0, -23.7]} scale={1} />
      <Poster position={[5.5, 1.95, -28.9]} width={0.6} variant={1} />
      <Poster position={[6.4, 1.95, -28.9]} width={0.6} variant={0} />
      <Sign text="Diretoria" subtitle="DECISÕES E RUMO" position={[4.35, 2.32, -28.9]} width={1.25} bg="#74836d" />
      <CeilingStrip position={[5.9, 3.19, -24.6]} size={[1.9, 0.11]} />
      <CeilingStrip position={[5.9, 3.19, -27.6]} size={[1.9, 0.11]} />
    </Zone>
  </>
}
