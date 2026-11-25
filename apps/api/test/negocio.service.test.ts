import { NegocioSchema } from '@projeto/shared'
import { describe, expect, it } from 'vitest'
import { negocioPublico } from '../src/services/negocio.service.js'

describe('o que quem visita vê', () => {
  it('segue o contrato', () => {
    expect(NegocioSchema.safeParse(negocioPublico()).success).toBe(true)
  })

  it('o link do código-fonte vem primeiro (a GPL pede que quem joga chegue nele)', () => {
    const [primeiro] = negocioPublico().links
    expect(primeiro?.nome).toMatch(/Código-fonte/)
    expect(primeiro?.endereco).toMatch(/^https:\/\/github\.com\//)
  })
})
