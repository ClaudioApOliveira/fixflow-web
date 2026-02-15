// Gerenciamento centralizado de tokens
const ACCESS_TOKEN_KEY = 'accessToken'
const REFRESH_TOKEN_KEY = 'refreshToken'

export const tokenManager = {
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(ACCESS_TOKEN_KEY)
  },

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  },

  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    document.cookie = `accessToken=${accessToken}; path=/; max-age=86400; SameSite=Strict`
    document.cookie = `refreshToken=${refreshToken}; path=/; max-age=604800; SameSite=Strict`
  },

  clearTokens(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    document.cookie = 'accessToken=; path=/; max-age=0'
    document.cookie = 'refreshToken=; path=/; max-age=0'
  },

  hasValidToken(): boolean {
    return !!this.getAccessToken()
  },
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
