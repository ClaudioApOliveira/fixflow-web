// Token manager com suporte a httpOnly cookies (preferencial) e localStorage (fallback)

const ACCESS_TOKEN_KEY = 'accessToken'
const REFRESH_TOKEN_KEY = 'refreshToken'

// Detecta se tokens estão em cookies httpOnly
function hasHttpOnlyCookies(): boolean {
  if (typeof document === 'undefined') return false
  // Se não conseguimos ler o token via JS, provavelmente está em httpOnly
  return !document.cookie.includes(ACCESS_TOKEN_KEY)
}

export const tokenManager = {
  // Modo: 'cookie' (httpOnly) ou 'localStorage' (fallback)
  mode: 'localStorage' as 'cookie' | 'localStorage',

  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null
    
    // Se está em modo cookie, não tenta ler (httpOnly)
    if (this.mode === 'cookie') return null
    
    return localStorage.getItem(ACCESS_TOKEN_KEY)
  },

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null
    
    if (this.mode === 'cookie') return null
    
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  },

  setTokens(accessToken: string, refreshToken: string): void {
    // Em modo cookie, backend gerencia os cookies
    if (this.mode === 'cookie') return
    
    // Fallback: localStorage
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  },

  clearTokens(): void {
    // Limpa localStorage
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    
    // Tenta limpar cookies client-side (não funciona com httpOnly)
    if (typeof document !== 'undefined') {
      document.cookie = `${ACCESS_TOKEN_KEY}=; path=/; max-age=0; SameSite=Strict`
      document.cookie = `${REFRESH_TOKEN_KEY}=; path=/; max-age=0; SameSite=Strict`
    }
  },

  hasValidToken(): boolean {
    // Em modo cookie, assume que backend gerencia
    if (this.mode === 'cookie') return true
    
    return !!this.getAccessToken()
  },

  // Detecta e configura o modo automaticamente
  detectMode(): void {
    if (typeof window === 'undefined') return
    
    // Se backend enviou cookies httpOnly, muda para modo cookie
    if (hasHttpOnlyCookies()) {
      this.mode = 'cookie'
      console.log('🔒 Modo httpOnly cookies ativado')
    } else {
      this.mode = 'localStorage'
      console.log('⚠️ Modo localStorage (considere migrar para httpOnly cookies)')
    }
  }
}

// Singleton para controlar refresh
class RefreshTokenManager {
  private isRefreshing = false
  private refreshPromise: Promise<string | null> | null = null

  async refresh(refreshFn: () => Promise<string | null>): Promise<string | null> {
    if (!this.isRefreshing) {
      this.isRefreshing = true
      this.refreshPromise = refreshFn().finally(() => {
        this.isRefreshing = false
        this.refreshPromise = null
      })
    }
    return this.refreshPromise!
  }
}

export const refreshManager = new RefreshTokenManager()

// Detecta modo na inicialização
if (typeof window !== 'undefined') {
  tokenManager.detectMode()
}
