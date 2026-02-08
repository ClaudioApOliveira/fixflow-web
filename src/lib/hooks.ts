import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from './api'
import type { 
  OrdemServico, 
  OrdemServicoRequest,
  Cliente, 
  ClienteRequest,
  Veiculo,
  VeiculoRequest,
  Usuario,
  UsuarioRequest,
  ServicoOS,
  ServicoOSRequest,
  Agendamento,
  AgendamentoRequest,
  DisponibilidadeMecanico,
  ApiResponse 
} from '@/types'

// ============================================
// Ordens de Serviço Hooks
// ============================================

export function useOrdens() {
  return useQuery({
    queryKey: ['ordens'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<OrdemServico[]>>('/ordens-servico')
      return response.data || []
    },
    refetchInterval: 5000,
  })
}

export function useOrdem(id: number) {
  return useQuery({
    queryKey: ['ordens', id],
    queryFn: async () => {
      const response = await api.get<ApiResponse<OrdemServico>>(`/ordens-servico/${id}`)
      return response.data
    },
    enabled: !!id,
  })
}

export function useOrdensByStatus(status: string) {
  return useQuery({
    queryKey: ['ordens', 'status', status],
    queryFn: async () => {
      const response = await api.get<ApiResponse<OrdemServico[]>>(`/ordens-servico/status/${status}`)
      return response.data || []
    },
  })
}

export function useOrdensByCliente(clienteId: number) {
  return useQuery({
    queryKey: ['ordens', 'cliente', clienteId],
    queryFn: async () => {
      const response = await api.get<ApiResponse<OrdemServico[]>>(`/ordens-servico/cliente/${clienteId}`)
      return response.data || []
    },
    enabled: !!clienteId,
  })
}

export function useOrdemByRastreio(codigoRastreio: string) {
  return useQuery({
    queryKey: ['ordens', 'rastreio', codigoRastreio],
    queryFn: async () => {
      const response = await api.get<ApiResponse<OrdemServico>>(`/ordens-servico/rastreio/${codigoRastreio}`)
      return response.data
    },
    enabled: !!codigoRastreio,
  })
}

export function useCreateOrdem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: OrdemServicoRequest) => api.post('/ordens-servico', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ordens'] }),
  })
}

export function useUpdateOrdem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<OrdemServicoRequest> & { id: number }) =>
      api.put(`/ordens-servico/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ordens'] }),
  })
}

export function useDeleteOrdem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/ordens-servico/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ordens'] }),
  })
}

export function useApproveOrcamento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.put(`/ordens-servico/${id}/approve-orcamento`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ordens'] })
      queryClient.invalidateQueries({ queryKey: ['ordem'] })
    },
  })
}

export function useRejectOrcamento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.put(`/ordens-servico/${id}/reject-orcamento`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ordens'] })
      queryClient.invalidateQueries({ queryKey: ['ordem'] })
    },
  })
}

// ============================================
// Clientes Hooks
// ============================================

export function useClientes() {
  return useQuery({
    queryKey: ['clientes'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Cliente[]>>('/clientes')
      return response.data || []
    },
  })
}

export function useClientesPaginated(page: number = 0, size: number = 20) {
  return useQuery({
    queryKey: ['clientes', 'paginated', page, size],
    queryFn: async () => {
      const response = await api.get<ApiResponse<import('@/types').PageResponse<Cliente>>>(
        `/clientes/paginated?page=${page}&size=${size}`
      )
      return response.data || { content: [], page: 0, size, totalElements: 0, totalPages: 0 }
    },
  })
}

export function useCliente(id: number) {
  return useQuery({
    queryKey: ['clientes', id],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Cliente>>(`/clientes/${id}`)
      return response.data
    },
    enabled: !!id,
  })
}

export function useClienteByDocumento(documento: string) {
  return useQuery({
    queryKey: ['clientes', 'documento', documento],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Cliente>>(`/clientes/documento/${documento}`)
      return response.data
    },
    enabled: !!documento,
  })
}

export function useCreateCliente() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ClienteRequest) => api.post('/clientes', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clientes'] }),
  })
}

export function useUpdateCliente() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: ClienteRequest & { id: number }) =>
      api.put(`/clientes/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clientes'] }),
  })
}

export function useDeleteCliente() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/clientes/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clientes'] }),
  })
}

// ============================================
// Veículos Hooks
// ============================================

export function useVeiculos() {
  return useQuery({
    queryKey: ['veiculos'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Veiculo[]>>('/veiculos')
      return response.data || []
    },
  })
}

export function useVeiculo(id: number) {
  return useQuery({
    queryKey: ['veiculos', id],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Veiculo>>(`/veiculos/${id}`)
      return response.data
    },
    enabled: !!id,
  })
}

export function useVeiculosByCliente(clienteId: number) {
  return useQuery({
    queryKey: ['veiculos', 'cliente', clienteId],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Veiculo[]>>(`/veiculos/cliente/${clienteId}`)
      return response.data || []
    },
    enabled: !!clienteId,
  })
}

export function useVeiculoByPlaca(placa: string) {
  return useQuery({
    queryKey: ['veiculos', 'placa', placa],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Veiculo>>(`/veiculos/placa/${placa}`)
      return response.data
    },
    enabled: !!placa,
  })
}

export function useCreateVeiculo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: VeiculoRequest) => api.post('/veiculos', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['veiculos'] }),
  })
}

