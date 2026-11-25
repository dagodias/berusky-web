# Os arquivos do Berusky original

Esta pasta guarda, byte a byte, os arquivos do jogo original de que esta versão precisa. Eles nunca se editam: o
conversor (`pnpm --filter @projeto/api fases`) lê daqui e gera `apps/api/src/config/fases.json`, e um teste confere a
cada `pnpm test` que o JSON guardado ainda bate com eles.

## De onde vieram

- O pacote de dados do Berusky 1.7, de Anakreon: `berusky-data_1.7.orig.tar.gz` (5.366.663 bytes), baixado do
  arquivo do Debian em https://deb.debian.org/debian/pool/main/b/berusky-data/.
- SHA-256 do pacote: `be6d99f40d65341b32b381c004f32885e3dc114b76a95efbc4c5057ea524401e`, o mesmo do `berusky-data_1.7-6.dsc` do Debian.
- A licença: GPL, versão 2 ou mais nova (o `COPYING` e o `README` desta pasta, como vieram no pacote).

## O que foi guardado

| Arquivo | O que é |
| --- | --- |
| `Levels/*.lv3` | As 120 fases (binárias, 28.361 bytes cada) |
| `GameData/s0.dat` a `s4.dat` | A ordem das fases de cada grupo e a senha de cada uma |
| `GameData/hints.dat` | A dica de cada fase, em inglês (a tradução mora em `../dicas.pt.txt`) |
| `GameData/end0.dat` a `end4.dat` | O texto do fim de cada grupo, em inglês |
| `GameData/credits.dat` | Os créditos do jogo original |
| `GameData/items.dat` | A definição dos itens; dela sai a posição dos batentes das portas |
| `COPYING` e `README` | A licença e o leia-me do pacote |

As imagens do original não foram guardadas: o visual desta versão é todo novo.
