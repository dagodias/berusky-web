<script setup lang="ts">
/**
 * O painel da partida: o nome da fase, os passos, as cinco chaves e as joaninhas (cada uma com o que carrega: as
 * picaretas e a chave colorida). Tocar numa joaninha passa o comando para ela. Os desenhos vêm do JogoSprites.
 */
import { CHAVES_PARA_SAIR, type Foto } from '@projeto/jogo'

defineProps<{ foto: Foto; titulo: string; melhor: number | null }>()
const emit = defineEmits<{ trocar: [numero: number] }>()
</script>

<template>
  <div class="flex flex-wrap items-center gap-x-6 gap-y-2">
    <h1 class="text-lg font-semibold tracking-tight sm:text-xl">{{ titulo }}</h1>

    <p class="text-sm text-stone-600 dark:text-stone-400">
      Passos
      <strong class="text-base text-stone-900 tabular-nums dark:text-white" data-passos>{{
        foto.passos
      }}</strong>
      <span v-if="melhor !== null"> · melhor {{ melhor }}</span>
    </p>

    <p
      class="flex items-center gap-1"
      :aria-label="`Chaves: ${foto.chaves} de ${CHAVES_PARA_SAIR}`"
    >
      <svg
        v-for="i in CHAVES_PARA_SAIR"
        :key="i"
        viewBox="0 0 64 64"
        class="size-6 transition-opacity"
        :class="i <= foto.chaves ? 'opacity-100' : 'opacity-25 grayscale'"
        aria-hidden="true"
      >
        <use href="#jogo-chave" />
      </svg>
      <span class="ml-1 text-sm tabular-nums" data-chaves
        >{{ foto.chaves }}/{{ CHAVES_PARA_SAIR }}</span
      >
    </p>

    <ul class="flex flex-wrap gap-2" aria-label="As joaninhas">
      <li v-for="besouro in foto.besouros" :key="besouro.numero">
        <button
          type="button"
          class="flex h-11 items-center gap-1.5 rounded-botao border-2 pr-2.5 pl-1.5 text-sm font-semibold transition-colors"
          :class="
            besouro.numero === foto.ativo
              ? 'border-stone-900 bg-stone-100 dark:border-white dark:bg-stone-800'
              : 'border-transparent hover:bg-stone-100 dark:hover:bg-stone-800'
          "
          :aria-pressed="besouro.numero === foto.ativo"
          :aria-label="`Joaninha ${besouro.numero} (${NOMES_DOS_BESOUROS[besouro.numero - 1]}): ${besouro.picaretas} picaretas${besouro.chavesColoridas ? ', com a chave colorida' : ''}`"
          @click="emit('trocar', besouro.numero)"
        >
          <svg viewBox="0 0 64 64" class="size-8" aria-hidden="true">
            <use href="#jogo-besouro" :style="{ '--cor': corDoBesouro(besouro.numero) }" />
            <text
              x="32"
              y="44"
              text-anchor="middle"
              font-size="20"
              font-weight="800"
              fill="#fff"
              stroke="#1f2937"
              stroke-width="5"
              paint-order="stroke"
            >
              {{ besouro.numero }}
            </text>
          </svg>
          <span v-if="besouro.picaretas" class="flex items-center tabular-nums" aria-hidden="true">
            <svg viewBox="0 0 64 64" class="size-5"><use href="#jogo-picareta" /></svg>
            {{ besouro.picaretas }}
          </span>
          <svg v-if="besouro.chavesColoridas" viewBox="0 0 64 64" class="size-5" aria-hidden="true">
            <use href="#jogo-chave-colorida" :style="{ '--cor': corDoBesouro(besouro.numero) }" />
          </svg>
        </button>
      </li>
    </ul>
  </div>
</template>
