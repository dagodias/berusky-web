# O jogo

## 0. Estado (25/11/2026)

- As 120 fases do Berusky 1.7 original estão convertidas: os arquivos de `apps/api/dados/berusky-data-1.7/` (byte a
  byte, GPL) viram `apps/api/src/config/fases.json` pelo conversor (`apps/api/scripts/fases.ts`). Um teste confere a
  cada `pnpm test` que o JSON guardado bate com os originais.
- A API serve os grupos (`GET /api/fases`) e cada fase (`GET /api/fases/{grupo}/{numero}`), sem a senha. As rotas de
  leitura têm um limite próprio (600 por minuto), maior que o geral.
- O motor do jogo existe: `packages/jogo`, com as regras do original portadas ramo a ramo e 37 testes. Ele roda igual
  na tela e na API.
- O resolvedor (`pnpm --filter @projeto/api resolver`) achou a solução do treino 1 (94 jogadas), gravada em
  `apps/api/test/fixtures/solucoes.json`; um teste confere que ela vence a fase. As outras fases de treino têm vários
  besouros e passam do limite da busca simples.
- O visual novo está no `/guia-de-estilo`, esperando aprovação (`docs/visual.md`).
- Ainda não existe: a tela da partida, a conclusão (com a senha da próxima) e a tradução das dicas.

## As fases do original

- **Os grupos:** treino (10), fácil (50), intermediário (35), avançado (20) e impossível (5), na ordem de `s0.dat` a
  `s4.dat`. Cada fase tem uma senha de cinco letras.
- **A grade:** 32 × 21 casas. O `.lv3` tem 28.361 bytes: a assinatura, o fundo (0 ou 1), a música, a rotação de cada
  besouro e três camadas (o piso, os itens e os besouros), em palavras de 16 bits little-endian.
- **O piso é decoração.** O original não confere o piso para andar: a casa sem piso mostra o fundo da fase, e os
  besouros andam nela do mesmo jeito. A maior parte das fases é assim (a r01 quase não tem piso).
- **Os itens** guardam o número do original (8 é a parede, 6 a caixa, 9 a saída...) e a variação. Na porta colorida, a
  variação 1 é o estilo "cyber", que muda o que a porta vira ao abrir (veja as armadilhas).

## O motor (`packages/jogo`)

- `new Partida(fase)` monta a fase; `mover(direcao)` dá um passo do besouro comandado e devolve os eventos (andou,
  empurrou, explodiu, pegou, abriu, fechou, venceu, bloqueado com o motivo); `trocar(n | 'proximo')`, `guardar()`,
  `voltar()` e `recomecar()` são as outras ações; `foto()` é o retrato para desenhar.
- Cada ação entra no registro (`jogadas`): U, D, L e R os passos (até os bloqueados), de 1 a 5 a troca, G guardar e V
  voltar. `reproduzir(fase, jogadas)` refaz a partida: é assim que a API confere a vitória.
- Os itens guardam os números do original (`ITEM`, em `itens.ts`), com o nome do original no comentário.

| A regra                                       | No original (`src/game_logic.cpp`)                              | O teste (`packages/jogo/test/regras.test.ts`) |
| --------------------------------------------- | --------------------------------------------------------------- | --------------------------------------------- |
| Andar, parede, borda, outro besouro           | `case NO_ITEM` e `default`                                      | andar                                         |
| Caixa: uma, só para casa vazia                | `case P_BOX`                                                    | a caixa                                       |
| Caixa leve: uma ou duas                       | `case P_BOX_LIGHT`                                              | a caixa leve                                  |
| Explosivo: anda ou explode a caixa de trás    | `case P_TNT`                                                    | o explosivo                                   |
| Saída com 5 chaves; chave de todos, até 5     | `case P_EXIT` e `case P_KEY`                                    | a saída e as chaves                           |
| Pedra e picareta (até 9 por besouro)          | `case P_STONE` e `case P_MATTOCK`                               | a pedra e a picareta                          |
| Chave colorida: só a cor, uma por vez         | `case P_KEY1` a `P_KEY5`                                        | a chave colorida                              |
| Porta colorida: a cor, no eixo, gasta a chave | `case P_DOOR*_Z` e `P_DOOR*_O`                                  | a porta colorida                              |
| Passagem colorida: só a cor; fecha ao sair    | `case P_ID_DOOR*` e a casa de saída                             | a passagem colorida                           |
| Porta de uma vez: fecha para sempre ao sair   | `case P_DV_*` e a casa de saída                                 | a porta de uma passagem só                    |
| Trocar de besouro                             | `level_game::player_switch`                                     | trocar de besouro                             |
| Guardar, voltar e recomeçar                   | `level_active::level_save/level_load`, `berusky::level_restart` | guardar, voltar e recomeçar                   |

## Como mexer

- **Uma regra nova ou corrigida:** leia o ramo no `src/game_logic.cpp` do original (o código está em
  https://sources.debian.org/src/berusky/1.7.2-4/src/), escreva o teste num tabuleiro de texto
  (`packages/jogo/test/tabuleiro.ts`) e só depois mude o `partida.ts`.
- **Os originais mudaram** (não deveriam): rode `pnpm --filter @projeto/api fases` e faça o commit do `fases.json`.
- **A tradução das dicas:** `apps/api/dados/dicas.pt.txt`, com as mesmas marcas do `hints.dat` (`~1_1` é a fase 1 do
  treino; `~fim_1` é o texto do fim do treino). Depois, o conversor de novo.

## Armadilhas

- **Os batentes das portas:** no original, cada porta põe dois batentes (que valem como parede) nas casas do lado dela,
  ao carregar e a cada vez que abre ou fecha. Em todas as 120 fases essas casas já são parede, então o motor não
  precisa dos batentes; o conversor recusa a fase em que isso não valer.
- **A ordem dos efeitos:** o original enfileira os efeitos de um passo e os aplica de trás para a frente. Por isso a
  porta colorida **clássica** (variação 0), ao abrir, vira chão: qualquer besouro passa por qualquer lado, e a caixa
  também. A **cyber** (variação 1) vira a porta aberta `P_DV`, que só deixa passar no eixo e não deixa a caixa passar.
  Não "conserte": é o jogo original.
- **O passo bloqueado fecha a porta:** apertar a seta do eixo em cima de uma passagem colorida ou de uma porta de uma
  vez abertas fecha a porta, mesmo se o passo não acontecer (o original enfileira o fechamento antes de olhar o
  destino). Por isso o registro de jogadas guarda também os passos bloqueados.
- **Guardar e voltar:** os passos não voltam (no original eles moram fora do que é guardado), e quem você comanda
  passa a ser o primeiro besouro da fase. Recomeçar zera os passos e apaga a posição guardada.
- **A caixa leve** precisa da terceira casa dentro da grade até para empurrar uma só (o original confere assim).
- **Com as cinco chaves**, a sexta chave vira obstáculo; e o passo que entra na saída não conta nem move o besouro.
- **Nenhuma fase oficial tem caixa leve** (o item 72), mas a regra dela existe e o motor a tem.
- **O fundo é 0 ou 1** em todas as fases (o original tinha mais imagens de fundo, sem uso nas fases).

## Pendências

- nenhuma
