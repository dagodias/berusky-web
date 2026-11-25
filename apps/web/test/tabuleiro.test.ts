import { ITEM, naCor } from '@projeto/jogo'
import { describe, expect, it } from 'vitest'
import {
  caminhoDasParedes,
  caminhosDoPiso,
  casasDeParede,
  corDoBesouro,
  desenhoDaPeca,
  retangulo,
} from '../app/utils/tabuleiro'

describe('o desenho do tabuleiro', () => {
  it('o retângulo sai fechado, e com cantos redondos quando pede', () => {
    expect(retangulo(0, 0, 10, 10)).toBe('M0 0h10v10h-10Z')
    expect(retangulo(0, 0, 64, 64, 16)).toMatch(/^M16 0h32a16 16 0 0 1 16 16/)
  })

  it('as paredes vizinhas ganham a emenda; a parede sozinha, não', () => {
    const sozinha = caminhoDasParedes([[0, 0, ITEM.PAREDE, 0]])
    const dupla = caminhoDasParedes([
      [0, 0, ITEM.PAREDE, 0],
      [1, 0, ITEM.PAREDE, 0],
    ])
    expect(sozinha.match(/M/g)).toHaveLength(1)
    expect(dupla.match(/M/g)).toHaveLength(3)
  })

  it('só a parede (e o batente) vira parede; a caixa, não', () => {
    const casas = casasDeParede([
      [0, 0, ITEM.PAREDE, 0],
      [1, 0, 64, 0],
      [2, 0, ITEM.CAIXA, 0],
    ])
    expect([...casas]).toEqual(['0,0', '1,0'])
  })

  it('o piso divide as lajotas em três tons e pula as casas sem piso', () => {
    const piso = '0.1' + '.'.repeat(32 * 21 - 3)
    const [a, b, c] = caminhosDoPiso(piso)
    expect(a.match(/M/g)).toHaveLength(1)
    expect(b.match(/M/g)).toHaveLength(1)
    expect(c).toBe('')
  })

  it('cada item tem o seu desenho; as portas de passar na vertical vão deitadas', () => {
    expect(desenhoDaPeca(ITEM.CAIXA)).toEqual({ simbolo: 'jogo-caixa', cor: 0, deitada: false })
    expect(desenhoDaPeca(naCor(ITEM.PORTA_H_FECHADA, 2))).toEqual({
      simbolo: 'jogo-porta-fechada',
      cor: 2,
      deitada: false,
    })
    expect(desenhoDaPeca(naCor(ITEM.PASSAGEM_V_ABERTA, 4))).toEqual({
      simbolo: 'jogo-passagem-aberta',
      cor: 4,
      deitada: true,
    })
    expect(desenhoDaPeca(ITEM.PORTA_CYBER_V).simbolo).toBe('jogo-porta-aberta')
    expect(desenhoDaPeca(ITEM.UMA_VEZ_V_FECHADA)).toEqual({
      simbolo: 'jogo-uma-vez-fechada',
      cor: 0,
      deitada: true,
    })
  })

  it('a cor do besouro vem da variável do main.css', () => {
    expect(corDoBesouro(3)).toBe('var(--besouro-3)')
  })
})
