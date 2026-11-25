/**
 * O progresso de quem joga, guardado só no navegador (localStorage, na chave com a versão). Como no original, cada
 * grupo abre a próxima fase quando a fase mais adiantada é vencida; a senha de uma fase também abre ela (em outro
 * aparelho, por exemplo). As funções aqui não tocam no navegador: o useProgresso lê e grava.
 */
import {
  type EnderecoDeFase,
  type Grupo,
  type GrupoId,
  type Progresso,
  ProgressoSchema,
} from '@projeto/shared'

export const CHAVE_DO_PROGRESSO = 'berusky:progresso:v1'

export function progressoVazio(): Progresso {
  return { versao: 1, abertas: {}, vencidas: {}, senhas: {} }
}

/** Lê o progresso guardado; o que vier quebrado ou de outra versão vira progresso vazio. */
export function lerProgresso(texto: string | null): Progresso {
  if (!texto) return progressoVazio()
  try {
    const lido = ProgressoSchema.safeParse(JSON.parse(texto))
    return lido.success ? lido.data : progressoVazio()
  } catch {
    return progressoVazio()
  }
}

export function nomeDaFase(grupo: GrupoId, numero: number): string {
  return `${grupo}-${numero}`
}

/** A fase mais adiantada aberta do grupo (a primeira está sempre aberta). */
export function ultimaAberta(progresso: Progresso, grupo: GrupoId): number {
  return Math.max(1, progresso.abertas[grupo] ?? 1)
}

export function faseAberta(progresso: Progresso, grupo: GrupoId, numero: number): boolean {
  return numero >= 1 && numero <= ultimaAberta(progresso, grupo)
}

export function melhorDaFase(progresso: Progresso, grupo: GrupoId, numero: number): number | null {
  return progresso.vencidas[nomeDaFase(grupo, numero)] ?? null
}

/** Abre uma fase (a senha, ou a próxima de uma vitória): a mais adiantada do grupo nunca volta para trás. */
export function abrirFase(
  progresso: Progresso,
  grupo: GrupoId,
  numero: number,
  senha?: string,
): Progresso {
  return {
    ...progresso,
    abertas: { ...progresso.abertas, [grupo]: Math.max(ultimaAberta(progresso, grupo), numero) },
    senhas: senha ? { ...progresso.senhas, [nomeDaFase(grupo, numero)]: senha } : progresso.senhas,
  }
}

/**
 * Anota a vitória: o menor número de passos e a próxima fase aberta (com a senha, se a API mandou; sem a API, a
 * próxima abre do mesmo jeito, só sem a senha).
 */
export function registrarVitoria(
  progresso: Progresso,
  grupo: GrupoId,
  numero: number,
  passos: number,
  totalDoGrupo: number,
  proxima?: { numero: number; senha: string } | null,
): Progresso {
  const nome = nomeDaFase(grupo, numero)
  const anterior = progresso.vencidas[nome]
  const comVitoria: Progresso = {
    ...progresso,
    vencidas: { ...progresso.vencidas, [nome]: Math.min(anterior ?? passos, passos) },
  }
  if (proxima) return abrirFase(comVitoria, grupo, proxima.numero, proxima.senha)
  return numero < totalDoGrupo ? abrirFase(comVitoria, grupo, numero + 1) : comVitoria
}

/** Onde continuar: a fase mais adiantada ainda não vencida, no primeiro grupo que tem uma. */
export function ondeContinuar(progresso: Progresso, grupos: Grupo[]): EnderecoDeFase | null {
  for (const grupo of grupos) {
    const numero = ultimaAberta(progresso, grupo.id)
    if (melhorDaFase(progresso, grupo.id, numero) === null) return { grupo: grupo.id, numero }
  }
  return null
}

/** A pessoa já jogou alguma coisa? (para o botão "Continuar" aparecer no lugar de "Jogar"). */
export function jaJogou(progresso: Progresso): boolean {
  return (
    Object.keys(progresso.vencidas).length > 0 ||
    Object.values(progresso.abertas).some((numero) => (numero ?? 1) > 1)
  )
}
