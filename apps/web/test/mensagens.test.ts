import { ITEM } from '@projeto/jogo'
import { describe, expect, it } from 'vitest'
import { descreverArredores, mensagemDosEventos } from '../app/utils/mensagens'

describe('o aviso falado', () => {
  it('o passo comum não diz nada; a chave, a saída e o bloqueio dizem', () => {
    const passo = { tipo: 'andou', besouro: 1, de: { x: 0, y: 0 }, para: { x: 1, y: 0 } } as const
    expect(mensagemDosEventos([passo], 0)).toBe('')
    expect(
      mensagemDosEventos(
        [passo, { tipo: 'pegou', peca: 1, item: ITEM.CHAVE, em: { x: 1, y: 0 } }, { tipo: 'saida-liberada' }],
        5,
      ),
    ).toBe('Chave: 5 de 5. A saída abriu!')
    expect(mensagemDosEventos([{ tipo: 'bloqueado', motivo: 'sem-picareta' }], 0)).toMatch(/picareta/)
  })

  it('descreve os quatro lados da joaninha', () => {
    const casa = (x: number, y: number) => ({
      item: y < 0 ? -1 : x === 1 ? ITEM.CHAVE : ITEM.NENHUM,
      besouro: x === -1 ? 2 : 0,
    })
    expect(descreverArredores(1, 0, 0, casa)).toBe(
      'Joaninha 1. Em cima: fim do tabuleiro. Embaixo: livre. À esquerda: joaninha 2. À direita: chave.',
    )
  })
})
