/**
 * As regras do Berusky original, uma por teste, em fases pequenas desenhadas em texto. O nome de cada bloco diz de que
 * ramo do player_move_check (src/game_logic.cpp) a regra vem; a tabela completa está no docs/jogo.md.
 */
import { describe, expect, it } from 'vitest'
import { ESTILO, ITEM, naCor, Partida } from '../src/index.js'
import { tabuleiro } from './tabuleiro.js'

/** O que tem na casa: o item e o besouro. */
function casa(partida: Partida, x: number, y: number) {
  return { item: partida.itemEm(x, y), besouro: partida.besouroEm(x, y) }
}

describe('andar (case NO_ITEM)', () => {
  it('anda para a casa vazia e conta o passo', () => {
    const partida = new Partida(tabuleiro(['1..']))
    const eventos = partida.mover('direita')
    expect(eventos[0]).toMatchObject({ tipo: 'andou', besouro: 1, para: { x: 1, y: 0 } })
    expect(partida.besouroEm(1, 0)).toBe(1)
    expect(partida.passos).toBe(1)
  })

  it('não anda para a parede nem para fora da grade, e o passo não conta', () => {
    const partida = new Partida(tabuleiro(['1#']))
    expect(partida.mover('direita')).toEqual([{ tipo: 'bloqueado', motivo: 'parede' }])
    expect(partida.mover('esquerda')).toEqual([{ tipo: 'bloqueado', motivo: 'borda' }])
    expect(partida.mover('cima')).toEqual([{ tipo: 'bloqueado', motivo: 'borda' }])
    expect(partida.passos).toBe(0)
  })

  it('não anda para cima de outro besouro', () => {
    const partida = new Partida(tabuleiro(['12']))
    expect(partida.mover('direita')).toEqual([{ tipo: 'bloqueado', motivo: 'besouro' }])
  })
})

describe('a caixa (case P_BOX)', () => {
  it('empurra uma caixa para a casa vazia', () => {
    const partida = new Partida(tabuleiro(['1B.']))
    partida.mover('direita')
    expect(casa(partida, 1, 0)).toEqual({ item: ITEM.NENHUM, besouro: 1 })
    expect(partida.itemEm(2, 0)).toBe(ITEM.CAIXA)
    expect(partida.passos).toBe(1)
  })

  it('não empurra contra parede, caixa, besouro, chave nem a borda', () => {
    for (const linha of ['1B#', '1BB.', '1B2', '1Bk', '1BE']) {
      const partida = new Partida(tabuleiro([linha]))
      expect(partida.mover('direita'), linha).toEqual([{ tipo: 'bloqueado', motivo: 'empurrar' }])
    }
    const naBorda = new Partida(tabuleiro(['.'.repeat(30) + '1B']))
    expect(naBorda.mover('direita')).toEqual([{ tipo: 'bloqueado', motivo: 'borda' }])
  })
})

describe('a caixa leve (case P_BOX_LIGHT)', () => {
  it('empurra uma, ou duas em fila', () => {
    const uma = new Partida(tabuleiro(['1L..']))
    uma.mover('direita')
    expect(uma.itemEm(2, 0)).toBe(ITEM.CAIXA_LEVE)

    const duas = new Partida(tabuleiro(['1LL.']))
    duas.mover('direita')
    expect([duas.itemEm(1, 0), duas.itemEm(2, 0), duas.itemEm(3, 0)]).toEqual([
      ITEM.NENHUM,
      ITEM.CAIXA_LEVE,
      ITEM.CAIXA_LEVE,
    ])
    expect(duas.besouroEm(1, 0)).toBe(1)
  })

  it('não empurra três, nem a caixa comum atrás dela', () => {
    for (const linha of ['1LLL.', '1LB.', '1LL#']) {
      const partida = new Partida(tabuleiro([linha]))
      expect(partida.mover('direita'), linha).toEqual([{ tipo: 'bloqueado', motivo: 'empurrar' }])
    }
  })

  it('mania do original: precisa da terceira casa dentro da grade até para empurrar uma', () => {
    const partida = new Partida(tabuleiro(['.'.repeat(29) + '1L.']))
    expect(partida.mover('direita')).toEqual([{ tipo: 'bloqueado', motivo: 'borda' }])
  })
})

