import { DateTime } from 'luxon'

export function toDateTime(val?: DateTime | string | number | Date | undefined): DateTime {
  if (val instanceof DateTime) {
    return val
  }
  
  if (val === undefined || val === "") {
    return DateTime.now()
  }

  if (val instanceof Date) {
    return DateTime.fromJSDate(val)
  }

  if (typeof val === 'string') {
    const dt = DateTime.fromISO(val)
    return dt.isValid ? dt : DateTime.now()
  }

  if (typeof val === 'number') {
    const dt = DateTime.fromMillis(val)
    return dt.isValid ? dt : DateTime.now()
  }

  return DateTime.now()
}

export function generateId(): string {
  return cryptoRandomId(7)
}

function cryptoRandomId(length: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, byte => chars[byte % chars.length]).join('')
}