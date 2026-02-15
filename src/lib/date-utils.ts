// Normaliza datas que vêm do backend em diferentes formatos
export function normalizeDate(date: string | number[] | Date | undefined): string {
  if (!date) return new Date().toISOString()

  if (typeof date === 'string') return date

  if (date instanceof Date) return date.toISOString()

  // Array format: [year, month, day, hour, minute, second, nano]
  if (Array.isArray(date)) {
    const [year, month, day, hour = 0, minute = 0, second = 0] = date
    return new Date(year, month - 1, day, hour, minute, second).toISOString()
  }

  return new Date().toISOString()
}

// Parse date para Date object
export function parseNormalizedDate(date: string | undefined): Date {
  return date ? new Date(date) : new Date()
}
