/**
 * O contrato: o formato dos dados que a frente e a API trocam.
 * Os dois lados importam daqui, então uma mudança vale para os dois.
 */
import { z } from 'zod'

/** Um link do site: o nome que aparece e o endereço completo, só http ou https. */
export const LinkSchema = z.object({
  nome: z.string().min(1),
  endereco: z.httpUrl(),
})

/**
 * O "negócio", neste projeto, é o próprio jogo: o nome, a frase e os links (o código-fonte, que a GPL pede que
 * esteja ao alcance de quem joga, e o jogo original).
 */
export const NegocioSchema = z.object({
  nome: z.string().min(1),
  frase: z.string(),
  /** O e-mail de contato, se houver. */
  email: z.email().optional(),
  links: z.array(LinkSchema),
})

export type Link = z.infer<typeof LinkSchema>
export type Negocio = z.infer<typeof NegocioSchema>

/*
 * As fases do Berusky. A grade tem 32 casas de largura e 21 de altura, como no original; a posição de uma casa na
 * lista é y * 32 + x.
 */
export const LARGURA = 32
export const ALTURA = 21

/** Os cinco grupos de fases do original, na ordem dele (s0.dat a s4.dat). */
export const GRUPOS = [
  { id: 'treino', nome: 'Treino' },
  { id: 'facil', nome: 'Fácil' },
  { id: 'intermediario', nome: 'Intermediário' },
  { id: 'avancado', nome: 'Avançado' },
  { id: 'impossivel', nome: 'Impossível' },
] as const

export const GrupoIdSchema = z.enum(['treino', 'facil', 'intermediario', 'avancado', 'impossivel'])

/** Um grupo, como a lista de grupos mostra: o nome e quantas fases ele tem. */
export const GrupoSchema = z.object({
  id: GrupoIdSchema,
  nome: z.string().min(1),
  totalDeFases: z.number().int().positive(),
})

/** Um número inteiro que cabe na grade: de 0 a 31 no x e de 0 a 20 no y. */
const Inteiro = z.number().int().nonnegative()

/**
 * Uma fase, como o motor do jogo recebe.
 * - piso: uma letra por casa (672), "." sem piso e de "0" a "9" o desenho do piso no original.
 * - itens: [x, y, item, variação], só as casas com item. O item é o número do original (8 é a parede, 6 a caixa...),
 *   e a variação 1 numa porta quer dizer o estilo "cyber", que muda o que a porta vira ao abrir.
 * - besouros: [número de 1 a 5, x, y, para onde olha de 0 a 3].
 */
export const FaseSchema = z.object({
  grupo: GrupoIdSchema,
  numero: z.number().int().positive(),
  totalDoGrupo: z.number().int().positive(),
  /** O fundo do original (0 ou 1): vira o tema de cores da fase. */
  fundo: Inteiro,
  piso: z
    .string()
    .length(LARGURA * ALTURA)
    .regex(/^[.0-9]+$/),
  itens: z.array(z.array(Inteiro).length(4)),
  besouros: z.array(z.array(Inteiro).length(4)).min(1).max(5),
  /** A dica da fase, em português (a do original foi traduzida); null enquanto não houver tradução. */
  dica: z.string().nullable(),
})

export type GrupoId = z.infer<typeof GrupoIdSchema>
export type Grupo = z.infer<typeof GrupoSchema>
export type Fase = z.infer<typeof FaseSchema>

/** O corpo das respostas de erro da API: um código curto, em português, sem acento. */
export const ErroSchema = z.object({ erro: z.string().min(1) })
export type Erro = z.infer<typeof ErroSchema>
