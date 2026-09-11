import type { Vec3 } from './characters'

export interface WallData { position: Vec3; size: Vec3; color?: string }
const height = 3.2
const vertical = (x: number, z1: number, z2: number): WallData => ({ position: [x, height / 2, (z1 + z2) / 2], size: [0.16, height, Math.abs(z2 - z1)] })
const horizontal = (z: number, x1: number, x2: number): WallData => ({ position: [(x1 + x2) / 2, height / 2, z], size: [Math.abs(x2 - x1), height, 0.16] })

// Floor-plan topology from assets/references/mapa low yellowkite.png.
// +X = image right; -Z = image up. Measurements are gameplay adaptations in meters.
export const walls: WallData[] = [
  vertical(0, 0, -29), vertical(8.6, 0, -19.2), horizontal(-29, 0, 18),
  vertical(18, -19.2, -29), horizontal(-19.2, 8.6, 18),
  ...[0, -4.8, -9.6, -14.4].flatMap(z => [
    vertical(3.2, z, z - 0.8), vertical(3.2, z - 2.7, z - 4.8),
    { position: [3.2, 2.96, z - 1.75] as Vec3, size: [0.16, 0.48, 1.9] as Vec3 },
    horizontal(z - 4.8, 3.2, 8.6),
  ]),
  // Back corridor connects the copa, directors and large open area.
  horizontal(-23, 0, 0.65), horizontal(-23, 2.35, 4.4), horizontal(-23, 6.15, 8.6),
  { position: [1.5, 2.96, -23], size: [1.7, 0.48, 0.16] },
  { position: [5.275, 2.96, -23], size: [1.75, 0.48, 0.16] },
  vertical(3.2, -23, -29), vertical(8.6, -23, -29),
  vertical(8.6, -19.2, -20.2), vertical(8.6, -22.2, -23),
  { position: [8.6, 2.96, -21.2], size: [0.16, 0.48, 2] },
]

export const shellRooms = [
  { name: 'Lead Zeppelin', z: -6.55, number: '02' },
  { name: 'Performance', z: -11.35, number: '03' },
  { name: 'Rocket', z: -16.15, number: '04' },
]
