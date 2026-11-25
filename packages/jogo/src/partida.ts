/**
 * A partida: o estado de uma fase sendo jogada e as regras de cada passo.
 *
 * As regras são o player_move_check do original (src/game_logic.cpp), portado ramo a ramo, na mesma ordem. O original
 * enfileira os efeitos de um passo e os aplica de trás para a frente (a fila em DIRECTION_STACK); aqui eles são
 * aplicados direto, no estado final que essa ordem produz. Onde a ordem muda o resultado (a porta colorida clássica,
 * que vira chão ao abrir), o comentário explica. As armadilhas estão no docs/jogo.md.
 *
 * Portado do Berusky 1.7.2, (C) 1997-2020 AnakreoN, sob a GPL versão 2 ou mais nova.
 */
import { ALTURA, LARGURA } from '@projeto/shared'
import {
  CHAVES_PARA_SAIR,
  corDaFaixa,
  ehParede,
  ESTILO,
  ITEM,
  ITENS_DO_JOGO,
  MAXIMO_DE_CHAVES_COLORIDAS,
  MAXIMO_DE_PICARETAS,
  naCor,
} from './itens.js'

/** O que o motor precisa de uma fase: os itens e os besouros, como no contrato (FaseSchema). */
export type FaseDoMotor = {
  /** [x, y, item, variação] */
  itens: number[][]
  /** [número de 1 a 5, x, y, rotação de 0 a 3] */
  besouros: number[][]
}

export type Direcao = 'cima' | 'baixo' | 'esquerda' | 'direita'
export type Posicao = { x: number; y: number }

/** As letras do registro de jogadas: uma por ação, para a API reproduzir a partida. */
export const LETRAS = {
  cima: 'U',
  baixo: 'D',
  esquerda: 'L',
  direita: 'R',
  guardar: 'G',
  voltar: 'V',
} as const

const DELTA: Record<Direcao, [number, number]> = {
  cima: [0, -1],
  baixo: [0, 1],
  esquerda: [-1, 0],
  direita: [1, 0],
}

/** A rotação do besouro olhando para cada lado (a mesma do original: 0 é para cima, e gira no sentido do relógio). */
const ROTACAO: Record<Direcao, number> = { cima: 0, direita: 1, baixo: 2, esquerda: 3 }

/** Por que o passo não aconteceu: para o aviso falado e a ajuda. */
export type Motivo =
  | 'parede'
  | 'borda'
  | 'besouro'
  | 'empurrar'
  | 'saida-fechada'
  | 'sem-picareta'
  | 'chaves-completas'
  | 'picaretas-completas'
  | 'chave-de-outra-cor'
  | 'ja-tem-chave-colorida'
  | 'porta-de-outra-cor'
  | 'sem-chave-colorida'
  | 'porta-de-lado'
  | 'porta-fechada'
  | 'venceu'

export type Evento =
  | { tipo: 'andou'; besouro: number; de: Posicao; para: Posicao }
  | { tipo: 'empurrou'; peca: number; item: number; de: Posicao; para: Posicao }
  | { tipo: 'explodiu'; peca: number; item: number; em: Posicao }
  | { tipo: 'detonou'; peca: number; em: Posicao }
  | { tipo: 'pegou'; peca: number; item: number; em: Posicao }
  | { tipo: 'quebrou'; peca: number; em: Posicao }
  | { tipo: 'abriu'; peca: number; item: number; em: Posicao }
  | { tipo: 'fechou'; peca: number; item: number; em: Posicao }
  | { tipo: 'saida-liberada' }
  | { tipo: 'venceu'; besouro: number }
  | { tipo: 'bloqueado'; motivo: Motivo }

export type Besouro = {
  numero: number
  x: number
  y: number
  rotacao: number
  picaretas: number
  chavesColoridas: number
}

/** Uma peça que se desenha (tudo menos a parede): o id não muda enquanto ela existir, para a animação. */
export type Peca = { id: number; item: number; variacao: number; x: number; y: number }

/** O retrato da partida, para desenhar: nada nele muda depois de pronto. */
export type Foto = {
  pecas: Peca[]
  besouros: Besouro[]
  /** O número (1 a 5) do besouro que você comanda. */
  ativo: number
  chaves: number
  passos: number
  venceu: boolean
  temPosicaoGuardada: boolean
}

