/**
 * O progresso de quem joga, no navegador (as regras estão no utils/progresso.ts). Na página montada no servidor ele
 * começa vazio; no navegador, é lido do localStorage depois de montar (assim as duas montagens não discordam). Muda
 * em outra aba, muda aqui também (o evento storage).
 */
import type { Progresso } from '@projeto/shared'

function lerDoNavegador(): Progresso {
  try {
    return lerProgresso(window.localStorage.getItem(CHAVE_DO_PROGRESSO))
  } catch {
    return progressoVazio()
  }
}

export function useProgresso() {
  const progresso = useState<Progresso>('progresso', progressoVazio)
  const carregado = useState('progresso-carregado', () => false)

  function aoMudarEmOutraAba(evento: StorageEvent) {
    if (evento.key === CHAVE_DO_PROGRESSO) progresso.value = lerProgresso(evento.newValue)
  }

  onMounted(() => {
    if (!carregado.value) {
      progresso.value = lerDoNavegador()
      carregado.value = true
    }
    window.addEventListener('storage', aoMudarEmOutraAba)
  })
  onBeforeUnmount(() => window.removeEventListener('storage', aoMudarEmOutraAba))

  /** Grava o progresso novo (se o navegador não deixar gravar, ele vale até fechar a página). */
  function salvar(novo: Progresso) {
    progresso.value = novo
    try {
      window.localStorage.setItem(CHAVE_DO_PROGRESSO, JSON.stringify(novo))
    } catch {
      // Navegação privada ou armazenamento cheio: segue sem gravar.
    }
  }

  return { progresso, carregado, salvar }
}
