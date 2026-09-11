import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { CapsuleCollider, RigidBody, useBeforePhysicsStep } from '@react-three/rapier'
import type { RapierRigidBody } from '@react-three/rapier'
import { Euler, Vector3 } from 'three'
import { useGame } from '../game/store'
import { playerRuntime } from './runtime'
import { playSound } from '../audio/audio'

const keys = new Set<string>()
const direction = new Vector3()
const up = new Vector3(0, 1, 0)
const euler = new Euler(0, 0, 0, 'YXZ')
const validKeys = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ShiftLeft', 'ShiftRight']
const MOUSE_SENSITIVITY = 0.0018
const TOUCH_SENSITIVITY = 0.0042
const PITCH_LIMIT = 1.45

export function Player() {
  const body = useRef<RapierRigidBody>(null)
  const { camera, gl } = useThree()
  const stepTime = useRef(0)
  useEffect(() => {
    // `locked` means "the player has control": Pointer Lock on desktop, tapping Entrar on touch.
    const onKeyDown = (event: KeyboardEvent) => {
      if (validKeys.includes(event.code) && useGame.getState().locked) {
        event.preventDefault(); keys.add(event.code)
      }
    }
    const onKeyUp = (event: KeyboardEvent) => { keys.delete(event.code) }
    const clear = () => { keys.clear(); playerRuntime.move.x = 0; playerRuntime.move.z = 0 }
    const onLock = () => {
      clear()
      if (!useGame.getState().touch) useGame.getState().setLocked(document.pointerLockElement === gl.domElement)
    }
    const onBlur = () => {
      clear()
      if (document.pointerLockElement) document.exitPointerLock()
      else if (useGame.getState().touch && useGame.getState().phase === 'playing') useGame.getState().setLocked(false)
    }
    const onVisibility = () => { if (document.hidden) onBlur() }
    const onMouse = (event: MouseEvent) => {
      if (document.pointerLockElement !== gl.domElement || useGame.getState().phase !== 'playing') return
      playerRuntime.yaw -= event.movementX * MOUSE_SENSITIVITY
      playerRuntime.pitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, playerRuntime.pitch - event.movementY * MOUSE_SENSITIVITY))
    }

    // Dragging anywhere the on-screen controls do not cover turns the camera.
    // Tracking by pointerId lets one thumb steer while the other drives the stick.
    const drags = new Map<number, { x: number; y: number }>()
    const onPointerDown = (event: PointerEvent) => {
      const state = useGame.getState()
      // Gated on touch mode rather than pointerType, so a tablet paired with a mouse
      // still drags to look, and a desktop keeps looking through Pointer Lock alone.
      if (!state.touch || state.phase !== 'playing' || state.dialogue) return
      drags.set(event.pointerId, { x: event.clientX, y: event.clientY })
      gl.domElement.setPointerCapture?.(event.pointerId)
    }
    const onPointerMove = (event: PointerEvent) => {
      const previous = drags.get(event.pointerId)
      if (!previous) return
      playerRuntime.yaw -= (event.clientX - previous.x) * TOUCH_SENSITIVITY
      playerRuntime.pitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT,
        playerRuntime.pitch - (event.clientY - previous.y) * TOUCH_SENSITIVITY))
      previous.x = event.clientX; previous.y = event.clientY
    }
    const onPointerUp = (event: PointerEvent) => { drags.delete(event.pointerId) }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)
    document.addEventListener('visibilitychange', onVisibility)
    document.addEventListener('pointerlockchange', onLock)
    document.addEventListener('mousemove', onMouse)
    gl.domElement.addEventListener('pointerdown', onPointerDown)
    gl.domElement.addEventListener('pointermove', onPointerMove)
    gl.domElement.addEventListener('pointerup', onPointerUp)
    gl.domElement.addEventListener('pointercancel', onPointerUp)
    playerRuntime.teleport = (x, z) => {
      body.current?.setTranslation({ x, y: 0.85, z }, true)
      body.current?.setLinvel({ x: 0, y: 0, z: 0 }, true)
      clear()
    }
    return () => {
      window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur); document.removeEventListener('visibilitychange', onVisibility)
      document.removeEventListener('pointerlockchange', onLock); document.removeEventListener('mousemove', onMouse)
      gl.domElement.removeEventListener('pointerdown', onPointerDown)
      gl.domElement.removeEventListener('pointermove', onPointerMove)
      gl.domElement.removeEventListener('pointerup', onPointerUp)
      gl.domElement.removeEventListener('pointercancel', onPointerUp)
      playerRuntime.teleport = null; clear()
    }
  }, [gl])

  useBeforePhysicsStep(() => {
    if (!body.current) return
    const state = useGame.getState()
    const moving = state.phase === 'playing' && state.locked && !state.dialogue
    const stick = playerRuntime.move
    direction.set(
      moving ? Number(keys.has('KeyD')) - Number(keys.has('KeyA')) + stick.x : 0, 0,
      moving ? Number(keys.has('KeyS')) - Number(keys.has('KeyW')) + stick.z : 0)
    // Clamping instead of normalising keeps the stick analogue while capping keyboard diagonals.
    if (direction.lengthSq() > 1) direction.normalize()
    direction.applyAxisAngle(up, playerRuntime.yaw)
    const running = keys.has('ShiftLeft') || keys.has('ShiftRight')
    const speed = running ? 4.1 : state.touch ? 3.3 : 2.55
    const velocity = body.current.linvel()
    const smoothing = direction.lengthSq() ? 0.22 : 0.42
    body.current.setLinvel({ x: velocity.x + (direction.x * speed - velocity.x) * smoothing,
      y: velocity.y, z: velocity.z + (direction.z * speed - velocity.z) * smoothing }, true)
    if (body.current.translation().y < -5) playerRuntime.teleport?.(1.6, 5.3)
  })

  useFrame((_, delta) => {
    if (!body.current) return
    const position = body.current.translation()
    playerRuntime.position.set(position.x, position.y, position.z)
    camera.position.set(position.x, position.y + 0.78, position.z)
    euler.set(playerRuntime.pitch, playerRuntime.yaw, 0)
    camera.quaternion.setFromEuler(euler)
    const state = useGame.getState()
    const velocity = body.current.linvel()
    if (state.phase === 'playing' && !state.dialogue && Math.hypot(velocity.x, velocity.z) > 0.6 && Math.abs(velocity.y) < 0.2) {
      stepTime.current += delta * Math.hypot(velocity.x, velocity.z)
      if (stepTime.current > 1.55) { playSound('step'); stepTime.current = 0 }
    }
    let location = position.z > 0 ? 'Entrada' : 'Corredor'
    if (position.x > 3.2 && position.z < 0 && position.z > -4.8) location = 'RH'
    if (position.x > 3.2 && position.z <= -4.8 && position.z > -9.6) location = 'Lead Zeppelin'
    if (position.x > 3.2 && position.z <= -9.6 && position.z > -14.4) location = 'Performance'
    if (position.x > 3.2 && position.z <= -14.4 && position.z > -19.2) location = 'Rocket'
    if (position.z < -23) location = position.x < 3.2 ? 'Copa' : position.x < 8.6 ? 'Sala dos diretores' : 'Tecnologia + Direção de Arte'
    else if (position.x > 8.6 && position.z < -19.2) location = 'Tecnologia + Direção de Arte'
    if (location !== state.location) useGame.setState({ location, visitedRH: state.visitedRH || location === 'RH' })
  })

  return <RigidBody ref={body} name="player" position={[1.6, 0.85, 5.3]} colliders={false}
    enabledRotations={[false, false, false]} friction={0} restitution={0} ccd canSleep={false}>
    <CapsuleCollider args={[0.56, 0.28]} friction={0} mass={70} />
  </RigidBody>
}
