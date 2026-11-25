<script setup lang="ts">
/**
 * A partida: uma fase do Berusky. A fase vem da API (montada no servidor); o motor e o tabuleiro rodam no navegador.
 * Ao vencer, a página manda as jogadas para a API conferir (com o mesmo motor) e recebe a senha da próxima fase.
 * O progresso fica no navegador (useProgresso).
 */
import { type Conclusao, GRUPOS, GrupoIdSchema } from '@projeto/shared'
import type { Acao } from '~/utils/teclas'

definePageMeta({ layout: 'jogo', key: (rota) => rota.fullPath })

const rota = useRoute()
const grupoLido = GrupoIdSchema.safeParse(rota.params.grupo)
const numero = Number(rota.params.numero)
if (!grupoLido.success || !Number.isInteger(numero) || numero < 1) {
  throw createError({ statusCode: 404, statusMessage: 'Esta fase não existe', fatal: true })
}
const grupo = grupoLido.data
const nomeDoGrupo = GRUPOS.find((g) => g.id === grupo)?.nome ?? grupo
const titulo = `${nomeDoGrupo} · fase ${numero}`

const { $api } = useNuxtApp()
const { data: fase, error } = await useAsyncData(`fase-${grupo}-${numero}`, async () => {
  const { data } = await $api.GET('/api/fases/{grupo}/{numero}', {
    params: { path: { grupo, numero } },
  })
  return data ?? null
})
if (error.value || !fase.value) {
  throw createError({ statusCode: 404, statusMessage: 'Esta fase não existe', fatal: true })
}

useSeoMeta({
  title: titulo,
  ogTitle: titulo,
  description: `A fase ${numero} do grupo ${nomeDoGrupo} do Berusky, o jogo de lógica das cinco joaninhas.`,
  ogDescription: `A fase ${numero} do grupo ${nomeDoGrupo} do Berusky, o jogo de lógica das cinco joaninhas.`,
})

const { foto, duracao, eventos, partida, venceu, menosMovimento, pedir, segurar, soltar, rapido } =
  useJogo(fase)
const { progresso, carregado, salvar } = useProgresso()
const melhor = computed(() => melhorDaFase(progresso.value, grupo, numero))
const fechada = computed(() => carregado.value && !faseAberta(progresso.value, grupo, numero))
const totalDoGrupo = computed(() => fase.value?.totalDoGrupo ?? 1)
const temProxima = computed(() => numero < totalDoGrupo.value)

// O visor: no computador, a fase inteira; no celular, a câmera segue a joaninha.
const modo = ref<'tudo' | 'seguir'>('tudo')
onMounted(() => {
  modo.value = window.matchMedia('(min-width: 1024px)').matches ? 'tudo' : 'seguir'
})

// As janelas.
const recomecoAberto = ref(false)
const ajudaAberta = ref(false)
const dicaAberta = ref(false)
const menuAberto = ref(false)

// O aviso falado: limpa e escreve de novo, para o leitor de tela repetir a mesma frase.
const aviso = ref('')
function anunciar(texto: string) {
  aviso.value = ''
  if (texto) nextTick(() => (aviso.value = texto))
}
watch(eventos, (novos) => anunciar(mensagemDosEventos(novos, foto.value?.chaves ?? 0)))

function agir(acao: Acao) {
  if (fechada.value) return
  if (acao.tipo === 'recomecar') {
    if (foto.value?.passos) recomecoAberto.value = true
    else pedir(acao)
  } else if (acao.tipo === 'ajuda') ajudaAberta.value = true
  else if (acao.tipo === 'dica') dicaAberta.value = true
  else if (acao.tipo === 'menu') menuAberto.value = true
  else if (acao.tipo === 'arredores') anunciarArredores()
  else pedir(acao)
}

function anunciarArredores() {
  const atual = partida.value
  const besouro = atual?.besouro(atual.ativo)
  if (!atual || !besouro) return
  anunciar(
    descreverArredores(besouro.numero, besouro.x, besouro.y, (x, y) => ({
      item: atual.itemEm(x, y),
      besouro: atual.besouroEm(x, y),
    })),
  )
}

function recomecar() {
  recomecoAberto.value = false
  menuAberto.value = false
  pedir({ tipo: 'recomecar' })
}

// O teclado: na página toda, menos nos campos de texto e com uma janela aberta.
const tabuleiro = ref<HTMLElement>()
watch(tabuleiro, (elemento) => elemento?.focus({ preventScroll: true }))

