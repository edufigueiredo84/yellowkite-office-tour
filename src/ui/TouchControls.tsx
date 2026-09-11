import { useRef } from 'react'
import { useGame } from '../game/store'
import { playerRuntime } from '../player/runtime'
import { inputBridge } from '../interactions/InteractionManager'

const RADIUS = 50

/**
 * Fixed analogue stick. The knob follows the thumb up to RADIUS and reports a
 * normalised vector, so a small tilt walks and a full tilt moves at the touch speed.
 * Pointer capture keeps the drag alive even if the thumb slides off the pad.
 */
function Stick() {
  const pad = useRef<HTMLDivElement>(null)
  const knob = useRef<HTMLDivElement>(null)
  const active = useRef<number | null>(null)

  const apply = (clientX: number, clientY: number) => {
    if (!pad.current) return
    const rect = pad.current.getBoundingClientRect()
    let dx = clientX - (rect.left + rect.width / 2)
    let dy = clientY - (rect.top + rect.height / 2)
    const length = Math.hypot(dx, dy)
    if (length > RADIUS) { dx = (dx / length) * RADIUS; dy = (dy / length) * RADIUS }
    playerRuntime.move.x = dx / RADIUS
    playerRuntime.move.z = dy / RADIUS
    if (knob.current) knob.current.style.transform = `translate(${dx}px, ${dy}px)`
  }
  const release = () => {
    active.current = null
    playerRuntime.move.x = 0
    playerRuntime.move.z = 0
    if (knob.current) knob.current.style.transform = 'translate(0px, 0px)'
  }

  return <div ref={pad} className="stick" aria-label="Controle de movimento"
    onPointerDown={event => {
      active.current = event.pointerId
      event.currentTarget.setPointerCapture(event.pointerId)
      apply(event.clientX, event.clientY)
    }}
    onPointerMove={event => { if (active.current === event.pointerId) apply(event.clientX, event.clientY) }}
    onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release}>
    <div className="stick-ring" aria-hidden="true" />
    <div ref={knob} className="stick-knob" aria-hidden="true" />
  </div>
}

export function TouchControls() {
  const focus = useGame(state => state.focus)
  const dialogue = useGame(state => state.dialogue)
  const portrait = useGame(state => state.portrait)
  return <div className="touch-layer">
    {portrait && <div className="rotate-hint" role="status">Gire o aparelho para ver melhor</div>}
    <button className="touch-pause" aria-label="Pausar"
      onPointerDown={event => { event.preventDefault(); useGame.getState().setLocked(false) }}>
      <span aria-hidden="true" /><span aria-hidden="true" />
    </button>
    {/* During a conversation the stick and the action button would sit under the
        dialogue panel, so the panel itself takes over: tap it to continue. */}
    {!dialogue && <>
      <Stick />
      <div className="action-area">
        {focus && <span className="action-label">{focus.label}</span>}
        <button className={`action${focus ? ' ready' : ''}`} aria-label={focus?.label ?? 'Interagir'} disabled={!focus}
          onPointerDown={event => { event.preventDefault(); inputBridge.act() }}>
          <span aria-hidden="true">✛</span>
        </button>
      </div>
    </>}
  </div>
}
