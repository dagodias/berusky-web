/**
 * O resolvedor: acha, com o próprio motor do jogo, uma solução das fases de treino. As soluções viram as provas dos
 * testes (apps/api/test/fixtures/solucoes.json): a API reproduz cada uma e confere a vitória, e o teste de tela joga
 * a primeira com o teclado. Rode com: pnpm --filter @projeto/api resolver
 *
 * É uma busca em largura: cada ação é "o besouro n dá um passo para tal lado" (com a troca antes, se precisar), e o
 * estado repetido fica de fora. Acha a solução com menos ações; nas fases grandes, desiste no limite de estados.
 */
import { writeFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { type Direcao, type FaseDoMotor, Partida } from '@projeto/jogo'
import { fases } from '../src/config/fases.js'

const DIRECOES: Direcao[] = ['cima', 'baixo', 'esquerda', 'direita']

/** O estado sem o besouro comandado: a troca é parte da ação, não do estado. */
function chave(partida: Partida): string {
  const completa = partida.chaveDoEstado()
  return completa.slice(completa.indexOf('|') + 1)
}

/** A solução (o registro de jogadas) com menos ações, ou null se passar do limite de estados. */
export function resolver(fase: FaseDoMotor, limiteDeEstados = 200_000): string | null {
  const inicio = new Partida(fase)
  const numeros = fase.besouros.map(([numero = 1]) => numero)
  const vistos = new Set([chave(inicio)])
  let fronteira = [inicio]
  while (fronteira.length) {
    const proxima: Partida[] = []
    for (const partida of fronteira) {
      for (const numero of numeros) {
        for (const direcao of DIRECOES) {
          const filha = partida.clonar()
          filha.trocar(numero)
          filha.mover(direcao)
          if (filha.venceu) return filha.jogadas
          const k = chave(filha)
          if (vistos.has(k)) continue
          vistos.add(k)
          if (vistos.size > limiteDeEstados) return null
          proxima.push(filha)
        }
      }
    }
    fronteira = proxima
  }
  return null
}

export const ARQUIVO_DAS_SOLUCOES = fileURLToPath(
  new URL('../test/fixtures/solucoes.json', import.meta.url),
)

// Rodado direto: resolve as fases de treino e grava as soluções.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const treino = fases.grupos.find((g) => g.id === 'treino')
  const solucoes: Record<string, string> = {}
  for (const [i, fase] of (treino?.fases ?? []).entries()) {
    const inicio = Date.now()
    const solucao = resolver(fase)
    const tempo = ((Date.now() - inicio) / 1000).toFixed(1)
    console.log(
      `treino ${i + 1}: ${solucao ? `${solucao.length} jogadas` : 'sem solução no limite'} (${tempo} s)`,
    )
    if (solucao) solucoes[`treino-${i + 1}`] = solucao
  }
  writeFileSync(ARQUIVO_DAS_SOLUCOES, JSON.stringify(solucoes, null, 2) + '\n')
}
