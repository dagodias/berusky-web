/** A conclusão de uma fase (a API refaz as jogadas com o motor) e a busca pela senha. */
import { ConclusaoSchema } from '@projeto/shared'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { criarServidor } from '../src/server.js'
import { buscarPorSenha, concluirFase } from '../src/services/fases.service.js'
import solucoes from './fixtures/solucoes.json' with { type: 'json' }

const vitoria = solucoes['treino-1']

describe('concluir a fase', () => {
  it('a solução vence: a API devolve os passos e a senha da próxima', () => {
    const resultado = concluirFase('treino', 1, vitoria)
    expect(resultado).toEqual({
      tipo: 'venceu',
      conclusao: {
        passos: expect.any(Number),
        proxima: { grupo: 'treino', numero: 2, senha: 'iroja' },
        textoDoFim: null,
      },
    })
  })

  it('jogadas que não vencem não dão a senha', () => {
    expect(concluirFase('treino', 1, 'UDLR')).toEqual({ tipo: 'nao-venceu' })
    expect(concluirFase('treino', 1, `${vitoria}L`)).toEqual({ tipo: 'nao-venceu' })
  })

  it('a fase que não existe', () => {
    expect(concluirFase('treino', 11, vitoria)).toEqual({ tipo: 'nao-existe' })
  })
})

describe('a senha', () => {
  it('leva à fase dela, com maiúscula ou minúscula', () => {
    expect(buscarPorSenha('cuwat')).toEqual({ grupo: 'treino', numero: 1 })
    expect(buscarPorSenha(' IROJA ')).toEqual({ grupo: 'treino', numero: 2 })
  })

  it('a senha que não existe', () => {
    expect(buscarPorSenha('zzzzz')).toBeNull()
  })
})

describe('as rotas', () => {
  let app: Awaited<ReturnType<typeof criarServidor>>

  beforeAll(async () => {
    app = await criarServidor()
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  const concluir = (url: string, jogadas: unknown) =>
    app.inject({ method: 'POST', url, payload: { jogadas } })

  it('POST da conclusão: 200 com a vitória, 422 sem ela, 400 com letra estranha, 404 sem a fase', async () => {
    const venceu = await concluir('/api/fases/treino/1/conclusao', vitoria)
    expect(venceu.statusCode).toBe(200)
    expect(ConclusaoSchema.parse(venceu.json()).proxima?.senha).toBe('iroja')

    const naoVenceu = await concluir('/api/fases/treino/1/conclusao', 'UD')
    expect(naoVenceu.statusCode).toBe(422)
    expect(naoVenceu.json()).toEqual({ erro: 'fase_nao_vencida' })

    expect((await concluir('/api/fases/treino/1/conclusao', 'UX')).statusCode).toBe(400)
    expect((await concluir('/api/fases/treino/1/conclusao', '')).statusCode).toBe(400)
    expect((await concluir('/api/fases/treino/11/conclusao', vitoria)).statusCode).toBe(404)
  })

  it('POST da senha: 200 com a fase, 404 com a senha que não existe, 400 fora do formato', async () => {
    const pedir = (senha: string) =>
      app.inject({ method: 'POST', url: '/api/senhas', payload: { senha } })
    const certa = await pedir('IroJa')
    expect(certa.statusCode).toBe(200)
    expect(certa.json()).toEqual({ grupo: 'treino', numero: 2 })
    expect((await pedir('zzzzz')).statusCode).toBe(404)
    expect((await pedir('abc')).statusCode).toBe(400)
  })
})
