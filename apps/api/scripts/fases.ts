/**
 * O conversor das fases: lê os arquivos do Berusky original (apps/api/dados/berusky-data-1.7) e gera
 * src/config/fases.json, o que a API serve. Rode com: pnpm --filter @projeto/api fases
 *
 * O formato .lv3 vem do level_game.h do original (LEVEL_DISK): 30 bytes de assinatura, o fundo, a música, a rotação de
 * cada besouro, 100 bytes reservados e três camadas de 21 x 32 casas (o piso e os itens com 10 palavras por casa, os
 * besouros com uma), em palavras de 16 bits little-endian. As regras de leitura copiam o level_import do original.
 *
 * Partes portadas do Berusky 1.7.2, (C) 1997-2020 AnakreoN, sob a GPL versão 2 ou mais nova.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { ALTURA, GRUPOS, LARGURA } from '@projeto/shared'
import type { ArquivoDeFases } from '../src/config/fases.js'

/** O que o conversor precisa dos originais. Só o lerOriginais toca no disco: o converter é uma função pura. */
export type Originais = {
  /** O texto de s0.dat a s4.dat, na ordem dos grupos. */
  conjuntos: string[]
  /** Os bytes de cada .lv3, pelo nome do arquivo. */
  fases: Map<string, Uint8Array>
  /** O hints.dat e os textos do fim de cada grupo (end0.dat a end4.dat), em inglês. */
  dicas: string
  fins: string[]
  /** A tradução (dicas.pt.txt), se já existir. */
  traducao: string | null
}

const TAMANHO = 28361
const ASSINATURA = 'Level 3 (C) Anakreon 1999'
const PISO = 137
const ITENS = 13577
const BESOUROS = 27017
const SEM_BESOURO = 0xffff
/** GAME_ITEMS do original: os itens vão de 0 a 72. */
const ITENS_DO_JOGO = 73
const PAREDE = 8

/** As portas que se atravessam na horizontal (os batentes ficam em cima e embaixo) e na vertical (dos lados). */
const PORTAS_H = [...faixa(18, 27), ...faixa(38, 47), 58, 59, 62]
const PORTAS_V = [...faixa(28, 37), ...faixa(48, 57), 60, 61, 63]

function faixa(de: number, ate: number): number[] {
  return Array.from({ length: ate - de + 1 }, (_, i) => de + i)
}

/** O conjunto (s0.dat...): linhas alternadas com o arquivo da fase e a senha; linha vazia e "#" ficam de fora. */
export function lerConjunto(texto: string): Array<{ arquivo: string; senha: string }> {
  const linhas = texto
    .split('\n')
    .map((linha) => linha.trim())
    .filter((linha) => linha && !linha.startsWith('#'))
  if (linhas.length % 2)
    throw new Error('O conjunto precisa de pares de linhas: o arquivo e a senha.')
  const fases: Array<{ arquivo: string; senha: string }> = []
  for (let i = 0; i < linhas.length; i += 2) {
    fases.push({ arquivo: linhas[i] ?? '', senha: linhas[i + 1] ?? '' })
  }
  return fases
}

