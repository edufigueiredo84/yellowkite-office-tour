import { CanvasTexture, SRGBColorSpace } from 'three'
import { Box } from './primitives'
import { screenMaterial } from './Furniture'
import type { ScreenKind } from './screens'
import type { Vec3 } from '../data/characters'

// Flat wall pieces. Everything drawn here is abstract: no invented client work,
// no fake case study and no text presented as a real Yellow Kite statement.

const cache = new Map<string, CanvasTexture>()
function texture(key: string, width: number, height: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const hit = cache.get(key)
  if (hit) return hit
  const canvas = document.createElement('canvas')
  canvas.width = width; canvas.height = height
  draw(canvas.getContext('2d')!)
  const map = new CanvasTexture(canvas)
  map.colorSpace = SRGBColorSpace; map.anisotropy = 4
  cache.set(key, map)
  return map
}

function generator(seed: number) {
  let value = seed * 7919 + 29
  return () => { value = (value * 16807) % 2147483647; return value / 2147483647 }
}

/** Dry-erase board with abstract diagrams — deliberately unreadable scribble, not fake content. */
export function Whiteboard({ position, rotation = [0, 0, 0], width = 2.2, seed = 1 }:
  { position: Vec3; rotation?: Vec3; width?: number; seed?: number }) {
  const map = texture(`board:${seed}`, 1024, 640, ctx => {
    const random = generator(seed)
    ctx.fillStyle = '#f4f2e8'; ctx.fillRect(0, 0, 1024, 640)
    ctx.lineCap = 'round'
    for (let i = 0; i < 5; i++) {
      const x = 70 + random() * 700, y = 90 + random() * 380
      ctx.strokeStyle = ['#3d514b', '#ecaa26', '#7d8a74'][i % 3]; ctx.lineWidth = 3
      ctx.strokeRect(x, y, 110 + random() * 90, 60 + random() * 50)
      ctx.beginPath(); ctx.moveTo(x + 140, y + 50); ctx.lineTo(x + 230, y + 90 + random() * 40); ctx.stroke()
    }
    ctx.strokeStyle = '#5a6555'; ctx.lineWidth = 4
    for (let i = 0; i < 16; i++) {
      const x = 90 + random() * 820, y = 470 + random() * 120
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 40 + random() * 110, y + (random() - 0.5) * 10); ctx.stroke()
    }
    ctx.fillStyle = '#c3c8ba'; ctx.font = '20px Arial'; ctx.textAlign = 'right'
    ctx.fillText('ESQUEMA DECORATIVO', 984, 610)
  })
  return <group position={position} rotation={rotation}>
    <Box size={[width + 0.07, width * 0.625 + 0.07, 0.04]} color="#8e8a74" rounded />
    <mesh position={[0, 0, 0.024]}><planeGeometry args={[width, width * 0.625]} /><meshStandardMaterial map={map} roughness={0.92} /></mesh>
    <Box position={[0, -(width * 0.625 / 2) - 0.06, 0.04]} size={[width * 0.5, 0.03, 0.07]} color="#7f7c68" />
    {[-0.06, 0.02, 0.1].map(x => <Box key={x} position={[x, -(width * 0.625 / 2) - 0.04, 0.06]} size={[0.06, 0.018, 0.018]}
      color={x < 0 ? '#3d514b' : x < 0.05 ? '#ecaa26' : '#8a3f34'} />)}
  </group>
}

/** Abstract graphic panels built from the brand palette. No logo repetition, no fake campaign. */
export function Poster({ position, rotation = [0, 0, 0], width = 0.62, variant = 0 }:
  { position: Vec3; rotation?: Vec3; width?: number; variant?: number }) {
  const map = texture(`poster:${variant}`, 512, 720, ctx => {
    const random = generator(variant + 11)
    const palettes = [
      ['#eee7d3', '#ecaa26', '#3d514b'], ['#33443a', '#e6dcc2', '#ecaa26'],
      ['#cec7b4', '#74836d', '#28332e'], ['#e6be62', '#445547', '#f1e8ce'],
    ]
    const [bg, primary, secondary] = palettes[variant % palettes.length]
    ctx.fillStyle = bg; ctx.fillRect(0, 0, 512, 720)
    if (variant % 4 === 0) {
      ctx.fillStyle = primary; ctx.beginPath(); ctx.arc(256, 300, 150, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = secondary; ctx.fillRect(96, 300, 320, 26)
    } else if (variant % 4 === 1) {
      for (let i = 0; i < 7; i++) {
        ctx.fillStyle = i % 2 ? primary : secondary
        ctx.fillRect(60, 90 + i * 74, 60 + random() * 340, 44)
      }
    } else if (variant % 4 === 2) {
      ctx.strokeStyle = primary; ctx.lineWidth = 14
      for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(256, 620, 80 + i * 70, Math.PI, Math.PI * 2); ctx.stroke() }
      ctx.fillStyle = secondary; ctx.fillRect(0, 620, 512, 100)
    } else {
      ctx.fillStyle = primary
      ctx.beginPath(); ctx.moveTo(70, 620); ctx.lineTo(256, 120); ctx.lineTo(442, 620); ctx.closePath(); ctx.fill()
      ctx.fillStyle = secondary; ctx.beginPath(); ctx.arc(256, 250, 66, 0, Math.PI * 2); ctx.fill()
    }
  })
  return <group position={position} rotation={rotation}>
    <Box size={[width + 0.035, width * 1.406 + 0.035, 0.018]} color="#42503f" />
    <mesh position={[0, 0, 0.012]}><planeGeometry args={[width, width * 1.406]} /><meshStandardMaterial map={map} roughness={0.94} /></mesh>
  </group>
}

