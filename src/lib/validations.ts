// ============================================
// Validações de Campos
// ============================================

export interface ValidationResult {
  isValid: boolean
  error?: string
}

// CPF
export function validateCPF(cpf: string): ValidationResult {
  const cleaned = cpf.replace(/\D/g, '')

  if (cleaned.length === 0) {
    return { isValid: false, error: 'CPF é obrigatório' }
  }

  if (cleaned.length !== 11) {
    return { isValid: false, error: 'CPF deve ter 11 dígitos' }
  }

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cleaned)) {
    return { isValid: false, error: 'CPF inválido' }
  }

  // Validação do dígito verificador
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned[i]) * (10 - i)
  }
  let digit = (sum * 10) % 11
  if (digit === 10 || digit === 11) digit = 0
  if (digit !== parseInt(cleaned[9])) {
    return { isValid: false, error: 'CPF inválido' }
  }

  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned[i]) * (11 - i)
  }
  digit = (sum * 10) % 11
  if (digit === 10 || digit === 11) digit = 0
  if (digit !== parseInt(cleaned[10])) {
    return { isValid: false, error: 'CPF inválido' }
  }

  return { isValid: true }
}

// CNPJ
export function validateCNPJ(cnpj: string): ValidationResult {
  const cleaned = cnpj.replace(/\D/g, '')

  if (cleaned.length === 0) {
    return { isValid: false, error: 'CNPJ é obrigatório' }
  }

  if (cleaned.length !== 14) {
    return { isValid: false, error: 'CNPJ deve ter 14 dígitos' }
  }

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cleaned)) {
    return { isValid: false, error: 'CNPJ inválido' }
  }

  // Validação do dígito verificador
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleaned[i]) * weights1[i]
  }
  let digit = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (digit !== parseInt(cleaned[12])) {
    return { isValid: false, error: 'CNPJ inválido' }
  }

  sum = 0
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleaned[i]) * weights2[i]
  }
  digit = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (digit !== parseInt(cleaned[13])) {
    return { isValid: false, error: 'CNPJ inválido' }
  }

  return { isValid: true }
}

// CPF ou CNPJ
export function validateCPFOrCNPJ(value: string): ValidationResult {
  const cleaned = value.replace(/\D/g, '')

  if (cleaned.length === 0) {
    return { isValid: false, error: 'Documento é obrigatório' }
  }

  if (cleaned.length === 11) {
    return validateCPF(cleaned)
  }

  if (cleaned.length === 14) {
    return validateCNPJ(cleaned)
  }

  return { isValid: false, error: 'Documento deve ter 11 (CPF) ou 14 (CNPJ) dígitos' }
}

// Telefone
export function validatePhone(phone: string): ValidationResult {
  const cleaned = phone.replace(/\D/g, '')

  if (cleaned.length === 0) {
    return { isValid: false, error: 'Telefone é obrigatório' }
  }

  if (cleaned.length < 10 || cleaned.length > 11) {
    return { isValid: false, error: 'Telefone deve ter 10 ou 11 dígitos' }
  }

  // DDD válido (11-99)
  const ddd = parseInt(cleaned.substring(0, 2))
  if (ddd < 11 || ddd > 99) {
    return { isValid: false, error: 'DDD inválido' }
  }

  return { isValid: true }
}

// Email
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim().length === 0) {
    return { isValid: false, error: 'Email é obrigatório' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Email inválido' }
  }

  return { isValid: true }
}

// Senha
export function validatePassword(password: string): ValidationResult {
  if (!password || password.length === 0) {
    return { isValid: false, error: 'Senha é obrigatória' }
  }

  if (password.length < 6) {
    return { isValid: false, error: 'Senha deve ter no mínimo 6 caracteres' }
  }

  return { isValid: true }
}

// Nome
export function validateName(name: string, fieldName: string = 'Nome'): ValidationResult {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: `${fieldName} é obrigatório` }
  }

  if (name.trim().length < 3) {
    return { isValid: false, error: `${fieldName} deve ter no mínimo 3 caracteres` }
  }

  return { isValid: true }
}

// Placa
export function validatePlaca(placa: string): ValidationResult {
  const cleaned = placa.toUpperCase().replace(/[^A-Z0-9]/g, '')

  if (cleaned.length === 0) {
    return { isValid: false, error: 'Placa é obrigatória' }
  }

  if (cleaned.length !== 7) {
    return { isValid: false, error: 'Placa deve ter 7 caracteres' }
  }

  // Formato antigo: ABC1234
  const oldFormat = /^[A-Z]{3}[0-9]{4}$/
  // Formato Mercosul: ABC1D23
  const newFormat = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/

  if (!oldFormat.test(cleaned) && !newFormat.test(cleaned)) {
    return { isValid: false, error: 'Formato de placa inválido (ABC-1234 ou ABC1D23)' }
  }

  return { isValid: true }
}