describe('o explosivo (case P_TNT)', () => {
  it('anda como a caixa quando a casa de trás está vazia', () => {
    const partida = new Partida(tabuleiro(['1T.']))
    partida.mover('direita')
    expect(partida.itemEm(2, 0)).toBe(ITEM.EXPLOSIVO)
    expect(partida.besouroEm(1, 0)).toBe(1)
  })

  it('explode a caixa de trás: os dois somem, o besouro entra na casa do explosivo e o passo conta', () => {
    for (const caixa of ['B', 'L']) {
      const partida = new Partida(tabuleiro([`1T${caixa}.`]))
      const eventos = partida.mover('direita')
      expect(eventos.map((e) => e.tipo)).toEqual(['andou', 'explodiu', 'detonou'])
      expect([partida.itemEm(1, 0), partida.itemEm(2, 0)]).toEqual([ITEM.NENHUM, ITEM.NENHUM])
      expect(partida.besouroEm(1, 0)).toBe(1)
      expect(partida.passos).toBe(1)
    }
  })

  it('não anda contra parede, outro explosivo nem a borda', () => {
    for (const linha of ['1T#', '1TT.', '1Tk']) {
      const partida = new Partida(tabuleiro([linha]))
      expect(partida.mover('direita'), linha).toEqual([{ tipo: 'bloqueado', motivo: 'empurrar' }])
    }
  })
})

describe('a saída e as chaves (case P_EXIT e P_KEY)', () => {
  it('a saída fica fechada sem as cinco chaves', () => {
    const partida = new Partida(tabuleiro(['1E']))
    expect(partida.mover('direita')).toEqual([{ tipo: 'bloqueado', motivo: 'saida-fechada' }])
    expect(partida.venceu).toBe(false)
  })

  it('as chaves são de todos os besouros; na quinta, a saída se libera e a sexta vira obstáculo', () => {
    const partida = new Partida(tabuleiro(['1kkkkkk']))
    for (let i = 0; i < 4; i++) partida.mover('direita')
    expect(partida.chaves).toBe(4)
    expect(partida.mover('direita').map((e) => e.tipo)).toEqual([
      'andou',
      'pegou',
      'saida-liberada',
    ])
    expect(partida.chaves).toBe(5)
    expect(partida.mover('direita')).toEqual([{ tipo: 'bloqueado', motivo: 'chaves-completas' }])
  })

  it('com as cinco chaves, o besouro vence sem entrar na saída, e esse passo não conta', () => {
    const partida = new Partida(tabuleiro(['kkkkk1E']))
    for (let i = 0; i < 5; i++) partida.mover('esquerda')
    for (let i = 0; i < 5; i++) partida.mover('direita')
    expect(partida.passos).toBe(10)
    expect(partida.mover('direita')).toEqual([{ tipo: 'venceu', besouro: 1 }])
    expect(partida.venceu).toBe(true)
    expect(partida.besouroEm(5, 0)).toBe(1)
    expect(partida.passos).toBe(10)
    expect(partida.mover('esquerda')).toEqual([{ tipo: 'bloqueado', motivo: 'venceu' }])
  })
})

