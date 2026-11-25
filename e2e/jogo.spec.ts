/**
 * A partida num navegador de verdade: andar, bater na parede, recomeçar, vencer o treino 1 com a solução achada pelo
 * resolvedor (a API confere e manda a senha da próxima) e o progresso guardado no navegador.
 * Com "menos movimento", a peça pula direto: cada tecla é um passo, sem esperar a animação.
 */
import { expect, type Page, test } from '@playwright/test'
import solucoes from '../apps/api/test/fixtures/solucoes.json' with { type: 'json' }

test.use({ reducedMotion: 'reduce' })

const TECLAS: Record<string, string> = {
  U: 'ArrowUp',
  D: 'ArrowDown',
  L: 'ArrowLeft',
  R: 'ArrowRight',
}

async function abrir(page: Page, caminho: string) {
  await page.goto(caminho)
  // O tabuleiro só aparece no navegador, depois que o Vue assume a página.
  await expect(page.locator('[data-pronto]')).toBeVisible()
}

const passos = (page: Page) => page.locator('[data-passos]')

test('o passo conta, o passo na parede não conta, e o recomeço zera', async ({ page }) => {
  await abrir(page, '/fases/treino/1')
  await page.keyboard.press('ArrowLeft')
  await expect(passos(page)).toHaveText('1')
  await page.keyboard.press('ArrowLeft')
  await expect(passos(page)).toHaveText('1')
  await expect(page.getByRole('status')).toHaveText('Parede.')

  await page.keyboard.press('r')
  const recomeco = page.getByRole('dialog', { name: 'Recomeçar a fase?' })
  await recomeco.getByRole('button', { name: 'Recomeçar' }).click()
  await expect(passos(page)).toHaveText('0')
})

test('vence o treino 1, recebe a senha da fase 2, e a fase 2 fica aberta', async ({ page }) => {
  await abrir(page, '/fases/treino/1')
  for (const letra of solucoes['treino-1']) await page.keyboard.press(TECLAS[letra] ?? '')

  const fim = page.getByRole('dialog', { name: 'Fase vencida!' })
  await expect(fim).toBeVisible()
  await expect(fim.locator('[data-senha]')).toHaveText('iroja')
  await fim.getByRole('link', { name: 'Próxima fase' }).click()
  await expect(page).toHaveURL(/\/fases\/treino\/2$/)
  await expect(page.locator('[data-pronto]')).toBeVisible()

  // O progresso mora no navegador: recarregar não fecha a fase.
  await page.reload()
  await expect(page.locator('[data-pronto]')).toBeVisible()
})

test('a fase fechada pede a anterior ou a senha', async ({ page }) => {
  await page.goto('/fases/treino/5')
  await expect(page.getByText('Esta fase ainda está fechada')).toBeVisible()
  await expect(page.locator('[data-pronto]')).toHaveCount(0)
})

test('a fase que não existe responde 404', async ({ page }) => {
  expect((await page.goto('/fases/treino/99'))?.status()).toBe(404)
  expect((await page.goto('/fases/outro/1'))?.status()).toBe(404)
})

test('a partida cabe na tela, sem rolar para o lado', async ({ page }) => {
  await abrir(page, '/fases/treino/1')
  const sobra = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(sobra).toBe(0)
})

test('no celular, o direcional move a joaninha', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'o direcional é do celular')
  await abrir(page, '/fases/treino/1')
  await page.getByRole('button', { name: 'Para a esquerda' }).click()
  await expect(passos(page)).toHaveText('1')
})
