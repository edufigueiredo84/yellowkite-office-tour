import { chromium, devices } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import assert from 'node:assert/strict'

// Touch run. Drives the tour the way a phone does: no Pointer Lock, no keyboard.
const executablePath = process.env.TOUR_BROWSER ?? [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].find(existsSync)
mkdirSync('test-results', { recursive: true })
const browser = await chromium.launch({ headless: true, executablePath, args: ['--enable-webgl', '--enable-unsafe-swiftshader', '--disable-background-timer-throttling'] })
const context = await browser.newContext({ ...devices['iPhone 13 landscape'] })
const page = await context.newPage()
const errors = [], report = []
page.on('pageerror', error => errors.push(String(error)))
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
page.on('response', response => { if (response.status() >= 400) errors.push(`HTTP ${response.status()} ${response.url()}`) })
const snapshot = () => page.evaluate(() => window.__tourTest.snapshot())
const shot = name => page.screenshot({ path: `test-results/${name}.png` })
const place = async (x, z, yaw = 0, pitch = 0) => {
  await page.evaluate(args => window.__tourTest.place(...args), [x, z, yaw, pitch])
  await page.waitForTimeout(420)
}
const aim = async (x, y, z) => {
  await page.evaluate(args => window.__tourTest.aim(...args), [x, y, z])
  await page.waitForTimeout(160)
}
const check = async (name, run) => { await run(); report.push({ name, passed: true }); console.log(`PASS ${name}`) }
/** Presses the stick toward (dx, dy) for a while, then releases it. */
const push = async (dx, dy, ms) => {
  const pad = await page.locator('.stick').boundingBox()
  const cx = pad.x + pad.width / 2, cy = pad.y + pad.height / 2
  await page.mouse.move(cx, cy)
  await page.mouse.down()
  await page.mouse.move(cx + dx, cy + dy, { steps: 4 })
  await page.waitForTimeout(ms)
  await page.mouse.up()
  await page.waitForTimeout(200)
}
/** Taps the on-screen action button. */
const act = async () => { await page.locator('.action').click({ force: true }); await page.waitForTimeout(350) }

