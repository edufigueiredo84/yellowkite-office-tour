import type { NPCState } from '../data/characters.ts'

export interface Attention { yaw: number; pitch: number; engaged: boolean }
export const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))
export const angleDifference = (target: number, current: number) => Math.atan2(Math.sin(target - current), Math.cos(target - current))
export const damp = (current: number, target: number, rate: number, delta: number) => current + (target - current) * (1 - Math.exp(-rate * delta))
const smoothstep = (value: number) => { const t = clamp(value, 0, 1); return t * t * (3 - 2 * t) }

/** One short wave per approach, with time to lift and lower the hand. */
export function greetingEnvelope(seconds: number) {
  if (seconds < 0 || seconds >= 2.8) return 0
  return smoothstep(seconds / 0.65) * (1 - smoothstep((seconds - 1.85) / 0.95))
}

export function characterSeed(id: string) {
  let hash = 0
  for (const letter of id) hash = (hash * 31 + letter.charCodeAt(0)) >>> 0
  return (hash % 1000) / 1000
}

/** Eyelids close briefly; per-character timing avoids synchronized blinking. */
export function eyeOpenness(time: number, seed: number) {
  const period = 3.4 + seed * 2.1
  const phase = (time + seed * period) % period
  return phase < 0.17 ? 1 - Math.sin(Math.PI * phase / 0.17) ** 2 * 0.96 : 1
}

export function createMotion() { return { time: 0, greetingTime: -1, engaged: false, wave: 0 } }

export function advanceMotion(motion: ReturnType<typeof createMotion>, state: NPCState, engaged: boolean, delta: number) {
  const dt = clamp(delta, 0, 0.1)
  motion.time += dt
  if (engaged && !motion.engaged && state !== 'TALKING') motion.greetingTime = 0
  else if (motion.greetingTime >= 0) motion.greetingTime += dt
  motion.engaged = engaged
  motion.wave = engaged && state !== 'TALKING' ? greetingEnvelope(motion.greetingTime) : 0
  return dt
}
