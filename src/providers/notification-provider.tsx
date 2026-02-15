'use client'

import { createContext, useContext, useEffect, useRef, useCallback, ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/components/ui'
import { api } from '@/lib/api'
import { getAccessToken } from '@/lib/auth'
import type { OrdemServico, ApiResponse, StatusOrdem } from '@/types'
import { STATUS_CONFIG } from '@/lib/constants'

interface NotificationContextType {
  checkForUpdates: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

interface NotificationProviderProps {
  children: ReactNode
}

// Armazena o estado anterior das ordens para comparação
let previousOrdensMap = new Map<number, OrdemServico>()

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { addToast } = useToast()
  const queryClient = useQueryClient()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isFirstLoad = useRef(true)

  const getStatusLabel = (status: StatusOrdem): string => {
    return STATUS_CONFIG[status]?.label || status
  }

  const checkForUpdates = useCallback(async () => {
    const token = getAccessToken()
    if (!token) return

    try {
      const response = await api.get<ApiResponse<OrdemServico[]>>('/ordens-servico')
      const currentOrdens = response.data || []

      // Na primeira carga, apenas armazena o estado sem notificar
      if (isFirstLoad.current) {
        currentOrdens.forEach((ordem) => {
          previousOrdensMap.set(ordem.id, ordem)
        })
        isFirstLoad.current = false
        return
      }

      // Compara com o estado anterior
      currentOrdens.forEach((ordem) => {
        const previousOrdem = previousOrdensMap.get(ordem.id)

        if (!previousOrdem) {
          // Nova ordem criada
          addToast('info', `🆕 Nova ordem criada: #${ordem.codigoRastreio}`)
        } else if (previousOrdem.status !== ordem.status) {
          // Status alterado
          const oldStatus = getStatusLabel(previousOrdem.status)
          const newStatus = getStatusLabel(ordem.status)
          addToast(
            getToastTypeForStatus(ordem.status),
            `📋 Ordem #${ordem.codigoRastreio}: ${oldStatus} → ${newStatus}`
          )
        } else if (previousOrdem.valorTotal !== ordem.valorTotal) {
          // Valor alterado
          addToast('info', `💰 Ordem #${ordem.codigoRastreio}: valor atualizado`)
        } else if (previousOrdem.responsavelId !== ordem.responsavelId) {
          // Responsável alterado
          addToast('info', `👤 Ordem #${ordem.codigoRastreio}: responsável alterado`)
        }
      })

      // Verifica ordens removidas
      previousOrdensMap.forEach((_, id) => {
        const exists = currentOrdens.find((o) => o.id === id)
        if (!exists) {
          addToast('warning', `🗑️ Ordem removida do sistema`)
        }
      })

      // Atualiza o mapa de ordens
      previousOrdensMap = new Map()
      currentOrdens.forEach((ordem) => {
        previousOrdensMap.set(ordem.id, ordem)
      })

      // Invalida as queries para atualizar a UI
      queryClient.invalidateQueries({ queryKey: ['ordens'] })
    } catch (error) {
      console.error('Erro ao verificar atualizações:', error)
    }
  }, [addToast, queryClient])

  useEffect(() => {
    const token = getAccessToken()
    if (!token) return

    // Carrega o estado inicial
    checkForUpdates()

    // Configura polling a cada 30 segundos
    intervalRef.current = setInterval(checkForUpdates, 30000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [checkForUpdates])

  // Reset quando o usuário fizer logout
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'accessToken' && !e.newValue) {
        previousOrdensMap = new Map()
        isFirstLoad.current = true
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  return (
    <NotificationContext.Provider value={{ checkForUpdates }}>
      {children}
    </NotificationContext.Provider>
  )
}

function getToastTypeForStatus(status: StatusOrdem): 'success' | 'error' | 'warning' | 'info' {
  switch (status) {
    case 'CONCLUIDO':
      return 'success'
    case 'CANCELADO':
      return 'error'
    case 'EM_ANDAMENTO':
      return 'info'
    case 'PENDENTE':
    default:
      return 'warning'
  }
}