// Valor monetário
export function validateCurrency(value: number): ValidationResult {
  if (value === undefined || value === null) {
    return { isValid: false, error: 'Valor é obrigatório' }
  }

  if (value < 0) {
    return { isValid: false, error: 'Valor não pode ser negativo' }
  }

  return { isValid: true }
}

// Campo obrigatório genérico
export function validateRequired(value: string | number | undefined | null, fieldName: string): ValidationResult {
  if (value === undefined || value === null || value === '' || value === 0) {
    return { isValid: false, error: `${fieldName} é obrigatório` }
  }

  return { isValid: true }
}

// ============================================
// Form Validators (retornam objeto de erros)
// ============================================

export interface ClienteFormData {
  nomeCompleto: string
  documento: string
  telefone: string
}

export function validateClienteForm(data: ClienteFormData): Record<string, string> {
  const errors: Record<string, string> = {}

  const nomeResult = validateName(data.nomeCompleto, 'Nome completo')
  if (!nomeResult.isValid) errors.nomeCompleto = nomeResult.error!

  const docResult = validateCPFOrCNPJ(data.documento)
  if (!docResult.isValid) errors.documento = docResult.error!

  const phoneResult = validatePhone(data.telefone)
  if (!phoneResult.isValid) errors.telefone = phoneResult.error!

  return errors
}

export interface VeiculoFormData {
  placa: string
  modelo: string
  marca: string
  clienteId: number
}

export function validateVeiculoForm(data: VeiculoFormData): Record<string, string> {
  const errors: Record<string, string> = {}

  const placaResult = validatePlaca(data.placa)
  if (!placaResult.isValid) errors.placa = placaResult.error!

  const modeloResult = validateName(data.modelo, 'Modelo')
  if (!modeloResult.isValid) errors.modelo = modeloResult.error!

  const marcaResult = validateName(data.marca, 'Marca')
  if (!marcaResult.isValid) errors.marca = marcaResult.error!

  const clienteResult = validateRequired(data.clienteId, 'Cliente')
  if (!clienteResult.isValid) errors.clienteId = clienteResult.error!

  return errors
}

export interface UsuarioFormData {
  nome: string
  email: string
  senha: string
  roles: string[]
}

export function validateUsuarioForm(data: UsuarioFormData, isEdit: boolean = false): Record<string, string> {
  const errors: Record<string, string> = {}

  const nomeResult = validateName(data.nome)
  if (!nomeResult.isValid) errors.nome = nomeResult.error!

  const emailResult = validateEmail(data.email)
  if (!emailResult.isValid) errors.email = emailResult.error!

  // Senha só é obrigatória na criação
  if (!isEdit) {
    const senhaResult = validatePassword(data.senha)
    if (!senhaResult.isValid) errors.senha = senhaResult.error!
  }

  if (!data.roles || data.roles.length === 0) {
    errors.roles = 'Selecione pelo menos uma função'
  }

  return errors
}

export interface OrdemFormData {
  clienteId: number
  veiculoId: number
  responsavelId: number
  status: string
  valorTotal: number
}

export function validateOrdemForm(data: OrdemFormData): Record<string, string> {
  const errors: Record<string, string> = {}

  const clienteResult = validateRequired(data.clienteId, 'Cliente')
  if (!clienteResult.isValid) errors.clienteId = clienteResult.error!

  const veiculoResult = validateRequired(data.veiculoId, 'Veículo')
  if (!veiculoResult.isValid) errors.veiculoId = veiculoResult.error!

  const responsavelResult = validateRequired(data.responsavelId, 'Responsável')
  if (!responsavelResult.isValid) errors.responsavelId = responsavelResult.error!

  const valorResult = validateCurrency(data.valorTotal)
  if (!valorResult.isValid) errors.valorTotal = valorResult.error!

  return errors
}

// ============================================
// Validação de Serviço OS
// ============================================

export interface ServicoOSFormData {
  tipoServico: string
  descricao: string
  valor: number
  kmVeiculo?: number
  observacoes?: string
}

export function validateServicoOSForm(data: ServicoOSFormData): Record<string, string> {
  const errors: Record<string, string> = {}

  if (!data.tipoServico || data.tipoServico.trim() === '') {
    errors.tipoServico = 'Tipo de serviço é obrigatório'
  }

  if (!data.descricao || data.descricao.trim() === '') {
    errors.descricao = 'Descrição é obrigatória'
  } else if (data.descricao.length < 5) {
    errors.descricao = 'Descrição deve ter pelo menos 5 caracteres'
  }

  if (data.valor === undefined || data.valor <= 0) {
    errors.valor = 'Valor deve ser maior que zero'
  }

  if (data.kmVeiculo !== undefined && data.kmVeiculo < 0) {
    errors.kmVeiculo = 'Km do veículo não pode ser negativo'
  }

  return errors
}
