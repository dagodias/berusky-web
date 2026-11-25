/**
 * Reproduzir uma partida a partir do registro de jogadas: é assim que a API confere, com o mesmo motor da tela, que a
 * fase foi mesmo vencida. Uma letra por ação: U, D, L e R são os passos (até os bloqueados, que podem fechar porta),
 * de 1 a 5 a troca de besouro, G guardar a posição e V voltar a ela. O recomeço não entra: ele zera o registro.
 */
import { MAXIMO_DE_JOGADAS } from '@projeto/shared'
import { type Direcao, type FaseDoMotor, LETRAS, Partida } from './partida.js'

/** O registro mais comprido que a API aceita (uma fase difícil passa de mil passos; é folga de sobra). */
export { MAXIMO_DE_JOGADAS }

export const PADRAO_DAS_JOGADAS = /^[UDLR1-5GV]*$/

const DIRECOES: Record<string, Direcao> = {
  [LETRAS.cima]: 'cima',
  [LETRAS.baixo]: 'baixo',
  [LETRAS.esquerda]: 'esquerda',
  [LETRAS.direita]: 'direita',
}

export type Reproducao =
  | { valida: true; venceu: boolean; passos: number }
  | { valida: false; motivo: 'letra-desconhecida' | 'jogada-depois-da-vitoria' | 'comprido-demais' }

export function reproduzir(fase: FaseDoMotor, jogadas: string): Reproducao {
  if (jogadas.length > MAXIMO_DE_JOGADAS) return { valida: false, motivo: 'comprido-demais' }
  if (!PADRAO_DAS_JOGADAS.test(jogadas)) return { valida: false, motivo: 'letra-desconhecida' }

  const partida = new Partida(fase)
  for (const letra of jogadas) {
    if (partida.venceu) return { valida: false, motivo: 'jogada-depois-da-vitoria' }
    const direcao = DIRECOES[letra]
    if (direcao) partida.mover(direcao)
    else if (letra === LETRAS.guardar) partida.guardar()
    else if (letra === LETRAS.voltar) partida.voltar()
    else partida.trocar(Number(letra))
  }
  return { valida: true, venceu: partida.venceu, passos: partida.passos }
}