type Estado = {
  itens: Uint8Array
  variacoes: Uint8Array
  pecas: Int32Array
  /** O número do besouro (1 a 5) em cada casa, ou 0 (a camada dos besouros do original). */
  ocupantes: Uint8Array
  /** Os besouros pelo número (índice 0 é o besouro 1); null se ele não está na fase. */
  besouros: Array<Besouro | null>
  ativo: number
  chaves: number
}

const FORA = -1
const CASAS = LARGURA * ALTURA

function indice(x: number, y: number): number {
  return y * LARGURA + x
}

function dentro(x: number, y: number): boolean {
  return x >= 0 && x < LARGURA && y >= 0 && y < ALTURA
}

function copiar(estado: Estado): Estado {
  return {
    itens: estado.itens.slice(),
    variacoes: estado.variacoes.slice(),
    pecas: estado.pecas.slice(),
    ocupantes: estado.ocupantes.slice(),
    besouros: estado.besouros.map((b) => (b ? { ...b } : null)),
    ativo: estado.ativo,
    chaves: estado.chaves,
  }
}

/** O primeiro besouro da fase (o SELECT_PLAYER_FIRST do original): é quem você comanda no começo e ao voltar. */
function primeiroBesouro(besouros: Array<Besouro | null>): number {
  return besouros.find((b) => b)?.numero ?? 1
}

export class Partida {
  private estado: Estado
  private guardado: Estado | null = null
  private registro: string[] = []
  private _passos = 0
  private _venceu = false

  constructor(private readonly fase: FaseDoMotor) {
    this.estado = Partida.montar(fase)
  }

  /** Monta a fase do jeito do level_import do original. */
  private static montar(fase: FaseDoMotor): Estado {
    const estado: Estado = {
      itens: new Uint8Array(CASAS),
      variacoes: new Uint8Array(CASAS),
      pecas: new Int32Array(CASAS),
      ocupantes: new Uint8Array(CASAS),
      besouros: [null, null, null, null, null],
      ativo: 1,
      chaves: 0,
    }
    let proximaPeca = 1
    for (const [x = 0, y = 0, item = 0, variacao = 0] of fase.itens) {
      if (!dentro(x, y)) throw new Error(`O item em ${x},${y} está fora da grade.`)
      if (item <= 5 || item >= ITENS_DO_JOGO) throw new Error(`O item ${item} não existe no jogo.`)
      const i = indice(x, y)
      estado.itens[i] = item
      estado.variacoes[i] = variacao
      estado.pecas[i] = ehParede(item) ? 0 : proximaPeca++
    }
    for (const [numero = 0, x = 0, y = 0, rotacao = 0] of fase.besouros) {
      if (numero < 1 || numero > 5) throw new Error(`O besouro ${numero} não existe.`)
      if (!dentro(x, y)) throw new Error(`O besouro ${numero} está fora da grade.`)
      estado.besouros[numero - 1] = { numero, x, y, rotacao, picaretas: 0, chavesColoridas: 0 }
      estado.ocupantes[indice(x, y)] = numero
    }
    estado.ativo = primeiroBesouro(estado.besouros)
    return estado
  }

  get passos(): number {
    return this._passos
  }

  get venceu(): boolean {
    return this._venceu
  }

  get ativo(): number {
    return this.estado.ativo
  }

  get chaves(): number {
    return this.estado.chaves
  }

  /** O registro de jogadas desde o começo (ou desde o recomeço): uma letra por ação. */
  get jogadas(): string {
    return this.registro.join('')
  }

  get temPosicaoGuardada(): boolean {
    return this.guardado !== null
  }

  /** O item numa casa (0 é vazia). */
  itemEm(x: number, y: number): number {
    return dentro(x, y) ? (this.estado.itens[indice(x, y)] ?? 0) : FORA
  }

  /** O número do besouro numa casa (0 é nenhum). */
  besouroEm(x: number, y: number): number {
    return dentro(x, y) ? (this.estado.ocupantes[indice(x, y)] ?? 0) : FORA
  }

  besouro(numero: number): Besouro | null {
    const b = this.estado.besouros[numero - 1]
    return b ? { ...b } : null
  }

  /** O retrato do momento, para desenhar. */
  foto(): Foto {
    const { itens, variacoes, pecas } = this.estado
    const lista: Peca[] = []
    for (let i = 0; i < CASAS; i++) {
      const id = pecas[i] ?? 0
      if (id) {
        lista.push({
          id,
          item: itens[i] ?? 0,
          variacao: variacoes[i] ?? 0,
          x: i % LARGURA,
          y: Math.floor(i / LARGURA),
        })
      }
    }
    return {
      pecas: lista,
      besouros: this.estado.besouros.filter((b): b is Besouro => b !== null).map((b) => ({ ...b })),
      ativo: this.estado.ativo,
      chaves: this.estado.chaves,
      passos: this._passos,
      venceu: this._venceu,
      temPosicaoGuardada: this.guardado !== null,
    }
  }

