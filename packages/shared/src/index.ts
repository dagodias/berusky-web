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

/*
 * A partida: o registro de jogadas que a tela manda para a API conferir a vitória. Uma letra por ação: U, D, L e R
 * os passos (até os bloqueados, que podem fechar porta), de 1 a 5 a troca de besouro, G guardar e V voltar.
 */
export const MAXIMO_DE_JOGADAS = 50_000
export const JogadasSchema = z
  .string()
  .min(1)
  .max(MAXIMO_DE_JOGADAS)
  .regex(/^[UDLR1-5GV]+$/)

export const ConclusaoEntradaSchema = z.object({ jogadas: JogadasSchema })

/** Uma fase de um grupo: o endereço dela no jogo. */
export const EnderecoDeFaseSchema = z.object({
  grupo: GrupoIdSchema,
  numero: z.number().int().positive(),
})

/** O que a API devolve quando confere a vitória. */
export const ConclusaoSchema = z.object({
  /** Os passos da partida, contados de novo pela API. */
  passos: z.number().int().nonnegative(),
  /** A próxima fase do grupo, com a senha dela; null quando o grupo acabou. */
  proxima: EnderecoDeFaseSchema.extend({ senha: z.string().regex(/^[a-z]{5}$/) }).nullable(),
  /** Quando a fase vencida era a última do grupo: o texto do fim dele (o do original, traduzido). */
  textoDoFim: z.string().nullable(),
})

/** A senha de cinco letras de uma fase (como no original: maiúscula e minúscula valem igual). */
export const SenhaEntradaSchema = z.object({ senha: z.string().trim().regex(/^[A-Za-z]{5}$/) })

/*
 * O progresso de quem joga, guardado só no navegador (localStorage). As chaves são "grupo-numero" (treino-1).
 */
export const ProgressoSchema = z.object({
  versao: z.literal(1),
  /** A fase mais adiantada aberta em cada grupo (a primeira de cada grupo está sempre aberta). */
  abertas: z.partialRecord(GrupoIdSchema, z.number().int().positive()),
  /** As fases vencidas, com o menor número de passos de cada uma. */
  vencidas: z.record(z.string(), z.number().int().nonnegative()),
  /** As senhas que a pessoa já recebeu. */
  senhas: z.record(z.string(), z.string()),
})

export type ConclusaoEntrada = z.infer<typeof ConclusaoEntradaSchema>
export type Conclusao = z.infer<typeof ConclusaoSchema>
export type EnderecoDeFase = z.infer<typeof EnderecoDeFaseSchema>
export type Progresso = z.infer<typeof ProgressoSchema>
