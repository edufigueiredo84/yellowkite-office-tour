# Yellow Kite — Office Tour

Tour interativo em primeira pessoa pela agência Yellow Kite, rodando no navegador.
Não é uma landing page 3D nem uma câmera automática: você anda, olha, abre portas,
entra nas salas e conversa com as pessoas.

## Rodando localmente

Requer Node 20+ e um navegador com WebGL 2 (Chrome, Edge ou Firefox atuais).

```bash
npm install
npm run dev
```

Abra <http://127.0.0.1:5173>, clique em **Entrar** e aceite o bloqueio do mouse.

| Tecla | Ação |
|---|---|
| `W` `A` `S` `D` | Andar |
| Mouse | Olhar |
| `Shift` | Acelerar |
| `E` | Interagir / avançar diálogo |
| `1` `2` | Escolher resposta num diálogo |
| `Esc` | Liberar o mouse / pausar |
| `F3` | Mostrar FPS |

Na pausa dá para alternar **Som** e **Gráficos** (Qualidade / Desempenho — o modo
Desempenho desliga sombras, reduz o DPR e mantém acesas só as luzes do corredor,
do RH e da área de Tecnologia).

### Celular e tablet

O tour funciona por toque, sem teclado e sem Pointer Lock (que o Safari do iPhone
nem tem). Tocar em **Entrar** já entrega o controle ao visitante.

| Gesto | Ação |
|---|---|
| Analógico (canto inferior esquerdo) | Andar — quanto mais inclinado, mais rápido |
| Arrastar em qualquer outro ponto | Olhar |
| Botão redondo (canto inferior direito) | Interagir — acende quando há algo na mira |
| Tocar no balão de conversa | Avançar o diálogo |
| Botão de pausa (canto superior direito) | Pausar |

Aparelhos de toque entram automaticamente no modo **Desempenho**. Em retrato o campo
de visão abre e aparece uma dica para girar o aparelho — dá para jogar em pé, mas
deitado é bem melhor.

## Roteiro sugerido para testar

1. Começa **fora** do prédio. Ande até a porta e abra com `E`.
2. Entre à direita no **RH** — a Ane percebe você e acena. `E` para conversar.
3. Siga o corredor. Cada sala de equipe (**Lead Zeppelin**, **Performance**,
   **Rocket**) tem porta própria que precisa ser aberta.
4. No fundo, à esquerda, a **Copa**: a Rosinha oferece um café (`1` aceita).
5. À direita da copa, a **Sala dos diretores**; e pelo corredor lateral, a área
   aberta de **Tecnologia + Direção de Arte**.

## Scripts

```bash
npm run dev           # servidor de desenvolvimento
npm run build         # typecheck + build de produção
npm run preview       # serve o build
npm test              # testes unitários (matemática da porta)
npm run test:browser  # 24 checks de teclado e mouse — exige o dev server rodando
npm run test:mobile   # 13 checks de toque (iPhone paisagem e retrato)
npm run test:characters # gestos, acompanhamento, pausa + screenshots e vídeo
```

`test:browser` dirige um Chrome de verdade com Pointer Lock real e percorre o prédio
inteiro. `test:mobile` repete o percurso com emulação de toque: analógico, arrasto,
botão de ação e o café da Rosinha só no dedo. Ambos gravam screenshots e um relatório
em `test-results/`.

Os testes miram com `__tourTest.aim(x, y, z)`, que calcula o ângulo a partir da posição
em que o corpo realmente parou. Um teleporte pode cair dentro de um colisor e ser
empurrado; ângulo escrito à mão no teste vira teste instável.

## Arquitetura

```
src/
  data/         characters.ts (NPCs, conquistas, slots futuros) · layout.ts (paredes)
  game/         store.ts (zustand) · Game.tsx (Canvas, física, diagnóstico)
  player/       controller em primeira pessoa e runtime compartilhado
  characters/   NPC.tsx (estados) · ProceduralCharacter.tsx (modelo articulado) · motion.ts
  interactions/ InteractionManager.tsx (raycast, foco, prompt, execução)
  world/        Office.tsx (casca) · rooms/ (uma sala por arquivo)
                primitives · Furniture · Decor · Door · Zone · screens.ts
  ui/           Interface.tsx · styles.css
  audio/        efeitos procedurais (sem download, sem voz inventada)
```

**Zone** esconde a decoração de salas distantes para segurar os draw calls; os
colliders continuam ativos, então a física não muda. Luzes ficam **fora** das
Zones de propósito: esconder uma luz recompila shaders e causa engasgo.

## Personagens e movimento

Os quatro personagens usam uma malha procedural com proporções adultas, contornos
suaves, gola, botões, mãos com dedos e olhos com íris. Ombro, cotovelo, punho,
coluna e cabeça têm movimentos independentes. Respiração e piscadas usam fases
diferentes para cada personagem.

O aceno dura 2,8 segundos e só se repete após uma nova aproximação. Durante o
diálogo há gestos leves e pequenos movimentos da cabeça. Cabeça e tronco acompanham
o visitante com limites de rotação; os pés permanecem apoiados, sem deslizar.
Pausar congela também os gestos. `motion.ts` concentra temporização e suavização,
com testes de comportamento e consistência entre taxas de quadros.

`npm run test:characters` exige o servidor local na porta 5173 e grava imagens dos
quatro personagens, `test-results/characters.webm` e `characters-report.json`.
O visual continua estilizado e genérico. Para uma etapa fotorrealista, o caminho
previsto é usar modelos GLB com texturas e animações de esqueleto aprovadas.

## O que ainda é placeholder

Nada aqui inventa pessoas, cargos, histórias ou resultados da Yellow Kite.

- **Modelos 3D**: todos os NPCs usam `ProceduralCharacter`, um modelo genérico que
  **não representa a aparência real de ninguém**. Para trocar por um modelo
  aprovado, basta preencher `model` (URL do `.glb`) e os nomes das animações em
  `src/data/characters.ts`. O caminho GLTF + `AnimationMixer` já está pronto.
- **Marcos Paulo e Carina** estão na sala, percebem e cumprimentam o visitante,
  mas têm `dialogues: []` de propósito — nenhuma fala institucional foi inventada.
  Preencher o array liga a interação automaticamente.
- **Rosinha**: só `"Vai um cafezinho?"` e os dois botões vieram do briefing. A
  saudação e as duas respostas são provisórias (`TODO_COPY`).
- **Equipes** (Lead Zeppelin, Performance, Rocket, Tecnologia + DA): ambiente,
  estações e iluminação prontos; integrantes ainda `TODO_CONTENT`. Há pontos de
  spawn reservados em `npcSlots`.
- **Telas**: tudo desenhado em canvas é ficção decorativa. Toda tela com número
  carrega o selo *"DADOS FICTÍCIOS · VISUAL DECORATIVO"*.

## Referências

- Planta: `public/assets/references/mapa low yellowkite.png` — define a topologia
  dos setores. As medidas em metros são adaptações para gameplay.
- Marca: `public/assets/brand/` — SVGs originais, usados sem recriação nem
  alteração de proporção; a versão branca ou preta é escolhida pelo contraste.