describe('a pedra e a picareta (case P_STONE e P_MATTOCK)', () => {
  it('sem picareta, a pedra não quebra', () => {
    const partida = new Partida(tabuleiro(['1S']))
    expect(partida.mover('direita')).toEqual([{ tipo: 'bloqueado', motivo: 'sem-picareta' }])
  })

  it('cada picareta quebra uma pedra, e é do besouro que a pegou', () => {
    const partida = new Partida(tabuleiro(['2p1SS'], {}))
    partida.mover('esquerda') // o besouro 1 pega a picareta (o ativo é o primeiro da fase)
    expect(partida.besouro(1)?.picaretas).toBe(1)
    partida.mover('direita')
    expect(partida.mover('direita').map((e) => e.tipo)).toEqual(['andou', 'quebrou'])
    expect(partida.besouro(1)?.picaretas).toBe(0)
    expect(partida.mover('direita')).toEqual([{ tipo: 'bloqueado', motivo: 'sem-picareta' }])
  })

  it('um besouro carrega até nove picaretas', () => {
    const partida = new Partida(tabuleiro(['1' + 'p'.repeat(10)]))
    for (let i = 0; i < 9; i++) partida.mover('direita')
    expect(partida.besouro(1)?.picaretas).toBe(9)
    expect(partida.mover('direita')).toEqual([{ tipo: 'bloqueado', motivo: 'picaretas-completas' }])
  })
})

describe('a chave colorida (case P_KEY1 a P_KEY5)', () => {
  it('só o besouro da cor pega, e uma de cada vez', () => {
    const partida = new Partida(tabuleiro(['1bab', '2...']))
    expect(partida.mover('direita')).toEqual([{ tipo: 'bloqueado', motivo: 'chave-de-outra-cor' }])
    partida.trocar(2)
    partida.mover('cima') // o besouro 2 não sobe na casa do besouro 1
    partida.trocar(1)
    expect(partida.besouro(1)?.chavesColoridas).toBe(0)

    const certa = new Partida(tabuleiro(['1aa']))
    certa.mover('direita')
    expect(certa.besouro(1)?.chavesColoridas).toBe(1)
    expect(certa.mover('direita')).toEqual([{ tipo: 'bloqueado', motivo: 'ja-tem-chave-colorida' }])
  })
})

describe('a porta colorida fechada (case P_DOOR*_Z)', () => {
  const horizontal = { D: { item: naCor(ITEM.PORTA_H_FECHADA, 1), variacao: ESTILO.CLASSICO } }

  it('só abre para o besouro da cor, no eixo dela, e gasta a chave colorida', () => {
    const semChave = new Partida(tabuleiro(['1D.'], horizontal))
    expect(semChave.mover('direita')).toEqual([{ tipo: 'bloqueado', motivo: 'sem-chave-colorida' }])

    const outraCor = new Partida(tabuleiro(['2D.'], horizontal))
    expect(outraCor.mover('direita')).toEqual([{ tipo: 'bloqueado', motivo: 'porta-de-outra-cor' }])

    const deLado = new Partida(tabuleiro(['a.', '1.', 'D.'], horizontal))
    deLado.mover('cima')
    deLado.mover('baixo')
    expect(deLado.mover('baixo')).toEqual([{ tipo: 'bloqueado', motivo: 'porta-de-lado' }])

    const certa = new Partida(tabuleiro(['a1D.'], horizontal))
    certa.mover('esquerda')
    certa.mover('direita')
    expect(certa.mover('direita').map((e) => e.tipo)).toEqual(['andou', 'abriu'])
    expect(certa.besouro(1)?.chavesColoridas).toBe(0)
    expect(certa.besouroEm(2, 0)).toBe(1)
  })

  it('a clássica vira chão: depois de aberta, qualquer um passa, por qualquer lado, e a caixa também', () => {
    const partida = new Partida(tabuleiro(['.a1DB.', '...2..'], horizontal))
    partida.mover('esquerda')
    partida.mover('direita')
    partida.mover('direita') // abre a porta e entra nela
    expect(partida.itemEm(3, 0)).toBe(ITEM.NENHUM)
    partida.mover('direita') // empurra a caixa
    partida.mover('esquerda')
    partida.mover('esquerda')
    partida.trocar(2)
    expect(partida.mover('cima')[0]).toMatchObject({ tipo: 'andou', para: { x: 3, y: 0 } })
  })

  it('a cyber vira porta aberta: qualquer besouro passa no eixo, mas a caixa não', () => {
    const cyber = { D: { item: naCor(ITEM.PORTA_H_FECHADA, 1), variacao: ESTILO.CYBER } }
    const partida = new Partida(tabuleiro(['a1D..', '.B...', '.2...'], cyber))
    partida.mover('esquerda')
    partida.mover('direita')
    partida.mover('direita')
    expect(partida.itemEm(2, 0)).toBe(ITEM.PORTA_CYBER_H)
    partida.mover('direita')
    partida.trocar(2)
    partida.mover('cima') // a caixa sobe para o lado da porta
    partida.mover('esquerda')
    partida.mover('cima')
    expect(partida.mover('direita')).toEqual([{ tipo: 'bloqueado', motivo: 'empurrar' }])
  })
})

