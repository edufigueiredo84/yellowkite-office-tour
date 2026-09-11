import { createContext, useContext, useEffect, useMemo, useRef } from 'react'
import type { ReactNode } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Raycaster, Vector2 } from 'three'
import type { Object3D } from 'three'
import { useGame } from '../game/store'
import { playSound } from '../audio/audio'

export interface Interaction {
  id: string; distance: number; label: () => string | null; execute: () => void
}

/** Lets the on-screen action button run exactly what the E key runs. */
export const inputBridge = { act: () => {} }
const Registry = createContext<Map<string, Interaction> | null>(null)
export function useInteraction(interaction: Interaction) {
  const registry = useContext(Registry)
  const latest = useRef(interaction)
  latest.current = interaction
  useEffect(() => {
    if (!registry) throw new Error('Interaction must be inside InteractionManager')
    const registered: Interaction = { id: interaction.id, distance: interaction.distance,
      label: () => latest.current.label(), execute: () => latest.current.execute() }
    registry.set(interaction.id, registered)
    return () => { registry.delete(interaction.id) }
  }, [registry, interaction.id, interaction.distance])
}

export function InteractionManager({ children }: { children: ReactNode }) {
  const registry = useMemo(() => new Map<string, Interaction>(), [])
  const ray = useMemo(() => new Raycaster(), [])
  const center = useMemo(() => new Vector2(), [])
  const elapsed = useRef(0)
  const { camera, scene } = useThree()

  // The first visible surface blocks the ray, preventing interaction through walls
  // and through the decoration of rooms the Zone culler has hidden.
  const resolveFocus = () => {
    const state = useGame.getState()
    if (!state.locked || state.phase !== 'playing' || state.dialogue) return null
    ray.setFromCamera(center, camera); ray.far = 3.2
    const hits = ray.intersectObjects(scene.children, true)
    for (const hit of hits) {
      let object: Object3D | null = hit.object
      let id: string | undefined
      let hidden = false
      while (object) {
        if (!object.visible) hidden = true
        id ??= object.userData.interactionId
        object = object.parent
      }
      if (hidden) continue
      const entry = id ? registry.get(id) : undefined
      const label = entry?.label()
      return entry && label && hit.distance <= entry.distance ? { id: entry.id, label } : null
    }
    return null
  }
  const resolve = useRef(resolveFocus)
  resolve.current = resolveFocus

  useFrame((_, delta) => {
    elapsed.current += delta
    if (elapsed.current < 0.06) return
    elapsed.current = 0
    useGame.getState().setFocus(resolve.current())
  })
  useEffect(() => {
    const act = () => {
      const state = useGame.getState()
      if (!state.locked || state.phase !== 'playing' || state.dialogue?.awaitingChoice) return
      if (state.dialogue) { state.nextDialogue(); return }
      const focus = resolve.current()
      if (focus) registry.get(focus.id)?.execute()
    }
    const keydown = (event: KeyboardEvent) => {
      const state = useGame.getState()
      if (event.repeat || !state.locked || state.phase !== 'playing') return
      if (state.dialogue?.awaitingChoice) {
        const option = state.chooseOption(event.code)
        if (option) { event.preventDefault(); playSound(option.grants ? 'coffee' : 'latch') }
        return
      }
      if (event.code !== 'KeyE') return
      event.preventDefault()
      act()
    }
    inputBridge.act = act
    window.addEventListener('keydown', keydown)
    return () => { window.removeEventListener('keydown', keydown); inputBridge.act = () => {} }
  }, [registry])
  return <Registry.Provider value={registry}>{children}</Registry.Provider>
}
