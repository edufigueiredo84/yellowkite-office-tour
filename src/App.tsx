import { Component, Suspense, lazy } from 'react'
import type { ReactNode } from 'react'
import { Interface } from './ui/Interface'

const Game = lazy(() => import('./game/Game'))

class GameBoundary extends Component<{ children: ReactNode }, { error: boolean }> {
  state = { error: false }
  static getDerivedStateFromError() { return { error: true } }
  render() {
    if (this.state.error) return <div className="fallback"><h1>Não foi possível abrir o tour.</h1><p>Verifique se a aceleração gráfica está disponível no navegador.</p><button onClick={() => location.reload()}>Tentar novamente</button></div>
    return this.props.children
  }
}

export function App() {
  return <main className="app">
    <GameBoundary><Suspense fallback={<div className="loading">Preparando sua visita<span /></div>}><Game /></Suspense></GameBoundary>
    <Interface />
  </main>
}
