import type { StatusOrdem } from '@/types'

// ============================================
// Status Configuration
// ============================================

export interface StatusConfig {
  bg: string
  text: string
  border: string
  dot: string
  label: string
}

export const STATUS_CONFIG: Record<StatusOrdem, StatusConfig> = {
  ORCAMENTO: {
    bg: 'bg-purple/10',
    text: 'text-purple',
    border: 'border-purple/20',
    dot: 'bg-purple',
    label: 'Orçamento',
  },
  ORCAMENTO_APROVADO: {
    bg: 'bg-success/10',
    text: 'text-success',
    border: 'border-success/20',
    dot: 'bg-success',
    label: 'Orçamento Aprovado',
  },
  ORCAMENTO_RECUSADO: {
    bg: 'bg-danger/10',
    text: 'text-danger',
    border: 'border-danger/20',
    dot: 'bg-danger',
    label: 'Orçamento Recusado',
  },
  PENDENTE: {
    bg: 'bg-warning/10',
    text: 'text-warning',
    border: 'border-warning/20',
    dot: 'bg-warning',
    label: 'Pendente',
  },
  EM_ANDAMENTO: {
    bg: 'bg-info/10',
    text: 'text-info',
    border: 'border-info/20',
    dot: 'bg-info',
    label: 'Em andamento',
  },
  CONCLUIDO: {
    bg: 'bg-success/10',
    text: 'text-success',
    border: 'border-success/20',
    dot: 'bg-success',
    label: 'Concluído',
  },
  CANCELADO: {
    bg: 'bg-danger/10',
    text: 'text-danger',
    border: 'border-danger/20',
    dot: 'bg-danger',
    label: 'Cancelado',
  },
}

export const STATUS_OPTIONS = [
  { value: 'ORCAMENTO' as StatusOrdem, label: 'Orçamento' },
  { value: 'ORCAMENTO_APROVADO' as StatusOrdem, label: 'Orçamento Aprovado' },
  { value: 'ORCAMENTO_RECUSADO' as StatusOrdem, label: 'Orçamento Recusado' },
  { value: 'PENDENTE' as StatusOrdem, label: 'Pendente' },
  { value: 'EM_ANDAMENTO' as StatusOrdem, label: 'Em Andamento' },
  { value: 'CONCLUIDO' as StatusOrdem, label: 'Concluído' },
  { value: 'CANCELADO' as StatusOrdem, label: 'Cancelado' },
]

export const STATUS_FILTERS = ['TODOS', 'ORCAMENTO', 'ORCAMENTO_APROVADO', 'ORCAMENTO_RECUSADO', 'PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO'] as const

// ============================================
// Roles Configuration
// ============================================

export interface RoleConfig {
  value: string
  label: string
  color: 'danger' | 'info' | 'warning' | 'success' | 'default'
}

export const ROLES_CONFIG: RoleConfig[] = [
  { value: 'ADMIN', label: 'Administrador', color: 'danger' },
  { value: 'MECANICO', label: 'Mecânico', color: 'info' },
  { value: 'ATENDENTE', label: 'Atendente', color: 'warning' },
]

// ============================================
// Navigation Configuration
// ============================================

export interface NavItem {
  href: string
  icon: string
  label: string
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', icon: '📊', label: 'Dashboard' },
  { href: '/agendamentos', icon: '📅', label: 'Agendamentos' },
  { href: '/ordens', icon: '📋', label: 'Ordens de Serviço' },
  { href: '/clientes', icon: '👥', label: 'Clientes' },
  { href: '/veiculos', icon: '🚗', label: 'Veículos' },
  { href: '/usuarios', icon: '👤', label: 'Usuários' },
]

// ============================================
// Masks and Patterns
// ============================================

export const PATTERNS = {
  cpf: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
  cnpj: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
  phone: /^\(\d{2}\)\s?\d{4,5}-\d{4}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  placaAntiga: /^[A-Z]{3}-\d{4}$/,
  placaMercosul: /^[A-Z]{3}\d[A-Z]\d{2}$/,
}

// ============================================
// API Endpoints
// ============================================

export const ENDPOINTS = {
  // Auth
  login: '/auth/login',
  logout: '/auth/logout',
  refresh: '/auth/refresh',
  
  // Clientes
  clientes: '/clientes',
  clienteById: (id: number) => `/clientes/${id}`,
  clienteByDocumento: (documento: string) => `/clientes/documento/${documento}`,
  
  // Veículos
  veiculos: '/veiculos',
  veiculoById: (id: number) => `/veiculos/${id}`,
  veiculosByCliente: (clienteId: number) => `/veiculos/cliente/${clienteId}`,
  veiculoByPlaca: (placa: string) => `/veiculos/placa/${placa}`,
  
  // Ordens de Serviço
  ordens: '/ordens-servico',
  ordemById: (id: number) => `/ordens-servico/${id}`,
  ordensByCliente: (clienteId: number) => `/ordens-servico/cliente/${clienteId}`,
  ordensByStatus: (status: string) => `/ordens-servico/status/${status}`,
  ordemByRastreio: (codigo: string) => `/ordens-servico/rastreio/${codigo}`,
  
  // Usuários
  usuarios: '/usuarios',
  usuarioById: (id: number) => `/usuarios/${id}`,
  usuarioByEmail: (email: string) => `/usuarios/email/${email}`,
  usuarioMe: '/usuarios/me',
  usuarioTipos: '/usuarios/tipos',
}
