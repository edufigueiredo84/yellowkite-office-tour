import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import assert from 'node:assert/strict'

const executablePath = process.env.TOUR_BROWSER ?? [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].find(existsSync)
mkdirSync('test-results', { recursive: true })
const browser = await chromium.launch({ headless: true, executablePath,
  args: ['--enable-webgl', '--enable-unsafe-swiftshader', '--disable-background-timer-throttling'] })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 },
  recordVideo: { dir: 'test-results/character-video', size: { width: 1440, height: 900 } } })
const video = page.video()
const errors = [], checks = []
page.on('pageerror', error => errors.push(String(error)))
const snapshot = () => page.evaluate(() => window.__tourTest.snapshot())
const pose = async () => (await snapshot()).characters.find(character => character.id === 'ane')
const check = async (name, run) => { await run(); checks.push(name); console.log(`PASS ${name}`) }
const place = async (x, z, target) => {
  await page.evaluate(([x, z]) => window.__tourTest.place(x, z), [x, z])
  await page.waitForTimeout(200)
  await page.evaluate(target => window.__tourTest.aim(...target), target)
}
try {
  await page.goto('http://127.0.0.1:5173/?test=1')
  await page.waitForFunction(() => window.__tourTest?.snapshot().game.ready, { timeout: 40000 })
  await page.getByRole('button', { name: /Entrar/ }).click()
  await page.waitForFunction(() => window.__tourTest.snapshot().game.phase === 'playing')
  await place(4.8, -2.95, [6, 1.5, -3.45])
  await check('greeting bends the elbow and settles without repeating', async () => {
    await page.waitForFunction(() => window.__tourTest.snapshot().characters.find(c => c.id === 'ane').elbow[2] > .85)
    await page.screenshot({ path: 'test-results/character-wave.png' })
    await page.waitForFunction(() => Math.abs(window.__tourTest.snapshot().characters.find(c => c.id === 'ane').elbow[2]) < .01)
    await page.waitForTimeout(500)
    assert.ok(Math.abs((await pose()).shoulder[2] - .07) < .02)
  })
  await check('head and torso follow independently while feet keep their facing', async () => {
    const current = await pose()
    assert.equal(current.facing, 0)
    assert.ok(Math.abs(current.head[1]) > .3 && Math.abs(current.head[1]) <= .851)
    assert.ok(Math.abs(current.torso[1]) <= .421)
    assert.notEqual(current.head[1], current.torso[1])
    await page.screenshot({ path: 'test-results/character-ane.png' })
  })
  await check('pause freezes all character joints and eyelids', async () => {
    await page.evaluate(() => document.exitPointerLock())
    await page.waitForFunction(() => window.__tourTest.snapshot().game.phase === 'paused')
    const before = (await snapshot()).characters
    await page.waitForTimeout(500)
    assert.deepEqual((await snapshot()).characters, before)
    await page.getByRole('button', { name: 'Continuar explorando' }).click()
    await page.waitForFunction(() => window.__tourTest.snapshot().game.phase === 'playing')
  })
  await check('dialogue uses conversational gestures and does not restart the wave', async () => {
    await page.waitForFunction(() => window.__tourTest.snapshot().game.focus?.id === 'ane')
    await page.keyboard.press('e')
    await page.waitForFunction(() => window.__tourTest.snapshot().game.dialogue?.characterId === 'ane')
    await page.waitForTimeout(600)
    assert.ok((await pose()).elbow[0] < -.2)
    await page.screenshot({ path: 'test-results/character-ane-dialogue.png' })
    await page.keyboard.press('e')
    await page.waitForTimeout(350)
    await page.keyboard.press('e')
    await page.waitForFunction(() => !window.__tourTest.snapshot().game.dialogue)
    await page.waitForTimeout(2200)
    assert.ok(Math.abs((await pose()).shoulder[2] - .07) < .02)
  })
  await place(1.3, -26.15, [1.15, 1.45, -27.3])
  await page.waitForTimeout(3200)
  await page.screenshot({ path: 'test-results/character-rosinha.png' })
  await place(5.9, -27.8, [7.2, 1.45, -28.1])
  await page.waitForTimeout(3200)
  await page.screenshot({ path: 'test-results/character-carina.png' })
  await page.evaluate(() => window.__tourTest.aim(4.6, 1.45, -28.1))
  await page.waitForTimeout(500)
  await page.screenshot({ path: 'test-results/character-marcos.png' })
  assert.deepEqual(errors, [])
  writeFileSync('test-results/characters-report.json', JSON.stringify({ checks, errors }, null, 2))
} finally {
  try {
    await page.context().close()
    await video.saveAs('test-results/characters.webm')
  } finally { await browser.close() }
}
