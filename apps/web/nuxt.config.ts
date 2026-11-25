import { execSync } from 'node:child_process'
import tailwindcss from '@tailwindcss/vite'

/**
 * O commit do código que vai no build: a página Sobre mostra e leva até ele (a GPL pede que quem joga chegue ao
 * código exato do que está no ar). Sem o Git, fica vazio.
 */
function commitDoCodigo(): string {
  try {
    return execSync('git rev-parse HEAD', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
  } catch {
    return ''
  }
}

// Os cabeçalhos de segurança das páginas (e os das privadas) moram no server/middleware/seguranca.ts.
export default defineNuxtConfig({
  compatibilityDate: '2026-11-01',
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],
  vite: { plugins: [tailwindcss()] },
  // A API roda na porta 3333 da mesma máquina, no computador e no servidor.
  // O Nuxt repassa /api para ela: o navegador vê um endereço só (o mesmo papel do nginx no servidor).
  routeRules: {
    '/api/**': { proxy: 'http://127.0.0.1:3333/api/**' },
  },
  // Na página montada no servidor, o $api fala direto com a API, sem dar a volta pelo /api.
  runtimeConfig: {
    apiInterna: 'http://127.0.0.1:3333',
    public: { commitDoCodigo: commitDoCodigo() },
  },
  app: {
    head: {
      htmlAttrs: { lang: 'pt-BR' },
      // O ícone da aba e o do atalho na tela do celular: troque os arquivos em public/ pelos seus.
      link: [
        { rel: 'icon', href: '/favicon.ico', sizes: '32x32' },
        { rel: 'icon', href: '/icone.svg', type: 'image/svg+xml' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      ],
      // A cor da barra do navegador no celular, no claro e no escuro.
      meta: [
        { name: 'theme-color', content: '#ffffff', media: '(prefers-color-scheme: light)' },
        { name: 'theme-color', content: '#0c0a09', media: '(prefers-color-scheme: dark)' },
      ],
    },
  },
})
