<script setup lang="ts">
/**
 * Como jogar: o objetivo, cada peça com o desenho e a regra dela (as do Berusky original) e os controles.
 * A versão curta destas regras é a ajuda da partida (components/jogo/Ajuda.vue).
 */
import { ITEM, naCor } from '@projeto/jogo'

useSeoMeta({
  title: 'Como jogar',
  ogTitle: 'Como jogar',
  description:
    'As regras do Berusky: as cinco joaninhas, as chaves, as caixas, os explosivos, as pedras e as portas.',
  ogDescription:
    'As regras do Berusky: as cinco joaninhas, as chaves, as caixas, os explosivos, as pedras e as portas.',
})

const pecas = [
  {
    nome: 'Chave',
    item: ITEM.CHAVE,
    regra:
      'São cinco por fase, de todas as joaninhas juntas. Com as cinco, a saída abre (e uma sexta chave vira obstáculo).',
  },
  {
    nome: 'Saída',
    item: ITEM.SAIDA,
    regra:
      'As luzes acendem a cada chave. Com as cinco, qualquer joaninha que encostar nela vence a fase.',
  },
  {
    nome: 'Caixa',
    item: ITEM.CAIXA,
    regra: 'Dá para empurrar, uma de cada vez, só para uma casa vazia.',
  },
  {
    nome: 'Caixa leve',
    item: ITEM.CAIXA_LEVE,
    regra: 'Também se empurra, e até duas em fila. Mas ela não empurra a caixa comum.',
  },
  {
    nome: 'Explosivo',
    item: ITEM.EXPLOSIVO,
    regra:
      'Empurrado para a casa vazia, anda como a caixa. Empurrado contra uma caixa, explode: a caixa e o explosivo somem. A explosão não machuca joaninha.',
  },
  {
    nome: 'Pedra',
    item: ITEM.PEDRA,
    regra:
      'Só sai do caminho com uma picareta da joaninha que anda. Cada picareta quebra uma pedra.',
  },
  {
    nome: 'Picareta',
    item: ITEM.PICARETA,
    regra: 'Cada joaninha carrega as suas, até nove. Elas não passam de uma joaninha para outra.',
  },
  {
    nome: 'Chave colorida',
    item: naCor(ITEM.CHAVE_COLORIDA, 2),
    regra: 'Só a joaninha da mesma cor pega, e ela carrega uma de cada vez.',
  },
  {
    nome: 'Porta colorida',
    item: naCor(ITEM.PORTA_H_FECHADA, 3),
    regra:
      'Abre com a chave da mesma cor, atravessando de frente. Depois de aberta, ou a porta some (e aí passa qualquer um, até a caixa), ou fica aberta (e aí passa qualquer joaninha, mas só de frente).',
  },
  {
    nome: 'Passagem colorida',
    item: naCor(ITEM.PASSAGEM_H_FECHADA, 5),
    regra:
      'Só a joaninha da mesma cor atravessa, de frente. Quando ela sai, a passagem fecha de novo. Caixa não passa.',
  },
  {
    nome: 'Porta de uma passagem só',
    item: ITEM.UMA_VEZ_H_ABERTA,
    regra: 'Qualquer joaninha passa, de frente, uma vez. Depois, ela fecha para sempre.',
  },
].map((peca) => ({ ...peca, desenho: desenhoDaPeca(peca.item) }))
</script>

<template>
  <div>
    <BaseCabecalho
      rotulo="Como jogar"
      titulo="As regras do jogo"
      subtitulo="As mesmas do Berusky original. Pense antes de andar: não dá para desfazer um passo."
    />
    <JogoSprites />

    <BaseSecao titulo="O objetivo">
      <div class="max-w-3xl space-y-4 text-lg text-stone-700 dark:text-stone-300">
        <p>
          Em cada fase, junte as <strong>cinco chaves</strong> e leve uma joaninha até a
          <strong>saída</strong>. A fase pode ter de uma a cinco joaninhas: você comanda uma de cada
          vez e troca quando quiser.
        </p>
        <ul class="flex flex-wrap gap-4">
          <li
            v-for="(nome, i) in NOMES_DOS_BESOUROS"
            :key="nome"
            class="flex items-center gap-2 text-base"
          >
            <svg viewBox="0 0 64 64" class="size-10" aria-hidden="true">
              <use href="#jogo-besouro" :style="{ '--cor': corDoBesouro(i + 1) }" />
            </svg>
            {{ i + 1 }}, {{ nome }}
          </li>
        </ul>
      </div>
    </BaseSecao>

    <BaseSecao titulo="As peças" fundo="suave">
      <ul class="grid gap-4 md:grid-cols-2">
        <li v-for="peca in pecas" :key="peca.nome">
          <BaseCartao class="flex h-full gap-4">
            <svg
              viewBox="0 0 64 64"
              class="size-14 shrink-0 rounded-lg bg-stone-200/70 dark:bg-stone-800"
              aria-hidden="true"
            >
              <use
                :href="`#${peca.desenho.simbolo}`"
                :style="peca.desenho.cor ? { '--cor': corDoBesouro(peca.desenho.cor) } : undefined"
              />
            </svg>
            <div>
              <h3 class="font-semibold">{{ peca.nome }}</h3>
              <p class="mt-1 text-stone-600 dark:text-stone-400">{{ peca.regra }}</p>
            </div>
          </BaseCartao>
        </li>
      </ul>
    </BaseSecao>

    <BaseSecao titulo="Os controles">
      <div class="max-w-3xl">
        <JogoAjuda so-controles />
      </div>
      <div class="mt-8">
        <BaseBotao para="/fases">Escolher uma fase</BaseBotao>
      </div>
    </BaseSecao>
  </div>
</template>
