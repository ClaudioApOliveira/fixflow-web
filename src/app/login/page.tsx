'use client'

import { useLogin } from '@/lib/auth'
import { useAuth } from '@/providers/auth-provider'
import { useToast } from '@/components/ui'
import { FormEvent, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  WrenchIcon,
  CheckIcon,
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  LoaderIcon,
} from '@/components/icons'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const login = useLogin()
  const { isAuthenticated, isLoading } = useAuth()
  const { addToast } = useToast()
  const router = useRouter()

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/ordens')
    }
  }, [isAuthenticated, isLoading, router])

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await login.mutateAsync({ email, senha })
      addToast('success', 'Login realizado com sucesso!')
      // Aguardar um pouco para garantir que o token foi salvo
      await new Promise((resolve) => setTimeout(resolve, 500))
      // Usar window.location para forçar um reload completo
      // garantindo que o AuthProvider recarregue o token
      window.location.href = '/ordens'
    } catch (error) {
      // Captura a mensagem real do backend
      const message = error instanceof Error ? error.message : 'Erro ao fazer login'
      addToast('error', message)
    }
  }

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 gradient-bg opacity-5" />
      <div className="absolute top-0 right-0 w-125 h-125 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-100 h-100 bg-accent/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      {/* Left side - Branding */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-12 relative">
        <div className="max-w-md space-y-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-primary to-accent flex items-center justify-center group-hover:scale-105 transition-transform">
              <WrenchIcon size={28} className="text-white" />
            </div>
            <span className="text-3xl font-bold gradient-text">FixFlow</span>
          </Link>

          <div className="space-y-4">
            <h1 className="text-4xl font-bold leading-tight">
              Gerencie sua oficina com <span className="gradient-text">eficiência</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Acesse o painel para controlar ordens de serviço, clientes e veículos em tempo real.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-4 pt-4">
            {[
              { text: 'Dashboard em tempo real' },
              { text: 'Gestão de ordens simplificada' },
              { text: 'Relatórios detalhados' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-success/20 text-success flex items-center justify-center">
                  <CheckIcon size={14} />
                </div>
                <span className="text-muted-foreground">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-primary to-accent flex items-center justify-center">
              <WrenchIcon size={24} className="text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">FixFlow</span>
          </Link>

          <div className="bg-card/80 backdrop-blur-xl border border-border rounded-3xl p-8 shadow-2xl shadow-black/5">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Bem-vindo de volta</h2>
              <p className="text-muted-foreground">Entre com suas credenciais para acessar</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">Email</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <MailIcon size={20} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full pl-12 pr-4 py-3.5 bg-secondary/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-foreground">Senha</label>
                  <button
                    type="button"
                    className="text-sm text-primary hover:text-primary-hover transition-colors"
                  >
                    Esqueceu?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <LockIcon size={20} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3.5 bg-secondary/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={login.isPending}
                className="w-full py-3.5 rounded-xl bg-linear-to-r from-primary to-accent text-white font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none shine"
              >
                {login.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <LoaderIcon size={20} />
                    Entrando...
                  </span>
                ) : (
                  'Entrar'
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-border text-center">
              <p className="text-muted-foreground text-sm">
                Não tem uma conta?{' '}
                <button className="text-primary hover:text-primary-hover font-medium transition-colors">
                  Fale com o suporte
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
