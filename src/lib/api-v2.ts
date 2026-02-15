import { tokenManager, refreshManager } from './token-manager-v2'

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

class ApiError extends Error {
  constructor(public status: number, message: string, public data?: unknown) {
    super(message)
    this.name = 'ApiError'
  }
}

function getHeaders() {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  
  // Apenas adiciona Authorization se estiver em modo localStorage
  if (tokenManager.mode === 'localStorage') {
    const token = tokenManager.getAccessToken()
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
  }
  // Em modo cookie, o browser envia automaticamente
  
  return headers
}

async function refreshToken(): Promise<string | null> {
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Importante: envia cookies
      body: tokenManager.mode === 'localStorage' 
        ? JSON.stringify({ refreshToken: tokenManager.getRefreshToken() })
        : JSON.stringify({}), // Backend usa cookie
    })

    if (!res.ok) {
      tokenManager.clearTokens()
      return null
    }

    const data = await res.json()
    
    // Em modo localStorage, salva tokens
    if (tokenManager.mode === 'localStorage' && data.success && data.data?.accessToken) {
      tokenManager.setTokens(data.data.accessToken, data.data.refreshToken)
      return data.data.accessToken
    }
    
    // Em modo cookie, backend já setou os cookies
    return data.success ? 'cookie-mode' : null
  } catch {
    tokenManager.clearTokens()
    return null
  }
}

async function fetchWithRefresh<T>(path: string, options: RequestInit): Promise<T> {
  let res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: getHeaders(),
    credentials: 'include', // Sempre envia cookies
  })

  if (res.status === 401 && !path.includes('/auth/')) {
    const newToken = await refreshManager.refresh(refreshToken)

    if (newToken) {
      const retryHeaders = getHeaders()
      if (tokenManager.mode === 'localStorage' && newToken !== 'cookie-mode') {
        retryHeaders.Authorization = `Bearer ${newToken}`
      }
      
      res = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: retryHeaders,
        credentials: 'include',
      })
    } else {
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
      throw new Error('Sessão expirada')
    }
  }

  if (!res.ok) {
    let errorMessage = `Erro na requisição: ${res.status} ${res.statusText}`
    let errorData
    
    try {
      errorData = await res.json()
      errorMessage = errorData.message || errorData.error || errorMessage
    } catch { /* ignore */ }
    
    throw new ApiError(res.status, errorMessage, errorData)
  }

  const data = await res.json()
  if (data && data.success === false && data.message) {
    throw new ApiError(res.status, data.message, data)
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
    await fetchWithRefresh<void>(path, { method: 'DELETE' })
  },
}
