import { useEffect, useState } from 'react'
import { useGame } from '../game/store'
import { playSound, unlockAudio } from '../audio/audio'
import { playerRuntime } from '../player/runtime'

const logo = '/assets/brand/logo-standart-white-zV0Tc470.svg'

async function enter() {
  const canvas = document.querySelector('canvas')
  if (!canvas || !useGame.getState().ready) return
  useGame.setState({ pointerError: '' })
  unlockAudio()
  try {
    await canvas.requestPointerLock()
  } catch {
    useGame.setState({ pointerError: 'Clique em Entrar novamente para ativar o mouse.' })
  }
}

function Controls() {
  return <div className="controls"><span><kbd>W A S D</kbd> Andar</span><span><kbd>Mouse</kbd> Olhar</span><span><kbd>Shift</kbd> Acelerar</span><span><kbd>E</kbd> Interagir</span><span><kbd>Esc</kbd> Pausar</span></div>
}

function Award() {
  const toast = useGame(state => state.toast)
  useEffect(() => {
    if (!toast) return
    playSound('award')
    const timer = setTimeout(() => useGame.getState().dismissToast(), 5600)
    return () => clearTimeout(timer)
  }, [toast])
  if (!toast) return null
  return <div className="award" role="status">
    <span className="award-mark" aria-hidden="true" />
    <div><small>{toast.title}</small><span>{toast.description}</span></div>
  </div>
}

export function Interface() {
  const ready = useGame(state => state.ready)
  const phase = useGame(state => state.phase)
  const focus = useGame(state => state.focus)
  const dialogue = useGame(state => state.dialogue)
  const location = useGame(state => state.location)
  const visited = useGame(state => state.visitedRH)
  const muted = useGame(state => state.muted)
  const quality = useGame(state => state.quality)
  const error = useGame(state => state.pointerError)
  const [showStats, setShowStats] = useState(false)
  const fps = useGame(state => state.fps)
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (event.code === 'F3') { event.preventDefault(); setShowStats(value => !value) }
    }
    const lockError = () => useGame.setState({ pointerError: 'O navegador não ativou o mouse. Clique no botão para tentar novamente.' })
    window.addEventListener('keydown', listener)
    document.addEventListener('pointerlockerror', lockError)
    return () => { window.removeEventListener('keydown', listener); document.removeEventListener('pointerlockerror', lockError) }
  }, [])

  return <div className="interface">
    {phase === 'start' && <div className="start-screen">
      <div className="start-content">
        <img src={logo} alt="Yellow Kite" width="331" height="87" />
        <button className="primary enter" onClick={enter} disabled={!ready}>{ready ? 'Entrar' : 'Preparando a visita…'}{ready && <span aria-hidden="true">↗</span>}</button>
        {error && <p className="error" role="alert">{error}</p>}
      </div>
    </div>}
    {phase === 'playing' && <>
      <div className="location"><span className="location-dot" /><div><small>YELLOW KITE / OFFICE TOUR</small><span>{location}</span></div></div>
      <div className="pause-hint"><kbd>Esc</kbd><span>Pausar</span></div>
      {!dialogue && <div className={`reticle${focus ? ' active' : ''}`} aria-hidden="true" />}
      {!dialogue && focus && <div className="interaction-prompt" role="status"><kbd>E</kbd><span>{focus.label}</span></div>}
      {!dialogue && !visited && <div className="walk-hint"><Controls /></div>}
      <Award />
      {dialogue && <section className="dialogue" role="dialog" aria-label={`Conversa com ${dialogue.name}`}>
        <div className="dialogue-heading">
          <span>{dialogue.name}</span><small>{dialogue.team}</small>
          {!dialogue.awaitingChoice && <span className="dialogue-count">0{dialogue.index + 1} / 0{dialogue.lines.length}</span>}
        </div>
        <p aria-live="polite">{dialogue.awaitingChoice ? dialogue.choice?.prompt : dialogue.lines[dialogue.index]}</p>
        {dialogue.awaitingChoice
          ? <div className="dialogue-choices">{dialogue.choice?.options.map(option =>
              <button key={option.id} className="choice" onClick={() => {
                const chosen = useGame.getState().chooseOption(option.key)
                if (chosen) playSound(chosen.grants ? 'coffee' : 'latch')
              }}><kbd>{option.hint}</kbd><span>{option.label}</span></button>)}</div>
          : <div className="dialogue-next"><span>{dialogue.index === dialogue.lines.length - 1 && !dialogue.choice ? 'Voltar a explorar' : 'Continuar'}</span><kbd>E</kbd></div>}
      </section>}
    </>}
    {phase === 'paused' && <div className="pause-screen"><section className="pause-card" role="dialog" aria-label="Visita em pausa">
      <img src={logo} alt="Yellow Kite" width="215" height="57" />
      <small className="eyebrow">NO SEU TEMPO</small><h1>Visita em pausa.</h1>
      <button className="primary" onClick={enter}>Continuar explorando <span aria-hidden="true">↗</span></button>
      <Controls />
      <div className="settings"><button onClick={() => useGame.setState({ muted: !muted })}>Som <strong>{muted ? 'Desligado' : 'Ligado'}</strong></button><button onClick={() => useGame.setState({ quality: quality === 'high' ? 'low' : 'high' })}>Gráficos <strong>{quality === 'high' ? 'Qualidade' : 'Desempenho'}</strong></button></div>
      <button className="text-button" onClick={() => { playerRuntime.teleport?.(1.6, 5.3); playerRuntime.yaw = 0; playerRuntime.pitch = 0; useGame.setState({ dialogue: null }); void enter() }}>Voltar à entrada</button>
      {error && <p className="error" role="alert">{error}</p>}
    </section></div>}
    {showStats && <div className="stats">{fps} FPS · {quality === 'high' ? 'Qualidade' : 'Desempenho'}</div>}
    <div className="touch-notice">Esta visita foi criada para computador, com teclado e mouse.</div>
  </div>
}
