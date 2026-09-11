import { Suspense, useEffect, useMemo, useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { RigidBody, CapsuleCollider } from '@react-three/rapier'
import { AnimationMixer, Group, MathUtils, Vector3 } from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { clone } from 'three/addons/utils/SkeletonUtils.js'
import type { CharacterData, NPCState } from '../data/characters'
import { playerRuntime } from '../player/runtime'
import { useGame } from '../game/store'
import { useInteraction } from '../interactions/InteractionManager'
import { playSound } from '../audio/audio'
import { TemporaryCharacter } from './TemporaryCharacter'

function Model({ data, state }: { data: CharacterData; state: React.RefObject<NPCState> }) {
  const gltf = useLoader(GLTFLoader, data.model!)
  const model = useMemo(() => clone(gltf.scene), [gltf.scene])
  const mixer = useMemo(() => new AnimationMixer(model), [model])
  const current = useRef('')
  useFrame((_, delta) => {
    if (useGame.getState().phase !== 'playing') return
    const desired = state.current === 'LOOK_AT_PLAYER' ? data.greetingAnimation : data.idleAnimation
    if (desired !== current.current) {
      const previous = gltf.animations.find(clip => clip.name === current.current)
      const next = gltf.animations.find(clip => clip.name === desired) ?? gltf.animations.find(clip => clip.name === data.idleAnimation)
      if (previous) mixer.clipAction(previous).fadeOut(0.25)
      if (next) mixer.clipAction(next).reset().fadeIn(0.25).play()
      current.current = desired
    }
    mixer.update(delta)
  })
  useEffect(() => () => { mixer.stopAllAction(); mixer.uncacheRoot(model) }, [mixer, model])
  return <primitive object={model} />
}

export function NPC({ data }: { data: CharacterData }) {
  const group = useRef<Group>(null)
  const state = useRef<NPCState>('IDLE')
  const stateTime = useRef(0)
  const noticed = useRef(false)
  const worldPosition = useMemo(() => new Vector3(...data.position), [data.position])
  const talkable = data.dialogues.length > 0 || !!data.choice
  useInteraction({ id: data.id, distance: data.interactionDistance,
    // No approved line yet means no prompt: the NPC is present but has nothing to say.
    label: () => talkable ? data.interactions[0]?.label ?? null : null,
    execute: () => { if (talkable) useGame.getState().startDialogue(data) },
  })
  useFrame((_, delta) => {
    const game = useGame.getState()
    if (!group.current || game.phase !== 'playing') return
    stateTime.current += delta
    const player = playerRuntime.position
    const distance = Math.hypot(player.x - worldPosition.x, player.z - worldPosition.z)
    // Awareness is bounded by the room's actual opening, so nobody greets through a wall.
    const { minX, maxX, minZ, maxZ } = data.awareness
    const near = player.x > minX && player.x < maxX && player.z > minZ && player.z < maxZ && distance < data.noticeDistance
    let next = state.current
    if (game.dialogue?.characterId === data.id) next = 'TALKING'
    else if (state.current === 'TALKING') next = 'RETURN_TO_IDLE'
    else if (near && state.current === 'IDLE') next = 'PLAYER_NEARBY'
    else if (near && state.current === 'PLAYER_NEARBY' && stateTime.current > 0.25) next = 'LOOK_AT_PLAYER'
    else if (!near && (state.current === 'LOOK_AT_PLAYER' || state.current === 'PLAYER_NEARBY')) next = 'RETURN_TO_IDLE'
    else if (state.current === 'RETURN_TO_IDLE' && stateTime.current > 1) next = 'IDLE'
    if (next !== state.current) {
      state.current = next; stateTime.current = 0
      useGame.setState({ npcState: next })
      if (next === 'PLAYER_NEARBY' && !noticed.current) {
        noticed.current = true
        if (!game.greeted) useGame.setState({ greeted: true })
        playSound('greeting')
      }
    }
    const looking = next === 'LOOK_AT_PLAYER' || next === 'TALKING' || next === 'PLAYER_NEARBY'
    const target = looking ? Math.atan2(player.x - worldPosition.x, player.z - worldPosition.z) : data.rotation
    const difference = Math.atan2(Math.sin(target - group.current.rotation.y), Math.cos(target - group.current.rotation.y))
    group.current.rotation.y += difference * (1 - Math.exp(-delta * 4))
    group.current.rotation.y = MathUtils.euclideanModulo(group.current.rotation.y + Math.PI, 2 * Math.PI) - Math.PI
  })
  return <group position={data.position}>
    <RigidBody type="fixed" colliders={false}><CapsuleCollider args={[0.55, 0.25]} position={[0, 0.8, 0]} /></RigidBody>
    <group ref={group} rotation={[0, data.rotation, 0]} userData={{ interactionId: data.id }}>
      <Suspense fallback={<TemporaryCharacter state={state} appearance={data.appearance} />}>
        {data.model ? <Model data={data} state={state} /> : <TemporaryCharacter state={state} appearance={data.appearance} />}
      </Suspense>
    </group>
  </group>
}
