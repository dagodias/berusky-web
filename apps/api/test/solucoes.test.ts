/** As soluções achadas pelo resolvedor (pnpm --filter @projeto/api resolver) vencem as fases no mesmo motor da tela. */
import { reproduzir } from '@projeto/jogo'
import { GrupoIdSchema } from '@projeto/shared'
import { describe, expect, it } from 'vitest'
import { buscarFase } from '../src/services/fases.service.js'
import solucoes from './fixtures/solucoes.json' with { type: 'json' }

describe('as soluções gravadas', () => {
  it('tem pelo menos a do treino 1', () => {
    expect(solucoes['treino-1']).toMatch(/^[UDLR1-5]+$/)
  })

  it('cada uma vence a fase dela', () => {
    for (const [nome, jogadas] of Object.entries(solucoes)) {
      const [grupo = '', numero = ''] = nome.split('-')
      const fase = buscarFase(GrupoIdSchema.parse(grupo), Number(numero))
      expect(fase, nome).not.toBeNull()
      expect(reproduzir(fase!, jogadas), nome).toMatchObject({ valida: true, venceu: true })
    }
  })
})
