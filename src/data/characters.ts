export type NPCState = 'IDLE' | 'PLAYER_NEARBY' | 'LOOK_AT_PLAYER' | 'TALKING' | 'RETURN_TO_IDLE'
export type Vec3 = [number, number, number]

/** Stand-in look for the placeholder mesh. Replaced entirely once approved GLB models arrive. */
export interface Appearance { skin: string; hair: string; top: string; bottom: string; hairStyle: 'short' | 'long' | 'tied' }

export interface ChoiceOption { id: string; key: string; hint: string; label: string; replies: string[]; grants?: string }
export interface Choice { prompt: string; options: ChoiceOption[] }

/** Region the NPC can notice the player from, so nobody greets through a wall. */
export interface Awareness { minX: number; maxX: number; minZ: number; maxZ: number }

export interface CharacterData {
  id: string
  name: string
  role: string | null
  team: string
  model: string | null
  position: Vec3
  rotation: number
  idleAnimation: string
  greetingAnimation: string
  interactionDistance: number
  noticeDistance: number
  awareness: Awareness
  dialogues: string[]
  choice?: Choice
  appearance: Appearance
  interactions: { id: string; label: string; type: 'dialogue' }[]
}

// Temporary visual stand-ins; none of them represents the real appearance of the person.
// Set `model` to a local GLB URL and fill the animation names when approved models arrive.

export const ane: CharacterData = {
  id: 'ane', name: 'Ane', role: null, team: 'RH', model: null,
  position: [6, 0, -3.45], rotation: 0,
  idleAnimation: 'Idle', greetingAnimation: 'Wave',
  interactionDistance: 2.8, noticeDistance: 4.6,
  awareness: { minX: 3.05, maxX: 8.6, minZ: -4.7, maxZ: -0.75 },
  dialogues: ['Oi! Seja bem-vindo à Yellow Kite!', 'Pode ficar à vontade para conhecer a agência.'],
  appearance: { skin: '#be9077', hair: '#493c33', top: '#e0d9c7', bottom: '#3d514b', hairStyle: 'short' },
  interactions: [{ id: 'talk', label: 'Conversar com Ane', type: 'dialogue' }],
}

// Brief supplied: "Rosinha faz nosso café e cuida da gente" and the "Vai um cafezinho?" prompt
// with its two options. The greeting and the two replies are provisional placeholders
// (TODO_COPY) waiting on approved wording.
export const rosinha: CharacterData = {
  id: 'rosinha', name: 'Rosinha', role: null, team: 'Copa', model: null,
  position: [1.15, 0, -27.3], rotation: 0.35,
  idleAnimation: 'Idle', greetingAnimation: 'Wave',
  interactionDistance: 2.8, noticeDistance: 4.6,
  awareness: { minX: 0.08, maxX: 3.12, minZ: -28.92, maxZ: -23 },
  dialogues: ['Oi! Tudo bem?'],
  choice: {
    prompt: 'Vai um cafezinho?',
    options: [
      { id: 'accept', key: 'Digit1', hint: '1', label: 'Claro', replies: ['Já vou preparar pra você.'], grants: 'coffee' },
      { id: 'decline', key: 'Digit2', hint: '2', label: 'Agora não', replies: ['Sem problema. Quando quiser, é só chamar.'] },
    ],
  },
  appearance: { skin: '#a9765a', hair: '#3b332e', top: '#cf9f5a', bottom: '#43503f', hairStyle: 'tied' },
  interactions: [{ id: 'talk', label: 'Conversar com Rosinha', type: 'dialogue' }],
}

// Directors are present in the room, but no role, history or institutional line was supplied.
// `dialogues` stays empty on purpose: they greet and look, and no talk prompt is offered.
export const marcosPaulo: CharacterData = {
  id: 'marcos-paulo', name: 'Marcos Paulo', role: null, team: 'Diretoria', model: null,
  position: [4.6, 0, -28.1], rotation: 0.25,
  idleAnimation: 'Idle', greetingAnimation: 'Wave',
  interactionDistance: 2.8, noticeDistance: 5,
  awareness: { minX: 3.28, maxX: 8.52, minZ: -28.92, maxZ: -23 },
  dialogues: [],
  appearance: { skin: '#c19a7d', hair: '#4a423a', top: '#5d6b63', bottom: '#39423c', hairStyle: 'short' },
  interactions: [{ id: 'talk', label: 'Conversar com Marcos Paulo', type: 'dialogue' }],
}

export const carina: CharacterData = {
  id: 'carina', name: 'Carina', role: null, team: 'Diretoria', model: null,
  position: [7.2, 0, -28.1], rotation: -0.25,
  idleAnimation: 'Idle', greetingAnimation: 'Wave',
  interactionDistance: 2.8, noticeDistance: 5,
  awareness: { minX: 3.28, maxX: 8.52, minZ: -28.92, maxZ: -23 },
  dialogues: [],
  appearance: { skin: '#d0a583', hair: '#584434', top: '#d9d2bd', bottom: '#414d48', hairStyle: 'long' },
  interactions: [{ id: 'talk', label: 'Conversar com Carina', type: 'dialogue' }],
}

export const characters: CharacterData[] = [ane, rosinha, marcosPaulo, carina]

/** Minimal award record. Architecture only, as asked: no progression or scoring system. */
export interface Achievement { id: string; title: string; description: string }
export const achievements: Record<string, Achievement> = {
  coffee: { id: 'coffee', title: 'CAFÉ DA ROSINHA', description: 'Agora sim você conheceu a Yellow Kite.' },
}

// Expansion data deliberately has no invented staff, speeches or room detail.
export const futureContent = {
  leadZeppelin: { status: 'TODO_CONTENT', characters: [] },
  performance: { status: 'TODO_CONTENT', characters: [] },
  rocket: { status: 'TODO_CONTENT', characters: [] },
  copa: { status: 'TODO_COPY', characters: ['rosinha'] },
  directors: { status: 'TODO_CONTENT', characters: ['marcos-paulo', 'carina'] },
  technologyAndArt: { status: 'TODO_CONTENT', characters: [] },
} as const

/** Spawn slots reserved for staff the client has not supplied yet. */
export const npcSlots: { room: string; position: Vec3; rotation: number }[] = [
  { room: 'Lead Zeppelin', position: [5.3, 0, -6.6], rotation: Math.PI },
  { room: 'Lead Zeppelin', position: [6.6, 0, -7.9], rotation: 0 },
  { room: 'Performance', position: [5.3, 0, -11.4], rotation: Math.PI },
  { room: 'Performance', position: [6.6, 0, -12.7], rotation: 0 },
  { room: 'Rocket', position: [5.3, 0, -16.2], rotation: Math.PI },
  { room: 'Rocket', position: [6.6, 0, -17.5], rotation: 0 },
  { room: 'Tecnologia + Direção de Arte', position: [12.6, 0, -20.6], rotation: Math.PI },
  { room: 'Tecnologia + Direção de Arte', position: [16.2, 0, -21.2], rotation: Math.PI },
  { room: 'Tecnologia + Direção de Arte', position: [10.0, 0, -23.6], rotation: Math.PI / 2 },
  { room: 'Tecnologia + Direção de Arte', position: [16.4, 0, -27.4], rotation: -Math.PI / 2 },
]
