import { z } from 'zod'

// Cliente
export const clienteSchema = z.object({
  nomeCompleto: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  documento: z.string().min(11, 'CPF/CNPJ inválido').max(14),
  telefone: z.string().min(10, 'Telefone inválido'),
})

// Veículo
export const veiculoSchema = z.object({
  placa: z.string().regex(/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/, 'Placa inválida'),
  modelo: z.string().min(2, 'Modelo inválido'),
  marca: z.string().min(2, 'Marca inválida'),
  clienteId: z.number().positive(),
})

// Ordem de Serviço
export const ordemServicoSchema = z.object({
  status: z.enum([
    'ORCAMENTO',
    'ORCAMENTO_APROVADO',
    'ORCAMENTO_RECUSADO',
    'PENDENTE',
    'EM_ANDAMENTO',
    'CONCLUIDO',
    'CANCELADO',
  ]),
  valorTotal: z.number().min(0),
  veiculoId: z.number().positive(),
  clienteId: z.number().positive(),
  responsavelId: z.number().positive(),
})

// Serviço OS
export const servicoOSSchema = z.object({
  tipoServico: z.string().min(1, 'Tipo de serviço obrigatório'),
  descricao: z.string().min(5, 'Descrição deve ter no mínimo 5 caracteres'),
  valor: z.number().min(0, 'Valor deve ser positivo'),
  kmVeiculo: z.number().optional(),
  observacoes: z.string().optional(),
})

// Agendamento
export const agendamentoSchema = z.object({
  clienteId: z.number().positive(),
  veiculoId: z.number().positive(),
  mecanicoId: z.number().positive(),
  dataHoraInicio: z.string().or(z.date()),
  dataHoraFim: z.string().or(z.date()),
  servicosSolicitados: z.array(z.string()).min(1, 'Selecione ao menos um serviço'),
  observacoes: z.string().optional(),
})

// Usuário
export const usuarioSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  ativo: z.boolean(),
  roles: z.array(z.string()).min(1, 'Selecione ao menos uma role'),
})

// Login
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(1, 'Senha obrigatória'),
})

export type ClienteFormData = z.infer<typeof clienteSchema>
export type VeiculoFormData = z.infer<typeof veiculoSchema>
export type OrdemServicoFormData = z.infer<typeof ordemServicoSchema>
export type ServicoOSFormData = z.infer<typeof servicoOSSchema>
export type AgendamentoFormData = z.infer<typeof agendamentoSchema>
export type UsuarioFormData = z.infer<typeof usuarioSchema>
export type LoginFormData = z.infer<typeof loginSchema>
