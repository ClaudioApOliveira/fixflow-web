'use client'

import { ReactNode } from 'react'
import { useAuth, Role } from '@/providers/auth-provider'
import { ShieldIcon } from '@/components/icons'

interface RoleProtectedProps {
  children: ReactNode
  allowedRoles: Role[]
  fallback?: ReactNode
}

export function RoleProtected({ children, allowedRoles, fallback }: RoleProtectedProps) {
  const { user, hasRole } = useAuth()

  if (!user || !hasRole(allowedRoles)) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-3xl bg-destructive/20 text-destructive flex items-center justify-center mx-auto mb-6">
            <ShieldIcon size={40} />
          </div>
          <h1 className="text-2xl font-bold mb-2">Acesso Negado</h1>
          <p className="text-muted-foreground mb-6">
            Você não tem permissão para acessar esta página.
          </p>
          <div className="p-4 bg-secondary/50 rounded-xl">
            <p className="text-sm text-muted-foreground mb-2">
              <strong>Seu perfil:</strong> {user?.roles.join(', ') || 'Não definido'}
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Perfis necessários:</strong> {allowedRoles.join(', ')}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
