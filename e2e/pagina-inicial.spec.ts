/** A página principal num navegador de verdade: o nome e a frase do jogo vêm da API. */
import { NegocioSchema } from '@projeto/shared'
import { expect, test } from '@playwright/test'

test('mostra o jogo com os dados que vêm da API', async ({ page, request }) => {
  // O mesmo contrato da frente e da API confere a resposta.
  const negocio = NegocioSchema.parse(await (await request.get('/api/negocio')).json())

  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(negocio.nome)
  await expect(page.getByText(negocio.frase).first()).toBeVisible()
  await expect(
    page.getByRole('main').getByRole('link', { name: 'Conheça o jogo' }),
  ).toHaveAttribute('href', '/sobre')
})

test('cabe na tela, sem rolar para o lado', async ({ page }) => {
  await page.goto('/')
  const sobra = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(sobra).toBe(0)
})

test.describe('sem JavaScript, como o robô do Google e a prévia do link compartilhado', () => {
  test.use({ javaScriptEnabled: false })

  test('a página chega pronta do servidor', async ({ page, request }) => {
    const negocio = NegocioSchema.parse(await (await request.get('/api/negocio')).json())

    await page.goto('/')
    await expect(page).toHaveTitle(negocio.nome)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(negocio.nome)
  })
})
