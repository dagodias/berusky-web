/**
 * Os itens do Berusky, com os números do original (src/defines.h), para a fase convertida e o código portado falarem
 * a mesma língua. O nome do original vem no comentário de cada um.
 *
 * Portado do Berusky 1.7.2, (C) 1997-2020 AnakreoN, sob a GPL versão 2 ou mais nova.
 */
export const ITEM = {
  /** P_GROUND: na camada dos itens, a casa vazia. */
  NENHUM: 0,
  /** P_BOX */
  CAIXA: 6,
  /** P_TNT */
  EXPLOSIVO: 7,
  /** P_WALL */
  PAREDE: 8,
  /** P_EXIT */
  SAIDA: 9,
  /** P_STONE */
  PEDRA: 10,
  /** P_KEY: a chave da saída (são cinco, de todos os besouros). */
  CHAVE: 11,
  /** P_MATTOCK */
  PICARETA: 12,
  /** P_KEY1 a P_KEY5: a chave colorida do besouro 1 a 5. */
  CHAVE_COLORIDA: 13,
  /** P_DOOR1_H_O a P_DOOR5_H_O: a porta colorida aberta, de passar na horizontal. */
  PORTA_H_ABERTA: 18,
  /** P_DOOR1_H_Z a P_DOOR5_H_Z: a porta colorida fechada, de passar na horizontal. */
  PORTA_H_FECHADA: 23,
  /** P_DOOR1_V_O a P_DOOR5_V_O */
  PORTA_V_ABERTA: 28,
  /** P_DOOR1_V_Z a P_DOOR5_V_Z */
  PORTA_V_FECHADA: 33,
  /** P_ID_DOOR1_H_O a P_ID_DOOR5_H_O: a passagem colorida (só o besouro da cor passa), aberta. */
  PASSAGEM_H_ABERTA: 38,
  /** P_ID_DOOR1_H_Z a P_ID_DOOR5_H_Z */
  PASSAGEM_H_FECHADA: 43,
  /** P_ID_DOOR1_V_O a P_ID_DOOR5_V_O */
  PASSAGEM_V_ABERTA: 48,
  /** P_ID_DOOR1_V_Z a P_ID_DOOR5_V_Z */
  PASSAGEM_V_FECHADA: 53,
  /** P_DV_H_O: a porta de uma passagem só, aberta. */
  UMA_VEZ_H_ABERTA: 58,
  /** P_DV_H_Z: fechada para sempre. */
  UMA_VEZ_H_FECHADA: 59,
  /** P_DV_V_O */
  UMA_VEZ_V_ABERTA: 60,
  /** P_DV_V_Z */
  UMA_VEZ_V_FECHADA: 61,
  /** P_DV_H: a porta colorida "cyber" depois de aberta. */
  PORTA_CYBER_H: 62,
  /** P_DV_V */
  PORTA_CYBER_V: 63,
  /** P_BOX_LIGHT: a caixa leve (dá para empurrar duas). */
  CAIXA_LEVE: 72,
} as const

/** As variações da porta colorida (DOOR_VARIATION_*): elas mudam o que a porta vira ao abrir. */
export const ESTILO = { CLASSICO: 0, CYBER: 1 } as const

/** Quantos itens o original tem (GAME_ITEMS): de 0 a 72. */
export const ITENS_DO_JOGO = 73

/** As chaves da saída que abrem a saída (MAX_GAME_KEYS). */
export const CHAVES_PARA_SAIR = 5
/** As picaretas que um besouro carrega (PLAYER_MAX_MATTLOCKS). */
export const MAXIMO_DE_PICARETAS = 9
/** As chaves coloridas que um besouro carrega (PLAYER_MAX_KEYS). */
export const MAXIMO_DE_CHAVES_COLORIDAS = 1

/** A cor (de 1 a 5) de um item colorido que começa em `primeiro`, ou 0 se o item não é dessa faixa. */
export function corDaFaixa(item: number, primeiro: number): number {
  return item >= primeiro && item < primeiro + 5 ? item - primeiro + 1 : 0
}

