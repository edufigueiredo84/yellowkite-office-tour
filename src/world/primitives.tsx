import { useMemo } from 'react'
import { useLoader } from '@react-three/fiber'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { BoxGeometry, CanvasTexture, MeshStandardMaterial, RepeatWrapping, SRGBColorSpace, TextureLoader } from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import type { Vec3 } from '../data/characters'

const unitBox = new BoxGeometry(1, 1, 1)
const materials = new Map<string, MeshStandardMaterial>()
function material(color: string, opacity: number) {
  const key = `${color}:${opacity}`
  if (!materials.has(key)) materials.set(key, new MeshStandardMaterial({ color, roughness: 0.78,
    transparent: opacity < 1, opacity, depthWrite: opacity === 1 }))
  return materials.get(key)!
}

export function Box({ position = [0, 0, 0], size, color = '#e6e1d6', rotation = [0, 0, 0], rounded = false,
  opacity = 1, shadow = false }: { position?: Vec3; size: Vec3; color?: string; rotation?: Vec3; rounded?: boolean; opacity?: number; shadow?: boolean }) {
  const geometry = useMemo(() => rounded ? new RoundedBoxGeometry(...size, 2, Math.min(0.06, Math.min(...size) * 0.3)) : unitBox,
    [rounded, size[0], size[1], size[2]])
  return <mesh position={position} rotation={rotation} geometry={geometry} scale={rounded ? undefined : size}
    material={material(color, opacity)} castShadow={shadow} receiveShadow dispose={null} />
}

export function Solid({ position, size, color = '#e6e1d6', rounded = false }: { position: Vec3; size: Vec3; color?: string; rounded?: boolean }) {
  return <RigidBody type="fixed" position={position} colliders={false}>
    <CuboidCollider args={[size[0] / 2, size[1] / 2, size[2] / 2]} />
    <Box size={size} color={color} rounded={rounded} shadow />
  </RigidBody>
}

const labelCache = new Map<string, CanvasTexture>()
function labelTexture(text: string, bg: string, fg: string, subtitle?: string) {
  const key = [text, bg, fg, subtitle].join('|')
  if (labelCache.has(key)) return labelCache.get(key)!
  const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 256
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = bg; ctx.fillRect(0, 0, 1024, 256)
  ctx.fillStyle = fg; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'
  ctx.font = '500 76px Arial'; ctx.fillText(text, 58, subtitle ? 100 : 128, 915)
  if (subtitle) { ctx.font = '25px Arial'; ctx.fillStyle = fg; ctx.globalAlpha = 0.7; ctx.fillText(subtitle, 62, 181, 900) }
  const texture = new CanvasTexture(canvas); texture.colorSpace = SRGBColorSpace; texture.anisotropy = 4
  labelCache.set(key, texture); return texture
}

export function Sign({ text, subtitle, position, rotation = [0, 0, 0], width = 1.2, bg = '#28332e', fg = '#f3eedc' }:
  { text: string; subtitle?: string; position: Vec3; rotation?: Vec3; width?: number; bg?: string; fg?: string }) {
  const texture = useMemo(() => labelTexture(text, bg, fg, subtitle), [text, bg, fg, subtitle])
  return <mesh position={position} rotation={rotation}>
    <planeGeometry args={[width, width / 4]} />
    <meshStandardMaterial map={texture} roughness={0.95} />
  </mesh>
}

export function Brand({ position, width = 2, white = false, rotation = [0, 0, 0] }: { position: Vec3; width?: number; white?: boolean; rotation?: Vec3 }) {
  const source = useLoader(TextureLoader, white ? '/assets/brand/logo-standart-white-zV0Tc470.svg' : '/assets/brand/logo-standart-black(2).svg')
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas'); canvas.width = 1324; canvas.height = 348
    canvas.getContext('2d')!.drawImage(source.image, 0, 0, 1324, 348)
    const map = new CanvasTexture(canvas); map.colorSpace = SRGBColorSpace; map.anisotropy = 4
    return map
  }, [source])
  return <mesh position={position} rotation={rotation}>
    <planeGeometry args={[width, width * 87 / 331]} />
    <meshStandardMaterial map={texture} transparent roughness={0.8} depthWrite={false} />
  </mesh>
}

export function Floor({ position, size, wood = false }: { position: Vec3; size: [number, number]; wood?: boolean }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas'); canvas.width = 256; canvas.height = 256
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = wood ? '#ae8c67' : '#b9b6a9'; ctx.fillRect(0, 0, 256, 256)
    let seed = 47
    const random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 }
    for (let i = 0; i < (wood ? 170 : 2100); i++) {
      ctx.fillStyle = wood ? `rgba(65,43,22,${random() * 0.13})` : `rgba(${random() > 0.5 ? '75,76,66' : '244,242,231'},${random() * 0.27})`
      ctx.fillRect(random() * 256, random() * 256, wood ? 25 + random() * 150 : 1 + random() * 3, wood ? 0.7 : 1 + random() * 3)
    }
    ctx.fillStyle = wood ? '#82674b' : '#a6a597'; ctx.fillRect(0, 0, 256, wood ? 1.5 : 0.65)
    if (!wood) ctx.fillRect(0, 0, 0.65, 256)
    const map = new CanvasTexture(canvas); map.colorSpace = SRGBColorSpace
    map.wrapS = map.wrapT = RepeatWrapping; map.repeat.set(size[0] / (wood ? 2 : 1.2), size[1] / (wood ? 0.2 : 1.2)); map.anisotropy = 8
    return map
  }, [wood, size[0], size[1]])
  return <mesh position={position} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
    <planeGeometry args={size} /><meshStandardMaterial map={texture} roughness={0.92} />
  </mesh>
}