function aoApertar(evento: KeyboardEvent) {
  if (document.querySelector('dialog[open]')) return
  const alvo = evento.target as HTMLElement | null
  if (alvo?.closest('input, textarea, select, [contenteditable="true"]')) return
  if (evento.key === 'Shift') rapido(true)
  const emFoco = !!tabuleiro.value?.contains(document.activeElement)
  const acao = acaoDaTecla(evento, emFoco)
  if (!acao) return
  evento.preventDefault()
  if (acao.tipo === 'mover') {
    // A tecla segurada repete no fim de cada passo (como no original), e não pela repetição do teclado.
    if (evento.repeat && !menosMovimento.value) return
    segurar(acao.direcao, acao.rapido)
  }
  agir(acao)
}

function aoSoltar(evento: KeyboardEvent) {
  if (evento.key === 'Shift') rapido(false)
  const direcao = direcaoDaTecla(evento)
  if (direcao) soltar(direcao)
}

onMounted(() => {
  window.addEventListener('keydown', aoApertar)
  window.addEventListener('keyup', aoSoltar)
  window.addEventListener('blur', () => soltar())
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', aoApertar)
  window.removeEventListener('keyup', aoSoltar)
})

// A vitória: a API confere as jogadas e manda a senha da próxima fase.
const fim = reactive({
  aberto: false,
  estado: 'conferindo' as 'conferindo' | 'pronto' | 'sem-api' | 'recusada',
  passos: 0,
  conclusao: null as Conclusao | null,
})

watch(venceu, async (agora) => {
  const atual = partida.value
  if (!agora || !atual) return
  Object.assign(fim, { aberto: true, estado: 'conferindo', passos: atual.passos, conclusao: null })
  try {
    const { data, response } = await $api.POST('/api/fases/{grupo}/{numero}/conclusao', {
      params: { path: { grupo, numero } },
      body: { jogadas: atual.jogadas },
    })
    if (data) {
      Object.assign(fim, { estado: 'pronto', conclusao: data })
      salvar(
        registrarVitoria(
          progresso.value,
          grupo,
          numero,
          data.passos,
          totalDoGrupo.value,
          data.proxima,
        ),
      )
      return
    }
    if (response.status === 422) {
      fim.estado = 'recusada'
      return
    }
    throw new Error(`A API respondeu ${response.status}`)
  } catch {
    // Sem a API, a vitória vale neste aparelho: a próxima fase abre, só sem a senha.
    fim.estado = 'sem-api'
    salvar(registrarVitoria(progresso.value, grupo, numero, fim.passos, totalDoGrupo.value, null))
  }
})

function jogarDeNovo() {
  fim.aberto = false
  pedir({ tipo: 'recomecar' })
}

const proximaFase = computed(() => `/fases/${grupo}/${numero + 1}`)
const rotuloDoTabuleiro = `O tabuleiro da fase ${numero} do grupo ${nomeDoGrupo}`
</script>

