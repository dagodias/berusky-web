<script setup lang="ts">
/**
 * O tabuleiro de uma fase: o chão, o piso e as paredes (um caminho por material, calculado uma vez) e, por cima, as
 * peças e os besouros do retrato da partida (a Foto do motor). Cada peça é um <g> com o id dela como chave: quando
 * ela anda, o mesmo elemento desliza (a transição de transform), em vez de sumir e aparecer.
 * Os desenhos vêm do JogoSprites, que precisa estar na página.
 */
import type { Fase } from '@projeto/shared'
import { CHAVES_PARA_SAIR, type Foto, ITEM } from '@projeto/jogo'

const props = withDefaults(
  defineProps<{
    fase: Fase
    foto: Foto
    /** Quanto dura o deslize de um passo, em milissegundos (0 é sem animação). */
    duracao?: number
    /** O nome do tabuleiro para o leitor de tela. */
    rotulo?: string
  }>(),
  { duracao: 0, rotulo: 'O tabuleiro da fase' },
)

const tema = computed(() => (props.fase.fundo === 1 ? 1 : 0))
const cor = (nome: string) => `var(--jogo-${tema.value}-${nome})`

const paredes = computed(() => caminhoDasParedes(props.fase.itens))
const piso = computed(() => caminhosDoPiso(props.fase.piso))

// As peças em ordem de id: a ordem dos elementos não muda quando elas andam (mover um elemento no meio da lista
// cortaria a transição).
const pecas = computed(() =>
  [...props.foto.pecas]
    .sort((a, b) => a.id - b.id)
    .map((peca) => ({ ...peca, desenho: desenhoDaPeca(peca.item) })),
)

const saidaLiberada = computed(() => props.foto.chaves >= CHAVES_PARA_SAIR)
// As cinco luzes da saída, no arco do portal: uma acende a cada chave.
const luzes = [
  [12, 30],
  [18, 15],
  [32, 9],
  [46, 15],
  [52, 30],
] as const

const transicao = computed(() =>
  props.duracao ? `transform ${props.duracao}ms linear, opacity ${props.duracao}ms linear` : 'none',
)

function posicao(x: number, y: number) {
  return { transform: `translate(${x * CASA}px, ${y * CASA}px)`, transition: transicao.value }
}
</script>

<template>
  <svg
    :viewBox="`0 0 ${LARGURA_DO_TABULEIRO} ${ALTURA_DO_TABULEIRO}`"
    class="block h-auto w-full select-none"
    role="img"
    :aria-label="rotulo"
  >
    <defs>
      <pattern :id="`jogo-pintas-${tema}`" width="32" height="32" patternUnits="userSpaceOnUse">
        <circle cx="8" cy="8" r="2.2" :fill="cor('chao-pinta')" />
        <circle cx="24" cy="24" r="1.6" :fill="cor('chao-pinta')" />
      </pattern>
    </defs>

    <!-- O chão (onde o original mostra o fundo da fase: também se anda nele). -->
    <rect :width="LARGURA_DO_TABULEIRO" :height="ALTURA_DO_TABULEIRO" :fill="cor('chao')" />
    <rect
      :width="LARGURA_DO_TABULEIRO"
      :height="ALTURA_DO_TABULEIRO"
      :fill="`url(#jogo-pintas-${tema})`"
    />

    <!-- O piso, em três tons. -->
    <path :d="piso[0]" :fill="cor('piso-a')" />
    <path :d="piso[1]" :fill="cor('piso-b')" />
    <path :d="piso[2]" :fill="cor('piso-c')" />

    <!-- As paredes: a lateral (o mesmo desenho, mais embaixo) e o topo. -->
    <path :d="paredes" :fill="cor('parede-lado')" transform="translate(0 10)" />
    <path :d="paredes" :fill="cor('parede')" />

    <!-- As peças. -->
    <g
      v-for="peca in pecas"
      :key="peca.id"
      :style="posicao(peca.x, peca.y)"
      :data-peca="peca.desenho.simbolo"
    >
      <use
        :href="`#${peca.item === ITEM.SAIDA && saidaLiberada ? 'jogo-saida-aberta' : peca.desenho.simbolo}`"
        width="64"
        height="64"
        :transform="peca.desenho.deitada ? 'rotate(90 32 32)' : undefined"
        :style="peca.desenho.cor ? { '--cor': corDoBesouro(peca.desenho.cor) } : undefined"
      />
      <template v-if="peca.item === ITEM.SAIDA">
        <circle
          v-for="([lx, ly], i) in luzes"
          :key="i"
          :cx="lx"
          :cy="ly"
          r="4"
          :fill="i < foto.chaves ? '#fbbf24' : '#1e293b'"
          :stroke="i < foto.chaves ? '#fff7ed' : '#64748b'"
          stroke-width="1.5"
        />
      </template>
      <text
        v-if="peca.desenho.cor && peca.desenho.simbolo !== 'jogo-porta-aberta'"
        x="52"
        y="58"
        text-anchor="middle"
        font-size="17"
        font-weight="800"
        fill="#fff"
        stroke="#1f2937"
        stroke-width="4"
        paint-order="stroke"
      >
        {{ peca.desenho.cor }}
      </text>
    </g>

    <!-- Os besouros: o comandado ganha o anel. -->
    <g
      v-for="besouro in foto.besouros"
      :key="`besouro-${besouro.numero}`"
      :style="posicao(besouro.x, besouro.y)"
      :data-besouro="besouro.numero"
    >
      <circle
        v-if="besouro.numero === foto.ativo"
        cx="32"
        cy="34"
        r="31"
        :fill="corDoBesouro(besouro.numero)"
        fill-opacity=".22"
        :stroke="corDoBesouro(besouro.numero)"
        stroke-width="4"
        class="anel-do-ativo"
      />
      <use
        href="#jogo-besouro"
        width="64"
        height="64"
        :transform="`rotate(${besouro.rotacao * 90} 32 32)`"
        :style="{ '--cor': corDoBesouro(besouro.numero) }"
      />
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
    </g>
  </svg>
</template>

<style scoped>
@media (prefers-reduced-motion: no-preference) {
  .anel-do-ativo {
    animation: pulsar 1.6s ease-in-out infinite;
  }
}

@keyframes pulsar {
  50% {
    opacity: 0.55;
  }
}
</style>
