import { CanvasTexture, SRGBColorSpace } from 'three'

// Every screen in the office is decorative fiction drawn on a canvas.
// No real Yellow Kite data, client name, campaign or result is represented here,
// and any screen that shows numbers carries a visible "dados fictícios" marker.

export type ScreenKind = 'agenda' | 'dashboard' | 'campaigns' | 'figma' | 'moodboard' | 'code' | 'terminal' | 'deck' | 'kanban' | 'calendar'

const cache = new Map<string, CanvasTexture>()
const ink = '#2f3d34'
const paper = '#eceadd'
const rail = '#2c3b33'
const accent = '#ecaa26'

function rounded(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath(); ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); ctx.fill()
}

/** Deterministic pseudo-random so a given screen always redraws identically. */
function generator(seed: number) {
  let value = seed * 7919 + 13
  return () => { value = (value * 16807) % 2147483647; return value / 2147483647 }
}

function chrome(ctx: CanvasRenderingContext2D, w: number, title: string, dark = false) {
  ctx.fillStyle = dark ? '#1e251f' : paper; ctx.fillRect(0, 0, w, 480)
  ctx.fillStyle = rail; ctx.fillRect(0, 0, w, 34)
  ctx.fillStyle = accent; ctx.fillRect(16, 12, 12, 10)
  ctx.fillStyle = '#f2f0e5'; ctx.font = '14px Arial'; ctx.textAlign = 'left'
  ctx.fillText(title, 38, 22)
}

function fiction(ctx: CanvasRenderingContext2D, w: number, text = 'DADOS FICTÍCIOS · VISUAL DECORATIVO') {
  ctx.fillStyle = '#8d9488'; ctx.font = '10px Arial'; ctx.textAlign = 'right'
  ctx.fillText(text, w - 14, 470); ctx.textAlign = 'left'
}

