import { FaseSchema, GrupoSchema } from '@projeto/shared'
import { describe, expect, it } from 'vitest'
import { buscarFase, listarGrupos } from '../src/services/fases.service.js'

describe('as fases para quem joga', () => {
  it('lista os grupos no formato do contrato', () => {
    const grupos = listarGrupos()
    expect(grupos.every((g) => GrupoSchema.safeParse(g).success)).toBe(true)
    expect(grupos.reduce((soma, g) => soma + g.totalDeFases, 0)).toBe(120)
  })

  it('toda fase sai no formato do contrato, sem a senha', () => {
    for (const grupo of listarGrupos()) {
      for (let numero = 1; numero <= grupo.totalDeFases; numero++) {
        const fase = buscarFase(grupo.id, numero)
        expect(FaseSchema.safeParse(fase).success, `${grupo.id} ${numero}`).toBe(true)
        expect(fase).not.toHaveProperty('senha')
      }
    }
  })

  it('a fase que não existe vem null', () => {
    expect(buscarFase('treino', 11)).toBeNull()
    expect(buscarFase('impossivel', 0)).toBeNull()
  })
})