/** Uma fase .lv3: o fundo, o piso, os itens e os besouros, conferidos. */
export function lerFase(arquivo: string, bytes: Uint8Array) {
  if (bytes.length !== TAMANHO)
    throw new Error(`${arquivo}: tem ${bytes.length} bytes, e não ${TAMANHO}.`)
  const dados = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const assinatura = new TextDecoder('latin1').decode(bytes.subarray(0, 30)).split('\0')[0]
  if (assinatura !== ASSINATURA) throw new Error(`${arquivo}: a assinatura não é a do Berusky.`)
  const palavra = (deslocamento: number) => dados.getUint16(deslocamento, true)
  const casa = (base: number, x: number, y: number, k: number) =>
    base + 2 * ((y * LARGURA + x) * 10 + k)

  const fundo = bytes[30] ?? 0
  let piso = ''
  const itens: number[][] = []
  const besouros: number[][] = []
  for (let y = 0; y < ALTURA; y++) {
    for (let x = 0; x < LARGURA; x++) {
      // O piso: 0 é chão (com o desenho na palavra 1); qualquer outro valor é casa sem piso (level_import).
      if (palavra(casa(PISO, x, y, 0)) === 0) {
        const desenho = palavra(casa(PISO, x, y, 1))
        if (desenho > 9)
          throw new Error(`${arquivo}: o piso em ${x},${y} tem o desenho ${desenho}.`)
        piso += String(desenho)
      } else {
        piso += '.'
      }

      // O item: 0 é casa vazia; os besouros (1 a 5) moram na camada deles, nunca aqui.
      const item = palavra(casa(ITENS, x, y, 0))
      if (item !== 0) {
        if (item < 6 || item >= ITENS_DO_JOGO) {
          throw new Error(`${arquivo}: o item ${item} em ${x},${y} não existe no jogo.`)
        }
        itens.push([x, y, item, palavra(casa(ITENS, x, y, 1))])
      }

      const besouro = palavra(BESOUROS + 2 * (y * LARGURA + x))
      if (besouro !== SEM_BESOURO) {
        if (besouro > 4)
          throw new Error(`${arquivo}: o besouro ${besouro} em ${x},${y} não existe.`)
        // A rotação de cada besouro mora no cabeçalho (rot[5]).
        besouros.push([besouro + 1, x, y, bytes[32 + besouro] ?? 0])
      }
    }
  }
  besouros.sort((a, b) => (a[0] ?? 0) - (b[0] ?? 0))
  const numeros = besouros.map((b) => b[0])
  if (new Set(numeros).size !== numeros.length)
    throw new Error(`${arquivo}: um besouro aparece duas vezes.`)
  conferirBatentes(arquivo, itens)
  return { fundo, piso, itens, besouros }
}

/**
 * Os batentes: no original, cada porta põe dois batentes (que funcionam como parede) nas casas do lado dela, ao
 * carregar e a cada vez que abre ou fecha (cell_subitems_reset). Em todas as fases essas casas já são parede, então o
 * motor pode tratar os batentes como a parede que já está lá. Se uma fase nova quebrar isso, o conversor avisa.
 */
function conferirBatentes(arquivo: string, itens: number[][]) {
  const naCasa = new Map(itens.map(([x, y, item]) => [`${x},${y}`, item]))
  for (const [x = 0, y = 0, item = 0] of itens) {
    const lados = PORTAS_H.includes(item)
      ? [
          [0, -1],
          [0, 1],
        ]
      : PORTAS_V.includes(item)
        ? [
            [-1, 0],
            [1, 0],
          ]
        : []
    for (const [dx = 0, dy = 0] of lados) {
      if (naCasa.get(`${x + dx},${y + dy}`) !== PAREDE) {
        throw new Error(
          `${arquivo}: o batente da porta em ${x},${y} cai em ${x + dx},${y + dy}, que não é parede.`,
        )
      }
    }
  }
}

/**
 * Os textos marcados (hints.dat e dicas.pt.txt): "~1_1" abre a dica da fase 1 do grupo 1, e "~" sozinho fecha o
 * arquivo. As linhas seguidas viram um parágrafo; a linha vazia separa os parágrafos.
 */
export function lerTextosMarcados(texto: string): Map<string, string> {
  const textos = new Map<string, string>()
  let marca: string | null = null
  let linhas: string[] = []
  const fechar = () => {
    if (marca) textos.set(marca, paragrafos(linhas))
    linhas = []
  }
  for (const linha of texto.split('\n')) {
    if (linha.startsWith('~')) {
      fechar()
      marca = linha.slice(1).trim() || null
    } else if (marca) {
      linhas.push(linha)
    }
  }
  fechar()
  return textos
}

/** Junta as linhas quebradas do original (a tela tinha 640 pontos de largura) em parágrafos. */
export function paragrafos(linhas: string[]): string {
  const blocos: string[] = []
  let atual: string[] = []
  for (const linha of linhas) {
    const limpa = linha.trim()
    if (limpa) {
      atual.push(limpa)
    } else if (atual.length) {
      blocos.push(atual.join(' '))
      atual = []
    }
  }
  if (atual.length) blocos.push(atual.join(' '))
  return blocos.join('\n\n')
}