  /**
   * Uma chave que identifica o estado do jogo (para o resolvedor): os itens, os besouros, o que eles carregam, quem
   * você comanda e as chaves. Os passos e a posição guardada ficam de fora.
   */
  chaveDoEstado(): string {
    const { itens, besouros, ativo, chaves } = this.estado
    const pessoas = besouros.map((b) =>
      b ? `${b.x},${b.y},${b.picaretas},${b.chavesColoridas}` : '-',
    )
    let grade = ''
    for (const item of itens) grade += String.fromCharCode(item)
    return `${ativo}|${chaves}|${pessoas.join(';')}|${grade}`
  }

  /** Uma cópia independente da partida, com o registro e a posição guardada. */
  clonar(): Partida {
    const copia = new Partida(this.fase)
    copia.estado = copiar(this.estado)
    copia.guardado = this.guardado ? copiar(this.guardado) : null
    copia.registro = [...this.registro]
    copia._passos = this._passos
    copia._venceu = this._venceu
    return copia
  }

  /** Troca o besouro que você comanda: um número de 1 a 5, ou o próximo da fase (o Tab). */
  trocar(alvo: number | 'proximo'): boolean {
    if (this._venceu) return false
    const { besouros } = this.estado
    let escolhido = 0
    if (alvo === 'proximo') {
      // O SELECT_PLAYER_NEXT do original: o próximo besouro da fase, dando a volta.
      for (let passo = 1; passo <= 5; passo++) {
        const numero = ((this.estado.ativo - 1 + passo) % 5) + 1
        if (besouros[numero - 1]) {
          escolhido = numero
          break
        }
      }
    } else if (besouros[alvo - 1]) {
      escolhido = alvo
    }
    if (!escolhido || escolhido === this.estado.ativo) return false
    this.estado.ativo = escolhido
    this.registro.push(String(escolhido))
    return true
  }

  /** Guarda a posição (o F2 do original): uma vaga só, que a próxima vez substitui. */
  guardar(): void {
    if (this._venceu) return
    this.guardado = copiar(this.estado)
    this.registro.push(LETRAS.guardar)
  }

  /**
   * Volta à posição guardada (o F3 do original). Os passos não voltam: no original eles moram fora do que é
   * guardado. E o besouro comandado passa a ser o primeiro da fase, como no level_populate do original.
   */
  voltar(): boolean {
    if (this._venceu || !this.guardado) return false
    this.estado = copiar(this.guardado)
    this.estado.ativo = primeiroBesouro(this.estado.besouros)
    this.registro.push(LETRAS.voltar)
    return true
  }

  /** Recomeça a fase: tudo como no começo, os passos em zero e sem posição guardada (o original cria a fase de novo). */
  recomecar(): void {
    this.estado = Partida.montar(this.fase)
    this.guardado = null
    this.registro = []
    this._passos = 0
    this._venceu = false
  }

