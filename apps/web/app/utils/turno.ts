/**
 * O turno da partida: enquanto um passo anima, a próxima ação espera, e só uma (a última pedida). Assim um toque
 * rápido durante a animação não se perde, e uma rajada de toques não vira uma fila de passos que ninguém pediu.
 */
export class Turno<A> {
  private _ocupado = false
  private pendente: A | null = null

  get ocupado(): boolean {
    return this._ocupado
  }

  /** Pede uma ação: devolve a ação para fazer agora, ou null se ela ficou esperando o passo terminar. */
  pedir(acao: A): A | null {
    if (!this._ocupado) return acao
    this.pendente = acao
    return null
  }

  /** Um passo começou a animar. */
  comecar(): void {
    this._ocupado = true
  }

  /** O passo terminou: devolve a ação que estava esperando (se houver). */
  terminar(): A | null {
    this._ocupado = false
    const pendente = this.pendente
    this.pendente = null
    return pendente
  }

  limpar(): void {
    this._ocupado = false
    this.pendente = null
  }
}
