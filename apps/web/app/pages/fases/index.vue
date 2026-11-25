<script setup lang="ts">
/**
 * O mapa de fases: os cinco grupos do original, todos abertos desde o começo; dentro de cada um, as fases abrem em
 * sequência (como no Berusky 1.7). A fase vencida mostra o menor número de passos e a senha que a abriu. A senha de
 * uma fase (as do original) abre a fase em qualquer aparelho. O progresso mora no navegador (useProgresso).
 */
import { Check, KeyRound, Lock } from '@lucide/vue'
import type { GrupoId } from '@projeto/shared'

useSeoMeta({
  title: 'Fases',
  ogTitle: 'Fases',
  description: 'As 120 fases do Berusky, do treino ao impossível, com as senhas do jogo original.',
  ogDescription:
    'As 120 fases do Berusky, do treino ao impossível, com as senhas do jogo original.',
})

const { $api } = useNuxtApp()
const { data: grupos, error } = await useAsyncData('grupos', async () => {
  const { data } = await $api.GET('/api/fases')
  if (!data) throw createError({ statusCode: 502, statusMessage: 'A API não respondeu' })
  return data
})

const { progresso, carregado, salvar } = useProgresso()

function estado(grupo: GrupoId, numero: number) {
  const melhor = melhorDaFase(progresso.value, grupo, numero)
  return {
    aberta: faseAberta(progresso.value, grupo, numero),
    melhor,
    senha: progresso.value.senhas[nomeDaFase(grupo, numero)],
  }
}

function vencidasDoGrupo(grupo: GrupoId, total: number) {
  let vencidas = 0
  for (let numero = 1; numero <= total; numero++) {
    if (melhorDaFase(progresso.value, grupo, numero) !== null) vencidas++
  }
  return vencidas
}

// A senha.
const senha = ref('')
const erroDaSenha = ref('')
const conferindo = ref(false)

async function usarSenha() {
  erroDaSenha.value = ''
  const digitada = senha.value.trim()
  if (!/^[A-Za-z]{5}$/.test(digitada)) {
    erroDaSenha.value = 'A senha tem cinco letras.'
    return
  }
  conferindo.value = true
  try {
    const { data } = await $api.POST('/api/senhas', { body: { senha: digitada } })
    if (!data) {
      erroDaSenha.value = 'Essa senha não abre nenhuma fase.'
      return
    }
    salvar(abrirFase(progresso.value, data.grupo, data.numero, digitada.toLowerCase()))
    await navigateTo(`/fases/${data.grupo}/${data.numero}`)
  } catch {
    erroDaSenha.value = 'Não deu para falar com o servidor. Tente de novo.'
  } finally {
    conferindo.value = false
  }
}
</script>

<template>
  <div>
    <BaseCabecalho
      rotulo="Fases"
      titulo="Escolha a fase"
      subtitulo="Os cinco grupos estão abertos; dentro de cada um, vencer uma fase abre a seguinte."
    />

    <BaseSecao v-if="error">
      <BaseAviso tipo="erro" titulo="A API não respondeu">
        Confira se ela está ligada (pnpm dev) e recarregue a página.
      </BaseAviso>
    </BaseSecao>

    <template v-else-if="grupos">
      <BaseSecao>
        <form class="max-w-md" novalidate @submit.prevent="usarSenha">
          <label for="senha" class="flex items-center gap-2 font-semibold">
            <KeyRound class="size-5" aria-hidden="true" />
            Tenho uma senha
          </label>
          <p id="senha-ajuda" class="mt-1 text-sm text-stone-600 dark:text-stone-400">
            As cinco letras que aparecem quando você vence uma fase. Elas abrem a fase em qualquer
            aparelho.
          </p>
          <div class="mt-3 flex gap-2">
            <input
              id="senha"
              v-model="senha"
              name="senha"
              maxlength="5"
              autocomplete="off"
              autocapitalize="none"
              spellcheck="false"
              aria-describedby="senha-ajuda senha-erro"
              :aria-invalid="erroDaSenha ? 'true' : undefined"
              class="h-11 w-40 rounded-botao border border-stone-300 bg-white px-3 font-mono text-lg tracking-widest lowercase dark:border-stone-700 dark:bg-stone-900"
            />
            <BaseBotao tipo="submit" variante="secundario" :disabled="conferindo">Abrir</BaseBotao>
          </div>
          <p
            id="senha-erro"
            class="mt-2 min-h-5 text-sm text-red-700 dark:text-red-400"
            role="alert"
          >
            {{ erroDaSenha }}
          </p>
        </form>
      </BaseSecao>

      <BaseSecao
        v-for="(grupo, g) in grupos"
        :key="grupo.id"
        :titulo="grupo.nome"
        :subtitulo="
          carregado
            ? `${vencidasDoGrupo(grupo.id, grupo.totalDeFases)} de ${grupo.totalDeFases} fases vencidas`
            : `${grupo.totalDeFases} fases`
        "
        :fundo="g % 2 ? 'nenhum' : 'suave'"
      >
        <ol
          class="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10"
          :aria-label="`As fases do grupo ${grupo.nome}`"
        >
          <li v-for="numero in grupo.totalDeFases" :key="numero">
            <template v-if="carregado && estado(grupo.id, numero).aberta">
              <NuxtLink
                :to="`/fases/${grupo.id}/${numero}`"
                class="flex h-16 flex-col items-center justify-center rounded-botao border text-sm transition-colors"
                :class="
                  estado(grupo.id, numero).melhor !== null
                    ? 'border-marca-300 bg-marca-50 text-marca-900 hover:bg-marca-100 dark:border-marca-800 dark:bg-marca-950 dark:text-marca-100 dark:hover:bg-marca-900'
                    : 'border-stone-300 bg-white font-semibold hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-900 dark:hover:bg-stone-800'
                "
                :aria-label="`Fase ${numero}${estado(grupo.id, numero).melhor !== null ? `, vencida em ${estado(grupo.id, numero).melhor} passos` : ''}`"
              >
                <span class="flex items-center gap-1 text-base font-semibold">
                  <Check
                    v-if="estado(grupo.id, numero).melhor !== null"
                    class="size-4"
                    aria-hidden="true"
                  />
                  {{ numero }}
                </span>
                <span
                  v-if="estado(grupo.id, numero).senha"
                  class="font-mono text-xs tracking-wider opacity-70"
                  aria-hidden="true"
                >
                  {{ estado(grupo.id, numero).senha }}
                </span>
              </NuxtLink>
            </template>
            <span
              v-else
              class="flex h-16 items-center justify-center gap-1 rounded-botao border border-dashed border-stone-300 text-sm text-stone-400 dark:border-stone-700 dark:text-stone-500"
              :aria-label="`Fase ${numero}, fechada`"
            >
              <Lock class="size-4" aria-hidden="true" />
              {{ numero }}
            </span>
          </li>
        </ol>
      </BaseSecao>
    </template>
  </div>
</template>
