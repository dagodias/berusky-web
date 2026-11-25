# Berusky · versão web

Versão web **não oficial** do [Berusky](https://www.anakreon.cz/berusky1.html), o jogo de lógica livre da Anakreon:
até cinco joaninhas, caixas, explosivos, pedras, chaves e portas, nas 120 fases originais, com um visual novo.

O jogo original, as fases e as regras são © 1997–2020 AnakreoN, sob a GPL. Esta versão também é software livre:
GPL-2.0-or-later (o arquivo `LICENSE`). Ela nasceu do projeto-modelo do Curso de Full Stack com IA (Ensino Social): a
frente e a API separadas, TypeScript nos dois lados e tudo documentado desde o primeiro dia.

## O que tem aqui

| Parte             | O que é                                                                                                      |
| ----------------- | ------------------------------------------------------------------------------------------------------------ |
| `packages/jogo`   | O motor: as regras do Berusky 1.7.2, portadas do `game_logic.cpp` original, sem tela, com um teste por regra |
| `apps/api`        | A API (Fastify e Zod): serve as fases, confere a vitória refazendo as jogadas com o motor e dá a senha       |
| `apps/api/dados`  | Os arquivos do jogo original (as 120 fases, as senhas e os textos), byte a byte, sob a GPL                   |
| `apps/web`        | O site (Nuxt 4 e Tailwind): o mapa de fases, a partida com o visual novo em SVG, o celular e o teclado       |
| `packages/shared` | O contrato entre o site e a API (os schemas Zod)                                                             |
| `docs/`           | A documentação: as regras e as armadilhas do motor (`docs/jogo.md`), a arquitetura e o visual                |
| `e2e/`            | Os testes de tela, num navegador de verdade (até uma vitória no treino 1, pelo teclado)                      |

## Rodar no computador

Precisa de Git, Node.js 24.15 ou mais novo e pnpm.

```
pnpm install
pnpm dev
```

O site abre em http://localhost:3000 e a API em http://localhost:3333 (a documentação dela em `/api/docs`). Para os
testes de tela, baixe o navegador uma vez: `pnpm exec playwright install chromium`.

## Os comandos

| Comando                                        | O que faz                                                          |
| ---------------------------------------------- | ------------------------------------------------------------------ |
| `pnpm dev`                                     | Liga o site e a API                                                |
| `pnpm test`                                    | Os testes (o motor, a API, o site e as fases convertidas)          |
| `pnpm e2e`                                     | O build e os testes de tela, no tamanho do celular e do computador |
| `pnpm contrato`                                | Gera de novo o contrato, depois de mudar uma rota da API           |
| `pnpm lint`, `pnpm typecheck`, `pnpm segredos` | O portão, um por um                                                |
| `pnpm --filter @projeto/api fases`             | Converte de novo as fases do original (`apps/api/dados`)           |
| `pnpm --filter @projeto/api resolver`          | Procura soluções das fases de treino com o motor                   |

## Licença e créditos

Este projeto é software livre: GNU GPL, versão 2 ou mais nova (o arquivo `LICENSE`). O Berusky original é da AnakreoN
(1997–2020), também sob a GPL: programação de Martin Stránský, regras e fases de Luboš Doležal, gráficos de Jan
Halfar e Václav Hlobil, som de Martin Linda e tradução de Radek Biba (a lista completa está na página Sobre do site).
Os desenhos desta versão são novos; as fases, as regras, as senhas e os textos (traduzidos) vêm do original.

O projeto nasceu do projeto-modelo do Curso de Full Stack com IA (Ensino Social); as regras de trabalho estão no
`CLAUDE.md` e em `docs/arquitetura.md`.