const painters: Record<ScreenKind, (ctx: CanvasRenderingContext2D, w: number, random: () => number) => void> = {
  agenda: (ctx, w, random) => {
    chrome(ctx, w, 'Agenda')
    ctx.fillStyle = rail; ctx.fillRect(0, 34, 130, 446)
    ctx.fillStyle = ink; ctx.font = '26px Arial'; ctx.fillText('Bom dia!', 156, 84)
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = '#d7dccc'; rounded(ctx, 156, 106 + i * 62, w - 190, 48, 5)
      ctx.fillStyle = i % 2 ? '#a6b8a0' : accent; ctx.fillRect(156, 106 + i * 62, 5, 48)
      ctx.fillStyle = '#a9b0a2'; ctx.fillRect(180, 122 + i * 62, 120 + random() * 180, 7)
      ctx.fillStyle = '#bdc3b4'; ctx.fillRect(180, 137 + i * 62, 70 + random() * 90, 6)
    }
    fiction(ctx, w, 'VISUAL DECORATIVO')
  },
  dashboard: (ctx, w, random) => {
    chrome(ctx, w, 'Painel de performance')
    const labels = ['ALCANCE', 'CLIQUES', 'CONVERSÃO']
    const column = (w - 48) / 3
    labels.forEach((label, i) => {
      ctx.fillStyle = '#dfe2d5'; rounded(ctx, 24 + i * column, 52, column - 14, 82, 6)
      ctx.fillStyle = '#79806f'; ctx.font = '10px Arial'; ctx.fillText(label, 38 + i * column, 74)
      ctx.fillStyle = ink; ctx.font = '600 28px Arial'
      ctx.fillText(`${(random() * 90 + 10).toFixed(1)}${i === 2 ? '%' : 'k'}`, 38 + i * column, 110)
    })
    ctx.fillStyle = '#dfe2d5'; rounded(ctx, 24, 148, w - 48, 180, 6)
    ctx.strokeStyle = '#c2c7b8'; ctx.lineWidth = 1
    for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(42, 160 + i * 40); ctx.lineTo(w - 42, 160 + i * 40); ctx.stroke() }
    ctx.strokeStyle = accent; ctx.lineWidth = 3; ctx.beginPath()
    for (let i = 0; i <= 22; i++) {
      const x = 42 + i * ((w - 84) / 22)
      const y = 300 - (Math.sin(i * 0.55) * 0.35 + 0.45 + random() * 0.16) * 120
      if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y)
    }
    ctx.stroke()
    for (let i = 0; i < 9; i++) {
      const height = 20 + random() * 70
      ctx.fillStyle = i % 3 ? '#8ea287' : accent
      ctx.fillRect(28 + i * ((w - 56) / 9), 440 - height, (w - 56) / 9 - 12, height)
    }
    fiction(ctx, w)
  },
  campaigns: (ctx, w, random) => {
    chrome(ctx, w, 'Campanhas')
    const status: [string, string][] = [['NO AR', '#6f8f68'], ['EM REVISÃO', accent], ['PAUSADA', '#98a08f']]
    ctx.fillStyle = '#79806f'; ctx.font = '10px Arial'
    ctx.fillText('CAMPANHA', 28, 60); ctx.fillText('PERÍODO', w - 250, 60); ctx.fillText('STATUS', w - 120, 60)
    for (let i = 0; i < 7; i++) {
      const y = 76 + i * 50
      ctx.fillStyle = i % 2 ? '#e4e3d6' : '#dcdccf'; ctx.fillRect(20, y, w - 40, 42)
      ctx.fillStyle = '#aeb4a5'; ctx.fillRect(28, y + 14, 90 + random() * 150, 8)
      ctx.fillStyle = '#bfc4b6'; ctx.fillRect(w - 250, y + 15, 84, 7)
      const [text, color] = status[i % 3]
      ctx.fillStyle = color; rounded(ctx, w - 124, y + 10, 92, 22, 11)
      ctx.fillStyle = '#f4f2e6'; ctx.font = '9px Arial'; ctx.textAlign = 'center'
      ctx.fillText(text, w - 78, y + 25); ctx.textAlign = 'left'
    }
    fiction(ctx, w)
  },
  figma: (ctx, w, random) => {
    chrome(ctx, w, 'Interface — estudo de telas', true)
    ctx.fillStyle = '#262e27'; ctx.fillRect(0, 34, 92, 446); ctx.fillRect(w - 84, 34, 84, 446)
    for (let i = 0; i < 9; i++) {
      ctx.fillStyle = '#57614f'; ctx.fillRect(12, 54 + i * 22, 10, 10)
      ctx.fillStyle = '#414a3f'; ctx.fillRect(28, 57 + i * 22, 22 + random() * 40, 6)
    }
    for (let i = 0; i < 6; i++) { ctx.fillStyle = '#404a3d'; ctx.fillRect(w - 74, 54 + i * 34, 64, 22) }
    for (let i = 0; i < 3; i++) {
      const x = 116 + i * 154
      ctx.fillStyle = '#f0eee1'; ctx.fillRect(x, 74, 130, 330)
      ctx.fillStyle = i === 1 ? accent : '#33443a'; ctx.fillRect(x, 74, 130, 46)
      ctx.fillStyle = '#d4d7c9'; ctx.fillRect(x + 12, 136, 106, 62)
      for (let line = 0; line < 5; line++) {
        ctx.fillStyle = '#c3c8b8'; ctx.fillRect(x + 12, 212 + line * 18, 40 + random() * 66, 7)
      }
      ctx.fillStyle = accent; ctx.fillRect(x + 12, 356, 62, 22)
      ctx.fillStyle = '#7b8374'; ctx.font = '9px Arial'; ctx.fillText(`ARTBOARD 0${i + 1}`, x, 66)
    }
    fiction(ctx, w, 'ESTUDO FICTÍCIO · VISUAL DECORATIVO')
  },
  moodboard: (ctx, w, random) => {
    chrome(ctx, w, 'Moodboard')
    const swatches = ['#ecaa26', '#3d514b', '#cec7b4', '#74836d', '#b49974', '#28332e']
    const column = (w - 48) / 4
    for (let i = 0; i < 8; i++) {
      const x = 24 + (i % 4) * column
      const y = 54 + Math.floor(i / 4) * 168
      ctx.fillStyle = swatches[i % swatches.length]
      rounded(ctx, x, y, column - 14, 150, 5)
      ctx.globalAlpha = 0.22; ctx.fillStyle = '#0f140f'
      ctx.fillRect(x, y + 96 + random() * 30, column - 14, 54); ctx.globalAlpha = 1
    }
    swatches.forEach((color, i) => { ctx.fillStyle = color; ctx.fillRect(24 + i * 40, 404, 30, 30) })
    fiction(ctx, w, 'REFERÊNCIA VISUAL DECORATIVA')
  },
  code: (ctx, w, random) => {
    chrome(ctx, w, 'editor — tour.ts', true)
    const tokens: [string, string][][] = [
      [['export ', '#c08fd0'], ['function ', '#8fb2d0'], ['tour', '#e8d79a'], ['() {', '#cfcdbd']],
      [['  const ', '#c08fd0'], ['rooms', '#d8d5c4'], [' = ', '#cfcdbd'], ['load', '#e8d79a'], ['(plan)', '#9fc08a']],
      [['  for ', '#c08fd0'], ['(const room ', '#d8d5c4'], ['of ', '#c08fd0'], ['rooms) {', '#cfcdbd']],
      [['    room.', '#d8d5c4'], ['build', '#e8d79a'], ['()', '#cfcdbd']],
      [['  }', '#cfcdbd']],
      [['  return ', '#c08fd0'], ['rooms', '#d8d5c4']],
      [['}', '#cfcdbd']],
    ]
    ctx.fillStyle = '#232b24'; ctx.fillRect(0, 34, 44, 446)
    ctx.font = '13px Consolas, monospace'
    for (let i = 0; i < 22; i++) {
      ctx.fillStyle = '#4c5648'; ctx.fillText(String(i + 1).padStart(2, ' '), 12, 62 + i * 19)
      const row = tokens[i % (tokens.length + 3)]
      if (!row) continue
      let x = 56
      for (const [text, color] of row) {
        ctx.fillStyle = color; ctx.fillText(text, x, 62 + i * 19); x += ctx.measureText(text).width
      }
    }
    ctx.fillStyle = accent; ctx.fillRect(56 + random() * 4, 62 + 6 * 19 - 11, 2, 15)
    fiction(ctx, w, 'CÓDIGO ILUSTRATIVO')
  },
  terminal: (ctx, w, random) => {
    ctx.fillStyle = '#141a15'; ctx.fillRect(0, 0, w, 480)
    ctx.fillStyle = '#222b23'; ctx.fillRect(0, 0, w, 28)
    ctx.fillStyle = '#6f7a6b'; ctx.font = '12px Consolas, monospace'; ctx.fillText('bash — yellowkite', 14, 19)
    ctx.font = '13px Consolas, monospace'
    const rows = ['npm run build', 'building for production...', '148 modules transformed', 'dist/index.html   0.49 kB',
      'dist/assets/tour.js  612 kB', 'built in 2.31s', 'npm run test', '3 passed']
    rows.forEach((row, i) => {
      const prompt = row.startsWith('npm')
      ctx.fillStyle = prompt ? accent : '#8fb28a'
      ctx.fillText(prompt ? `~ $ ${row}` : `  ${row}`, 16, 56 + i * 24)
    })
    ctx.fillStyle = '#9fc08a'; ctx.fillRect(30 + random() * 3, 56 + rows.length * 24 - 11, 8, 14)
    fiction(ctx, w, 'SAÍDA ILUSTRATIVA')
  },
  deck: (ctx, w, random) => {
    ctx.fillStyle = '#33443a'; ctx.fillRect(0, 0, w, 480)
    ctx.fillStyle = accent; ctx.fillRect(56, 92, 54, 5)
    ctx.fillStyle = '#f2efe0'; ctx.font = '34px Arial'; ctx.fillText('Planejamento', 56, 156)
    ctx.fillStyle = '#b9c3b2'; ctx.font = '17px Arial'; ctx.fillText('Apresentação interna', 56, 190)
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = '#3d5044'; rounded(ctx, 56, 228 + i * 62, w - 112, 48, 5)
      ctx.fillStyle = '#7d8d79'; ctx.fillRect(74, 246 + i * 62, 120 + random() * 200, 8)
    }
    fiction(ctx, w, 'CONTEÚDO FICTÍCIO')
  },
  kanban: (ctx, w, random) => {
    chrome(ctx, w, 'Quadro da equipe')
    const columns = ['A FAZER', 'EM ANDAMENTO', 'REVISÃO', 'PRONTO']
    columns.forEach((name, i) => {
      const x = 20 + i * ((w - 40) / 4)
      const cw = (w - 40) / 4 - 12
      ctx.fillStyle = '#dfe2d5'; rounded(ctx, x, 50, cw, 412, 6)
      ctx.fillStyle = '#79806f'; ctx.font = '10px Arial'; ctx.fillText(name, x + 12, 72)
      for (let card = 0; card < 2 + Math.floor(random() * 3); card++) {
        ctx.fillStyle = '#f1efe4'; rounded(ctx, x + 10, 86 + card * 76, cw - 20, 64, 5)
        ctx.fillStyle = card % 2 ? '#8ea287' : accent; ctx.fillRect(x + 10, 86 + card * 76, cw - 20, 5)
        ctx.fillStyle = '#b6bcac'; ctx.fillRect(x + 22, 108 + card * 76, cw - 60, 7)
        ctx.fillStyle = '#c8cdbe'; ctx.fillRect(x + 22, 124 + card * 76, cw - 84, 6)
      }
    })
    fiction(ctx, w, 'QUADRO FICTÍCIO')
  },
  calendar: (ctx, w, random) => {
    chrome(ctx, w, 'Semana')
    const days = ['SEG', 'TER', 'QUA', 'QUI', 'SEX']
    const column = (w - 48) / 5
    days.forEach((day, i) => {
      const x = 24 + i * column
      ctx.fillStyle = '#79806f'; ctx.font = '10px Arial'; ctx.fillText(day, x, 62)
      ctx.fillStyle = '#e1e3d7'; ctx.fillRect(x, 72, column - 10, 388)
      for (let block = 0; block < 1 + Math.floor(random() * 3); block++) {
        const y = 86 + block * 118 + random() * 30
        ctx.fillStyle = block % 2 ? '#8ea287' : accent
        rounded(ctx, x + 6, y, column - 22, 54 + random() * 40, 4)
      }
    })
    fiction(ctx, w, 'AGENDA FICTÍCIA')
  },
}

export function screenTexture(kind: ScreenKind, seed = 0) {
  const key = `${kind}:${seed}`
  const hit = cache.get(key)
  if (hit) return hit
  const canvas = document.createElement('canvas')
  canvas.width = 768; canvas.height = 480
  const ctx = canvas.getContext('2d')!
  ctx.textBaseline = 'alphabetic'
  painters[kind](ctx, 768, generator(seed + 1))
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 4
  cache.set(key, texture)
  return texture
}
