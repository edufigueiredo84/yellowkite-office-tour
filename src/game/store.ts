import { create } from 'zustand'
import { achievements } from '../data/characters'
import type { Achievement, CharacterData, Choice, ChoiceOption, NPCState } from '../data/characters'

export type Phase = 'start' | 'playing' | 'paused'
type Dialogue = {
  characterId: string; name: string; team: string
  lines: string[]; index: number
  choice: Choice | null; awaitingChoice: boolean
}
interface GameState {
  ready: boolean; phase: Phase; locked: boolean; focus: { id: string; label: string } | null
  dialogue: Dialogue | null; greeted: boolean; visitedRH: boolean; spokeToAne: boolean
  location: string; visited: string[]; npcState: NPCState; muted: boolean; quality: 'high' | 'low'
  unlocked: string[]; toast: Achievement | null
  pointerError: string; fps: number
  setReady: () => void
  setLocked: (locked: boolean) => void
  setFocus: (focus: GameState['focus']) => void
  startDialogue: (character: CharacterData) => void
  nextDialogue: () => void
  chooseOption: (key: string) => ChoiceOption | null
  unlock: (id: string) => Achievement | null
  dismissToast: () => void
}

export const useGame = create<GameState>((set, get) => ({
  ready: false, phase: 'start', locked: false, focus: null, dialogue: null,
  greeted: false, visitedRH: false, spokeToAne: false, location: 'Entrada', visited: ['Entrada'],
  npcState: 'IDLE', muted: false, quality: 'high', unlocked: [], toast: null,
  pointerError: '', fps: 0,
  setReady: () => set({ ready: true }),
  setLocked: (locked) => set({ locked, phase: locked ? 'playing' : (get().phase === 'start' ? 'start' : 'paused'), focus: null }),
  setFocus: (focus) => {
    const previous = get().focus
    if (previous?.id !== focus?.id || previous?.label !== focus?.label) set({ focus })
  },
  startDialogue: (character) => set({
    dialogue: {
      characterId: character.id, name: character.name, team: character.team,
      lines: character.dialogues, index: 0,
      choice: character.choice ?? null,
      awaitingChoice: character.dialogues.length === 0 && !!character.choice,
    },
    focus: null,
  }),
  nextDialogue: () => {
    const current = get().dialogue
    if (!current || current.awaitingChoice) return
    if (current.index + 1 < current.lines.length) set({ dialogue: { ...current, index: current.index + 1 } })
    else if (current.choice) set({ dialogue: { ...current, awaitingChoice: true } })
    else set({ dialogue: null, spokeToAne: get().spokeToAne || current.characterId === 'ane' })
  },
  chooseOption: (key) => {
    const current = get().dialogue
    if (!current?.awaitingChoice || !current.choice) return null
    const option = current.choice.options.find(entry => entry.key === key)
    if (!option) return null
    if (option.grants) get().unlock(option.grants)
    if (!option.replies.length) set({ dialogue: null })
    else set({ dialogue: { ...current, lines: option.replies, index: 0, choice: null, awaitingChoice: false } })
    return option
  },
  unlock: (id) => {
    if (get().unlocked.includes(id)) return null
    const award = achievements[id]
    if (!award) return null
    set({ unlocked: [...get().unlocked, id], toast: award })
    return award
  },
  dismissToast: () => set({ toast: null }),
}))