export function useUpdateVeiculo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: VeiculoRequest & { id: number }) =>
      api.put(`/veiculos/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['veiculos'] }),
  })
}

export function useDeleteVeiculo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/veiculos/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['veiculos'] }),
  })
}

// ============================================
// Usuários Hooks
// ============================================

export function useUsuarios() {
  return useQuery({
    queryKey: ['usuarios'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Usuario[]>>('/usuarios')
      return response.data || []
    },
  })
}

export function useUsuario(id: number) {
  return useQuery({
    queryKey: ['usuarios', id],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Usuario>>(`/usuarios/${id}`)
      return response.data
    },
    enabled: !!id,
  })
}

export function useUsuarioByEmail(email: string) {
  return useQuery({
    queryKey: ['usuarios', 'email', email],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Usuario>>(`/usuarios/email/${email}`)
      return response.data
    },
    enabled: !!email,
  })
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ['usuarios', 'me'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Usuario>>('/usuarios/me')
      return response.data
    },
  })
}

export function useUsuarioTipos() {
  return useQuery({
    queryKey: ['usuarios', 'tipos'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Record<string, string>[]>>('/usuarios/tipos')
      return response.data || []
    },
  })
}

export function useCreateUsuario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UsuarioRequest) => api.post('/usuarios', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['usuarios'] }),
  })
}

export function useUpdateUsuario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<UsuarioRequest> & { id: number }) =>
      api.put(`/usuarios/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['usuarios'] }),
  })
}

export function useDeleteUsuario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/usuarios/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['usuarios'] }),
  })
}

// ============================================
// Serviços OS Hooks
// ============================================

export function useServicosOS(ordemServicoId: number) {
  return useQuery({
    queryKey: ['servicos-os', 'ordem', ordemServicoId],
    queryFn: async () => {
      const response = await api.get<ApiResponse<ServicoOS[]>>(`/servicos-os/ordem-servico/${ordemServicoId}`)
      return response.data || []
    },
    enabled: !!ordemServicoId,
  })
}

export function useServicoOS(id: number) {
  return useQuery({
    queryKey: ['servicos-os', id],
    queryFn: async () => {
      const response = await api.get<ApiResponse<ServicoOS>>(`/servicos-os/${id}`)
      return response.data
    },
    enabled: !!id,
  })
}

export function useCreateServicoOS() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ ordemServicoId, ...data }: ServicoOSRequest & { ordemServicoId: number }) => 
      api.post(`/servicos-os/ordem-servico/${ordemServicoId}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['servicos-os', 'ordem', variables.ordemServicoId] })
      queryClient.invalidateQueries({ queryKey: ['ordens'] })
    },
  })
}

export function useUpdateServicoOS() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ordemServicoId, ...data }: ServicoOSRequest & { id: number; ordemServicoId: number }) =>
      api.put(`/servicos-os/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['servicos-os', 'ordem', variables.ordemServicoId] })
      queryClient.invalidateQueries({ queryKey: ['servicos-os', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['ordens'] })
    },
  })
}

export function useDeleteServicoOS() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ordemServicoId }: { id: number; ordemServicoId: number }) => 
      api.delete(`/servicos-os/${id}`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['servicos-os', 'ordem', variables.ordemServicoId] })
      queryClient.invalidateQueries({ queryKey: ['ordens'] })
    },
  })
}

// ============================================
// Agendamentos Hooks
// ============================================

export function useAgendamentos(date?: Date) {
  return useQuery({
    queryKey: ['agendamentos', date?.toISOString()],
    queryFn: async () => {
      const params = date ? `?data=${date.toISOString().split('T')[0]}` : ''
      const response = await api.get<ApiResponse<Agendamento[]>>(`/agendamentos${params}`)
      return response.data || []
    },
    refetchInterval: 5000,
  })
}

export function useAgendamentosByStatus(status: string) {
  return useQuery({
    queryKey: ['agendamentos', 'status', status],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Agendamento[]>>(`/agendamentos/status/${status}`)
      return response.data || []
    },
    refetchInterval: 5000,
  })
}

export function useAgendamento(id: number) {
  return useQuery({
    queryKey: ['agendamento', id],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Agendamento>>(`/agendamentos/${id}`)
      return response.data
    },
    enabled: !!id && id > 0,
  })
}

export function useDisponibilidadeMecanicos(data: Date) {
  return useQuery({
    queryKey: ['disponibilidade-mecanicos', data.toISOString()],
    queryFn: async () => {
      const response = await api.get<ApiResponse<DisponibilidadeMecanico[]>>(
        `/agendamentos/disponibilidade?data=${data.toISOString().split('T')[0]}`
      )
      return response.data || []
    },
    enabled: !!data,
  })
}

export function useCreateAgendamento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: AgendamentoRequest) => api.post('/agendamentos', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['agendamentos'] }),
  })
}

export function useUpdateAgendamento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<AgendamentoRequest> & { id: number }) =>
      api.put(`/agendamentos/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] })
      queryClient.invalidateQueries({ queryKey: ['agendamento'] })
    },
  })
}

export function useCancelAgendamento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.put(`/agendamentos/${id}/cancelar`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['agendamentos'] }),
  })
}

export function useConfirmarAgendamento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.put(`/agendamentos/${id}/confirmar`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['agendamentos'] }),
  })
}