describe('a porta colorida aberta (case P_DOOR*_O)', () => {
  const aberta = { D: { item: naCor(ITEM.PORTA_V_ABERTA, 3) } }

  it('qualquer besouro passa, só no eixo', () => {
    const deLado = new Partida(tabuleiro(['1D'], aberta))
    expect(deLado.mover('direita')).toEqual([{ tipo: 'bloqueado', motivo: 'porta-de-lado' }])

    const noEixo = new Partida(tabuleiro(['2', 'D', '.'], aberta))
    expect(noEixo.mover('baixo')[0]).toMatchObject({ tipo: 'andou', para: { x: 0, y: 1 } })
    expect(noEixo.mover('baixo')[0]).toMatchObject({ tipo: 'andou', para: { x: 0, y: 2 } })
  })

  it('a caixa não entra nela', () => {
    const partida = new Partida(tabuleiro(['1', 'B', 'D', '.'], aberta))
    expect(partida.mover('baixo')).toEqual([{ tipo: 'bloqueado', motivo: 'empurrar' }])
  })
})

describe('a passagem colorida (case P_ID_DOOR*)', () => {
  const passagem = { P: { item: naCor(ITEM.PASSAGEM_H_FECHADA, 1) } }

  it('só o besouro da cor passa, no eixo; ela abre com ele dentro e fecha quando ele sai', () => {
    const partida = new Partida(tabuleiro(['1P.', '2..'], passagem))
    expect(partida.mover('direita').map((e) => e.tipo)).toEqual(['andou', 'abriu'])
    expect(partida.itemEm(1, 0)).toBe(naCor(ITEM.PASSAGEM_H_ABERTA, 1))
    expect(partida.mover('direita').map((e) => e.tipo)).toEqual(['andou', 'fechou'])
    expect(partida.itemEm(1, 0)).toBe(naCor(ITEM.PASSAGEM_H_FECHADA, 1))

    partida.mover('baixo')
    partida.mover('esquerda')
    expect(partida.mover('cima')).toEqual([{ tipo: 'bloqueado', motivo: 'porta-de-lado' }])
  })

  it('o besouro de outra cor não passa', () => {
    const partida = new Partida(tabuleiro(['2P.'], passagem))
    expect(partida.mover('direita')).toEqual([{ tipo: 'bloqueado', motivo: 'porta-de-outra-cor' }])
  })

  it('mania do original: apertar a seta do eixo fecha a passagem mesmo se o passo for bloqueado', () => {
    const partida = new Partida(tabuleiro(['1P#'], passagem))
    partida.mover('direita')
    const eventos = partida.mover('direita')
    expect(eventos.map((e) => e.tipo)).toEqual(['bloqueado', 'fechou'])
    expect(partida.itemEm(1, 0)).toBe(naCor(ITEM.PASSAGEM_H_FECHADA, 1))
    expect(partida.besouroEm(1, 0)).toBe(1)
    // Fechada, com o besouro dentro: ele ainda sai por onde entrou.
    expect(partida.mover('esquerda')[0]).toMatchObject({ tipo: 'andou' })
  })

  it('na vertical, a passagem fechada com outro besouro dentro não deixa entrar', () => {
    const vertical = { P: { item: naCor(ITEM.PASSAGEM_V_FECHADA, 1) } }
    const partida = new Partida(tabuleiro(['1', 'P', '.'], vertical))
    partida.mover('baixo')
    expect(partida.itemEm(0, 1)).toBe(naCor(ITEM.PASSAGEM_V_ABERTA, 1))
  })
})

