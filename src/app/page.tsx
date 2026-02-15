'use client'

import Link from 'next/link'
import { WrenchIcon, ClipboardListIcon, CarIcon, UsersIcon } from '@/components/icons'
import { PublicOnly, PrivateOnly } from '@/components/protected-route'
import { useBackendStatus } from '@/lib/use-backend-status'

export default function Home() {
  const { data: isOnline = false } = useBackendStatus()

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 gradient-bg opacity-10" />

      {/* Floating shapes */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-info/10 rounded-full blur-3xl" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary to-accent flex items-center justify-center">
            <WrenchIcon size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold gradient-text">FixFlow</span>
        </div>

        {/* Menu - Diferente se logado ou não */}
        <PublicOnly>
          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Entrar
            </Link>
            <Link
              href="/login"
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary-hover transition-all hover:shadow-lg hover:shadow-primary/25 active:scale-95"
            >
              Começar
            </Link>
          </nav>
        </PublicOnly>

        <PrivateOnly>
          <nav className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Dashboard
            </Link>
            <Link
              href="/ordens"
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary-hover transition-all hover:shadow-lg hover:shadow-primary/25 active:scale-95"
            >
              Acessar Sistema
            </Link>
          </nav>
        </PrivateOnly>
      </header>

      {/* Hero section */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-100px)] px-8">
        <div className="text-center space-y-8 max-w-4xl">
          {/* Badge */}
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium ${
              isOnline
                ? 'bg-green-500/10 border-green-500/20 text-green-600'
                : 'bg-red-500/10 border-red-500/20 text-red-600'
            }`}
          >
            <span className="relative flex h-2 w-2">
              {isOnline && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isOnline ? 'bg-green-500' : 'bg-red-500'
                }`}
              ></span>
            </span>
            {isOnline ? 'Sistema em funcionamento' : 'Sistema offline'}
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Gestão de oficina
            <br />
            <span className="gradient-text">simplificada</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Controle ordens de serviço, clientes e veículos em um único lugar. Interface moderna e
            intuitiva para sua oficina mecânica.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              href="/ordens"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-linear-to-r from-primary to-accent text-white font-semibold text-lg hover:shadow-2xl hover:shadow-primary/30 transition-all hover:-translate-y-1 active:translate-y-0 shine"
            >
              Começar agora
              <svg
                className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-card border border-border text-foreground font-semibold text-lg hover:bg-secondary transition-all hover:border-primary/50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                />
              </svg>
              Fazer login
            </Link>
          </div>
        </div>

        {/* Features preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-5xl w-full">
          {[
            {
              icon: <ClipboardListIcon size={24} />,
              title: 'Ordens de Serviço',
              desc: 'Crie e gerencie OS de forma rápida e organizada',
            },
            {
              icon: <CarIcon size={24} />,
              title: 'Gestão de Veículos',
              desc: 'Histórico completo de cada veículo atendido',
            },
            {
              icon: <UsersIcon size={24} />,
              title: 'Clientes',
              desc: 'Base de clientes centralizada e acessível',
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="group p-6 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm hover:bg-card hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-primary">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
