# O jogo

## 0. Estado (25/11/2026)

- As 120 fases do Berusky 1.7 original estão convertidas: os arquivos de `apps/api/dados/berusky-data-1.7/` (byte a
  byte, GPL) viram `apps/api/src/config/fases.json` pelo conversor (`apps/api/scripts/fases.ts`). Um teste confere a
  cada `pnpm test` que o JSON guardado bate com os originais.
- A API serve os grupos (`GET /api/fases`) e cada fase (`GET /api/fases/{grupo}/{numero}`), sem a senha. As rotas de
  leitura têm um limite próprio (600 por minuto), maior que o geral.
- Ainda não existe: o motor do jogo, a tela da partida e a tradução das dicas.

## As fases do original

- **Os grupos:** treino (10), fácil (50), intermediário (35), avançado (20) e impossível (5), na ordem de `s0.dat` a
  `s4.dat`. Cada fase tem uma senha de cinco letras.
- **A grade:** 32 × 21 casas. O `.lv3` tem 28.361 bytes: a assinatura, o fundo (0 ou 1), a música, a rotação de cada
  besouro e três camadas (o piso, os itens e os besouros), em palavras de 16 bits little-endian.
- **O piso é decoração.** O original não confere o piso para andar: a casa sem piso mostra o fundo da fase, e os
  besouros andam nela do mesmo jeito. A maior parte das fases é assim (a r01 quase não tem piso).
- **Os itens** guardam o número do original (8 é a parede, 6 a caixa, 9 a saída...) e a variação. Na porta colorida, a
  variação 1 é o estilo "cyber", que muda o que a porta vira ao abrir (veja as armadilhas).

## Como mexer

- **Os originais mudaram** (não deveriam): rode `pnpm --filter @projeto/api fases` e faça o commit do `fases.json`.
- **A tradução das dicas:** `apps/api/dados/dicas.pt.txt`, com as mesmas marcas do `hints.dat` (`~1_1` é a fase 1 do
  treino; `~fim_1` é o texto do fim do treino). Depois, o conversor de novo.

## Armadilhas

- **Os batentes das portas:** no original, cada porta põe dois batentes (que valem como parede) nas casas do lado dela,
  ao carregar e a cada vez que abre ou fecha. Em todas as 120 fases essas casas já são parede, então o motor não
  precisa dos batentes; o conversor recusa a fase em que isso não valer.
- **Nenhuma fase oficial tem caixa leve** (o item 72), mas a regra dela existe e o motor a tem.
- **O fundo é 0 ou 1** em todas as fases (o original tinha mais imagens de fundo, sem uso nas fases).

## Pendências

- nenhuma
