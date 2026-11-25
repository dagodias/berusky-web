<script setup lang="ts">
/** A página inicial: o nome e a frase do jogo (vêm da API) e o que é o Berusky, em poucas linhas. */
import { ArrowRight, Bug, KeyRound, Puzzle } from '@lucide/vue'

const { data: negocio, error } = await useNegocio()

// O botão principal: "Jogar" na primeira vez; depois, "Continuar" na fase aberta ainda não vencida.
const { $api } = useNuxtApp()
const { data: grupos } = await useAsyncData(
  'grupos',
  async () => (await $api.GET('/api/fases')).data,
)
const { progresso, carregado } = useProgresso()
const continuar = computed(() => ondeContinuar(progresso.value, grupos.value ?? []))
const destino = computed(() =>
  continuar.value ? `/fases/${continuar.value.grupo}/${continuar.value.numero}` : '/fases',
)
const rotuloDoBotao = computed(() =>
  carregado.value && jaJogou(progresso.value) ? 'Continuar' : 'Jogar',
)

useSeoMeta({
  title: () => negocio.value?.nome ?? 'Início',
  ogTitle: () => negocio.value?.nome,
  description: () => negocio.value?.frase,
  ogDescription: () => negocio.value?.frase,
})

const destaques = [
  {
    icone: Bug,
    titulo: 'Cinco joaninhas',
    texto:
      'Cada fase tem até cinco joaninhas. Você troca de uma para outra e elas trabalham juntas.',
  },
  {
    icone: KeyRound,
    titulo: 'Cinco chaves',
    texto: 'Para sair, junte as cinco chaves e abra caminho até a porta de saída.',
  },
  {
    icone: Puzzle,
    titulo: '120 fases originais',
    texto:
      'Do treino ao impossível, com as mesmas regras do jogo de 1999: caixas, explosivos e portas.',
  },
]
</script>

<template>
  <div>
    <BaseSecao v-if="error">
      <BaseAviso tipo="erro" titulo="A API não respondeu">
        Confira se ela está ligada (pnpm dev) e recarregue a página.
      </BaseAviso>
    </BaseSecao>

    <template v-else-if="negocio">
      <section class="relative isolate overflow-hidden">
        <div
          aria-hidden="true"
          class="absolute inset-x-0 -top-48 -z-10 h-[36rem] bg-[radial-gradient(ellipse_at_top,var(--color-marca-100),transparent_65%)] dark:bg-[radial-gradient(ellipse_at_top,color-mix(in_oklab,var(--color-marca-900)_45%,transparent),transparent_65%)]"
        />
        <div class="mx-auto max-w-6xl px-4 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-20 lg:pt-24 lg:pb-24">
          <BaseSelo tipo="neutro">Versão web não oficial</BaseSelo>
          <h1
            class="mt-5 text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl"
          >
            {{ negocio.nome }}
          </h1>
          <p
            class="mt-5 max-w-xl text-lg text-pretty text-stone-600 sm:text-xl dark:text-stone-400"
          >
            {{ negocio.frase }}
          </p>
          <div class="mt-8 flex flex-col gap-3 sm:flex-row">
            <BaseBotao :para="destino" tamanho="grande">
              {{ rotuloDoBotao }}
              <ArrowRight class="size-5" aria-hidden="true" />
            </BaseBotao>
            <BaseBotao para="/fases" variante="secundario" tamanho="grande"
              >Mapa de fases</BaseBotao
            >
            <BaseBotao para="/como-jogar" variante="discreto" tamanho="grande"
              >Como jogar</BaseBotao
            >
          </div>
        </div>
      </section>

      <BaseSecao
        titulo="Um quebra-cabeça de empurrar caixas"
        subtitulo="Pense antes de andar: não dá para desfazer o passo."
        fundo="suave"
      >
        <ul class="grid gap-5 sm:grid-cols-3">
          <li v-for="destaque in destaques" :key="destaque.titulo">
            <BaseCartao class="h-full">
              <span
                class="grid size-10 place-items-center rounded-full bg-marca-50 text-marca-700 dark:bg-marca-950 dark:text-marca-300"
              >
                <component :is="destaque.icone" class="size-5" aria-hidden="true" />
              </span>
              <h3 class="mt-4 text-lg font-semibold">{{ destaque.titulo }}</h3>
              <p class="mt-1.5 text-stone-600 dark:text-stone-400">{{ destaque.texto }}</p>
            </BaseCartao>
          </li>
        </ul>
      </BaseSecao>
    </template>
  </div>
</template>
