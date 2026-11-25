<script setup lang="ts">
/**
 * O guia de estilo: todas as peças do site numa página só, para você e a IA verem antes de usar.
 * Fica fora do menu e fora do Google (noindex). Peça nova em components/base aparece aqui também.
 */
import { MessageCircle, PackageOpen } from '@lucide/vue'
import { ITEM, naCor, Partida } from '@projeto/jogo'

useSeoMeta({
  title: 'Guia de estilo',
  description: 'As peças do site: cores, letras, botões, cartões, selos, avisos e estados.',
  robots: 'noindex, nofollow',
})

// As classes inteiras, para o Tailwind achar no código.
const marca = [
  ['50', 'bg-marca-50'],
  ['100', 'bg-marca-100'],
  ['200', 'bg-marca-200'],
  ['300', 'bg-marca-300'],
  ['400', 'bg-marca-400'],
  ['500', 'bg-marca-500'],
  ['600', 'bg-marca-600'],
  ['700', 'bg-marca-700'],
  ['800', 'bg-marca-800'],
  ['900', 'bg-marca-900'],
  ['950', 'bg-marca-950'],
]
// O jogo: duas fases de verdade, vindas da API (o treino 1, aberto, e a intermediário 6, cheia de portas).
const { $api } = useNuxtApp()
const { data: vitrine } = await useAsyncData('guia-fases', async () => {
  const pedir = (grupo: 'treino' | 'intermediario', numero: number) =>
    $api.GET('/api/fases/{grupo}/{numero}', { params: { path: { grupo, numero } } })
  const [treino, intermediaria] = await Promise.all([pedir('treino', 1), pedir('intermediario', 6)])
  return [treino.data, intermediaria.data].filter((fase) => fase !== undefined)
})
const fotos = computed(() => (vitrine.value ?? []).map((fase) => new Partida(fase).foto()))

// Cada peça do jogo, com o nome que aparece na ajuda.
const pecasDoJogo = [
  { nome: 'Caixa', item: ITEM.CAIXA },
  { nome: 'Caixa leve', item: ITEM.CAIXA_LEVE },
  { nome: 'Explosivo', item: ITEM.EXPLOSIVO },
  { nome: 'Pedra', item: ITEM.PEDRA },
  { nome: 'Picareta', item: ITEM.PICARETA },
  { nome: 'Chave', item: ITEM.CHAVE },
  { nome: 'Saída', item: ITEM.SAIDA },
  { nome: 'Chave colorida', item: naCor(ITEM.CHAVE_COLORIDA, 2) },
  { nome: 'Porta colorida', item: naCor(ITEM.PORTA_H_FECHADA, 3) },
  { nome: 'Porta aberta', item: naCor(ITEM.PORTA_H_ABERTA, 3) },
  { nome: 'Passagem colorida', item: naCor(ITEM.PASSAGEM_H_FECHADA, 5) },
  { nome: 'Passagem aberta', item: naCor(ITEM.PASSAGEM_H_ABERTA, 5) },
  { nome: 'Porta de uma vez', item: ITEM.UMA_VEZ_H_ABERTA },
  { nome: 'Fechada de vez', item: ITEM.UMA_VEZ_H_FECHADA },
].map((peca) => ({ ...peca, desenho: desenhoDaPeca(peca.item) }))

const neutros = [
  ['50', 'bg-stone-50'],
  ['100', 'bg-stone-100'],
  ['200', 'bg-stone-200'],
  ['300', 'bg-stone-300'],
  ['400', 'bg-stone-400'],
  ['500', 'bg-stone-500'],
  ['600', 'bg-stone-600'],
  ['700', 'bg-stone-700'],
  ['800', 'bg-stone-800'],
  ['900', 'bg-stone-900'],
  ['950', 'bg-stone-950'],
]

const titulo = 'text-sm font-semibold text-stone-500 dark:text-stone-400'
</script>