/** Os originais viram o arquivo de fases que a API serve. */
export function converter(originais: Originais): ArquivoDeFases {
  const dicas = lerTextosMarcados(originais.dicas)
  const traducao = originais.traducao
    ? lerTextosMarcados(originais.traducao)
    : new Map<string, string>()

  const grupos = GRUPOS.map((grupo, g) => {
    const conjunto = lerConjunto(originais.conjuntos[g] ?? '')
    const fases = conjunto.map(({ arquivo, senha }, n) => {
      const bytes = originais.fases.get(arquivo)
      if (!bytes) throw new Error(`Falta a fase ${arquivo}.`)
      const marca = `${g + 1}_${n + 1}`
      const dicaOriginal = dicas.get(marca)
      if (!dicaOriginal) throw new Error(`Falta a dica ${marca} no hints.dat.`)
      return {
        arquivo,
        senha,
        ...lerFase(arquivo, bytes),
        dica: traducao.get(marca) ?? null,
        dicaOriginal,
      }
    })
    return {
      id: grupo.id,
      nome: grupo.nome,
      fases,
      textoDoFim: traducao.get(`fim_${g + 1}`) ?? null,
      textoDoFimOriginal: paragrafos((originais.fins[g] ?? '').split('\n')),
    }
  })

  return { origem: 'berusky-data 1.7 (AnakreoN, GPL-2.0-or-later)', grupos }
}

/** Lê os originais da pasta (e a tradução, se existir). */
export function lerOriginais(pasta: string, arquivoDaTraducao: string): Originais {
  const ler = (...partes: string[]) => readFileSync(join(pasta, ...partes), 'latin1')
  const fases = new Map<string, Uint8Array>()
  for (const arquivo of readdirSync(join(pasta, 'Levels'))) {
    if (arquivo.endsWith('.lv3')) fases.set(arquivo, readFileSync(join(pasta, 'Levels', arquivo)))
  }
  return {
    conjuntos: GRUPOS.map((_, g) => ler('GameData', `s${g}.dat`)),
    fases,
    dicas: ler('GameData', 'hints.dat'),
    fins: GRUPOS.map((_, g) => ler('GameData', `end${g}.dat`)),
    traducao: existsSync(arquivoDaTraducao) ? readFileSync(arquivoDaTraducao, 'utf8') : null,
  }
}

/**
 * O JSON, estável e enxuto: cada fase numa linha só para os números (o arquivo é gerado; ninguém edita à mão), e o
 * resto com recuo, para a diferença entre duas versões ficar legível.
 */
export function formatar(arquivo: ArquivoDeFases): string {
  const texto = JSON.stringify(arquivo, null, 2)
  // Junta numa linha as listas só de números e as listas de listas de números.
  const juntar = (trecho: string) => trecho.replace(/\s+/g, '')
  return (
    texto.replace(/\[(\s*\[[\d,\s]*\]\s*,?)+\s*\]/g, juntar).replace(/\[[\d,\s]+\]/g, juntar) + '\n'
  )
}

export const PASTA_DOS_ORIGINAIS = fileURLToPath(
  new URL('../dados/berusky-data-1.7', import.meta.url),
)
export const ARQUIVO_DA_TRADUCAO = fileURLToPath(new URL('../dados/dicas.pt.txt', import.meta.url))
export const ARQUIVO_DAS_FASES = fileURLToPath(new URL('../src/config/fases.json', import.meta.url))

// Rodado direto (pnpm --filter @projeto/api fases): gera o fases.json.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const arquivo = converter(lerOriginais(PASTA_DOS_ORIGINAIS, ARQUIVO_DA_TRADUCAO))
  writeFileSync(ARQUIVO_DAS_FASES, formatar(arquivo))
  const total = arquivo.grupos.reduce((soma, grupo) => soma + grupo.fases.length, 0)
  console.log(`${total} fases gravadas em ${join(dirname(ARQUIVO_DAS_FASES), 'fases.json')}`)
}
