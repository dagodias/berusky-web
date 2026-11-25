/**
 * O que o aviso falado (aria-live) diz depois de cada ação: só o que importa (a chave pega, a porta que abriu, por
 * que o passo não aconteceu). E a descrição dos arredores da joaninha comandada (a tecla L).
 */
import { CHAVES_PARA_SAIR, type Evento, ITEM, type Motivo, tipoDoItem } from '@projeto/jogo'

const MOTIVOS: Record<Motivo, string> = {
  parede: 'Parede.',
  borda: 'Fim do tabuleiro.',
  besouro: 'Outra joaninha está no caminho.',
  empurrar: 'Não dá para empurrar: o outro lado está ocupado.',
  'saida-fechada': `A saída só abre com as ${CHAVES_PARA_SAIR} chaves.`,
  'sem-picareta': 'Para quebrar a pedra, esta joaninha precisa de uma picareta.',
  'chaves-completas': 'Já são cinco chaves: esta fica onde está.',
  'picaretas-completas': 'Esta joaninha já carrega nove picaretas.',
  'chave-de-outra-cor': 'Esta chave é de outra joaninha.',
  'ja-tem-chave-colorida': 'Esta joaninha já carrega uma chave colorida.',
  'porta-de-outra-cor': 'Esta porta é de outra joaninha.',
  'sem-chave-colorida': 'Esta porta abre com a chave colorida da mesma cor.',
  'porta-de-lado': 'A porta só se atravessa de frente.',
  'porta-fechada': 'Esta porta fechou para sempre.',
  venceu: 'A fase já foi vencida.',
}

export function mensagemDoMotivo(motivo: Motivo): string {
  return MOTIVOS[motivo]
}

/** A frase do que aconteceu, ou vazio se não há nada para dizer (um passo comum). */
export function mensagemDosEventos(eventos: Evento[], chaves: number): string {
  const frases: string[] = []
  for (const evento of eventos) {
    if (evento.tipo === 'bloqueado') frases.push(MOTIVOS[evento.motivo])
    else if (evento.tipo === 'pegou') {
      if (evento.item === ITEM.CHAVE) frases.push(`Chave: ${chaves} de ${CHAVES_PARA_SAIR}.`)
      else if (evento.item === ITEM.PICARETA) frases.push('Picareta pega.')
      else frases.push('Chave colorida pega.')
    } else if (evento.tipo === 'saida-liberada') frases.push('A saída abriu!')
    else if (evento.tipo === 'explodiu') frases.push('Bum! A caixa explodiu.')
    else if (evento.tipo === 'quebrou') frases.push('A pedra quebrou.')
    else if (evento.tipo === 'abriu') frases.push('A porta abriu.')
    else if (evento.tipo === 'fechou') frases.push('A porta fechou.')
    else if (evento.tipo === 'venceu') frases.push('Fase vencida!')
  }
  return frases.join(' ')
}

const NOME_DO_TIPO: Record<string, string> = {
  caixa: 'caixa',
  'caixa-leve': 'caixa leve',
  explosivo: 'explosivo',
  saida: 'saída',
  pedra: 'pedra',
  chave: 'chave',
  picareta: 'picareta',
  'chave-colorida': 'chave colorida',
  porta: 'porta colorida',
  passagem: 'passagem colorida',
  'uma-vez': 'porta de uma passagem só',
  parede: 'parede',
}

/** O que tem numa casa, em palavras. */
export function descreverCasa(item: number, besouro: number): string {
  if (item < 0) return 'fim do tabuleiro'
  if (besouro > 0) return `joaninha ${besouro}`
  if (item === ITEM.NENHUM) return 'livre'
  return NOME_DO_TIPO[tipoDoItem(item)] ?? 'obstáculo'
}

/** Os arredores da joaninha comandada, para quem não vê o tabuleiro. */
export function descreverArredores(
  numero: number,
  x: number,
  y: number,
  casa: (x: number, y: number) => { item: number; besouro: number },
): string {
  const lado = (dx: number, dy: number) => {
    const { item, besouro } = casa(x + dx, y + dy)
    return descreverCasa(item, besouro)
  }
  return (
    `Joaninha ${numero}. Em cima: ${lado(0, -1)}. Embaixo: ${lado(0, 1)}. ` +
    `À esquerda: ${lado(-1, 0)}. À direita: ${lado(1, 0)}.`
  )
}
