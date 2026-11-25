import { ErroSchema, FaseSchema, GrupoIdSchema, GrupoSchema } from '@projeto/shared'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { guard } from '../lib/guard.js'
import { buscarFase, listarGrupos } from '../services/fases.service.js'

/**
 * As rotas de leitura das fases. Cada página do jogo pede a fase dela (no servidor e, ao trocar de fase, no
 * navegador): o limite aqui é maior que o geral, que fica para as rotas que mudam alguma coisa.
 */
const LEITURA = { rateLimit: { max: 600, timeWindow: '1 minute' } }

export const fasesRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/fases',
    {
      preHandler: guard({ publica: true }),
      config: LEITURA,
      schema: {
        tags: ['fases'],
        summary: 'Os cinco grupos de fases, do treino ao impossível, com quantas fases cada um tem',
        response: { 200: z.array(GrupoSchema) },
      },
    },
    async () => listarGrupos(),
  )

  app.get(
    '/fases/:grupo/:numero',
    {
      preHandler: guard({ publica: true }),
      config: LEITURA,
      schema: {
        tags: ['fases'],
        summary:
          'Uma fase: o piso, os itens, os besouros e a dica (a senha só vem quando a anterior é vencida)',
        params: z.object({ grupo: GrupoIdSchema, numero: z.coerce.number().int().min(1).max(99) }),
        response: { 200: FaseSchema, 404: ErroSchema },
      },
    },
    async (request, reply) => {
      const fase = buscarFase(request.params.grupo, request.params.numero)
      if (!fase) return reply.code(404).send({ erro: 'fase_nao_encontrada' })
      return fase
    },
  )
}
