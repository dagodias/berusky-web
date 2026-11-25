import { describe, expect, it } from 'vitest'
import { LinkSchema, NegocioSchema } from '../src/index.js'

const negocio = { nome: 'Berusky', frase: '', links: [] }

describe('o contrato', () => {
  it('o link só aceita endereço http ou https', () => {
    expect(LinkSchema.safeParse({ nome: 'Código', endereco: 'https://github.com/' }).success).toBe(
      true,
    )
    expect(LinkSchema.safeParse({ nome: 'Golpe', endereco: 'javascript:alert(1)' }).success).toBe(
      false,
    )
  })

  it('o nome não pode ficar vazio', () => {
    expect(NegocioSchema.safeParse(negocio).success).toBe(true)
    expect(NegocioSchema.safeParse({ ...negocio, nome: '' }).success).toBe(false)
  })

  it('o e-mail é opcional, mas, se vier, precisa ser um e-mail', () => {
    expect(NegocioSchema.safeParse({ ...negocio, email: 'contato@exemplo.com.br' }).success).toBe(
      true,
    )
    expect(NegocioSchema.safeParse({ ...negocio, email: 'contato' }).success).toBe(false)
  })
})
