const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

// Constantes para localStorage (devem ser as mesmas do auth.ts)
const ACCESS_TOKEN_KEY = 'accessToken'
const REFRESH_TOKEN_KEY = 'refreshToken'

function getAccessToken(): string | null {
  return typeof window !== 'undefined' ? localStorage.getItem(ACCESS_TOKEN_KEY) : null
}

function getRefreshToken(): string | null {
  return typeof window !== 'undefined' ? localStorage.getItem(REFRESH_TOKEN_KEY) : null
}

function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
}

function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

function getHeaders() {
  const token = getAccessToken()
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

// Flag para evitar múltiplas tentativas de refresh simultâneas
let isRefreshing = false
let refreshPromise: Promise<string | null> | null = null

async function refreshToken(): Promise<string | null> {
  const refresh = getRefreshToken()
  if (!refresh) return null

  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: refresh }),
    })

    if (!res.ok) {
      clearTokens()
      return null
    }

    const data = await res.json()
    if (data.success && data.data?.accessToken) {
      setTokens(data.data.accessToken, data.data.refreshToken)
      return data.data.accessToken
    }
    return null
  } catch {
    clearTokens()
    return null
  }
}

async function fetchWithRefresh<T>(
  path: string,
  options: RequestInit
): Promise<T> {
  let res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: getHeaders(),
  })

  // Se receber 401, tenta fazer refresh do token
  if (res.status === 401 && !path.includes('/auth/')) {
    // Evita múltiplas chamadas de refresh simultâneas
    if (!isRefreshing) {
      isRefreshing = true
      refreshPromise = refreshToken()
    }

    const newToken = await refreshPromise
    isRefreshing = false
    refreshPromise = null

    if (newToken) {
      // Tenta novamente com o novo token
      res = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
          ...options.headers,
          'Content-Type': 'application/json',
          Authorization: `Bearer ${newToken}`,
        },
      })
    } else {
      // Refresh falhou, redireciona para login
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
      throw new Error('Sessão expirada')
    }
  }

  // Se não for sucesso, lança erro com a mensagem do backend
  if (!res.ok) {
    let errorMessage = `Erro na requisição: ${res.status} ${res.statusText}`
    
    try {
      const errorData = await res.json()
      // Tenta pegar a mensagem do backend em diferentes formatos
      if (errorData.message) {
        errorMessage = errorData.message
      } else if (errorData.error) {
        errorMessage = errorData.error
      } else if (typeof errorData === 'string') {
        errorMessage = errorData
      }
    } catch {
      // Se não conseguir parsear o JSON, usa a mensagem padrão
    }
    
    throw new Error(errorMessage)
  }

  // Mesmo com status 200, verifica se success é false
  const data = await res.json()
  if (data && data.success === false && data.message) {
    throw new Error(data.message)
  }

  return data
}

export const api = {
  async get<T>(path: string): Promise<T> {
    return fetchWithRefresh<T>(path, { method: 'GET' })
  },

  async post<T>(path: string, data: unknown): Promise<T> {
    return fetchWithRefresh<T>(path, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async put<T>(path: string, data: unknown): Promise<T> {
    return fetchWithRefresh<T>(path, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  async delete(path: string): Promise<void> {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'DELETE',
      headers: getHeaders(),
    })

    if (res.status === 401 && !path.includes('/auth/')) {
      if (!isRefreshing) {
        isRefreshing = true
        refreshPromise = refreshToken()
      }

      const newToken = await refreshPromise
      isRefreshing = false
      refreshPromise = null

      if (newToken) {
        const retryRes = await fetch(`${API_URL}${path}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${newToken}`,
          },
        })
        if (!retryRes.ok) {
          let errorMessage = `Erro na requisição: ${retryRes.status}`
          try {
            const errorData = await retryRes.json()
            if (errorData.message) errorMessage = errorData.message
          } catch { /* ignore */ }
          throw new Error(errorMessage)
        }
        return
      } else {
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
        throw new Error('Sessão expirada')
      }
    }

    if (!res.ok) {
      let errorMessage = `Erro na requisição: ${res.status}`
      try {
        const errorData = await res.json()
        if (errorData.message) errorMessage = errorData.message
        else if (errorData.error) errorMessage = errorData.error
      } catch { /* ignore */ }
      throw new Error(errorMessage)
    }
  },
}
