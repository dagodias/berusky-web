/**
 * A partida na tela: o motor (packages/jogo), a animação de cada passo e as ações pedidas pelo teclado, pelos
 * botões e pelo deslizar. O tempo do passo é o do original: 9 quadros a 30 por segundo (300 ms), e 4 com Shift
 * (133 ms). Durante o passo, a próxima ação espera (uma só); a seta segurada continua andando quando o passo acaba.
 * Com "menos movimento" ligado no aparelho, a peça pula direto e nada espera.
 */
import { type Evento, type Foto, Partida } from '@projeto/jogo'
import type { Fase } from '@projeto/shared'
import type { Direcao } from '@projeto/jogo'
import type { Acao } from '~/utils/teclas'

const PASSO_NORMAL = 300
const PASSO_RAPIDO = 133

/** As ações que mexem na partida (as outras, como a ajuda, a página trata). */
export type AcaoDaPartida = Extract<
  Acao,
  | { tipo: 'mover' }
  | { tipo: 'trocar' }
  | { tipo: 'guardar' }
  | { tipo: 'voltar' }
  | { tipo: 'recomecar' }
>

export function useJogo(fase: Ref<Fase | null | undefined>) {
  const partida = shallowRef<Partida | null>(null)
  const foto = shallowRef<Foto | null>(null)
  const eventos = shallowRef<Evento[]>([])
  /** Quanto dura o deslize do passo que está acontecendo (0 é sem animação). */
  const duracao = ref(0)
  const menosMovimento = ref(false)
  const turno = new Turno<AcaoDaPartida>()
  let segurada: { direcao: Direcao; rapido: boolean } | null = null
  let relogio: ReturnType<typeof setTimeout> | undefined

  function comecar() {
    clearTimeout(relogio)
    turno.limpar()
    segurada = null
    partida.value = fase.value ? new Partida(fase.value) : null
    foto.value = partida.value?.foto() ?? null
    eventos.value = []
    duracao.value = 0
  }
  watch(fase, comecar, { immediate: true })

  function fazer(acao: AcaoDaPartida) {
    const atual = partida.value
    if (!atual || atual.venceu) return
    let novos: Evento[] = []
    let anima = false
    if (acao.tipo === 'mover') {
      novos = atual.mover(acao.direcao)
      anima = novos.some((evento) => evento.tipo === 'andou')
      duracao.value = menosMovimento.value ? 0 : acao.rapido ? PASSO_RAPIDO : PASSO_NORMAL
    } else {
      // Trocar, guardar, voltar e recomeçar não deslizam: a peça pula para o lugar.
      duracao.value = 0
      if (acao.tipo === 'trocar') atual.trocar(acao.alvo)
      else if (acao.tipo === 'guardar') atual.guardar()
      else if (acao.tipo === 'voltar') atual.voltar()
      else atual.recomecar()
    }
    foto.value = atual.foto()
    eventos.value = novos
    if (anima && duracao.value > 0) {
      turno.comecar()
      relogio = setTimeout(fimDoPasso, duracao.value)
    }
  }

  function fimDoPasso() {
    const esperando = turno.terminar()
    if (esperando) fazer(esperando)
    else if (segurada && !partida.value?.venceu) fazer({ tipo: 'mover', ...segurada })
  }

  /** Pede uma ação: agora, ou quando o passo que está acontecendo terminar. */
  function pedir(acao: AcaoDaPartida) {
    const agora = turno.pedir(acao)
    if (agora) fazer(agora)
  }

  /** A seta apertada (e ainda não solta): o passo se repete a cada fim de passo, como no original. */
  function segurar(direcao: Direcao, rapido: boolean) {
    segurada = { direcao, rapido }
  }

  function soltar(direcao?: Direcao) {
    if (!direcao || segurada?.direcao === direcao) segurada = null
  }

  function rapido(ligado: boolean) {
    if (segurada) segurada = { ...segurada, rapido: ligado }
  }

  onMounted(() => {
    const preferencia = window.matchMedia('(prefers-reduced-motion: reduce)')
    menosMovimento.value = preferencia.matches
    preferencia.addEventListener('change', (e) => (menosMovimento.value = e.matches))
  })
  onBeforeUnmount(() => clearTimeout(relogio))

  return {
    partida,
    foto,
    eventos,
    duracao,
    menosMovimento,
    pedir,
    segurar,
    soltar,
    rapido,
    recomecarDoZero: comecar,
    venceu: computed(() => foto.value?.venceu ?? false),
  }
}
