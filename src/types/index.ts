// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface ErrorResponse {
  success: boolean
  message: string
  timestamp: string
  path: string
}

// ============================================
// Auth Types
// ============================================

export interface LoginRequest {
  email: string
  senha: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
}

// ============================================
// Usuario Types
// ============================================

export interface Usuario {
  id: number
  nome: string
  email: string
  ativo: boolean
  roles: string[]
  criadoEm: string
}

export interface UsuarioRequest {
  nome: string
  email: string
  senha: string
  ativo: boolean
  roles: string[]
}

// ============================================
// Cliente Types
// ============================================

export interface Cliente {
  id: number
  usuarioId: number
  nomeCompleto: string
  documento: string
  telefone: string
  criadoEm: string
}

export interface ClienteRequest {
  nomeCompleto: string
  documento: string
  telefone: string
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

// ============================================
// Veiculo Types
// ============================================

export interface Veiculo {
  id: number
  placa: string
  modelo: string
  marca: string
  clienteId: number
  criadoEm: string
}

export interface VeiculoRequest {
  placa: string
  modelo: string
  marca: string
  clienteId: number
}

// ============================================
// Ordem de Servico Types
// ============================================

export type StatusOrdem =
  | 'ORCAMENTO'
  | 'ORCAMENTO_APROVADO'
  | 'ORCAMENTO_RECUSADO'
  | 'PENDENTE'
  | 'EM_ANDAMENTO'
  | 'CONCLUIDO'
  | 'CANCELADO'

export interface OrdemServico {
  id: number
  codigoRastreio: string
  status: StatusOrdem
  valorTotal: number
  veiculoId: number
  clienteId: number
  responsavelId: number
  criadoEm: string
  nomeCliente?: string
  modeloVeiculo?: string
  dataAprovacao?: string
  dataRecusao?: string
}

export interface OrdemServicoRequest {
  status: StatusOrdem
  valorTotal: number
  veiculoId: number
  clienteId: number
  responsavelId: number
}

// ============================================
// Serviço OS Types
// ============================================

export interface ServicoOS {
  id: number
  ordemServicoId: number
  tipoServico: string
  descricao: string
  valor: number
  kmVeiculo?: number
  observacoes?: string
  criadoEm: string
  alteradoEm?: string
  criadoPor?: number
  alteradoPor?: number
}

export interface ServicoOSRequest {
  tipoServico: string
  descricao: string
  valor: number
  kmVeiculo?: number
  observacoes?: string
}

// ============================================
// Agendamento Types
// ============================================

export type StatusAgendamento =
  | 'AGENDADO'
  | 'CONFIRMADO'
  | 'EM_ATENDIMENTO'
  | 'CONCLUIDO'
  | 'CANCELADO'
  | 'REAGENDADO'

export interface Agendamento {
  id: number
  clienteId: number
  nomeCliente?: string
  veiculoId: number
  modeloVeiculo?: string
  mecanicoId: number
  nomeMecanico?: string
  dataHoraInicio: string
  dataHoraFim: string
  status: StatusAgendamento
  servicosSolicitados: string[]
  observacoes?: string
  ordemServicoId?: number
  criadoEm: string
}

export interface AgendamentoRequest {
  clienteId: number
  veiculoId: number
  mecanicoId: number
  dataHoraInicio: string
  dataHoraFim: string
  servicosSolicitados: string[]
  observacoes?: string
}

export interface DisponibilidadeMecanico {
  mecanicoId: number
  nomeMecanico: string
  horariosDisponiveis: Array<{
    inicio: string
    fim: string
  }>
}