/** O item colorido da faixa que começa em `primeiro`, na cor de 1 a 5. */
export function naCor(primeiro: number, cor: number): number {
  return primeiro + cor - 1
}

export function ehParede(item: number): boolean {
  // Os batentes das portas (64 a 71) também são parede; nas fases do original eles caem sempre em parede.
  return item === ITEM.PAREDE || (item >= 64 && item <= 71)
}

export type TipoDePeca =
  | 'caixa'
  | 'caixa-leve'
  | 'explosivo'
  | 'saida'
  | 'pedra'
  | 'chave'
  | 'picareta'
  | 'chave-colorida'
  | 'porta'
  | 'passagem'
  | 'uma-vez'
  | 'parede'
  | 'outro'

/** O tipo de um item, para o desenho e as mensagens. */
export function tipoDoItem(item: number): TipoDePeca {
  if (item === ITEM.CAIXA) return 'caixa'
  if (item === ITEM.CAIXA_LEVE) return 'caixa-leve'
  if (item === ITEM.EXPLOSIVO) return 'explosivo'
  if (item === ITEM.SAIDA) return 'saida'
  if (item === ITEM.PEDRA) return 'pedra'
  if (item === ITEM.CHAVE) return 'chave'
  if (item === ITEM.PICARETA) return 'picareta'
  if (corDaFaixa(item, ITEM.CHAVE_COLORIDA)) return 'chave-colorida'
  if (item >= ITEM.PORTA_H_ABERTA && item <= 37) return 'porta'
  if (item === ITEM.PORTA_CYBER_H || item === ITEM.PORTA_CYBER_V) return 'porta'
  if (item >= ITEM.PASSAGEM_H_ABERTA && item <= 57) return 'passagem'
  if (item >= ITEM.UMA_VEZ_H_ABERTA && item <= ITEM.UMA_VEZ_V_FECHADA) return 'uma-vez'
  if (ehParede(item)) return 'parede'
  return 'outro'
}

/** A cor (1 a 5) de uma chave colorida, porta colorida ou passagem colorida; 0 nos outros itens. */
export function corDoItem(item: number): number {
  for (const primeiro of [
    ITEM.CHAVE_COLORIDA,
    ITEM.PORTA_H_ABERTA,
    ITEM.PORTA_H_FECHADA,
    ITEM.PORTA_V_ABERTA,
    ITEM.PORTA_V_FECHADA,
    ITEM.PASSAGEM_H_ABERTA,
    ITEM.PASSAGEM_H_FECHADA,
    ITEM.PASSAGEM_V_ABERTA,
    ITEM.PASSAGEM_V_FECHADA,
  ]) {
    const cor = corDaFaixa(item, primeiro)
    if (cor) return cor
  }
  return 0
}

/** A porta (de qualquer tipo) é de passar na horizontal? As outras são de passar na vertical. */
export function portaHorizontal(item: number): boolean {
  return (
    corDaFaixa(item, ITEM.PORTA_H_ABERTA) > 0 ||
    corDaFaixa(item, ITEM.PORTA_H_FECHADA) > 0 ||
    corDaFaixa(item, ITEM.PASSAGEM_H_ABERTA) > 0 ||
    corDaFaixa(item, ITEM.PASSAGEM_H_FECHADA) > 0 ||
    item === ITEM.UMA_VEZ_H_ABERTA ||
    item === ITEM.UMA_VEZ_H_FECHADA ||
    item === ITEM.PORTA_CYBER_H
  )
}

/** A porta está aberta (dá para passar)? */
export function portaAberta(item: number): boolean {
  return (
    corDaFaixa(item, ITEM.PORTA_H_ABERTA) > 0 ||
    corDaFaixa(item, ITEM.PORTA_V_ABERTA) > 0 ||
    corDaFaixa(item, ITEM.PASSAGEM_H_ABERTA) > 0 ||
    corDaFaixa(item, ITEM.PASSAGEM_V_ABERTA) > 0 ||
    item === ITEM.UMA_VEZ_H_ABERTA ||
    item === ITEM.UMA_VEZ_V_ABERTA ||
    item === ITEM.PORTA_CYBER_H ||
    item === ITEM.PORTA_CYBER_V
  )
}
