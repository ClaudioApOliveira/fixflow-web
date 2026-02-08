'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { jwtDecode } from 'jwt-decode'
import { api } from '@/lib/api'
import { getAccessToken, clearTokens } from '@/lib/auth'

// Tipos de roles do sistema
export type Role = 'ADMIN' | 'GERENTE' | 'FINANCEIRO' | 'FUNCIONARIO' | 'MECANICO'

interface JWTPayload {
    sub: string
    exp: number
    iat: number
}

interface UsuarioResponse {
    id: number
    nome: string
    email: string
    ativo: boolean
    roles: string[]
    criadoEm: string | number[]
}

interface ApiResponse<T> {
    success: boolean
    message: string
    data: T
}

interface AuthUser {
    id: string
    email: string
    nome: string
    roles: Role[]
}

interface AuthContextType {
    user: AuthUser | null
    isAuthenticated: boolean
    isLoading: boolean
    hasRole: (role: Role | Role[]) => boolean
    hasAnyRole: (roles: Role[]) => boolean
    logout: () => void
    refreshAuth: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [authVersion, setAuthVersion] = useState(0)

    // Função para buscar dados do usuário da API
    const fetchUserData = useCallback(async () => {
        try {
            const response = await api.get<ApiResponse<UsuarioResponse>>('/usuarios/me')
            console.log('User data response:', response)
            if (response.success && response.data) {
                const userData = response.data
                setUser({
                    id: String(userData.id),
                    email: userData.email,
                    nome: userData.nome,
                    roles: userData.roles as Role[],
                })
                return userData.roles as Role[]
            }
            return []
        } catch (error) {
            console.error('Failed to fetch user data:', error)
            // Se falhar ao buscar dados, remove os tokens
            clearTokens()
            setUser(null)
            return []
        }
    }, [])

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = getAccessToken()

                if (!token) {
                    setUser(null)
                    setIsLoading(false)
                    return
                }

                // Decodificar o token apenas para verificar expiração
                const decoded = jwtDecode<JWTPayload>(token)

                // Verificar se o token expirou
                const now = Date.now() / 1000
                if (decoded.exp < now) {
                    clearTokens()
                    setUser(null)
                    setIsLoading(false)
                    return
                }

                // Buscar dados completos do usuário da API
                await fetchUserData()

                setIsLoading(false)
            } catch {
                clearTokens()
                setUser(null)
                setIsLoading(false)
            }
        }

        checkAuth()
    }, [authVersion, fetchUserData])

    const refreshAuth = () => {
        setAuthVersion((v) => v + 1)
    }

    const hasRole = (role: Role | Role[]): boolean => {
        if (!user || !user.roles) return false
        const roles = Array.isArray(role) ? role : [role]
        return roles.some((r) => user.roles.includes(r))
    }

    const hasAnyRole = (roles: Role[]): boolean => {
        if (!user || !user.roles) return false
        return roles.some((role) => user.roles.includes(role))
    }

    const logout = async () => {
        try {
            await api.post('/auth/logout', {})
        } finally {
            clearTokens()
            setUser(null)
            // AuthRedirector vai detectar que não tem mais token e redirecionar
        }
    }

    // Mostrar loading enquanto verifica autenticação
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-muted-foreground">Carregando...</p>
                </div>
            </div>
        )
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                hasRole,
                hasAnyRole,
                logout,
                refreshAuth,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

// Hook para verificar permissão de ações específicas
export function usePermission() {
    const { hasRole } = useAuth()

    return {
        // Ordens de Serviço
        canViewOrdens: hasRole(['ADMIN', 'GERENTE', 'FUNCIONARIO', 'MECANICO']),
        canCreateOrdem: hasRole(['ADMIN', 'GERENTE', 'FUNCIONARIO']),
        canEditOrdem: hasRole(['ADMIN', 'GERENTE', 'FUNCIONARIO', 'MECANICO']),
        canDeleteOrdem: hasRole(['ADMIN', 'GERENTE']),
        canChangeOrdemStatus: hasRole(['ADMIN', 'GERENTE', 'MECANICO']),

        // Clientes
        canViewClientes: hasRole(['ADMIN', 'GERENTE', 'FUNCIONARIO']),
        canCreateCliente: hasRole(['ADMIN', 'GERENTE', 'FUNCIONARIO']),
        canEditCliente: hasRole(['ADMIN', 'GERENTE', 'FUNCIONARIO']),
        canDeleteCliente: hasRole(['ADMIN', 'GERENTE']),

        // Veículos
        canViewVeiculos: hasRole(['ADMIN', 'GERENTE', 'FUNCIONARIO']),
        canCreateVeiculo: hasRole(['ADMIN', 'GERENTE', 'FUNCIONARIO']),
        canEditVeiculo: hasRole(['ADMIN', 'GERENTE', 'FUNCIONARIO']),
        canDeleteVeiculo: hasRole(['ADMIN', 'GERENTE']),

        // Usuários
        canViewUsuarios: hasRole(['ADMIN']),
        canCreateUsuario: hasRole(['ADMIN']),
        canEditUsuario: hasRole(['ADMIN']),
        canDeleteUsuario: hasRole(['ADMIN']),

        // Financeiro
        canViewFinanceiro: hasRole(['ADMIN', 'GERENTE', 'FINANCEIRO']),
        canEditFinanceiro: hasRole(['ADMIN', 'FINANCEIRO']),
    }
}
