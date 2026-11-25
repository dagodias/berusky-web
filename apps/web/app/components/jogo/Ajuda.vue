<script setup lang="ts">
/** A ajuda rápida da partida: os controles (teclado e toque) e as regras em poucas linhas. */
defineProps<{
  /** Só os controles (a página Como jogar já tem as regras, com os desenhos). */ soControles?: boolean
}>()

const teclas = [
  ['Setas ou W, A, S, D', 'Movem a joaninha (com Shift, mais rápido)'],
  ['Tab ou 1 a 5', 'Trocam a joaninha que você comanda'],
  ['R', 'Recomeça a fase'],
  ['G e V', 'Guarda a posição e volta a ela'],
  ['P', 'Mostra a dica da fase'],
  ['L', 'Descreve os arredores (para leitor de tela)'],
  ['Esc', 'Pausa'],
]

const regras = [
  'Junte as cinco chaves e leve uma joaninha até a saída.',
  'A caixa se empurra, uma de cada vez; a caixa leve, até duas.',
  'O explosivo empurrado contra uma caixa explode os dois.',
  'A pedra só quebra com uma picareta (cada picareta, uma pedra).',
  'A chave colorida e a porta colorida são da joaninha da mesma cor.',
  'A passagem colorida só deixa passar a joaninha da cor dela, e fecha quando ela sai.',
  'A porta com o 1 deixa passar uma vez só: depois, fecha para sempre.',
]
</script>

<template>
  <div class="space-y-5 text-sm">
    <section>
      <h3 class="font-semibold text-stone-900 dark:text-white">No teclado</h3>
      <dl class="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
        <template v-for="[tecla, faz] in teclas" :key="tecla">
          <dt class="font-mono font-semibold whitespace-nowrap">{{ tecla }}</dt>
          <dd>{{ faz }}</dd>
        </template>
      </dl>
      <p class="mt-2">No celular, use o direcional ou deslize o dedo sobre o tabuleiro.</p>
    </section>
    <section v-if="!soControles">
      <h3 class="font-semibold text-stone-900 dark:text-white">As regras</h3>
      <ul class="mt-2 list-disc space-y-1 pl-5">
        <li v-for="regra in regras" :key="regra">{{ regra }}</li>
      </ul>
      <p class="mt-2">Não dá para desfazer um passo: pense antes de andar (ou guarde a posição).</p>
    </section>
  </div>
</template>
