import { test } from 'node:test'
import assert from 'node:assert/strict'
import { distanceToLeaf, wouldSweepPlayer } from '../src/world/doorMath.ts'

test('closed leaf spans the opening and rotates around its hinge', () => {
  assert.equal(distanceToLeaf(0.9, 0, 0, 0, 0, 1.7), 0)
  assert.ok(distanceToLeaf(0.9, 0, 0, 0, Math.PI / 2, 1.7) > 0.89)
  assert.ok(distanceToLeaf(0, -0.9, 0, 0, Math.PI / 2, 1.7) < 1e-10)
})

test('a closing door reverses before its leaf reaches the player', () => {
  assert.equal(wouldSweepPlayer(1.1, -0.2, 0, 0, 0.65, 0.5, 1.7), true)
  assert.equal(wouldSweepPlayer(1.1, 0.7, 0, 0, 0, 0.1, 1.7), false)
  assert.equal(wouldSweepPlayer(4, 4, 0, 0, 0.3, 0.2, 1.7), false)
})

test('end caps still protect players near the tip of the leaf', () => {
  assert.ok(Math.abs(distanceToLeaf(1.9, 0, 0, 0, 0, 1.7) - 0.2) < 1e-10)
})
