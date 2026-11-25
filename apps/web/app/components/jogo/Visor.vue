<script setup lang="ts">
/**
 * O visor do tabuleiro: no computador, a fase inteira cabe na tela ("ver tudo"); no celular, a câmera chega perto e
 * segue a joaninha comandada ("seguir"), com casas de pelo menos 44 pontos. A câmera desliza com transform (rápido
 * no celular) e para nas bordas da fase. Deslizar o dedo sobre o tabuleiro move a joaninha.
 */
import type { Direcao, Foto } from '@projeto/jogo'
import type { Fase } from '@projeto/shared'

const props = defineProps<{
  fase: Fase
  foto: Foto
  duracao: number
  modo: 'tudo' | 'seguir'
  rotulo: string
}>()
const emit = defineEmits<{ deslizar: [direcao: Direcao] }>()

const visor = ref<HTMLElement>()
const tamanho = reactive({ largura: 0, altura: 0 })
let observador: ResizeObserver | undefined

onMounted(() => {
  observador = new ResizeObserver(([entrada]) => {
    if (!entrada) return
    tamanho.largura = entrada.contentRect.width
    tamanho.altura = entrada.contentRect.height
  })
  if (visor.value) observador.observe(visor.value)
})
onBeforeUnmount(() => observador?.disconnect())

/** A escala que faz a fase inteira caber. */
const escalaQueCabe = computed(() =>
  Math.min(tamanho.largura / LARGURA_DO_TABULEIRO, tamanho.altura / ALTURA_DO_TABULEIRO),
)
const escala = computed(() =>
  props.modo === 'tudo' ? escalaQueCabe.value : Math.max(escalaQueCabe.value, 44 / CASA),
)
const largura = computed(() => LARGURA_DO_TABULEIRO * escala.value)
const altura = computed(() => ALTURA_DO_TABULEIRO * escala.value)

/** Onde fica o tabuleiro dentro do visor: no meio, se cabe; senão, com a joaninha comandada no meio. */
function eixo(tamanhoDoVisor: number, tamanhoDoTabuleiro: number, centro: number): number {
  if (tamanhoDoTabuleiro <= tamanhoDoVisor) return (tamanhoDoVisor - tamanhoDoTabuleiro) / 2
  return Math.min(0, Math.max(tamanhoDoVisor - tamanhoDoTabuleiro, tamanhoDoVisor / 2 - centro))
}

const deslocamento = computed(() => {
  const ativo = props.foto.besouros.find((b) => b.numero === props.foto.ativo)
  const x = ((ativo?.x ?? 16) + 0.5) * CASA * escala.value
  const y = ((ativo?.y ?? 10) + 0.5) * CASA * escala.value
  return {
    x: Math.round(eixo(tamanho.largura, largura.value, x)),
    y: Math.round(eixo(tamanho.altura, altura.value, y)),
  }
})

const estilo = computed(() => ({
  width: `${largura.value}px`,
  height: `${altura.value}px`,
  transform: `translate3d(${deslocamento.value.x}px, ${deslocamento.value.y}px, 0)`,
  transition: props.duracao ? `transform ${props.duracao}ms linear` : 'none',
}))

// O deslizar: o dedo que anda mais de 24 pontos move a joaninha para o lado que andou mais.
let inicio: { x: number; y: number } | null = null
function apertou(evento: PointerEvent) {
  inicio = { x: evento.clientX, y: evento.clientY }
}
function soltou(evento: PointerEvent) {
  if (!inicio) return
  const dx = evento.clientX - inicio.x
  const dy = evento.clientY - inicio.y
  inicio = null
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return
  if (Math.abs(dx) > Math.abs(dy)) emit('deslizar', dx > 0 ? 'direita' : 'esquerda')
  else emit('deslizar', dy > 0 ? 'baixo' : 'cima')
}
</script>

<template>
  <div
    ref="visor"
    class="relative h-full w-full touch-none overflow-hidden"
    @pointerdown="apertou"
    @pointerup="soltou"
    @pointercancel="inicio = null"
  >
    <div v-if="tamanho.largura" class="absolute top-0 left-0" :style="estilo">
      <JogoTabuleiro :fase="fase" :foto="foto" :duracao="duracao" :rotulo="rotulo" />
    </div>
  </div>
</template>
