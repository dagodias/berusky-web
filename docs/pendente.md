# Pendências

Próximo passo: P-011 (jogar num celular de verdade, agora pelo endereço do site no ar).

## P-001 · Sons e música

- **Assunto:** docs/jogo.md
- **Data:** 25/11/2026
- **O que falta:** o jogo é mudo. O pacote de dados do original não traz áudio, então os sons seriam novos (o passo,
  a chave, a explosão, a porta, a vitória), com um botão de silêncio que fica guardado no navegador.
- **Quem destrava:** Dagoberto decide se quer som; a IA faz.
- **Como resolver:** sons curtos gerados no navegador (Web Audio), sem arquivo de fora.

## P-002 · Perfis com nome, como no original

- **Assunto:** docs/jogo.md
- **Data:** 25/11/2026
- **O que falta:** o original guarda o progresso por perfil (várias pessoas no mesmo computador). Aqui há um progresso
  por navegador.
- **Quem destrava:** a IA.
- **Como resolver:** a chave do localStorage por perfil, e a escolha do perfil no mapa de fases.

## P-003 · Recordes guardados no servidor

- **Assunto:** docs/arquitetura.md
- **Data:** 25/11/2026
- **O que falta:** o menor número de passos fica só no aparelho. A conclusão já confere os passos na API; faltam o
  banco (`/ligar-banco`) e o login (`/ligar-login`) para guardar e mostrar os recordes.
- **Quem destrava:** Dagoberto (quer conta e ranking?), depois a IA.
- **Como resolver:** o modelo do recorde no Prisma, gravado pela rota de conclusão.

## P-004 · O editor de fases

- **Assunto:** docs/jogo.md
- **Data:** 25/11/2026
- **O que falta:** o original tem um editor de fases (com desfazer). Não faz parte da versão web.
- **Quem destrava:** Dagoberto decide se entra.
- **Como resolver:** uma página que monta a fase no mesmo formato do `fases.json`.

## P-005 · Desfazer jogada

- **Assunto:** docs/jogo.md
- **Data:** 25/11/2026
- **O que falta:** o original não tem desfazer (só guardar e voltar a posição), e esta versão seguiu o original.
- **Quem destrava:** Dagoberto decide se entra, como opção ligável.
- **Como resolver:** o motor já guarda o registro de jogadas: desfazer é refazer a partida sem a última.

## P-006 · Jogar sem internet

- **Assunto:** docs/arquitetura.md
- **Data:** 25/11/2026
- **O que falta:** a fase vem da API; sem internet, não abre. A vitória sem a API já abre a próxima fase (sem a senha).
- **Quem destrava:** a IA.
- **Como resolver:** um service worker que guarda as fases já abertas (PWA).

## P-007 · As fases extras dos jogadores

- **Assunto:** docs/jogo.md
- **Data:** 25/11/2026
- **O que falta:** o pacote de dados traz a pasta `Levels/user1` (arquivos `.LV3`) e o site do original oferece o
  `urovne.zip`. Ficaram de fora: o formato e a licença precisam ser conferidos.
- **Quem destrava:** a IA confere; Dagoberto decide se entram.
- **Como resolver:** um sexto grupo, "Extras", no conversor.

## P-008 · Resolver as outras fases com o resolvedor

- **Assunto:** docs/jogo.md
- **Data:** 25/11/2026
- **O que falta:** o resolvedor (busca simples) só acha a solução do treino 1; as outras fases de treino têm vários
  besouros e passam do limite. Mais soluções seriam mais provas de que o motor é fiel ao original.
- **Quem destrava:** a IA.
- **Como resolver:** a busca com macro-passos (cada ação leva a joaninha até a frente de uma peça) e um limite maior.

## P-009 · Comparar o motor com o jogo original rodando

- **Assunto:** docs/jogo.md
- **Data:** 25/11/2026
- **O que falta:** o motor foi portado lendo o código (e conferido com testes e com as dicas do original); falta a
  prova de rodar as mesmas jogadas no C++ original e comparar.
- **Quem destrava:** a IA.
- **Como resolver:** compilar só o `game_logic.cpp` com uma casca sem tela e comparar o estado depois de cada jogada.

## P-010 · Publicar

- **Assunto:** docs/publicar.md
- **Data:** 25/11/2026
- **O que falta:** o site só roda no computador. Falta pôr no ar (com o domínio e o `enderecoDoSite` do
  `app.config.ts`, para a prévia do link).
- **Quem destrava:** Dagoberto (o servidor e o domínio), com a IA.
- **Como resolver:** o `PUBLICACAO-DAGOBERTO.md`, que está na pasta `modelo/` (fora do Git).
- **Resolvida em 26/11/2026:** no ar na Amazon Lightsail, em São Paulo, com o endereço grátis do sslip.io e o cadeado
  (o `docs/publicar.md`). O domínio e o `enderecoDoSite` ficaram para a P-012.

## P-011 · Jogar num celular de verdade

- **Assunto:** docs/visual.md
- **Data:** 25/11/2026
- **O que falta:** o celular foi conferido no emulador e nos testes de tela; falta jogar algumas fases num aparelho de
  verdade (o toque no direcional, o deslizar e a câmera).
- **Quem destrava:** Dagoberto.
- **Como resolver:** com o `pnpm dev` ligado, abrir o site no celular pela rede de casa, ou depois de publicar.

## P-012 · O domínio de verdade

- **Assunto:** docs/publicar.md
- **Data:** 26/11/2026
- **O que falta:** o site está no endereço grátis do sslip.io, que leva o IP no nome. Sem domínio, o `enderecoDoSite`
  fica vazio (sem a prévia do link) e o `infra/servidor.conf` fica fora do Git.
- **Quem destrava:** Dagoberto decide: um domínio (ou um subdomínio de um que já tem), ou apagar o servidor depois da
  apresentação (o `docs/publicar.md` diz como).
- **Como resolver:** as etapas 5 a 8 do `PUBLICACAO-DAGOBERTO.md`: o DNS apontando para o IP fixo, o `preparar.sh` e
  o `cadeado.sh` com o domínio, o `infra/servidor.conf` de volta ao Git e o `enderecoDoSite` preenchido.

## P-013 · O vigia de queda e as cópias da máquina

- **Assunto:** docs/publicar.md
- **Data:** 26/11/2026
- **O que falta:** ninguém avisa se o site cair, e a máquina não tem cópia automática (snapshot).
- **Quem destrava:** Dagoberto (cria o vigia e decide os snapshots, que têm um custo pequeno).
- **Como resolver:** um vigia grátis de fora (UptimeRobot ou parecido) olhando o `/api/saude` a cada 5 minutos; os
  snapshots automáticos no painel do Lightsail.
