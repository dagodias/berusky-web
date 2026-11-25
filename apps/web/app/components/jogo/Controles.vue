<script setup lang="ts">
/**
 * Os botões da partida: o direcional (no celular e no tablet) e as ações, com a tecla de cada uma no computador.
 * Tudo com pelo menos 44 pontos, para o dedo.
 */
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  CircleHelp,
  Crosshair,
  History,
  Lightbulb,
  Maximize,
  RotateCcw,
  Save,
} from '@lucide/vue'
import type { Direcao } from '@projeto/jogo'
import type { Acao } from '~/utils/teclas'

defineProps<{ modo: 'tudo' | 'seguir'; temPosicaoGuardada: boolean }>()
const emit = defineEmits<{ acao: [acao: Acao]; alternarModo: [] }>()

const setas: Array<{ direcao: Direcao; rotulo: string; icone: Component; lugar: string }> = [
  { direcao: 'cima', rotulo: 'Para cima', icone: ArrowUp, lugar: 'col-start-2 row-start-1' },
  {
    direcao: 'esquerda',
    rotulo: 'Para a esquerda',
    icone: ArrowLeft,
    lugar: 'col-start-1 row-start-2',
  },
  {
    direcao: 'direita',
    rotulo: 'Para a direita',
    icone: ArrowRight,
    lugar: 'col-start-3 row-start-2',
  },
  { direcao: 'baixo', rotulo: 'Para baixo', icone: ArrowDown, lugar: 'col-start-2 row-start-3' },
]

// No celular, só o ícone (o nome fica para o leitor de tela); no computador, o nome e a tecla.
const botao =
  'inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-botao border border-stone-300 bg-white text-sm font-medium text-stone-800 transition-colors hover:bg-stone-50 disabled:opacity-40 lg:px-3 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:hover:bg-stone-800'
const nome = 'sr-only lg:not-sr-only'
</script>

<template>
  <div class="flex items-end justify-between gap-3">
    <div
      class="controles-de-toque grid shrink-0 grid-cols-3 grid-rows-3 gap-1"
      aria-label="Direcional"
    >
      <button
        v-for="seta in setas"
        :key="seta.direcao"
        type="button"
        class="grid size-13 place-items-center rounded-botao bg-stone-900 text-white shadow-sm active:scale-95 dark:bg-stone-100 dark:text-stone-900"
        :class="seta.lugar"
        :aria-label="seta.rotulo"
        @click="emit('acao', { tipo: 'mover', direcao: seta.direcao, rapido: false })"
      >
        <component :is="seta.icone" class="size-7" aria-hidden="true" />
      </button>
    </div>

    <div class="grid grid-cols-3 gap-2 lg:flex lg:flex-wrap lg:justify-end">
      <button type="button" :class="botao" @click="emit('acao', { tipo: 'recomecar' })">
        <RotateCcw class="size-4" aria-hidden="true" />
        <span :class="nome">Recomeçar</span>
        <kbd class="atalho">R</kbd>
      </button>
      <button type="button" :class="botao" @click="emit('acao', { tipo: 'guardar' })">
        <Save class="size-4" aria-hidden="true" />
        <span :class="nome">Guardar</span>
        <kbd class="atalho">G</kbd>
      </button>
      <button
        type="button"
        :class="botao"
        :disabled="!temPosicaoGuardada"
        @click="emit('acao', { tipo: 'voltar' })"
      >
        <History class="size-4" aria-hidden="true" />
        <span :class="nome">Voltar</span>
        <kbd class="atalho">V</kbd>
      </button>
      <button type="button" :class="botao" @click="emit('acao', { tipo: 'dica' })">
        <Lightbulb class="size-4" aria-hidden="true" />
        <span :class="nome">Dica</span>
        <kbd class="atalho">P</kbd>
      </button>
      <button type="button" :class="botao" @click="emit('acao', { tipo: 'ajuda' })">
        <CircleHelp class="size-4" aria-hidden="true" />
        <span :class="nome">Ajuda</span>
        <kbd class="atalho">H</kbd>
      </button>
      <button type="button" :class="botao" @click="emit('alternarModo')">
        <component :is="modo === 'tudo' ? Crosshair : Maximize" class="size-4" aria-hidden="true" />
        <span :class="nome">{{ modo === 'tudo' ? 'Seguir a joaninha' : 'Ver tudo' }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* O direcional e o atalho de teclado: um ou outro, conforme o aparelho. */
.controles-de-toque {
  display: grid;
}

.atalho {
  display: none;
}

@media (min-width: 1024px) and (pointer: fine) {
  .controles-de-toque {
    display: none;
  }

  .atalho {
    display: inline-block;
    border-radius: 0.375rem;
    border: 1px solid currentColor;
    padding: 0 0.3rem;
    font-size: 0.7rem;
    opacity: 0.6;
  }
}
</style>
