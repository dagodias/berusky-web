/**
 * O teclado da partida: qual ação cada tecla pede. As setas e o WASD (pela posição da tecla, que vale em qualquer
 * teclado) movem; Shift deixa o passo rápido. As letras das outras ações valem pela letra (R recomeça, G guarda, V
 * volta, P mostra a dica, H a ajuda, L lê os arredores); Tab troca de joaninha só com o tabuleiro em foco (fora dele, o
 * Tab navega pela página). Tecla com Ctrl, Cmd ou Alt fica para o navegador (o Ctrl+R recarrega a página).
 */
import type { Direcao } from '@projeto/jogo'

export type Acao =
  | { tipo: 'mover'; direcao: Direcao; rapido: boolean }
  | { tipo: 'trocar'; alvo: number | 'proximo' }
  | { tipo: 'guardar' }
  | { tipo: 'voltar' }
  | { tipo: 'recomecar' }
  | { tipo: 'ajuda' }
  | { tipo: 'dica' }
  | { tipo: 'menu' }
  | { tipo: 'arredores' }

export type Tecla = Pick<
  KeyboardEvent,
  'key' | 'code' | 'shiftKey' | 'ctrlKey' | 'metaKey' | 'altKey'
>

const DIRECOES: Record<string, Direcao> = {
  ArrowUp: 'cima',
  ArrowDown: 'baixo',
  ArrowLeft: 'esquerda',
  ArrowRight: 'direita',
  KeyW: 'cima',
  KeyS: 'baixo',
  KeyA: 'esquerda',
  KeyD: 'direita',
}

const LETRAS: Record<string, Acao> = {
  r: { tipo: 'recomecar' },
  g: { tipo: 'guardar' },
  v: { tipo: 'voltar' },
  p: { tipo: 'dica' },
  h: { tipo: 'ajuda' },
  '?': { tipo: 'ajuda' },
  l: { tipo: 'arredores' },
}

/** As teclas de função do original, que continuam valendo: F1 a ajuda, F2 guardar, F3 voltar. */
const FUNCOES: Record<string, Acao> = {
  F1: { tipo: 'ajuda' },
  F2: { tipo: 'guardar' },
  F3: { tipo: 'voltar' },
}

export function direcaoDaTecla(tecla: Pick<KeyboardEvent, 'key' | 'code'>): Direcao | null {
  return DIRECOES[tecla.code] ?? DIRECOES[tecla.key] ?? null
}

export function acaoDaTecla(tecla: Tecla, tabuleiroEmFoco: boolean): Acao | null {
  if (tecla.ctrlKey || tecla.metaKey || tecla.altKey) return null
  const direcao = direcaoDaTecla(tecla)
  if (direcao) return { tipo: 'mover', direcao, rapido: tecla.shiftKey }
  if (tecla.key === 'Tab') {
    return tabuleiroEmFoco && !tecla.shiftKey ? { tipo: 'trocar', alvo: 'proximo' } : null
  }
  if (tecla.key === 'Escape') return { tipo: 'menu' }
  const numero = /^(?:Digit|Numpad)([1-5])$/.exec(tecla.code)?.[1]
  if (numero) return { tipo: 'trocar', alvo: Number(numero) }
  return FUNCOES[tecla.key] ?? LETRAS[tecla.key.toLowerCase()] ?? null
}