  /** Um passo do besouro que você comanda. Devolve o que aconteceu, na ordem, para a animação. */
  mover(direcao: Direcao): Evento[] {
    if (this._venceu) return [{ tipo: 'bloqueado', motivo: 'venceu' }]
    this.registro.push(LETRAS[direcao])

    const estado = this.estado
    const numero = estado.ativo
    const besouro = estado.besouros[numero - 1]
    if (!besouro) return [{ tipo: 'bloqueado', motivo: 'besouro' }]

    const [dx, dy] = DELTA[direcao]
    const px = besouro.x
    const py = besouro.y
    const nx = px + dx
    const ny = py + dy
    const nnx = nx + dx
    const nny = ny + dy
    const nnnx = nnx + dx
    const nnny = nny + dy

    // Tudo é lido antes de qualquer mudança, como no original.
    const itmStart = this.itemEm(px, py)
    const itm = this.itemEm(nx, ny)
    const itmPlayer = this.besouroEm(nx, ny)
    const itmNext = this.itemEm(nnx, nny)
    const itmNextPlayer = this.besouroEm(nnx, nny)
    const itmNextNext = this.itemEm(nnnx, nnny)
    const itmNextNextPlayer = this.besouroEm(nnnx, nnny)

    const eventos: Evento[] = []
    const depois: Evento[] = []

    // A casa de onde o besouro sai: a passagem colorida e a porta de uma vez abertas se fecham quando ele aperta a
    // seta do eixo delas, ande ou não (o original enfileira o fechamento antes de olhar o destino).
    const corDaPassagemH = corDaFaixa(itmStart, ITEM.PASSAGEM_H_ABERTA)
    const corDaPassagemV = corDaFaixa(itmStart, ITEM.PASSAGEM_V_ABERTA)
    if (corDaPassagemH && dx) {
      depois.push(this.trocarItem(px, py, naCor(ITEM.PASSAGEM_H_FECHADA, corDaPassagemH), 'fechou'))
    } else if (corDaPassagemV && dy) {
      depois.push(this.trocarItem(px, py, naCor(ITEM.PASSAGEM_V_FECHADA, corDaPassagemV), 'fechou'))
    } else if (itmStart === ITEM.UMA_VEZ_H_ABERTA && dx) {
      depois.push(this.trocarItem(px, py, ITEM.UMA_VEZ_H_FECHADA, 'fechou'))
    } else if (itmStart === ITEM.UMA_VEZ_V_ABERTA && dy) {
      depois.push(this.trocarItem(px, py, ITEM.UMA_VEZ_V_FECHADA, 'fechou'))
    }

    const andar = () => {
      eventos.unshift(this.andar(numero, px, py, nx, ny, direcao))
    }
    const bloquear = (motivo: Motivo) => eventos.push({ tipo: 'bloqueado', motivo })

    const corChave = corDaFaixa(itm, ITEM.CHAVE_COLORIDA)
    const corPortaHAberta = corDaFaixa(itm, ITEM.PORTA_H_ABERTA)
    const corPortaVAberta = corDaFaixa(itm, ITEM.PORTA_V_ABERTA)
    const corPortaHFechada = corDaFaixa(itm, ITEM.PORTA_H_FECHADA)
    const corPortaVFechada = corDaFaixa(itm, ITEM.PORTA_V_FECHADA)
    const corPassagemHFechada = corDaFaixa(itm, ITEM.PASSAGEM_H_FECHADA)
    const corPassagemHAberta = corDaFaixa(itm, ITEM.PASSAGEM_H_ABERTA)
    const corPassagemVFechada = corDaFaixa(itm, ITEM.PASSAGEM_V_FECHADA)
    const corPassagemVAberta = corDaFaixa(itm, ITEM.PASSAGEM_V_ABERTA)

    if (itm === ITEM.NENHUM) {
      // Só andar.
      if (itmPlayer === 0) andar()
      else bloquear('besouro')
    } else if (itm === ITEM.CAIXA) {
      // Andar e empurrar a caixa: uma só, para a casa vazia.
      if (!dentro(nnx, nny)) bloquear('borda')
      else if (itmNext === ITEM.NENHUM && itmNextPlayer === 0) {
        andar()
        eventos.push(this.empurrar(nx, ny, nnx, nny))
      } else bloquear('empurrar')
    } else if (itm === ITEM.CAIXA_LEVE) {
      // A caixa leve: uma, ou duas em fila. O original confere a terceira casa dentro da grade até para empurrar uma.
      if (!dentro(nnnx, nnny)) bloquear('borda')
      else if (itmNext === ITEM.NENHUM && itmNextPlayer === 0) {
        andar()
        eventos.push(this.empurrar(nx, ny, nnx, nny))
      } else if (
        itmNext === ITEM.CAIXA_LEVE &&
        itmNextNext === ITEM.NENHUM &&
        itmNextNextPlayer === 0
      ) {
        andar()
        // A da frente sai primeiro, para a de trás ocupar o lugar dela.
        const frente = this.empurrar(nnx, nny, nnnx, nnny)
        const tras = this.empurrar(nx, ny, nnx, nny)
        eventos.push(tras, frente)
      } else bloquear('empurrar')
    } else if (itm === ITEM.EXPLOSIVO) {
      // O explosivo: anda como a caixa, ou explode a caixa (comum ou leve) que está atrás dele.
      if (!dentro(nnx, nny)) bloquear('borda')
      else if (itmNext === ITEM.NENHUM && itmNextPlayer === 0) {
        andar()
        eventos.push(this.empurrar(nx, ny, nnx, nny))
      } else if (itmNext === ITEM.CAIXA || itmNext === ITEM.CAIXA_LEVE) {
        // O besouro entra na casa do explosivo; o explosivo e a caixa somem. A explosão nunca fere besouro.
        eventos.push({ tipo: 'explodiu', ...this.apagar(nnx, nny) })
        const explosivo = this.apagar(nx, ny)
        eventos.push({ tipo: 'detonou', peca: explosivo.peca, em: explosivo.em })
        andar()
      } else bloquear('empurrar')
    } else if (itm === ITEM.SAIDA) {
      // A saída: com as cinco chaves, a fase acaba. O besouro não entra nela, e esse passo não conta.
      if (estado.chaves === CHAVES_PARA_SAIR) {
        this._venceu = true
        eventos.push({ tipo: 'venceu', besouro: numero })
      } else bloquear('saida-fechada')
    } else if (itm === ITEM.PEDRA) {
      // A pedra: quebra com uma picareta do besouro que anda (uma picareta, uma pedra).
      if (besouro.picaretas > 0) {
        besouro.picaretas--
        andar()
        eventos.push({ tipo: 'quebrou', ...this.apagarPeca(nx, ny) })
      } else bloquear('sem-picareta')
    } else if (itm === ITEM.CHAVE) {
      // A chave da saída: de todos os besouros, até cinco. Com cinco, a próxima vira obstáculo.
      if (estado.chaves < CHAVES_PARA_SAIR) {
        estado.chaves++
        eventos.push({ tipo: 'pegou', ...this.apagar(nx, ny) })
        andar()
        if (estado.chaves === CHAVES_PARA_SAIR) eventos.push({ tipo: 'saida-liberada' })
      } else bloquear('chaves-completas')
    } else if (itm === ITEM.PICARETA) {
      // A picareta: até nove por besouro.
      if (besouro.picaretas < MAXIMO_DE_PICARETAS) {
        besouro.picaretas++
        eventos.push({ tipo: 'pegou', ...this.apagar(nx, ny) })
        andar()
      } else bloquear('picaretas-completas')
    } else if (corChave) {
      // A chave colorida: só o besouro da cor pega, e ele carrega uma por vez.
      if (numero !== corChave) bloquear('chave-de-outra-cor')
      else if (besouro.chavesColoridas < MAXIMO_DE_CHAVES_COLORIDAS) {
        besouro.chavesColoridas++
        eventos.push({ tipo: 'pegou', ...this.apagar(nx, ny) })
        andar()
      } else bloquear('ja-tem-chave-colorida')
    } else if (corPortaHAberta || corPortaVAberta) {
      // A porta colorida aberta: qualquer besouro passa, no eixo dela.
      const noEixo = corPortaHAberta ? dx : dy
      if (!noEixo) bloquear('porta-de-lado')
      else if (itmPlayer === 0) andar()
      else bloquear('besouro')
    } else if (corPortaHFechada || corPortaVFechada) {
      // A porta colorida fechada: só o besouro da cor, no eixo, gastando a chave colorida.
      const cor = corPortaHFechada || corPortaVFechada
      const noEixo = corPortaHFechada ? dx : dy
      if (numero !== cor) bloquear('porta-de-outra-cor')
      else if (!noEixo) bloquear('porta-de-lado')
      else if (besouro.chavesColoridas === 0) bloquear('sem-chave-colorida')
      else {
        besouro.chavesColoridas--
        andar()
        const estilo = estado.variacoes[indice(nx, ny)]
        if (estilo === ESTILO.CLASSICO) {
          // O estilo clássico: os efeitos aplicados de trás para a frente deixam a casa sem item (só o piso), então
          // depois de aberta ela é chão: qualquer besouro passa por qualquer lado, e a caixa também.
          const { peca, em } = this.apagar(nx, ny)
          eventos.push({ tipo: 'abriu', peca, item: ITEM.NENHUM, em })
        } else if (estilo === ESTILO.CYBER) {
          // O estilo cyber: vira a porta aberta P_DV (só no eixo, e a caixa não passa).
          const item = corPortaHFechada ? ITEM.PORTA_CYBER_H : ITEM.PORTA_CYBER_V
          estado.variacoes[indice(nx, ny)] = 0
          eventos.push(this.trocarItem(nx, ny, item, 'abriu'))
        }
      }
    } else if (corPassagemHFechada) {
      // A passagem colorida fechada, de passar na horizontal: só o besouro da cor; ela abre com ele dentro.
      if (numero !== corPassagemHFechada) bloquear('porta-de-outra-cor')
      else if (!dx) bloquear('porta-de-lado')
      else {
        andar()
        eventos.push(
          this.trocarItem(nx, ny, naCor(ITEM.PASSAGEM_H_ABERTA, corPassagemHFechada), 'abriu'),
        )
      }
    } else if (corPassagemHAberta) {
      if (numero !== corPassagemHAberta) bloquear('porta-de-outra-cor')
      else if (!dx) bloquear('porta-de-lado')
      else if (itmPlayer === 0) andar()
      else bloquear('besouro')
    } else if (corPassagemVFechada) {
      // Na vertical, o original também confere que não há besouro na passagem (na horizontal, não confere).
      if (numero !== corPassagemVFechada) bloquear('porta-de-outra-cor')
      else if (!dy) bloquear('porta-de-lado')
      else if (itmPlayer !== 0) bloquear('besouro')
      else {
        andar()
        eventos.push(
          this.trocarItem(nx, ny, naCor(ITEM.PASSAGEM_V_ABERTA, corPassagemVFechada), 'abriu'),
        )
      }
    } else if (corPassagemVAberta) {
      if (numero !== corPassagemVAberta) bloquear('porta-de-outra-cor')
      else if (!dy) bloquear('porta-de-lado')
      else if (itmPlayer === 0) andar()
      else bloquear('besouro')
    } else if (
      itm === ITEM.UMA_VEZ_H_ABERTA ||
      itm === ITEM.UMA_VEZ_V_ABERTA ||
      itm === ITEM.PORTA_CYBER_H ||
      itm === ITEM.PORTA_CYBER_V
    ) {
      // A porta de uma vez aberta e a porta cyber aberta: qualquer besouro, no eixo.
      const noEixo = itm === ITEM.UMA_VEZ_H_ABERTA || itm === ITEM.PORTA_CYBER_H ? dx : dy
      if (!noEixo) bloquear('porta-de-lado')
      else if (itmPlayer === 0) andar()
      else bloquear('besouro')
    } else if (itm === ITEM.UMA_VEZ_H_FECHADA || itm === ITEM.UMA_VEZ_V_FECHADA) {
      bloquear('porta-fechada')
    } else {
      // A parede, o batente, a borda da grade.
      bloquear(itm === FORA ? 'borda' : 'parede')
    }

    return [...eventos, ...depois]
  }

