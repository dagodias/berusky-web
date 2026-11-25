/** O mapa de fases e a senha: os grupos, as fases fechadas e abertas, e a senha que abre a fase. */
import { expect, test } from '@playwright/test'

test('o mapa mostra os cinco grupos, com a primeira fase de cada um aberta', async ({ page }) => {
  await page.goto('/fases')
  for (const grupo of ['Treino', 'Fácil', 'Intermediário', 'Avançado', 'Impossível']) {
    await expect(page.getByRole('heading', { name: grupo, level: 2 })).toBeVisible()
  }
  const treino = page.getByRole('list', { name: 'As fases do grupo Treino' })
  await expect(treino.getByRole('link', { name: 'Fase 1', exact: true })).toBeVisible()
  await expect(treino.getByLabel('Fase 2, fechada')).toBeVisible()
})

test('a senha certa abre a fase e leva até ela; a errada avisa', async ({ page }) => {
  await page.goto('/fases')
  const campo = page.getByLabel('Tenho uma senha')
  // O formulário só responde depois que o Vue assume a página.
  await expect(async () => {
    await campo.fill('zzzzz')
    await page.getByRole('button', { name: 'Abrir', exact: true }).click()
    await expect(page.getByRole('alert')).toHaveText('Essa senha não abre nenhuma fase.', {
      timeout: 1000,
    })
  }).toPass()

  await campo.fill('IROJA')
  await page.getByRole('button', { name: 'Abrir', exact: true }).click()
  await expect(page).toHaveURL(/\/fases\/treino\/2$/)
  await expect(page.locator('[data-pronto]')).toBeVisible()

  await page.goto('/fases')
  const treino = page.getByRole('list', { name: 'As fases do grupo Treino' })
  await expect(treino.getByRole('link', { name: 'Fase 2', exact: true })).toBeVisible()
})