describe('a porta de uma passagem só (case P_DV_*)', () => {
  it('qualquer besouro passa, no eixo; ao sair, ela fecha para sempre', () => {
    const umaVez = { U: { item: ITEM.UMA_VEZ_H_ABERTA } }
    const partida = new Partida(tabuleiro(['2U..', '1...'], umaVez))
    partida.trocar(2)
    partida.mover('direita')
    expect(partida.mover('direita').map((e) => e.tipo)).toEqual(['andou', 'fechou'])
    expect(partida.itemEm(1, 0)).toBe(ITEM.UMA_VEZ_H_FECHADA)
    expect(partida.mover('esquerda')).toEqual([{ tipo: 'bloqueado', motivo: 'porta-fechada' }])
  })
})

describe('trocar de besouro (player_switch)', () => {
  it('começa no primeiro besouro da fase e o Tab pula os que não estão nela', () => {
    const partida = new Partida(tabuleiro(['2.4.5']))
    expect(partida.ativo).toBe(2)
    expect(partida.trocar('proximo')).toBe(true)
    expect(partida.ativo).toBe(4)
    partida.trocar('proximo')
    partida.trocar('proximo')
    expect(partida.ativo).toBe(2)
    expect(partida.trocar(3)).toBe(false)
    expect(partida.trocar(5)).toBe(true)
    expect(partida.jogadas).toBe('4525')
  })

  it('com um besouro só, o Tab não muda nada', () => {
    const partida = new Partida(tabuleiro(['1']))
    expect(partida.trocar('proximo')).toBe(false)
  })
})

describe('guardar, voltar e recomeçar', () => {
  it('voltar devolve a posição guardada, menos os passos; e o comandado vira o primeiro besouro', () => {
    const partida = new Partida(tabuleiro(['1k..', '2...']))
    partida.mover('direita')
    partida.trocar(2)
    partida.guardar()
    partida.mover('direita')
    partida.trocar(1)
    partida.mover('direita')
    expect(partida.passos).toBe(3)
    expect(partida.voltar()).toBe(true)
    expect(partida.besouroEm(1, 0)).toBe(1)
    expect(partida.besouroEm(0, 1)).toBe(2)
    expect(partida.chaves).toBe(1)
    expect(partida.passos).toBe(3)
    expect(partida.ativo).toBe(1)
  })

  it('voltar sem ter guardado não faz nada', () => {
    const partida = new Partida(tabuleiro(['1.']))
    expect(partida.voltar()).toBe(false)
    expect(partida.jogadas).toBe('')
  })

  it('recomeçar volta tudo ao começo, zera os passos e apaga a posição guardada', () => {
    const partida = new Partida(tabuleiro(['1k.']))
    partida.mover('direita')
    partida.guardar()
    partida.recomecar()
    expect(partida.chaves).toBe(0)
    expect(partida.passos).toBe(0)
    expect(partida.temPosicaoGuardada).toBe(false)
    expect(partida.jogadas).toBe('')
    expect(partida.itemEm(1, 0)).toBe(ITEM.CHAVE)
  })
})

describe('o retrato da partida', () => {
  it('cada peça mantém o id quando anda, e a parede não é peça', () => {
    const partida = new Partida(tabuleiro(['#1B.']))
    const antes = partida.foto().pecas
    expect(antes).toHaveLength(1)
    partida.mover('direita')
    const depois = partida.foto().pecas
    expect(depois[0]?.id).toBe(antes[0]?.id)
    expect(depois[0]).toMatchObject({ x: 3, y: 0, item: ITEM.CAIXA })
  })
})
