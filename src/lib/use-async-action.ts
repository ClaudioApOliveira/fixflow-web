import { useLoading } from '@/providers/loading-provider'

export function useAsyncAction() {
  const { startLoading, stopLoading } = useLoading()

  const execute = async <T>(action: () => Promise<T>, loadingMessage?: string): Promise<T> => {
    try {
      startLoading(loadingMessage)
      return await action()
    } finally {
      stopLoading()
    }
  }

  return { execute }
}
