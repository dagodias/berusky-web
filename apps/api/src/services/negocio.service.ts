/** As regras do negócio (aqui, o jogo). A rota chama; quem decide é o service. */
import type { Negocio } from '@projeto/shared'
import { negocio } from '../config/negocio.js'

/** O que quem visita vê: o nome do jogo, a frase e os links. */
export function negocioPublico(): Negocio {
  return negocio
}
