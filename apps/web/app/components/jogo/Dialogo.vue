<script setup lang="ts">
/**
 * Uma janela por cima da partida (o <dialog> do navegador): prende o foco dentro dela, fecha com Esc e devolve o
 * foco para onde estava. O conteúdo e os botões vêm pelos slots.
 */
const aberto = defineModel<boolean>('aberto', { required: true })
defineProps<{ titulo: string }>()

const janela = ref<HTMLDialogElement>()

watch(
  aberto,
  (abrir) => {
    const elemento = janela.value
    if (!elemento) return
    if (abrir && !elemento.open) elemento.showModal()
    if (!abrir && elemento.open) elemento.close()
  },
  { flush: 'post' },
)

onMounted(() => {
  if (aberto.value) janela.value?.showModal()
})
</script>

<template>
  <dialog
    ref="janela"
    class="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-cartao bg-white p-0 text-stone-900 shadow-2xl backdrop:bg-stone-950/60 backdrop:backdrop-blur-sm dark:bg-stone-900 dark:text-stone-100"
    :aria-label="titulo"
    @close="aberto = false"
  >
    <div class="max-h-[80dvh] overflow-y-auto p-6">
      <h2 class="text-xl font-semibold tracking-tight">{{ titulo }}</h2>
      <div class="mt-3 text-stone-700 dark:text-stone-300">
        <slot />
      </div>
      <div v-if="$slots.acoes" class="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <slot name="acoes" />
      </div>
    </div>
  </dialog>
</template>