try {
  await page.goto('http://127.0.0.1:5173/?test=1')
  await page.waitForFunction(() => window.__tourTest?.snapshot().game.ready, { timeout: 40000 })
  await page.waitForTimeout(1200)

  await check('touch device is detected and starts on the lighter tier', async () => {
    const current = await snapshot()
    assert.equal(current.game.touch, true)
    assert.equal(current.game.quality, 'low')
  })
  await check('the desktop-only notice is gone', async () => {
    assert.equal(await page.locator('.touch-notice').count(), 0)
  })
  await check('Entrar starts the tour without Pointer Lock', async () => {
    await page.getByRole('button', { name: /Entrar/ }).click()
    await page.waitForFunction(() => window.__tourTest.snapshot().game.phase === 'playing')
    const current = await snapshot()
    assert.equal(current.pointerLocked, false)
    assert.equal(current.game.locked, true)
    await shot('touch-01-playing')
  })
  await check('on-screen stick and action button are present', async () => {
    await page.locator('.stick').waitFor()
    await page.locator('.action').waitFor()
    await page.locator('.touch-pause').waitFor()
  })
  await check('pushing the stick forward walks the player', async () => {
    await place(1.6, 4.2, 0)
    const before = (await snapshot()).position
    await push(0, -48, 1100)
    const after = (await snapshot()).position
    assert.ok(after[2] < before[2] - 0.8, `z ${before[2]} -> ${after[2]}`)
  })
  await check('stick sideways strafes, and releasing it stops the player', async () => {
    await place(1.6, 4.2, 0)
    await push(48, 0, 900)
    const after = (await snapshot()).position
    assert.ok(after[0] > 1.9, JSON.stringify(after))
    await page.waitForTimeout(700)
    const stopped = await snapshot()
    assert.ok(Math.abs(stopped.position[0] - after[0]) < 0.25, 'seguiu andando depois de soltar')
  })
  await check('dragging the view turns the camera', async () => {
    await place(1.6, 4.2, 0)
    const before = (await snapshot()).yaw
    await page.mouse.move(600, 120)
    await page.mouse.down()
    await page.mouse.move(460, 120, { steps: 6 })
    await page.mouse.up()
    const after = (await snapshot()).yaw
    assert.ok(Math.abs(after - before) > 0.2, `yaw ${before} -> ${after}`)
  })
  await check('action button opens the main door and the player walks in', async () => {
    await place(1.6, 1.6, 0)
    await page.waitForFunction(() => window.__tourTest.snapshot().game.focus?.id === 'main-door')
    assert.equal(await page.locator('.action-label').textContent(), 'Abrir porta')
    await shot('touch-02-door')
    await act()
    await page.waitForFunction(() => window.__tourTest.snapshot().door.state === 'OPEN')
    await push(0, -48, 1500)
    assert.equal((await snapshot()).game.location, 'Corredor')
  })
  await check('tapping the dialogue panel advances the conversation', async () => {
    await place(4.8, -2.95)
    await aim(6, 1.5, -3.45)
    await page.waitForFunction(() => window.__tourTest.snapshot().game.focus?.id === 'ane')
    await act()
    await page.getByText('Oi! Seja bem-vindo à Yellow Kite!', { exact: true }).waitFor()
    await page.waitForTimeout(400)
    await shot('touch-03-dialogue')
    // The stick would sit under the panel, so it steps aside while talking.
    assert.equal(await page.locator('.stick').count(), 0)
    await page.locator('.dialogue').click({ position: { x: 40, y: 20 } })
    await page.getByText('Pode ficar à vontade para conhecer a agência.', { exact: true }).waitFor()
    await page.locator('.dialogue').click({ position: { x: 40, y: 20 } })
    assert.equal((await snapshot()).game.dialogue, null)
    await page.locator('.stick').waitFor()
  })
  await check('coffee choice can be tapped and awards CAFÉ DA ROSINHA', async () => {
    await place(1.7, -26.2)
    await aim(1.15, 1.5, -27.3)
    await page.waitForFunction(() => window.__tourTest.snapshot().game.focus?.id === 'rosinha')
    await act()
    await page.getByText('Oi! Tudo bem?', { exact: true }).waitFor()
    await page.locator('.dialogue').click({ position: { x: 40, y: 20 } })
    await page.getByText('Vai um cafezinho?', { exact: true }).waitFor()
    await page.waitForTimeout(400)
    await shot('touch-04-choice')
    await page.getByRole('button', { name: 'Claro' }).click()
    await page.getByText('Já vou preparar pra você.', { exact: true }).waitFor()
    assert.deepEqual((await snapshot()).game.unlocked, ['coffee'])
  })
  await check('pause button stops the tour and resume brings it back', async () => {
    await page.locator('.dialogue').click({ position: { x: 40, y: 20 } })
    await page.locator('.touch-pause').click()
    await page.getByRole('heading', { name: 'Visita em pausa.' }).waitFor()
    const before = (await snapshot()).position
    await page.waitForTimeout(500)
    assert.deepEqual((await snapshot()).position, before)
    await shot('touch-05-pause')
    await page.getByRole('button', { name: 'Continuar explorando' }).click()
    await page.waitForFunction(() => window.__tourTest.snapshot().game.phase === 'playing')
  })
  await check('landscape shows no rotate hint', async () => {
    assert.equal(await page.locator('.rotate-hint').count(), 0)
    assert.equal((await snapshot()).game.portrait, false)
  })

  const landscape = await snapshot()
  await context.close()

  // Portrait is playable but cramped, so the hint appears and the camera opens up.
  const upright = await browser.newContext({ ...devices['iPhone 13'] })
  const portraitPage = await upright.newPage()
  portraitPage.on('pageerror', error => errors.push(String(error)))
  portraitPage.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
  await portraitPage.goto('http://127.0.0.1:5173/?test=1')
  await portraitPage.waitForFunction(() => window.__tourTest?.snapshot().game.ready, { timeout: 40000 })
  await portraitPage.getByRole('button', { name: /Entrar/ }).click()
  await portraitPage.waitForFunction(() => window.__tourTest.snapshot().game.phase === 'playing')
  await portraitPage.waitForTimeout(900)
  await check('portrait asks the visitor to rotate and widens the field of view', async () => {
    await portraitPage.locator('.rotate-hint').waitFor()
    const fov = await portraitPage.evaluate(() => window.__tourTest.snapshot().fov)
    assert.ok(fov > 75, `fov ${fov}`)
  })
  await portraitPage.screenshot({ path: 'test-results/touch-06-portrait.png' })
  await upright.close()

  assert.deepEqual(errors, [], errors.join('\n'))
  const diagnostics = { checks: report, errors, fps: landscape.game.fps, renderer: landscape.render,
    caveat: 'Chromium headless com emulacao de toque. Nao mede GPU de celular real: FPS e conforto precisam de teste no aparelho.' }
  writeFileSync('test-results/mobile-report.json', JSON.stringify(diagnostics, null, 2))
  console.log(JSON.stringify(diagnostics, null, 2))
} catch (error) {
  await shot('touch-failure').catch(() => {})
  writeFileSync('test-results/mobile-failure.json', JSON.stringify({ error: String(error), checks: report, errors }, null, 2))
  throw error
} finally { await browser.close() }
