import { describe, expect, it } from 'vitest'
import {
  abrirFase,
  faseAberta,
  jaJogou,
  lerProgresso,
  melhorDaFase,
  ondeContinuar,
  progressoVazio,
  registrarVitoria,
} from '../app/utils/progresso'

const grupos = [
  { id: 'treino' as const, nome: 'Treino', totalDeFases: 10 },
  { id: 'facil' as const, nome: 'Fácil', totalDeFases: 50 },
]

describe('o progresso no navegador', () => {
  it('sem nada guardado (ou guardado quebrado), começa do zero', () => {
    expect(lerProgresso(null)).toEqual(progressoVazio())
    expect(lerProgresso('{quebrado')).toEqual(progressoVazio())
    expect(lerProgresso(JSON.stringify({ versao: 2 }))).toEqual(progressoVazio())
  })

  it('a primeira fase de cada grupo está sempre aberta; a seguinte abre com a vitória', () => {
    let progresso = progressoVazio()
    expect(faseAberta(progresso, 'facil', 1)).toBe(true)
    expect(faseAberta(progresso, 'treino', 2)).toBe(false)
    progresso = registrarVitoria(progresso, 'treino', 1, 94, 10, { numero: 2, senha: 'iroja' })
    expect(faseAberta(progresso, 'treino', 2)).toBe(true)
    expect(progresso.senhas['treino-2']).toBe('iroja')
    expect(melhorDaFase(progresso, 'treino', 1)).toBe(94)
  })

  it('guarda o menor número de passos, e jogar de novo uma fase de trás não fecha nada', () => {
    let progresso = registrarVitoria(progressoVazio(), 'treino', 1, 120, 10, null)
    progresso = registrarVitoria(progresso, 'treino', 2, 50, 10, null)
    progresso = registrarVitoria(progresso, 'treino', 1, 94, 10, null)
    progresso = registrarVitoria(progresso, 'treino', 1, 200, 10, null)
    expect(melhorDaFase(progresso, 'treino', 1)).toBe(94)
    expect(faseAberta(progresso, 'treino', 3)).toBe(true)
  })

  it('a última fase do grupo não abre fase que não existe', () => {
    const progresso = registrarVitoria(progressoVazio(), 'treino', 10, 30, 10, null)
    expect(progresso.abertas.treino).toBeUndefined()
  })

  it('a senha abre a fase dela', () => {
    const progresso = abrirFase(progressoVazio(), 'facil', 7, 'abcde')
    expect(faseAberta(progresso, 'facil', 7)).toBe(true)
    expect(faseAberta(progresso, 'facil', 8)).toBe(false)
  })

  it('continuar leva à fase aberta ainda não vencida', () => {
    let progresso = progressoVazio()
    expect(jaJogou(progresso)).toBe(false)
    expect(ondeContinuar(progresso, grupos)).toEqual({ grupo: 'treino', numero: 1 })
    progresso = registrarVitoria(progresso, 'treino', 1, 94, 10, null)
    expect(jaJogou(progresso)).toBe(true)
    expect(ondeContinuar(progresso, grupos)).toEqual({ grupo: 'treino', numero: 2 })
  })
})
