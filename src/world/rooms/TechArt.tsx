import { Brand, Sign } from '../primitives'
import { LowTable, Plant, Printer, Shelf, Sofa, Workstation } from '../Furniture'
import { CeilingStrip, Moodboard, Poster, Rug } from '../Decor'
import { RoomLight, Zone } from '../Zone'
import type { ScreenKind } from '../screens'

/**
 * The large open area. Art direction sits on the rows nearest the entrance and
 * technology on the far rows, so the work reads from the screens alone.
 * It is a contemporary agency floor, not a dark "tech" set.
 */
const rows: { z: number; stations: ScreenKind[]; second?: ScreenKind }[] = [
  { z: -22.0, stations: ['figma', 'moodboard', 'figma'] },
  { z: -25.0, stations: ['moodboard', 'figma', 'code'], second: 'terminal' },
  { z: -27.9, stations: ['code', 'terminal', 'code'], second: 'terminal' },
]

export function TechArt() {
  return <>
    <pointLight position={[11.6, 2.7, -22.6]} intensity={13} distance={12} decay={2} color="#fff0d2" />
    <RoomLight position={[14.8, 2.7, -26.6]} intensity={13} distance={12} />
    <Zone center={[13.3, -24.1]} radius={24}>
      {rows.map((row, index) => [10.8, 12.6, 14.4].map((x, seat) =>
        <Workstation key={`${row.z}:${x}`} position={[x, 0, row.z]} kind={row.stations[seat]}
          seed={index * 3 + seat} second={index && seat === 2 ? row.second : undefined} mug={seat !== 1} />))}

      <Rug position={[16.1, 0.008, -23.2]} size={[2.8, 2.6]} color="#93998a" />
      <Sofa position={[16.75, 0, -23.2]} rotation={-Math.PI / 2} width={1.9} />
      <LowTable position={[15.5, 0, -23.2]} rotation={0.1} />
      <Plant position={[17.3, 0, -20.6]} scale={1.35} />
      <Plant position={[9.25, 0, -28.3]} scale={1.25} />

      <Printer position={[9.3, 0, -25.6]} rotation={Math.PI / 2} />
      <Shelf position={[8.87, 0, -27.2]} rotation={Math.PI / 2} width={1.8} />

      <Moodboard position={[12, 1.85, -19.3]} rotation={[0, Math.PI, 0]} width={2.7} seed={5} />
      <Brand position={[15.6, 2.15, -19.3]} rotation={[0, Math.PI, 0]} width={1.5} />
      <Sign text="Onde as ideias viram coisa" position={[15.6, 1.5, -19.3]} rotation={[0, Math.PI, 0]} width={1.9} bg="#74836d" />
      <Poster position={[17.9, 1.78, -25.4]} rotation={[0, -Math.PI / 2, 0]} width={0.64} variant={0} />
      <Poster position={[17.9, 1.78, -26.5]} rotation={[0, -Math.PI / 2, 0]} width={0.64} variant={3} />
      <Poster position={[17.9, 1.78, -27.6]} rotation={[0, -Math.PI / 2, 0]} width={0.64} variant={1} />

      {[-21.5, -24.5, -27.5].map(z => [10.6, 14.2].map(x =>
        <CeilingStrip key={`${z}:${x}`} position={[x, 3.19, z]} size={[2.2, 0.11]} />))}
    </Zone>
  </>
}
