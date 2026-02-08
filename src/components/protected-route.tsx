'use client'

import { ReactNode } from 'react'
import { useAuth } from '@/providers/auth-provider'
import Link from 'next/link'
import { WrenchIcon } from '@/components/icons'

interface ProtectedRouteProps {
    children: ReactNode
    fallback?: ReactNode
}

/**
 * Componente que protege uma rota, mostrando apenas se o usuário estiver autenticado
 */
export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading } = useAuth()

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center animate-pulse">
                        <WrenchIcon size={24} className="text-primary" />
                    </div>
                    <p className="text-muted-foreground">Carregando...</p>
                </div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return (
            fallback || (
                <div className="min-h-screen flex items-center justify-center bg-background">
                    <div className="text-center space-y-6">
                        <h1 className="text-3xl font-bold">Acesso Negado</h1>
                        <p className="text-muted-foreground">Você precisa estar autenticado para acessar esta página</p>
                        <Link
                            href="/login"
                            className="inline-block px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                        >
                            Ir para Login
                        </Link>
                    </div>
                </div>
            )
        )
    }

    return <>{children}</>
}

interface PublicOnlyProps {
    children: ReactNode
    fallback?: ReactNode
}

/**
 * Componente que mostra conteúdo apenas se NÃO estiver autenticado
 */
export function PublicOnly({ children, fallback }: PublicOnlyProps) {
    const { isAuthenticated, isLoading } = useAuth()

    if (isLoading) {
        return null
    }

    if (isAuthenticated) {
        return fallback || null
    }

    return <>{children}</>
}

/**
 * Componente que mostra conteúdo apenas se ESTIVER autenticado
 */
export function PrivateOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth()

    if (isLoading) {
        return null
    }

    if (!isAuthenticated) {
        return fallback || null
    }

    return <>{children}</>
}

/**
 * Hook para verificar se está autenticado
 */
export function useIsAuthenticated() {
    const { isAuthenticated, isLoading } = useAuth()
    return { isAuthenticated, isLoading }
}
