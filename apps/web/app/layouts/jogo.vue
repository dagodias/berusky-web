<script setup lang="ts">
/**
 * A casca da partida: a mesma do default (o link de pular para o conteúdo, o topo, o título e a prévia do link), sem
 * o rodapé, para o tabuleiro ocupar a tela. O código-fonte continua a um toque: o menu leva ao Sobre.
 */
const { data: negocio } = await useNegocio()
const { enderecoDoSite } = useAppConfig()
const route = useRoute()
const endereco = enderecoDoSite.replace(/\/+$/, '')
// A página privada (o painel, a entrada, o pedido com o código secreto) não ganha endereço oficial nem og:url.
const enderecoDaPagina = computed(() =>
  endereco && !ehPaginaPrivada(route.path) ? endereco + route.path : undefined,
)

// O título de cada página ganha o nome do negócio no fim: "Contato · Meu Negócio".
useHead({
  titleTemplate: (titulo) => {
    const nome = negocio.value?.nome
    if (!nome) return titulo ?? ''
    return titulo && titulo !== nome ? `${titulo} · ${nome}` : nome
  },
  link: computed(() =>
    enderecoDaPagina.value ? [{ rel: 'canonical', href: enderecoDaPagina.value }] : [],
  ),
})

// A prévia do link (WhatsApp, Facebook): o nome, a imagem e o endereço. O título e a descrição vêm de cada página.
useSeoMeta({
  ogSiteName: () => negocio.value?.nome,
  ogType: 'website',
  ogLocale: 'pt_BR',
  ogImage: endereco ? `${endereco}/previa.png` : '/previa.png',
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogUrl: () => enderecoDaPagina.value,
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <div class="flex h-dvh flex-col">
    <a
      href="#conteudo"
      class="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-botao focus:bg-white focus:px-4 focus:py-2.5 focus:font-semibold focus:shadow-lg dark:focus:bg-stone-900"
    >
      Pular para o conteúdo
    </a>
    <SiteTopo :negocio="negocio" />
    <main id="conteudo" tabindex="-1" class="flex min-h-0 flex-1 flex-col focus:outline-none">
      <slot />
    </main>
  </div>
</template>
