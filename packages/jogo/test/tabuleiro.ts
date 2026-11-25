/**
 * Fases pequenas desenhadas em texto, no canto de cima da grade, para os testes das regras.
 * Legenda: '#' parede, '.' vazio, 'B' caixa, 'L' caixa leve, 'T' explosivo, 'E' saída, 'S' pedra, 'k' chave,
 * 'p' picareta, 'a' a 'e' a chave colorida do besouro 1 a 5, '1' a '5' o besouro. Outras letras vêm na legenda.
 */
import { ITEM, type FaseDoMotor } from '../src/index.js'

export type Simbolo = { item?: number; variacao?: number; besouro?: number }

const PADRAO: Record<string, Simbolo> = {
  '#': { item: ITEM.PAREDE },
  B: { item: ITEM.CAIXA },
  L: { item: ITEM.CAIXA_LEVE },
  T: { item: ITEM.EXPLOSIVO },
  E: { item: ITEM.SAIDA },
  S: { item: ITEM.PEDRA },
  k: { item: ITEM.CHAVE },
  p: { item: ITEM.PICARETA },
  a: { item: ITEM.CHAVE_COLORIDA },
  b: { item: ITEM.CHAVE_COLORIDA + 1 },
  c: { item: ITEM.CHAVE_COLORIDA + 2 },
  d: { item: ITEM.CHAVE_COLORIDA + 3 },
  e: { item: ITEM.CHAVE_COLORIDA + 4 },
  '1': { besouro: 1 },
  '2': { besouro: 2 },
  '3': { besouro: 3 },
  '4': { besouro: 4 },
  '5': { besouro: 5 },
}

export function tabuleiro(linhas: string[], legenda: Record<string, Simbolo> = {}): FaseDoMotor {
  const fase: FaseDoMotor = { itens: [], besouros: [] }
  linhas.forEach((linha, y) => {
    ;[...linha].forEach((letra, x) => {
      if (letra === '.' || letra === ' ') return
      const simbolo = legenda[letra] ?? PADRAO[letra]
      if (!simbolo) throw new Error(`A letra ${letra} não está na legenda.`)
      if (simbolo.item) fase.itens.push([x, y, simbolo.item, simbolo.variacao ?? 0])
      if (simbolo.besouro) fase.besouros.push([simbolo.besouro, x, y, 0])
    })
  })
  return fase
}
