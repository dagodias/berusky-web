import {
  ConclusaoEntradaSchema,
  ConclusaoSchema,
  EnderecoDeFaseSchema,
  ErroSchema,
  FaseSchema,
  GrupoIdSchema,
  GrupoSchema,
  SenhaEntradaSchema,
} from '@projeto/shared'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { guard } from '../lib/guard.js'
import { LEITURA } from '../lib/limites.js'
import {
  buscarFase,
  buscarPorSenha,
  concluirFase,
  listarGrupos,
} from '../services/fases.service.js'

/** As fases: as leituras (com o limite de leitura, lib/limites.ts), a conclusão e a senha (com o limite geral). */

const EnderecoSchema = z.object({
  grupo: GrupoIdSchema,
  numero: z.coerce.number().int().min(1).max(99),
})

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
        params: EnderecoSchema,
        response: { 200: FaseSchema, 404: ErroSchema },
      },
    },
    async (request, reply) => {
      const fase = buscarFase(request.params.grupo, request.params.numero)
      if (!fase) return reply.code(404).send({ erro: 'fase_nao_encontrada' })
      return fase
    },
  )

  app.post(
    '/fases/:grupo/:numero/conclusao',
    {
      preHandler: guard({ publica: true }),
      schema: {
        tags: ['fases'],
        summary:
          'Confere a vitória: a API refaz as jogadas com o mesmo motor e devolve a senha da próxima fase',
        params: EnderecoSchema,
        body: ConclusaoEntradaSchema,
        response: { 200: ConclusaoSchema, 404: ErroSchema, 422: ErroSchema },
      },
    },
    async (request, reply) => {
      const { grupo, numero } = request.params
      const resultado = concluirFase(grupo, numero, request.body.jogadas)
      if (resultado.tipo === 'nao-existe')
        return reply.code(404).send({ erro: 'fase_nao_encontrada' })
      if (resultado.tipo === 'nao-venceu') return reply.code(422).send({ erro: 'fase_nao_vencida' })
      return resultado.conclusao
    },
  )

  app.post(
    '/senhas',
    {
      preHandler: guard({ publica: true }),
      schema: {
        tags: ['fases'],
        summary: 'A fase de uma senha de cinco letras (as senhas do original)',
        body: SenhaEntradaSchema,
        response: { 200: EnderecoDeFaseSchema, 404: ErroSchema },
      },
    },
    async (request, reply) => {
      const fase = buscarPorSenha(request.body.senha)
      if (!fase) return reply.code(404).send({ erro: 'senha_desconhecida' })
      return fase
    },
  )
}
