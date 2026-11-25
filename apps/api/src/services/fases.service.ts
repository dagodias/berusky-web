/**
 * As fases: a lista dos grupos e cada fase como o motor do jogo recebe. As senhas e o texto do original ficam aqui
 * dentro: a API só entrega a senha de uma fase quando a anterior foi vencida (a conclusão, conferida pelo motor).
 */
import { reproduzir } from '@projeto/jogo'
import type { Conclusao, EnderecoDeFase, Fase, Grupo, GrupoId } from '@projeto/shared'
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

export type ResultadoDaConclusao =
  { tipo: 'venceu'; conclusao: Conclusao } | { tipo: 'nao-existe' } | { tipo: 'nao-venceu' }

/**
 * Confere a vitória: reproduz as jogadas com o mesmo motor da tela. Só a fase vencida de verdade dá a senha da
 * próxima (e, na última do grupo, o texto do fim).
 */
export function concluirFase(
  grupo: GrupoId,
  numero: number,
  jogadas: string,
): ResultadoDaConclusao {
  const fase = buscarFase(grupo, numero)
  const doGrupo = fases.grupos.find((g) => g.id === grupo)
  if (!fase || !doGrupo) return { tipo: 'nao-existe' }

  const partida = reproduzir(fase, jogadas)
  if (!partida.valida || !partida.venceu) return { tipo: 'nao-venceu' }

  const seguinte = doGrupo.fases[numero]
  return {
    tipo: 'venceu',
    conclusao: {
      passos: partida.passos,
      proxima: seguinte ? { grupo, numero: numero + 1, senha: seguinte.senha } : null,
      textoDoFim: seguinte ? null : doGrupo.textoDoFim,
    },
  }
}

/** A fase de uma senha (maiúscula e minúscula valem igual, como no original); null se nenhuma tem essa senha. */
export function buscarPorSenha(senha: string): EnderecoDeFase | null {
  const procurada = senha.trim().toLowerCase()
  for (const grupo of fases.grupos) {
    const indice = grupo.fases.findIndex((fase) => fase.senha === procurada)
    if (indice >= 0) return { grupo: grupo.id, numero: indice + 1 }
  }
  return null
}
