/** Horizontal distance to an actual hinged door leaf, including its end caps. */
export function distanceToLeaf(px: number, pz: number, hingeX: number, hingeZ: number, angle: number, width: number) {
  const dx = px - hingeX, dz = pz - hingeZ
  const along = Math.max(0, Math.min(width, dx * Math.cos(angle) - dz * Math.sin(angle)))
  return Math.hypot(dx - along * Math.cos(angle), dz + along * Math.sin(angle))
}
export function wouldSweepPlayer(px: number, pz: number, hx: number, hz: number, current: number, next: number, width: number) {
  const before = distanceToLeaf(px, pz, hx, hz, current, width)
  const after = distanceToLeaf(px, pz, hx, hz, next, width)
  return after < 0.43 && after < before - 0.00001
}
