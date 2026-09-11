import { Vector3 } from 'three'

export const playerRuntime = {
  position: new Vector3(1.6, 0.85, 5.3),
  yaw: 0, pitch: 0,
  /** Analog stick input, -1..1 on each axis. Zero when the player is on a keyboard. */
  move: { x: 0, z: 0 },
  teleport: null as null | ((x: number, z: number) => void),
}
