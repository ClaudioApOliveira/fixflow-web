'use client'

import { ReactNode } from 'react'
import { useAuth } from '@/providers/auth-provider'
import { Card } from '@/components/ui'
import type { Role } from '@/providers/auth-provider'

interface RoleProtectedProps {
    children: ReactNode
    requiredRoles: Role[]
    fallback?: ReactNode
}

export function RoleProtected({ children, requiredRoles, fallback }: RoleProtectedProps) {
    const { user, hasAnyRole } = useAuth()

    // Se o usuário não está autenticado
    if (!user) {
        return (
            <Card>
                <div className="p-6 text-center">
                    <p className="text-sm text-muted-foreground">Você precisa estar autenticado para acessar este conteúdo</p>
                </div>
            </Card>
        ) || fallback || null
    }

    // Se o usuário não tem a role necessária
    if (!hasAnyRole(requiredRoles)) {
        return (
            fallback || (
                <Card>
                    <div className="p-6 text-center space-y-2">
                        <p className="text-sm font-medium text-foreground">Acesso Restrito</p>
                        <p className="text-xs text-muted-foreground">
                            Você não tem permissão para visualizar este conteúdo. Apenas usuários com perfil {requiredRoles.join(' ou ')} podem acessar.
                        </p>
                    </div>
                </Card>
            )
        )
    }

    // Se tem acesso, renderiza o conteúdo
    return <>{children}</>
}
