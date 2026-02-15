import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { QueryProvider } from '@/providers/query-provider'
import { AuthProvider } from '@/providers/auth-provider'
import { NotificationProvider } from '@/providers/notification-provider'
import { ToastProvider } from '@/components/ui'
import { AuthRedirector } from '@/components/auth-redirector'
import { ErrorBoundary } from '@/components/error-boundary'
import { LoadingProvider } from '@/providers/loading-provider'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'FixFlow | Sistema de Gestão de Oficina',
  description: 'Sistema moderno para gestão de ordens de serviço em oficinas mecânicas',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        <ErrorBoundary>
          <QueryProvider>
            <AuthProvider>
              <LoadingProvider>
                <ToastProvider>
                  <NotificationProvider>
                    <AuthRedirector />
                    {children}
                  </NotificationProvider>
                </ToastProvider>
              </LoadingProvider>
            </AuthProvider>
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
