import { defineConfig } from 'tsup'

// O build da API leva os pacotes shared e jogo junto, já que eles são TypeScript puro.
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  platform: 'node',
  target: 'node24',
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  noExternal: ['@projeto/shared', '@projeto/jogo'],
})
