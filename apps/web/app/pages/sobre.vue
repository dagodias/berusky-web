<script setup lang="ts">
/**
 * A página Sobre: o que é o Berusky, o que esta versão muda (só o visual) e os créditos do jogo original, que a GPL
 * e o respeito pedem. Os links (o código-fonte e o original) vêm da API.
 */
const { data: negocio } = await useNegocio()

useSeoMeta({
  title: 'Sobre',
  ogTitle: 'Sobre',
  description: 'O Berusky, o jogo original da Anakreon, e esta versão web, livre como ele.',
  ogDescription: 'O Berusky, o jogo original da Anakreon, e esta versão web, livre como ele.',
})

// Os créditos do original, do arquivo credits.dat do jogo (GameData), na mesma ordem.
const creditos = [
  { funcao: 'Programação', nomes: ['Martin "komat" Stránský'] },
  { funcao: 'Regras do jogo e desenho das fases', nomes: ['Luboš "Shobul" Doležal'] },
  { funcao: 'Gráficos do jogo', nomes: ['Jan "Riva" Halfar'] },
  { funcao: 'Gráficos do menu e logos', nomes: ['Václav "Mega" Hlobil'] },
  { funcao: 'Som e música', nomes: ['Martin Linda'] },
  { funcao: 'Tradução para o inglês', nomes: ['Radek Biba'] },
  { funcao: 'Revisão do texto', nomes: ['Michal "Mipo" Policky'] },
  {
    funcao: 'Agradecimentos',
    nomes: [
      'Michal Simonik',
      'Pavel Dolezal',
      'Milan Hamrik',
      'Jan Chalupa',
      'Igor Blaha',
      'Patrik Sykora',
      'Eva Sykorova',
      'Milan Crha',
      'Mary Stranska',
    ],
  },
]

const codigoFonte = computed(() => negocio.value?.links[0]?.endereco)
const original = computed(() => negocio.value?.links[1]?.endereco)

// O commit do código que está no ar (anotado no build, no nuxt.config.ts).
const { commitDoCodigo } = useRuntimeConfig().public
const linkDoCommit = computed(() =>
  codigoFonte.value && commitDoCodigo ? `${codigoFonte.value}/tree/${commitDoCodigo}` : undefined,
)
</script>

<template>
  <div>
    <BaseCabecalho
      rotulo="Sobre"
      titulo="O jogo e esta versão"
      subtitulo="O Berusky é software livre desde o começo. Esta versão web também é."
    />

    <BaseSecao>
      <div class="max-w-3xl space-y-5 text-lg text-stone-700 dark:text-stone-300">
        <p>
          O Berusky é um jogo de lógica criado pela Anakreon, na República Tcheca, no fim dos anos
          1990. Ele parte da velha ideia de empurrar caixas num labirinto e acrescenta explosivos,
          pedras, portas coloridas e até cinco joaninhas ("berušky", em tcheco) que você comanda uma
          de cada vez.
        </p>
        <p>
          Esta é uma versão web <strong>não oficial</strong>. As 120 fases e todas as regras são as
          do jogo original (a versão 1.7.2); o que mudou foi o visual, desenhado de novo, e o jeito
          de jogar no celular.
        </p>
        <p>
          O código desta versão é livre, sob a mesma licença do original: a GNU GPL, versão 2 ou
          mais nova.
          <a v-if="codigoFonte" :href="codigoFonte" class="font-medium underline underline-offset-4"
            >Veja o código-fonte</a
          ><template v-if="codigoFonte && original"> ou </template>
          <a v-if="original" :href="original" class="font-medium underline underline-offset-4"
            >conheça o original</a
          >.
        </p>
        <p v-if="linkDoCommit" class="text-base text-stone-600 dark:text-stone-400">
          Esta versão do site é o commit
          <a :href="linkDoCommit" class="font-mono underline underline-offset-4" data-commit>{{
            commitDoCodigo.slice(0, 7)
          }}</a>
          do código-fonte.
        </p>
      </div>
    </BaseSecao>

    <BaseSecao
      titulo="Quem criou o Berusky"
      subtitulo="O jogo original, as fases e as regras: © 1997–2020 AnakreoN, sob a GPL."
      fundo="suave"
    >
      <dl class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <BaseCartao v-for="credito in creditos" :key="credito.funcao" class="h-full">
          <dt class="text-sm font-semibold text-marca-700 dark:text-marca-400">
            {{ credito.funcao }}
          </dt>
          <dd
            v-for="nome in credito.nomes"
            :key="nome"
            class="mt-1 text-stone-700 dark:text-stone-300"
          >
            {{ nome }}
          </dd>
        </BaseCartao>
      </dl>
    </BaseSecao>
  </div>
</template>
