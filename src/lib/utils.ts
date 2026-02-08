import { formatInTimeZone, toZonedTime, fromZonedTime } from 'date-fns-tz'

const SAO_PAULO_TZ = 'America/Sao_Paulo'

/**
 * Converte uma data para o timezone de São Paulo
 */
export function toSaoPauloTime(date: Date): Date {
  return toZonedTime(date, SAO_PAULO_TZ)
}

/**
 * Converte uma data de São Paulo para UTC
 */
export function fromSaoPauloTime(date: Date): Date {
  return fromZonedTime(date, SAO_PAULO_TZ)
}

/**
 * Retorna a data/hora atual em São Paulo
 */
export function nowInSaoPaulo(): Date {
  return toZonedTime(new Date(), SAO_PAULO_TZ)
}

/**
 * Formata uma data no timezone de São Paulo
 */
export function formatDateInSaoPaulo(date: Date, dateFormat: string = 'dd/MM/yyyy HH:mm'): string {
  return formatInTimeZone(date, SAO_PAULO_TZ, dateFormat)
}

/**
 * Formata um documento (CPF ou CNPJ)
 */
export function formatDocument(doc: string): string {
  const cleaned = doc.replace(/\D/g, '')
  
  if (cleaned.length === 11) {
    // CPF: 000.000.000-00
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }
  
  if (cleaned.length === 14) {
    // CNPJ: 00.000.000/0000-00
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  }
  
  return doc
}

/**
 * Formata um número de telefone
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.length === 11) {
    // Celular: (00) 00000-0000
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }
  
  if (cleaned.length === 10) {
    // Fixo: (00) 0000-0000
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }
  
  return phone
}

/**
 * Formata uma placa de veículo (padrão antigo ou Mercosul)
 */
export function formatPlaca(placa: string): string {
  const cleaned = placa.toUpperCase().replace(/[^A-Z0-9]/g, '')
  
  if (cleaned.length === 7) {
    // Placa Mercosul: ABC1D23
    if (/^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(cleaned)) {
      return cleaned
    }
    // Placa antiga: ABC-1234
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`
  }
  
  return placa.toUpperCase()
}

/**
 * Formata um valor monetário em Real brasileiro
 */
export function parseDate(date: string | number[] | Date): Date {
  if (date instanceof Date) return date
  if (typeof date === 'string') return new Date(date)
  if (Array.isArray(date)) {
    // LocalDateTime do Java vem como [year, month, day, hour, minute, second, nano]
    const [year, month, day, hour = 0, minute = 0, second = 0] = date
    return new Date(year, month - 1, day, hour, minute, second)
  }
  return new Date()
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

/**
 * Converte um valor de data para objeto Date
 * Suporta: string ISO, array LocalDateTime do Java [year, month, day, hour, minute, second, nano]
 */
function parseDate(date: string | number[]): Date {
  if (Array.isArray(date)) {
    // LocalDateTime do Java: [year, month, day, hour, minute, second, nanoseconds]
    const [year, month, day, hour = 0, minute = 0, second = 0] = date
    // Mês no JavaScript é 0-indexed, mas o Java envia 1-indexed
    return new Date(year, month - 1, day, hour, minute, second)
  }
  return new Date(date)
}

/**
 * Formata uma data no padrão brasileiro
 */
export function formatDate(
  date: string | number[],
  options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }
): string {
  const parsedDate = parseDate(date)
  if (isNaN(parsedDate.getTime())) return '-'
  return parsedDate.toLocaleDateString('pt-BR', options)
}

/**
 * Formata data e hora no padrão brasileiro
 */
export function formatDateTime(date: string | number[]): string {
  const parsedDate = parseDate(date)
  if (isNaN(parsedDate.getTime())) return '-'
  return parsedDate.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Retorna uma saudação baseada no horário
 */
export function getGreeting(): string {
  const hour = new Date().getHours()
  
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

/**
 * Gera iniciais a partir de um nome
 */
export function getInitials(name: string, maxLength = 2): string {
  return name
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase())
    .slice(0, maxLength)
    .join('')
}

/**
 * Remove acentos de uma string
 */
export function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

/**
 * Compara strings ignorando acentos e case
 */
export function compareStrings(a: string, b: string): boolean {
  return removeAccents(a.toLowerCase()).includes(removeAccents(b.toLowerCase()))
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Trunca um texto com ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - 3) + '...'
}
