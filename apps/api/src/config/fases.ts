/**
 * As 120 fases do Berusky original, com as senhas e as dicas. O fases.json é gerado pelo conversor
 * (scripts/fases.ts, com pnpm --filter @projeto/api fases) a partir de dados/berusky-data-1.7: nunca se edita à mão.
 */
import type { GrupoId } from '@projeto/shared'
import dados from './fases.json' with { type: 'json' }

export type FaseDoArquivo = {
  arquivo: string
  senha: string
  fundo: number
  piso: string
  itens: number[][]
  besouros: number[][]
  /** A dica em português, ou null enquanto não houver tradução (dados/dicas.pt.txt). */
  dica: string | null
  /** A dica do original, em inglês: a referência da tradução. */
  dicaOriginal: string
}

export type GrupoDoArquivo = {
  id: GrupoId
  nome: string
  fases: FaseDoArquivo[]
  textoDoFim: string | null
  textoDoFimOriginal: string
}

export type ArquivoDeFases = { origem: string; grupos: GrupoDoArquivo[] }

export const fases = dados as ArquivoDeFases
