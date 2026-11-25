<script setup lang="ts">
/**
 * A privacidade, em linguagem simples. O jogo guarda o progresso no próprio navegador e manda as jogadas ao servidor
 * só para conferir a fase vencida. Mudou isso (conta, cadastro, rastreador)? Mude este texto junto, e a data.
 */
const { data: negocio } = await useNegocio()

const atualizadaEm = '25 de novembro de 2026'

useSeoMeta({
  title: 'Privacidade',
  ogTitle: 'Privacidade',
  description:
    'O que o jogo guarda: o seu progresso, só no seu navegador. Sem cadastro e sem cookie.',
  ogDescription:
    'O que o jogo guarda: o seu progresso, só no seu navegador. Sem cadastro e sem cookie.',
})

const codigoFonte = computed(() => negocio.value?.links[0]?.endereco)
</script>

<template>
  <div>
    <BaseCabecalho
      rotulo="Privacidade"
      titulo="Os seus dados"
      :subtitulo="`Atualizada em ${atualizadaEm}.`"
    />

    <BaseSecao>
      <div class="max-w-3xl space-y-10 text-stone-700 dark:text-stone-300">
        <section>
          <h2 class="text-xl font-semibold text-stone-900 dark:text-white">
            O que fica no seu aparelho
          </h2>
          <p class="mt-3">
            O seu progresso: as fases que você venceu, o menor número de passos de cada uma e as
            senhas das fases. Ele fica guardado só neste navegador, no espaço que o próprio
            navegador dá ao site. Limpar os dados do site apaga o progresso; as senhas ajudam a
            recuperar.
          </p>
        </section>
        <section>
          <h2 class="text-xl font-semibold text-stone-900 dark:text-white">
            O que vai para o servidor
          </h2>
          <p class="mt-3">
            Quando você vence uma fase, o jogo manda as jogadas que você fez (as setas, as trocas de
            joaninha) para o servidor conferir a vitória e devolver a senha da próxima fase. Nada
            disso diz quem você é, e o servidor não guarda essas jogadas.
          </p>
        </section>
        <section>
          <h2 class="text-xl font-semibold text-stone-900 dark:text-white">O que o site não faz</h2>
          <p class="mt-3">Não usa cookies, não tem rastreador nem anúncio e não pede cadastro.</p>
        </section>
        <section>
          <h2 class="text-xl font-semibold text-stone-900 dark:text-white">
            Os registros do servidor
          </h2>
          <p class="mt-3">
            Como todo site, o servidor anota o endereço de internet (IP) de quem acessa, a data e a
            página pedida, só para a segurança. Esses registros são apagados em até 14 dias.
          </p>
        </section>
        <section v-if="codigoFonte">
          <h2 class="text-xl font-semibold text-stone-900 dark:text-white">Dúvidas</h2>
          <p class="mt-3">
            O código deste site é aberto: dá para conferir tudo isso
            <a :href="codigoFonte" class="font-medium underline underline-offset-4"
              >no código-fonte</a
            >, e deixar a sua pergunta lá.
          </p>
        </section>
      </div>
    </BaseSecao>
  </div>
</template>
