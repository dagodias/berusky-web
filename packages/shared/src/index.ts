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