<template>
  <div>
    <BaseCabecalho
      rotulo="Para quem constrói o site"
      titulo="Guia de estilo"
      subtitulo="Todas as peças do site numa página só. Use estas, nesta ordem de preferência, antes de criar outra."
    />

    <BaseSecao
      titulo="Cores"
      subtitulo="A cor da marca muda no assets/css/main.css; os neutros são o stone do Tailwind."
    >
      <div class="space-y-6">
        <div v-for="(paleta, nome) in { marca, neutros }" :key="nome">
          <p :class="titulo">
            {{ nome === 'marca' ? 'A marca (marca-*)' : 'Os neutros (stone-*)' }}
          </p>
          <ul class="mt-3 grid grid-cols-6 gap-2 sm:grid-cols-11">
            <li v-for="[tom, classe] in paleta" :key="tom">
              <div
                class="h-12 rounded-lg ring-1 ring-stone-900/10 ring-inset dark:ring-white/10"
                :class="classe"
              />
              <p class="mt-1 text-xs text-stone-500 dark:text-stone-400">{{ tom }}</p>
            </li>
          </ul>
        </div>
      </div>
    </BaseSecao>

    <BaseSecao titulo="Letras" subtitulo="A Inter, servida pelo próprio site." fundo="suave">
      <div class="space-y-4">
        <p class="text-5xl font-semibold tracking-tight">Título da página (h1)</p>
        <p class="text-3xl font-semibold tracking-tight">Título da seção (h2)</p>
        <p class="text-lg font-semibold">Título do cartão (h3)</p>
        <p class="max-w-2xl text-lg text-stone-600 dark:text-stone-400">
          O subtítulo: uma ou duas frases que explicam a seção, em cinza.
        </p>
        <p class="max-w-2xl">
          O texto comum, para ler com calma, com no máximo uns 70 caracteres por linha.
        </p>
        <p class="text-sm text-stone-500 dark:text-stone-400">
          O texto pequeno, para detalhes e avisos.
        </p>
      </div>
    </BaseSecao>

    <BaseSecao titulo="Botões" subtitulo="Um principal por tela; o resto, secundário ou discreto.">
      <div class="space-y-6">
        <div class="flex flex-wrap items-center gap-3">
          <BaseBotao>Principal</BaseBotao>
          <BaseBotao variante="secundario">Secundário</BaseBotao>
          <BaseBotao variante="discreto">Discreto</BaseBotao>
          <BaseBotao disabled>Desligado</BaseBotao>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <BaseBotao tamanho="pequeno">Pequeno</BaseBotao>
          <BaseBotao>Normal</BaseBotao>
          <BaseBotao tamanho="grande">
            <MessageCircle class="size-5" aria-hidden="true" />
            Grande, com ícone
          </BaseBotao>
        </div>
      </div>
    </BaseSecao>

    <BaseSecao titulo="Selos e avisos" fundo="suave">
      <div class="space-y-8">
        <div class="flex flex-wrap gap-2">
          <BaseSelo>Neutro</BaseSelo>
          <BaseSelo tipo="marca">Da marca</BaseSelo>
          <BaseSelo tipo="sucesso" ponto>Aberto agora</BaseSelo>
          <BaseSelo tipo="exemplo">Exemplo: troque pelo seu</BaseSelo>
        </div>
        <div class="grid gap-4 md:grid-cols-2">
          <BaseAviso titulo="Informação">Um aviso comum, para quem está na página.</BaseAviso>
          <BaseAviso tipo="sucesso" titulo="Deu certo">O que a pessoa fez funcionou.</BaseAviso>
          <BaseAviso tipo="atencao" titulo="Atenção">Algo pede cuidado antes de seguir.</BaseAviso>
          <BaseAviso tipo="erro" titulo="Não deu certo"
            >O que falhou e o que fazer agora.</BaseAviso
          >
        </div>
      </div>
    </BaseSecao>

    <BaseSecao titulo="Cartão, vazio e carregando">
      <div class="grid gap-5 md:grid-cols-3">
        <BaseCartao>
          <p :class="titulo">Cartão</p>
          <h3 class="mt-3 text-lg font-semibold">Um assunto por cartão</h3>
          <p class="mt-1.5 text-stone-600 dark:text-stone-400">Uma fase, uma regra, um passo.</p>
        </BaseCartao>
        <BaseVazio
          :icone="PackageOpen"
          titulo="Nada por aqui ainda"
          texto="Diga o que é e qual o próximo passo."
        >
          <BaseBotao variante="secundario" tamanho="pequeno">O próximo passo</BaseBotao>
        </BaseVazio>
        <BaseCartao>
          <p :class="titulo">Carregando</p>
          <BaseCarregando class="mt-4" :linhas="4" />
        </BaseCartao>
      </div>
    </BaseSecao>
    <BaseSecao
      titulo="O jogo"
      subtitulo="Os besouros, as peças e o tabuleiro. Os desenhos moram em components/jogo/Sprites.vue; as cores, no main.css."
      fundo="suave"
    >
      <JogoSprites />
      <ul class="flex flex-wrap gap-4">
        <li v-for="(nome, i) in NOMES_DOS_BESOUROS" :key="nome" class="w-20 text-center">
          <svg viewBox="0 0 64 64" class="mx-auto size-14" aria-hidden="true">
            <use href="#jogo-besouro" :style="{ '--cor': corDoBesouro(i + 1) }" />
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
              {{ i + 1 }}
            </text>
          </svg>
          <p class="mt-1 text-sm">{{ i + 1 }} · {{ nome }}</p>
        </li>
      </ul>
      <ul class="mt-8 grid grid-cols-3 gap-4 sm:grid-cols-5 lg:grid-cols-7">
        <li v-for="peca in pecasDoJogo" :key="peca.nome" class="text-center">
          <svg
            viewBox="0 0 64 64"
            class="mx-auto size-14 rounded-lg bg-stone-200/70 dark:bg-stone-800"
            aria-hidden="true"
          >
            <use
              :href="`#${peca.desenho.simbolo}`"
              :style="peca.desenho.cor ? { '--cor': corDoBesouro(peca.desenho.cor) } : undefined"
            />
          </svg>
          <p class="mt-1 text-sm">{{ peca.nome }}</p>
        </li>
      </ul>
      <div v-if="vitrine?.length" class="mt-10 space-y-8">
        <figure v-for="(fase, i) in vitrine" :key="`${fase.grupo}-${fase.numero}`">
          <div class="overflow-hidden rounded-cartao shadow-sm ring-1 ring-black/5">
            <JogoTabuleiro
              :fase="fase"
              :foto="fotos[i]!"
              :rotulo="`O tabuleiro da fase ${fase.numero} do grupo ${fase.grupo}`"
            />
          </div>
          <figcaption class="mt-2 text-sm text-stone-600 dark:text-stone-400">
            {{ fase.grupo === 'treino' ? 'Treino' : 'Intermediário' }}, fase
            {{ fase.numero }} (fundo {{ fase.fundo }}).
          </figcaption>
        </figure>
      </div>
    </BaseSecao>
  </div>
</template>
