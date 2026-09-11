import { test } from 'node:test'
import assert from 'node:assert/strict'
import { advanceMotion, angleDifference, characterSeed, createMotion, damp, eyeOpenness, greetingEnvelope } from '../src/characters/motion.ts'

test('greeting settles and only starts again after the visitor leaves', () => {
  const motion = createMotion()
  for (let frame = 0; frame < 240; frame++) advanceMotion(motion, 'LOOK_AT_PLAYER', true, 1 / 60)
  assert.equal(motion.wave, 0)
  advanceMotion(motion, 'TALKING', true, 1 / 60)
  advanceMotion(motion, 'RETURN_TO_IDLE', true, 1 / 60)
  advanceMotion(motion, 'PLAYER_NEARBY', true, 1 / 60)
  assert.equal(motion.wave, 0, 'ending a dialogue must not restart the wave')
  advanceMotion(motion, 'IDLE', false, 1 / 60)
  advanceMotion(motion, 'PLAYER_NEARBY', true, 1 / 60)
  for (let frame = 0; frame < 60; frame++) advanceMotion(motion, 'LOOK_AT_PLAYER', true, 1 / 60)
  assert.ok(motion.wave > .95)
  advanceMotion(motion, 'TALKING', true, 1 / 60)
  assert.equal(motion.wave, 0)
})

test('wave starts and ends at rest; interrupted frames cannot jump the pose', () => {
  assert.equal(greetingEnvelope(-1), 0)
  assert.equal(greetingEnvelope(0), 0)
  assert.equal(greetingEnvelope(1), 1)
  assert.equal(greetingEnvelope(2.8), 0)
  const motion = createMotion()
  advanceMotion(motion, 'IDLE', false, 30)
  assert.equal(motion.time, .1)
})

test('joint damping is consistent at 30, 60 and 144 frames per second', () => {
  const sample = fps => {
    let value = 0
    for (let i = 0; i < fps; i++) value = damp(value, 1.2, 6, 1 / fps)
    return value
  }
  assert.ok(Math.abs(sample(30) - sample(144)) < 1e-12)
  assert.ok(Math.abs(sample(60) - sample(144)) < 1e-12)
  assert.ok(Math.abs(angleDifference(-Math.PI + .1, Math.PI - .1) - .2) < 1e-12)
})

test('eyes stay within eyelid limits and characters have different blink phases', () => {
  const seeds = ['ane', 'rosinha', 'marcos-paulo', 'carina'].map(characterSeed)
  assert.equal(new Set(seeds).size, 4)
  for (const seed of seeds) {
    let closedFrames = 0
    for (let frame = 0; frame < 600; frame++) {
      const openness = eyeOpenness(frame / 60, seed)
      assert.ok(openness >= .039 && openness <= 1)
      if (openness < .5) closedFrames++
    }
    assert.ok(closedFrames > 0 && closedFrames < 30)
  }
})
