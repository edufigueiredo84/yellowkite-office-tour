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

export function Player() {
  const body = useRef<RapierRigidBody>(null)
  const { camera, gl } = useThree()
  const stepTime = useRef(0)
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (validKeys.includes(event.code) && document.pointerLockElement === gl.domElement) {
        event.preventDefault(); keys.add(event.code)
      }
    }
    const onKeyUp = (event: KeyboardEvent) => { keys.delete(event.code) }
    const clear = () => { keys.clear() }
    const onLock = () => {
      clear()
      useGame.getState().setLocked(document.pointerLockElement === gl.domElement)
    }
    const onBlur = () => { clear(); if (document.pointerLockElement) document.exitPointerLock() }
    const onVisibility = () => { if (document.hidden) onBlur() }
    const onMouse = (event: MouseEvent) => {
      if (document.pointerLockElement !== gl.domElement || useGame.getState().phase !== 'playing') return
      playerRuntime.yaw -= event.movementX * 0.0018
      playerRuntime.pitch = Math.max(-1.45, Math.min(1.45, playerRuntime.pitch - event.movementY * 0.0018))
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)
    document.addEventListener('visibilitychange', onVisibility)
    document.addEventListener('pointerlockchange', onLock)
    document.addEventListener('mousemove', onMouse)
    playerRuntime.teleport = (x, z) => {
      body.current?.setTranslation({ x, y: 0.85, z }, true)
      body.current?.setLinvel({ x: 0, y: 0, z: 0 }, true)
      keys.clear()
    }
    return () => {
      window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur); document.removeEventListener('visibilitychange', onVisibility)
      document.removeEventListener('pointerlockchange', onLock); document.removeEventListener('mousemove', onMouse)
      playerRuntime.teleport = null; clear()
    }
  }, [gl])

  useBeforePhysicsStep(() => {
    if (!body.current) return
    const state = useGame.getState()
    const moving = state.phase === 'playing' && state.locked && !state.dialogue
    direction.set(moving ? Number(keys.has('KeyD')) - Number(keys.has('KeyA')) : 0, 0,
      moving ? Number(keys.has('KeyS')) - Number(keys.has('KeyW')) : 0).normalize()
    direction.applyAxisAngle(up, playerRuntime.yaw)
    const speed = keys.has('ShiftLeft') || keys.has('ShiftRight') ? 4.1 : 2.55
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
