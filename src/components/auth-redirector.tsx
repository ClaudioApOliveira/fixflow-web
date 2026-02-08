'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/auth-provider'

/**
 * Componente que redireciona usuários autenticados para dashboard
 * e usuários não-autenticados para login
 */
export function AuthRedirector() {
    const router = useRouter()
    const { user, isLoading, isAuthenticated } = useAuth()

    useEffect(() => {
        if (isLoading) return // Aguarda carregamento

        const currentPath = window.location.pathname

        // Rotas públicas
        const publicRoutes = ['/', '/login']
        const isPublicRoute = publicRoutes.includes(currentPath)

        // Se está autenticado
        if (isAuthenticated && user) {
            // Se está em rota pública, redireciona para dashboard
            if (isPublicRoute) {
                router.push('/dashboard')
            }
        } else {
            // Se NÃO está autenticado
            // Se está em rota protegida, redireciona para login
            if (!isPublicRoute && !currentPath.startsWith('/login')) {
                router.push('/login')
            }
        }
    }, [isAuthenticated, user, isLoading, router])

    return null
}
