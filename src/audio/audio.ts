import { useGame } from '../game/store'

let context: AudioContext | undefined
export function unlockAudio() {
  context ??= new AudioContext()
  void context.resume().catch(() => {})
}

type Sound = 'door' | 'latch' | 'step' | 'greeting' | 'coffee' | 'award'

const tones: Record<Sound, { frequency: number; duration: number; bend: number; type: OscillatorType; gain: number }> = {
  door: { frequency: 105, duration: 0.45, bend: 0.4, type: 'triangle', gain: 0.045 },
  latch: { frequency: 230, duration: 0.075, bend: 0.4, type: 'triangle', gain: 0.045 },
  step: { frequency: 70, duration: 0.075, bend: 0.4, type: 'triangle', gain: 0.025 },
  greeting: { frequency: 520, duration: 0.24, bend: 1.5, type: 'sine', gain: 0.045 },
  coffee: { frequency: 320, duration: 0.6, bend: 2.2, type: 'sine', gain: 0.03 },
  award: { frequency: 660, duration: 0.5, bend: 1.5, type: 'sine', gain: 0.05 },
}

// Short procedural effects: no downloads, autoplay or made-up NPC voice.
export function playSound(kind: Sound) {
  if (!context || context.state !== 'running' || useGame.getState().muted) return
  const tone = tones[kind]
  const now = context.currentTime
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  oscillator.type = tone.type
  oscillator.frequency.setValueAtTime(tone.frequency, now)
  oscillator.frequency.exponentialRampToValueAtTime(tone.frequency * tone.bend, now + tone.duration)
  gain.gain.setValueAtTime(0, now)
  gain.gain.linearRampToValueAtTime(tone.gain, now + 0.012)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + tone.duration)
  oscillator.connect(gain).connect(context.destination)
  oscillator.start(now)
  oscillator.stop(now + tone.duration)
  oscillator.onended = () => { oscillator.disconnect(); gain.disconnect() }
}