<template>
  <div class="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col gap-3 p-3 sm:px-4">
    <JogoSprites />
    <JogoHud
      v-if="foto"
      :foto="foto"
      :titulo="titulo"
      :melhor="melhor"
      @trocar="(n) => agir({ tipo: 'trocar', alvo: n })"
    />

    <div v-if="fechada" class="grid flex-1 place-items-center">
      <BaseAviso tipo="atencao" titulo="Esta fase ainda está fechada">
        Vença a fase anterior do grupo {{ nomeDoGrupo }}, ou abra esta com a senha dela no mapa de
        fases.
        <div class="mt-4 flex flex-wrap gap-3">
          <BaseBotao para="/fases" tamanho="pequeno">Ir para o mapa de fases</BaseBotao>
        </div>
      </BaseAviso>
    </div>

    <ClientOnly v-else>
      <div
        ref="tabuleiro"
        class="relative min-h-0 flex-1 overflow-hidden rounded-cartao bg-stone-200 ring-1 ring-black/5 focus-visible:outline-2 focus-visible:outline-offset-2 dark:bg-stone-800 dark:ring-white/10"
        tabindex="0"
        role="application"
        :aria-label="`${titulo}. Use as setas para mover a joaninha.`"
        aria-describedby="instrucoes"
        data-pronto
      >
        <JogoVisor
          v-if="fase && foto"
          :fase="fase"
          :foto="foto"
          :duracao="duracao"
          :modo="modo"
          :rotulo="rotuloDoTabuleiro"
          @deslizar="(direcao) => agir({ tipo: 'mover', direcao, rapido: false })"
        />
      </div>
      <template #fallback>
        <div class="min-h-0 flex-1 animate-pulse rounded-cartao bg-stone-200 dark:bg-stone-800" />
      </template>
    </ClientOnly>

    <JogoControles
      v-if="!fechada"
      :modo="modo"
      :tem-posicao-guardada="foto?.temPosicaoGuardada ?? false"
      @acao="agir"
      @alternar-modo="modo = modo === 'tudo' ? 'seguir' : 'tudo'"
    />

    <p id="instrucoes" class="sr-only">
      As setas (ou W, A, S e D) movem a joaninha; com Shift, mais rápido. Tab ou de 1 a 5 trocam de
      joaninha. R recomeça, G guarda a posição e V volta a ela. P mostra a dica, H a ajuda e L
      descreve os arredores. Esc pausa e tira o foco do tabuleiro.
    </p>
    <p class="sr-only" role="status" aria-live="polite">{{ aviso }}</p>

    <JogoDialogo v-model:aberto="fim.aberto" titulo="Fase vencida!">
      <p>
        As joaninhas saíram em <strong data-passos-do-fim>{{ fim.passos }}</strong> passos.
        <template v-if="melhor !== null && fim.estado !== 'conferindo'">
          O seu melhor nesta fase: {{ melhor }}.
        </template>
      </p>
      <p v-if="fim.estado === 'conferindo'" class="mt-3 text-sm">Conferindo a vitória…</p>
      <template v-else-if="fim.estado === 'pronto' && fim.conclusao">
        <p v-if="fim.conclusao.proxima" class="mt-3">
          A senha da fase {{ fim.conclusao.proxima.numero }} é
          <strong class="font-mono text-lg tracking-widest" data-senha>{{
            fim.conclusao.proxima.senha
          }}</strong>. Anote: ela abre a fase em outro aparelho.
        </p>
        <div v-else class="mt-3 space-y-3 whitespace-pre-line">
          <p class="font-semibold">Você terminou o grupo {{ nomeDoGrupo }}!</p>
          <p v-if="fim.conclusao.textoDoFim">{{ fim.conclusao.textoDoFim }}</p>
        </div>
      </template>
      <p v-else-if="fim.estado === 'sem-api'" class="mt-3 text-sm">
        Não deu para falar com o servidor: a próxima fase abriu neste aparelho, mas a senha dela
        fica para depois.
      </p>
      <p v-else class="mt-3 text-sm">O servidor não confirmou a vitória. Tente jogar de novo.</p>
      <template #acoes>
        <BaseBotao para="/fases" variante="discreto">Mapa de fases</BaseBotao>
        <BaseBotao variante="secundario" @click="jogarDeNovo">Jogar de novo</BaseBotao>
        <BaseBotao v-if="temProxima && fim.estado !== 'conferindo'" :para="proximaFase">
          Próxima fase
        </BaseBotao>
      </template>
    </JogoDialogo>

    <JogoDialogo v-model:aberto="recomecoAberto" titulo="Recomeçar a fase?">
      <p>Os passos voltam a zero e a posição guardada se perde.</p>
      <template #acoes>
        <BaseBotao variante="secundario" @click="recomecoAberto = false"
          >Continuar jogando</BaseBotao
        >
        <BaseBotao @click="recomecar">Recomeçar</BaseBotao>
      </template>
    </JogoDialogo>

    <JogoDialogo v-model:aberto="dicaAberta" titulo="A dica da fase">
      <p class="whitespace-pre-line">
        {{ fase?.dica ?? 'A dica desta fase ainda não foi traduzida.' }}
      </p>
      <template #acoes>
        <BaseBotao @click="dicaAberta = false">Voltar ao jogo</BaseBotao>
      </template>
    </JogoDialogo>

    <JogoDialogo v-model:aberto="ajudaAberta" titulo="Como jogar">
      <JogoAjuda />
      <template #acoes>
        <BaseBotao para="/como-jogar" variante="discreto">Todas as regras</BaseBotao>
        <BaseBotao @click="ajudaAberta = false">Voltar ao jogo</BaseBotao>
      </template>
    </JogoDialogo>

    <JogoDialogo v-model:aberto="menuAberto" titulo="Pausa">
      <p>O jogo espera você.</p>
      <template #acoes>
        <BaseBotao para="/fases" variante="discreto">Mapa de fases</BaseBotao>
        <BaseBotao variante="secundario" @click="recomecar">Recomeçar</BaseBotao>
        <BaseBotao @click="menuAberto = false">Continuar</BaseBotao>
      </template>
    </JogoDialogo>
  </div>
</template>
