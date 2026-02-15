import { useQuery } from '@tanstack/react-query'

const BACKEND_HEALTH_URL =
  process.env.NEXT_PUBLIC_BACKEND_HEALTH_URL || 'http://localhost:30080/actuator/health'

export function useBackendStatus() {
  return useQuery({
    queryKey: ['backend-status'],
    queryFn: async () => {
      try {
        const response = await fetch(BACKEND_HEALTH_URL, { method: 'GET' })
        return response.ok
      } catch {
        return false
      }
    },
    refetchInterval: 10000,
    retry: false,
  })
}