/** Pinned references: colour cards, print-outs and swatches, no readable copy. */
export function Moodboard({ position, rotation = [0, 0, 0], width = 2.4, seed = 3 }:
  { position: Vec3; rotation?: Vec3; width?: number; seed?: number }) {
  const map = texture(`mood:${seed}`, 1024, 620, ctx => {
    const random = generator(seed)
    ctx.fillStyle = '#d9d3bd'; ctx.fillRect(0, 0, 1024, 620)
    const colors = ['#ecaa26', '#3d514b', '#cec7b4', '#74836d', '#b49974', '#e6dcc2', '#8a9b83']
    for (let i = 0; i < 15; i++) {
      const w = 120 + random() * 130, h = 90 + random() * 130
      const x = 24 + random() * (980 - w), y = 20 + random() * (580 - h)
      ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.rotate((random() - 0.5) * 0.14)
      ctx.fillStyle = '#f4f1e4'; ctx.fillRect(-w / 2 - 7, -h / 2 - 7, w + 14, h + 14)
      ctx.fillStyle = colors[i % colors.length]; ctx.fillRect(-w / 2, -h / 2, w, h)
      if (i % 3 === 0) { ctx.fillStyle = '#00000022'; ctx.fillRect(-w / 2, h / 2 - 30, w, 30) }
      ctx.fillStyle = '#b6412e'; ctx.beginPath(); ctx.arc(0, -h / 2 - 1, 7, 0, Math.PI * 2); ctx.fill()
      ctx.restore()
    }
  })
  return <group position={position} rotation={rotation}>
    <Box size={[width + 0.06, width * 0.605 + 0.06, 0.03]} color="#8a7d5f" rounded />
    <mesh position={[0, 0, 0.018]}><planeGeometry args={[width, width * 0.605]} /><meshStandardMaterial map={map} roughness={0.95} /></mesh>
  </group>
}

export function TV({ position, rotation = [0, 0, 0], width = 1.5, kind = 'deck', seed = 0 }:
  { position: Vec3; rotation?: Vec3; width?: number; kind?: ScreenKind; seed?: number }) {
  const height = width * 0.625
  return <group position={position} rotation={rotation}>
    <Box size={[width + 0.06, height + 0.06, 0.05]} color="#262e28" rounded />
    <mesh position={[0, 0, 0.028]} material={screenMaterial(kind, seed)}><planeGeometry args={[width, height]} /></mesh>
  </group>
}

export function Rug({ position, size, color = '#8a9182' }: { position: Vec3; size: [number, number]; color?: string }) {
  return <mesh position={position} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
    <planeGeometry args={size} /><meshStandardMaterial color={color} roughness={1} />
  </mesh>
}

/** Unlit ceiling fixture. Reads as a light source without adding a real light to the scene. */
export function CeilingStrip({ position, size = [1.1, 0.09], rotation = 0 }:
  { position: Vec3; size?: [number, number]; rotation?: number }) {
  return <group position={position} rotation={[0, rotation, 0]}>
    <Box position={[0, 0.03, 0]} size={[size[0], 0.05, size[1] + 0.03]} color="#38423a" />
    <mesh position={[0, -0.001, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <planeGeometry args={size} /><meshBasicMaterial color="#fff2cb" />
    </mesh>
  </group>
}

export function Pendant({ position, drop = 0.55 }: { position: Vec3; drop?: number }) {
  return <group position={position}>
    <Box position={[0, -drop / 2, 0]} size={[0.014, drop, 0.014]} color="#49544c" />
    <mesh position={[0, -drop - 0.08, 0]}><cylinderGeometry args={[0.19, 0.1, 0.18, 20, 1, true]} /><meshStandardMaterial color="#3d4a41" roughness={0.8} side={2} /></mesh>
    <mesh position={[0, -drop - 0.16, 0]} rotation={[Math.PI / 2, 0, 0]}><circleGeometry args={[0.1, 18]} /><meshBasicMaterial color="#ffeec6" /></mesh>
  </group>
}
