import { describe, expect, it } from 'vitest'
import { Turno } from '../app/utils/turno'

describe('o turno da partida', () => {
  it('livre, a ação acontece na hora', () => {
    expect(new Turno<string>().pedir('a')).toBe('a')
  })

  it('durante o passo, só a última ação pedida espera, e sai quando o passo termina', () => {
    const turno = new Turno<string>()
    turno.comecar()
    expect(turno.pedir('a')).toBeNull()
    expect(turno.pedir('b')).toBeNull()
    expect(turno.terminar()).toBe('b')
    expect(turno.terminar()).toBeNull()
    expect(turno.ocupado).toBe(false)
  })

  it('limpar esquece o que esperava', () => {
    const turno = new Turno<string>()
    turno.comecar()
    turno.pedir('a')
    turno.limpar()
    expect(turno.terminar()).toBeNull()
  })
})
