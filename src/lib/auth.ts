import { useMutation } from '@tanstack/react-query'
import { api } from './api'
import { tokenManager } from './token-manager'

interface LoginRequest {
  email: string
  senha: string
}

interface RefreshTokenRequest {
  refreshToken: string
}

interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

// Constantes para localStorage
const ACCESS_TOKEN_KEY = 'accessToken'
const REFRESH_TOKEN_KEY = 'refreshToken'

// Funções auxiliares para gerenciar tokens (mantidas para compatibilidade)
export function getAccessToken(): string | null {
  return tokenManager.getAccessToken()
}

export function getRefreshToken(): string | null {
  return tokenManager.getRefreshToken()
}

export function setTokens(accessToken: string, refreshToken: string): void {
  tokenManager.setTokens(accessToken, refreshToken)
}

export function clearTokens(): void {
  tokenManager.clearTokens()
}

export function useLogin() {
  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', data)
      console.log('Login response:', response)
      if (response.success && response.data?.accessToken) {
        setTokens(response.data.accessToken, response.data.refreshToken)
      } else {
        console.error('Invalid response format:', response)
        throw new Error('Token not found in response')
      }
      return response
    },
  })
}

export function useRefreshToken() {
  return useMutation({
    mutationFn: async () => {
      const refreshToken = getRefreshToken()
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }
      const response = await api.post<ApiResponse<AuthResponse>>('/auth/refresh', {
        refreshToken,
      } as RefreshTokenRequest)
      if (response.success && response.data?.accessToken) {
        setTokens(response.data.accessToken, response.data.refreshToken)
      } else {
        throw new Error('Failed to refresh token')
      }
      return response
    },
  })
}

export function useLogout() {
  return useMutation({
    mutationFn: async () => {
      try {
        await api.post<ApiResponse<void>>('/auth/logout', {})
      } finally {
        clearTokens()
      }
    },
    onSuccess: () => {
      window.location.href = '/login'
    },
    onError: () => {
      // Mesmo com erro, limpa tokens e redireciona
      clearTokens()
      window.location.href = '/login'
    },
  })
}

// Função para fazer logout sem hook (para uso em interceptors)
export async function logout(): Promise<void> {
  try {
    await api.post<ApiResponse<void>>('/auth/logout', {})
  } finally {
    clearTokens()
    window.location.href = '/login'
  }
}

// Função para refresh token sem hook (para uso em interceptors)
export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    return null
  }
  try {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/refresh', {
      refreshToken,
    } as RefreshTokenRequest)
    if (response.success && response.data?.accessToken) {
      setTokens(response.data.accessToken, response.data.refreshToken)
      return response.data.accessToken
    }
    return null
  } catch {
    clearTokens()
    return null
  }
}