  /** O besouro anda uma casa (o player_move do original): é o único jeito de contar um passo. */
  private andar(
    numero: number,
    px: number,
    py: number,
    nx: number,
    ny: number,
    direcao: Direcao,
  ): Evento {
    const besouro = this.estado.besouros[numero - 1]
    if (!besouro) throw new Error(`O besouro ${numero} não está na fase.`)
    this.estado.ocupantes[indice(px, py)] = 0
    this.estado.ocupantes[indice(nx, ny)] = numero
    besouro.x = nx
    besouro.y = ny
    besouro.rotacao = ROTACAO[direcao]
    this._passos++
    return { tipo: 'andou', besouro: numero, de: { x: px, y: py }, para: { x: nx, y: ny } }
  }

  /** Leva o item de uma casa para outra (o item_move do original). */
  private empurrar(x: number, y: number, nx: number, ny: number): Evento {
    const { itens, variacoes, pecas } = this.estado
    const de = indice(x, y)
    const para = indice(nx, ny)
    const item = itens[de] ?? 0
    itens[para] = item
    variacoes[para] = variacoes[de] ?? 0
    pecas[para] = pecas[de] ?? 0
    itens[de] = 0
    variacoes[de] = 0
    pecas[de] = 0
    return { tipo: 'empurrou', peca: pecas[para] ?? 0, item, de: { x, y }, para: { x: nx, y: ny } }
  }

  /** Tira o item da casa (o GL_CELL_CLEAR_ALL do original). */
  private apagar(x: number, y: number): { peca: number; item: number; em: Posicao } {
    const { itens, variacoes, pecas } = this.estado
    const i = indice(x, y)
    const resultado = { peca: pecas[i] ?? 0, item: itens[i] ?? 0, em: { x, y } }
    itens[i] = 0
    variacoes[i] = 0
    pecas[i] = 0
    return resultado
  }

  private apagarPeca(x: number, y: number): { peca: number; em: Posicao } {
    const { peca, em } = this.apagar(x, y)
    return { peca, em }
  }

  /** Troca o item de uma casa, mantendo a peça (a porta que abre ou fecha continua a mesma porta). */
  private trocarItem(x: number, y: number, item: number, tipo: 'abriu' | 'fechou'): Evento {
    const i = indice(x, y)
    this.estado.itens[i] = item
    return { tipo, peca: this.estado.pecas[i] ?? 0, item, em: { x, y } }
  }
}
