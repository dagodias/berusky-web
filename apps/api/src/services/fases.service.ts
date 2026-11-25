/**
 * As fases: a lista dos grupos e cada fase como o motor do jogo recebe. As senhas e o texto do original ficam aqui
 * dentro: a API só entrega a senha de uma fase quando a fase anterior foi vencida (a conclusão).
 */
import { type Fase, type Grupo, type GrupoId } from '@projeto/shared'
import { fases } from '../config/fases.js'

export function listarGrupos(): Grupo[] {
  return fases.grupos.map((grupo) => ({
    id: grupo.id,
    nome: grupo.nome,
    totalDeFases: grupo.fases.length,
  }))
}

/** A fase (numero começa em 1), sem a senha; null se ela não existe. */
export function buscarFase(grupo: GrupoId, numero: number): Fase | null {
  const doGrupo = fases.grupos.find((g) => g.id === grupo)
  const fase = doGrupo?.fases[numero - 1]
  if (!doGrupo || !fase) return null
  return {
    grupo,
    numero,
    totalDoGrupo: doGrupo.fases.length,
    fundo: fase.fundo,
    piso: fase.piso,
    itens: fase.itens,
    besouros: fase.besouros,
    dica: fase.dica,
  }
}
