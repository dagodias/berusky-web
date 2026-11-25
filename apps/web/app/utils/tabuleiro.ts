/**
 * O desenho do tabuleiro: as contas que viram os caminhos do SVG. O chão, o piso e as paredes não mudam durante a
 * partida, então cada material vira um caminho só (poucos elementos na tela, leve no celular); as peças são <use> dos
 * desenhos do JogoSprites.
 */
import { ALTURA, LARGURA } from '@projeto/shared'
import { corDoItem, ehParede, ITEM, portaHorizontal, tipoDoItem } from '@projeto/jogo'

/** O tamanho de uma casa, em unidades do SVG (o desenho de cada peça é 64 × 64). */
export const CASA = 64
export const LARGURA_DO_TABULEIRO = LARGURA * CASA
export const ALTURA_DO_TABULEIRO = ALTURA * CASA

/** Um retângulo de cantos redondos, no sentido do relógio (todos iguais, para as sobreposições se somarem). */
export function retangulo(x: number, y: number, largura: number, altura: number, raio = 0): string {
  const r = Math.min(raio, largura / 2, altura / 2)
  if (!r) return `M${x} ${y}h${largura}v${altura}h${-largura}Z`
  return (
    `M${x + r} ${y}h${largura - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${altura - 2 * r}` +
    `a${r} ${r} 0 0 1 ${-r} ${r}h${-(largura - 2 * r)}a${r} ${r} 0 0 1 ${-r} ${-r}v${-(altura - 2 * r)}` +
    `a${r} ${r} 0 0 1 ${r} ${-r}Z`
  )
}

/** As casas de parede da fase (a parede e os batentes). */
export function casasDeParede(itens: number[][]): Set<string> {
  const casas = new Set<string>()
  for (const [x = 0, y = 0, item = 0] of itens) if (ehParede(item)) casas.add(`${x},${y}`)
  return casas
}

/**
 * As paredes num caminho só: cada casa é um quadrado de cantos redondos, e a emenda com a parede vizinha (à direita e
 * embaixo) cobre os cantos de dentro. Sobram redondos só os cantos de fora: a parede fica um bloco contínuo.
 */
export function caminhoDasParedes(itens: number[][]): string {
  const casas = casasDeParede(itens)
  const partes: string[] = []
  for (const casa of casas) {
    const [x = 0, y = 0] = casa.split(',').map(Number)
    partes.push(retangulo(x * CASA, y * CASA, CASA, CASA, 16))
    if (casas.has(`${x + 1},${y}`))
      partes.push(retangulo(x * CASA + CASA / 2, y * CASA, CASA, CASA))
    if (casas.has(`${x},${y + 1}`))
      partes.push(retangulo(x * CASA, y * CASA + CASA / 2, CASA, CASA))
  }
  return partes.join('')
}

/**
 * O piso: uma lajota por casa com piso, com a junta entre elas. O desenho do original (de 0 a 9) escolhe um de três
 * tons, para o piso não ficar chapado.
 */
export function caminhosDoPiso(piso: string): [string, string, string] {
  const tons: [string[], string[], string[]] = [[], [], []]
  for (let i = 0; i < piso.length; i++) {
    const letra = piso[i]
    if (!letra || letra === '.') continue
    const x = i % LARGURA
    const y = Math.floor(i / LARGURA)
    tons[Number(letra) % 3]?.push(retangulo(x * CASA + 3, y * CASA + 3, CASA - 6, CASA - 6, 9))
  }
  return [tons[0].join(''), tons[1].join(''), tons[2].join('')]
}

export type DesenhoDaPeca = {
  /** O id do <symbol> no JogoSprites. */
  simbolo: string
  /** A cor (1 a 5) dos itens coloridos; 0 é sem cor. */
  cor: number
  /** Girada 90 graus: as portas de passar na vertical usam o mesmo desenho, deitado. */
  deitada: boolean
}

/** Qual desenho usar para um item. */
export function desenhoDaPeca(item: number): DesenhoDaPeca {
  const cor = corDoItem(item)
  const deitada = !portaHorizontal(item)
  const tipo = tipoDoItem(item)
  if (tipo === 'porta') {
    const aberta = item === ITEM.PORTA_CYBER_H || item === ITEM.PORTA_CYBER_V || estaAberta(item)
    return { simbolo: aberta ? 'jogo-porta-aberta' : 'jogo-porta-fechada', cor, deitada }
  }
  if (tipo === 'passagem') {
    return {
      simbolo: estaAberta(item) ? 'jogo-passagem-aberta' : 'jogo-passagem-fechada',
      cor,
      deitada,
    }
  }
  if (tipo === 'uma-vez') {
    const aberta = item === ITEM.UMA_VEZ_H_ABERTA || item === ITEM.UMA_VEZ_V_ABERTA
    return { simbolo: aberta ? 'jogo-uma-vez-aberta' : 'jogo-uma-vez-fechada', cor: 0, deitada }
  }
  return { simbolo: `jogo-${tipo}`, cor, deitada: false }
}

function estaAberta(item: number): boolean {
  return (
    (item >= ITEM.PORTA_H_ABERTA && item < ITEM.PORTA_H_FECHADA) ||
    (item >= ITEM.PORTA_V_ABERTA && item < ITEM.PORTA_V_FECHADA) ||
    (item >= ITEM.PASSAGEM_H_ABERTA && item < ITEM.PASSAGEM_H_FECHADA) ||
    (item >= ITEM.PASSAGEM_V_ABERTA && item < ITEM.PASSAGEM_V_FECHADA)
  )
}

/** A cor CSS de um besouro (de 1 a 5). */
export function corDoBesouro(numero: number): string {
  return `var(--besouro-${numero})`
}

/** O nome de cada besouro, para quem lê com leitor de tela. */
export const NOMES_DOS_BESOUROS = ['vermelho', 'verde', 'azul', 'bege', 'violeta'] as const
