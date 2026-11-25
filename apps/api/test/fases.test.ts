/**
 * As fases convertidas do original: o JSON guardado bate com os arquivos de dados/berusky-data-1.7, e cada fase
 * segue as regras que o motor do jogo espera.
 */
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  ARQUIVO_DA_TRADUCAO,
  ARQUIVO_DAS_FASES,
  converter,
  formatar,
  lerConjunto,
  lerFase,
  lerOriginais,
  lerTextosMarcados,
  PASTA_DOS_ORIGINAIS,
} from '../scripts/fases.js'
import { fases } from '../src/config/fases.js'

const CHAVE = 11
const SAIDA = 9

describe('o fases.json', () => {
  it('é exatamente o que o conversor gera dos originais (rode pnpm --filter @projeto/api fases)', () => {
    const gerado = formatar(converter(lerOriginais(PASTA_DOS_ORIGINAIS, ARQUIVO_DA_TRADUCAO)))
    expect(gerado === readFileSync(ARQUIVO_DAS_FASES, 'utf8')).toBe(true)
  })

  it('tem os cinco grupos do original, com 10, 50, 35, 20 e 5 fases', () => {
    expect(fases.grupos.map((g) => g.id)).toEqual([
      'treino',
      'facil',
      'intermediario',
      'avancado',
      'impossivel',
    ])
    expect(fases.grupos.map((g) => g.fases.length)).toEqual([10, 50, 35, 20, 5])
  })

  it('cada fase tem de 1 a 5 besouros, uma saída e pelo menos 5 chaves', () => {
    for (const grupo of fases.grupos) {
      for (const fase of grupo.fases) {
        const contar = (item: number) => fase.itens.filter(([, , i]) => i === item).length
        expect(fase.besouros.length, fase.arquivo).toBeGreaterThanOrEqual(1)
        expect(fase.besouros.length, fase.arquivo).toBeLessThanOrEqual(5)
        expect(contar(SAIDA), fase.arquivo).toBeGreaterThanOrEqual(1)
        expect(contar(CHAVE), fase.arquivo).toBeGreaterThanOrEqual(5)
        expect(fase.piso, fase.arquivo).toHaveLength(32 * 21)
      }
    }
  })

  it('as senhas são de cinco letras e nunca se repetem', () => {
    const senhas = fases.grupos.flatMap((g) => g.fases.map((f) => f.senha))
    expect(senhas.every((s) => /^[a-z]{5}$/.test(s))).toBe(true)
    expect(new Set(senhas).size).toBe(120)
  })
})

describe('o conversor', () => {
  it('lê o conjunto em pares: o arquivo da fase e a senha', () => {
    expect(lerConjunto('# comentário\nr01.lv3\ncuwat\n\nr02.lv3\niroja\n')).toEqual([
      { arquivo: 'r01.lv3', senha: 'cuwat' },
      { arquivo: 'r02.lv3', senha: 'iroja' },
    ])
    expect(() => lerConjunto('r01.lv3\n')).toThrow()
  })

  it('recusa a fase com tamanho ou assinatura errados', () => {
    expect(() => lerFase('x.lv3', new Uint8Array(10))).toThrow(/bytes/)
    expect(() => lerFase('x.lv3', new Uint8Array(28361))).toThrow(/assinatura/)
  })

  it('lê a primeira fase do treino como o original: um besouro em 14,3 e a saída em 12,9', () => {
    const r01 = fases.grupos[0]?.fases[0]
    expect(r01?.arquivo).toBe('r01.lv3')
    expect(r01?.senha).toBe('cuwat')
    expect(r01?.besouros).toEqual([[1, 14, 3, 1]])
    expect(r01?.itens).toContainEqual([12, 9, SAIDA, 4])
  })

  it('junta as linhas do texto marcado em parágrafos', () => {
    const textos = lerTextosMarcados(
      '~1_1\n\nUma linha\ne outra.\n\nOutro parágrafo.\n~1_2\nDois\n~\n',
    )
    expect(textos.get('1_1')).toBe('Uma linha e outra.\n\nOutro parágrafo.')
    expect(textos.get('1_2')).toBe('Dois')
  })
})
