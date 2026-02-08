'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode, useState } from 'react'
import { useAuth, usePermission, Role } from '@/providers/auth-provider'
import { useNotifications } from '@/providers/notification-provider'
import {
    ClipboardListIcon,
    UsersIcon,
    CarIcon,
    UserIcon,
    LogoutIcon,
    WrenchIcon,
    RefreshIcon,
    BarChartIcon,
    CalendarIcon,
} from '@/components/icons'

interface NavItemProps {
    href: string
    icon: ReactNode
    label: string
    roles?: Role[]
}

function NavItem({ href, icon, label, roles }: NavItemProps) {
    const pathname = usePathname()
    const { hasRole } = useAuth()
    const isActive = pathname === href || pathname.startsWith(href + '/')

    // Se roles foram definidas, verifica se o usuário tem permissão
    if (roles && !hasRole(roles)) {
        return null
    }

    return (
        <Link
            href={href}
            className={`
        flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
        ${isActive
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }
      `}
        >
            <span className="w-5 h-5">{icon}</span>
            <span className="font-medium">{label}</span>
        </Link>
    )
}

function MobileNavItem({ href, icon, label, roles }: NavItemProps) {
    const pathname = usePathname()
    const { hasRole } = useAuth()
    const isActive = pathname === href || pathname.startsWith(href + '/')

    // Se roles foram definidas, verifica se o usuário tem permissão
    if (roles && !hasRole(roles)) {
        return null
    }

    return (
        <Link
            href={href}
            className={`
        flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors
        ${isActive ? 'text-primary' : 'text-muted-foreground'}
      `}
        >
            <span className="w-5 h-5">{icon}</span>
            <span className="text-xs font-medium">{label}</span>
        </Link>
    )
}

interface DashboardLayoutProps {
    children: ReactNode
    title: string
    subtitle?: string
    actions?: ReactNode
}

export function DashboardLayout({ children, title, subtitle, actions }: DashboardLayoutProps) {
    const { user, logout } = useAuth()
    const { checkForUpdates } = useNotifications()
    const [isRefreshing, setIsRefreshing] = useState(false)

    const handleRefresh = async () => {
        setIsRefreshing(true)
        await checkForUpdates()
        setTimeout(() => setIsRefreshing(false), 1000)
    }

    const navItems: NavItemProps[] = [
        {
            href: '/dashboard',
            icon: <BarChartIcon size={20} />,
            label: 'Dashboard',
            roles: ['ADMIN', 'GERENTE', 'FUNCIONARIO', 'MECANICO'],
        },
        {
            href: '/agendamentos',
            icon: <CalendarIcon size={20} />,
            label: 'Agendamentos',
            roles: ['ADMIN', 'GERENTE', 'FUNCIONARIO', 'MECANICO'],
        },
        {
            href: '/ordens',
            icon: <ClipboardListIcon size={20} />,
            label: 'Ordens de Serviço',
            roles: ['ADMIN', 'GERENTE', 'FUNCIONARIO', 'MECANICO'],
        },
        {
            href: '/clientes',
            icon: <UsersIcon size={20} />,
            label: 'Clientes',
            roles: ['ADMIN', 'GERENTE', 'FUNCIONARIO'],
        },
        {
            href: '/veiculos',
            icon: <CarIcon size={20} />,
            label: 'Veículos',
            roles: ['ADMIN', 'GERENTE', 'FUNCIONARIO'],
        },
        {
            href: '/usuarios',
            icon: <UserIcon size={20} />,
            label: 'Usuários',
            roles: ['ADMIN'],
        },
    ]

    return (
        <div className="min-h-screen bg-background">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border hidden lg:flex flex-col z-20">
                {/* Logo */}
                <div className="p-6 border-b border-border">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary to-accent flex items-center justify-center group-hover:scale-105 transition-transform">
                            <WrenchIcon size={20} className="text-white" />
                        </div>
                        <span className="text-xl font-bold bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
                            FixFlow
                        </span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => (
                        <NavItem key={item.href} {...item} />
                    ))}
                </nav>

                {/* User section */}
                <div className="p-4 border-t border-border space-y-3">
                    {user && (
                        <div className="px-4 py-2">
                            <p className="text-sm font-medium text-foreground truncate">{user.nome}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                            <div className="flex gap-1 mt-1">
                                {user.roles.map((role) => (
                                    <span
                                        key={role}
                                        className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium"
                                    >
                                        {role}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-danger/10 hover:text-danger transition-all duration-200"
                    >
                        <LogoutIcon size={20} />
                        <span className="font-medium">Sair</span>
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="lg:ml-64 min-h-screen pb-20 lg:pb-0">
                {/* Header */}
                <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div>
                            <h1 className="text-2xl font-bold">{title}</h1>
                            {subtitle && (
                                <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Botão de atualizar notificações */}
                            <button
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                className="p-2 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-200 disabled:opacity-50"
                                title="Verificar atualizações"
                            >
                                <RefreshIcon
                                    size={20}
                                    className={isRefreshing ? 'animate-spin' : ''}
                                />
                            </button>
                            {actions}
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <div className="p-6">{children}</div>
            </main>

            {/* Mobile navigation */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border flex justify-around py-2 z-20">
                {navItems.map((item) => (
                    <MobileNavItem key={item.href} {...item} />
                ))}
            </nav>
        </div>
    )
}
