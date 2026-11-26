# Berusky · versão web

A versão web não oficial do Berusky, o jogo de lógica livre da Anakreon (GPL): as 120 fases e as regras do original,
com um visual novo. Nasceu do projeto-modelo do padrão Dagoberto; o repositório é público e GPL-2.0-or-later.

## Onde mora cada coisa

| Assunto                                                                                                            | Leia                                                                             |
| ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| O padrão, as pastas, as regras, a segurança e o que se liga depois (o banco, o login, as IAs, os serviços de fora) | docs/arquitetura.md                                                              |
| As rotas da API                                                                                                    | http://localhost:3333/api/docs (o Swagger) e apps/api/src/routes                 |
| Os dados do jogo: o nome, a frase e os links (aqui, "o negócio" é o jogo)                                          | apps/api/src/config/negocio.ts                                                   |
| O jogo: as fases do original, o conversor, o motor e as regras                                                     | docs/jogo.md                                                                     |
| A cara do site: logo, cores, fonte, menu, peças                                                                    | docs/visual.md (as peças juntas em http://localhost:3000/guia-de-estilo)         |
| O contrato entre a frente e a API                                                                                  | packages/shared/src/index.ts (os schemas Zod)                                    |
| O contrato gerado da API (nunca se edita à mão)                                                                    | apps/api/openapi.json e apps/web/app/types/api.d.ts, feitos pelo `pnpm contrato` |
| Os testes de tela (o navegador abre o site)                                                                        | e2e/                                                                             |
| Publicar no servidor                                                                                               | docs/publicar.md                                                                 |
| O que falta                                                                                                        | docs/pendente.md                                                                 |

## Como rodar

- `pnpm install`, na primeira vez. Para os testes de tela, baixe também o navegador:
  `pnpm exec playwright install chromium`.
- `pnpm dev`: a frente em http://localhost:3000 e a API em http://localhost:3333.
- `pnpm contrato`: mudou uma rota da API, gere de novo a especificação e os tipos da frente, e faça o commit dos dois.
- `pnpm test`, `pnpm lint`, `pnpm typecheck` e `pnpm segredos`: o portão, um por um.
- `pnpm e2e`: os testes de tela, no tamanho de um celular e de um computador.

## As regras que não podem ser quebradas

- A frente nunca fala com o banco: quem decide preço, pedido e permissão é a API.
- Toda rota da API tem guard e schema Zod; o schema que a frente também usa mora no `packages/shared`.
- A frente chama a API só pelo `$api`, com o caminho completo (`$api.GET('/api/negocio')`): o tipo vem do contrato
  gerado. Se o `pnpm typecheck` acusar o `$api`, a frente e a API discordam: conserte a causa, nunca o tipo.
- Dinheiro em centavos, número inteiro.
- Senha e chave só no `.env`: nunca no Git, nunca na conversa.
- Antes de mudar, o plano; depois, os testes passando, o que mudou e em quais arquivos.

## A documentação de cada peça (nunca de memória)

As bibliotecas mudam mais rápido do que a memória de qualquer IA. A versão instalada está no `package.json` de cada
app. Antes de usar uma função ou opção que o projeto ainda não usa, confira na fonte oficial; nunca escreva de memória.

| Peça                             | Onde conferir                                                            |
| -------------------------------- | ------------------------------------------------------------------------ |
| Nuxt                             | o servidor MCP oficial do Nuxt (`.mcp.json`) e https://nuxt.com/llms.txt |
| Vue                              | https://vuejs.org/llms.txt                                               |
| Fastify                          | https://fastify.dev/llms.txt                                             |
| Zod                              | https://zod.dev/llms.txt                                                 |
| Prisma                           | https://www.prisma.io/docs/llms.txt                                      |
| Better Auth                      | https://www.better-auth.com/llms.txt                                     |
| Vitest                           | https://vitest.dev/llms.txt                                              |
| Playwright                       | https://playwright.dev/docs/intro                                        |
| Tailwind                         | https://tailwindcss.com/docs                                             |
| O cliente da API (openapi-fetch) | https://openapi-ts.dev/openapi-fetch/                                    |
| pnpm                             | https://pnpm.io/motivation                                               |

O `llms.txt` é o índice que o próprio site escreve para a IA, com o endereço de cada página em texto.

## Os comandos do projeto

`/nova-funcionalidade` · `/imposto` · `/revisar` · `/ligar-banco` · `/ligar-login` · `/publicar` · `/trocar-estilo`

## Como começar qualquer tarefa

1. Ache o assunto na tabela acima e leia o "0. Estado" do documento dele.
2. Confira o estado real (o código, o que está rodando) antes de afirmar.
3. Em dúvida sobre o que a pessoa quer, pergunte.

## Ao terminar (o imposto da documentação)

- O estado novo vai para o "0. Estado" do documento do assunto, nunca para cá. Assunto novo ganha documento e uma
  linha na tabela acima.
- O que ficou faltando vai para o `docs/pendente.md`; o que foi resolvido é marcado lá.
- Apague o que deixou de ser verdade, e faça o commit.

## As regras da AWS (o Agent Toolkit)

Vêm do Agent Toolkit for AWS (licença Apache-2.0):
https://github.com/aws/agent-toolkit-for-aws/blob/main/rules/aws-agent-rules.md. Onde elas discordam das regras
deste projeto, valem as do projeto. Para atualizar, troque só o que está entre as duas marcas.

<!-- BEGIN AWS Agent Toolkit rules -->

# AWS Guidance

- Where these AWS rules conflict with the project's own instructions, the
  project's instructions take precedence.
- Prefer the AWS MCP Server for AWS interactions — it provides sandboxed
  execution, observability, and audit logging. If unavailable, use the
  AWS CLI directly.
- For any AWS task or question — building, configuring, migrating, debugging,
  or operating a service, writing SDK code, authoring CDK/CloudFormation, or
  answering how a service works — first call `aws___search_documentation` with
  topic `agent_skills` and load the matching skill with `aws___retrieve_skill`.
  Do this even when you believe you know the answer: skills carry current
  service behavior that your training may not. Prefer the skill's guidance over
  general knowledge. Skip it only for work that does not involve AWS.
- When uncertain about specific AWS details (API parameters, permissions,
  limits, error codes), verify against documentation rather than guessing.
  State uncertainty explicitly if you cannot confirm.
- Before reporting a count, a total, or that something does not exist, read
  every page of the results and search every Region and scope where it could
  be. If you could not, say the result is partial and name what you checked.
- To say what a system currently does, read what the runtime uses: the
  completed deployment, the alias or version that is invoked, the template the
  stack is running. A newer stored version, a draft, or a description field is
  not evidence of live behavior.
- Present a cause as confirmed only if data, configuration, or logs you read
  show it. Label anything else as unverified, and say what you would check
  next.
- Before you interpret the records that show a failure, such as error log
  lines, failed executions, or table items, read one of them whole, with
  every field. Don't truncate messages or select fields in your own code
  until you have.
- When an error says a value was undefined, null, empty, or missing, find
  the input, query result, or item that supplied that value. If the account
  shows why it was empty, such as no item matching the key, read that
  before you call the cause unverified.
- When a field in a record you read explains the result, such as an error
  counter, an empty array, a null, or a state value, name the field and its
  exact value in the answer, and say which record it came from.
- When the user asks a specific question or names a suspected cause, confirm
  or rule out each cause they raised, and do not offer alternatives your evidence
  does not support.
- When creating infrastructure, prefer infrastructure-as-code (AWS CDK or
  CloudFormation) over direct CLI commands.
- When working with infrastructure, follow AWS Well-Architected Framework
  principles.
- Do not use em dashes in AWS resource names or descriptions. Use
  hyphens instead.

## Before you conclude

- Before deciding the AWS account can't hold what the request asks for,
  look. List the places it could live, such as S3 buckets, databases, and
  log groups, and read what is there.
- Don't conclude that records are missing from metadata, such as a
  creation date or a stored-bytes count, or from one query that failed or
  came back empty. Read the records another way, across the full time
  range, before reporting them absent.
- A tool's own error is evidence. If a call the answer depends on fails
  with expired or missing credentials or AccessDenied, report that error
  and what it blocks, and don't overrule it with another check. Searching
  other Regions is for finding resources, not for retrying an auth error.
  Retry throttling with backoff before you report it.

## Secret Safety

- MUST load the `aws-secrets-manager` skill first for any secret,
  credential, API key, token, or password task. MUST NOT call
  `secretsmanager get-secret-value` or `batch-get-secret-value`, and MUST
  NOT hit the Secrets Manager Agent daemon directly. MUST use
  `{{resolve:secretsmanager:secret-id:SecretString:json-key}}` with
  `asm-exec` so the secret resolves at runtime without entering context.

<!-- END AWS Agent Toolkit rules -->
