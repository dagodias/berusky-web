import { NegocioSchema } from '@projeto/shared'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { guard } from '../lib/guard.js'
import { LEITURA } from '../lib/limites.js'
import { negocioPublico } from '../services/negocio.service.js'

export const negocioRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/negocio',
    {
      preHandler: guard({ publica: true }),
      config: LEITURA,
      schema: {
        tags: ['negócio'],
        summary: 'Os dados do jogo: o nome, a frase e os links (o código-fonte e o original)',
        response: { 200: NegocioSchema },
      },
    },
    async () => negocioPublico(),
  )
}
