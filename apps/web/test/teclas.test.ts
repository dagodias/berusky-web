import { describe, expect, it } from 'vitest'
import { acaoDaTecla, type Tecla } from '../app/utils/teclas'

const tecla = (key: string, code = '', extra: Partial<Tecla> = {}): Tecla => ({
  key,
  code,
  shiftKey: false,
  ctrlKey: false,
  metaKey: false,
  altKey: false,
  ...extra,
})

describe('o teclado da partida', () => {
  it('as setas e o WASD movem; com Shift, o passo é rápido', () => {
    expect(acaoDaTecla(tecla('ArrowUp', 'ArrowUp'), true)).toEqual({
      tipo: 'mover',
      direcao: 'cima',
      rapido: false,
    })
    expect(acaoDaTecla(tecla('a', 'KeyA'), true)).toMatchObject({ direcao: 'esquerda' })
    expect(acaoDaTecla(tecla('ArrowRight', 'ArrowRight', { shiftKey: true }), true)).toMatchObject({
      rapido: true,
    })
  })

  it('o Tab troca de joaninha só com o tabuleiro em foco, e o Shift+Tab fica para o navegador', () => {
    expect(acaoDaTecla(tecla('Tab', 'Tab'), true)).toEqual({ tipo: 'trocar', alvo: 'proximo' })
    expect(acaoDaTecla(tecla('Tab', 'Tab'), false)).toBeNull()
    expect(acaoDaTecla(tecla('Tab', 'Tab', { shiftKey: true }), true)).toBeNull()
  })

  it('de 1 a 5 escolhe a joaninha (no teclado numérico também)', () => {
    expect(acaoDaTecla(tecla('3', 'Digit3'), false)).toEqual({ tipo: 'trocar', alvo: 3 })
    expect(acaoDaTecla(tecla('5', 'Numpad5'), false)).toEqual({ tipo: 'trocar', alvo: 5 })
    expect(acaoDaTecla(tecla('6', 'Digit6'), false)).toBeNull()
  })

  it('as letras das ações valem pela letra, maiúscula ou minúscula', () => {
    expect(acaoDaTecla(tecla('R', 'KeyR', { shiftKey: true }), false)).toEqual({ tipo: 'recomecar' })
    expect(acaoDaTecla(tecla('g', 'KeyG'), false)).toEqual({ tipo: 'guardar' })
    expect(acaoDaTecla(tecla('v', 'KeyV'), false)).toEqual({ tipo: 'voltar' })
    expect(acaoDaTecla(tecla('p', 'KeyP'), false)).toEqual({ tipo: 'dica' })
    expect(acaoDaTecla(tecla('?', 'Slash', { shiftKey: true }), false)).toEqual({ tipo: 'ajuda' })
    expect(acaoDaTecla(tecla('l', 'KeyL'), false)).toEqual({ tipo: 'arredores' })
    expect(acaoDaTecla(tecla('Escape', 'Escape'), false)).toEqual({ tipo: 'menu' })
    expect(acaoDaTecla(tecla('F2', 'F2'), false)).toEqual({ tipo: 'guardar' })
  })

  it('tecla com Ctrl, Cmd ou Alt fica para o navegador (o Ctrl+R recarrega)', () => {
    expect(acaoDaTecla(tecla('r', 'KeyR', { ctrlKey: true }), true)).toBeNull()
    expect(acaoDaTecla(tecla('ArrowUp', 'ArrowUp', { metaKey: true }), true)).toBeNull()
    expect(acaoDaTecla(tecla('x', 'KeyX'), true)).toBeNull()
  })
})
