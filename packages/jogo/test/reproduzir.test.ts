/** Reproduzir o registro de jogadas: é assim que a API confere a vitória, com o mesmo motor da tela. */
import { describe, expect, it } from 'vitest'
import { MAXIMO_DE_JOGADAS, Partida, reproduzir } from '../src/index.js'
import { tabuleiro } from './tabuleiro.js'

const fase = tabuleiro(['kkkkk1E', '2......'])

describe('reproduzir as jogadas', () => {
  it('o registro da partida, reproduzido, chega à mesma vitória e aos mesmos passos', () => {
    const partida = new Partida(fase)
    partida.trocar(2)
    partida.mover('direita')
    partida.trocar(1)
    for (let i = 0; i < 5; i++) partida.mover('esquerda')
    partida.mover('cima') // bloqueado: o registro guarda também
    for (let i = 0; i < 5; i++) partida.mover('direita')
    partida.mover('direita')
    expect(partida.venceu).toBe(true)
    expect(reproduzir(fase, partida.jogadas)).toEqual({ valida: true, venceu: true, passos: 11 })
  })

  it('guardar e voltar também se reproduzem (os passos continuam contando)', () => {
    const partida = new Partida(fase)
    partida.guardar()
    partida.mover('esquerda')
    partida.voltar()
    expect(reproduzir(fase, partida.jogadas)).toEqual({ valida: true, venceu: false, passos: 1 })
  })

  it('recusa letra desconhecida, jogada depois da vitória e registro comprido demais', () => {
    expect(reproduzir(fase, 'LX')).toEqual({ valida: false, motivo: 'letra-desconhecida' })
    expect(reproduzir(fase, 'LLLLLRRRRRRL')).toEqual({
      valida: false,
      motivo: 'jogada-depois-da-vitoria',
    })
    expect(reproduzir(fase, 'L'.repeat(MAXIMO_DE_JOGADAS + 1))).toEqual({
      valida: false,
      motivo: 'comprido-demais',
    })
  })
})
