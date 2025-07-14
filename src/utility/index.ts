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

export function generateId(length:number = 7): string {
  return cryptoRandomId(length)
}

function cryptoRandomId(length: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, byte => chars[byte % chars.length]).join('')
}

/**
 * Get the grouping key for a given date and mode.
 * @param dt DateTime object
 * @param mode 1 = daily, 2 = weekly, 3 = monthly
 */
export function getDateKey(dt: DateTime = DateTime.now(), mode: 1 | 2 | 3 = 1): string {
  return mode === 1
    ? dt.toISODate()??""              // e.g., '2025-07-09'
    : mode === 2
    ? dt.toFormat("kkkk-'W'WW")    // e.g., '2025-W28'
    : dt.toFormat('yyyy-MM')       // e.g., '2025-07'
}

/**
 * Compute basic stats from an array of entries based on a numeric key
 */
export function computeEntryStats(entries: any[], key: string) {
  const values = entries.map(e => e[key]).filter(v => typeof v === 'number')

  if (values.length === 0) {
    return { min: 0, max: 0, avg: 0, total: 0, count: 0 }
  }

  const total = values.reduce((sum, v) => sum + v, 0)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const avg = total / values.length
  const count = values.length

  return { min, max, avg, total, count }
}

export  function computeReversedRanges<T extends { startDate: string }>(records: T[]): (T & { endDate?: string })[] {
  const sorted = [...records].sort((a, b) => b.startDate.localeCompare(a.startDate))
  return sorted.map((r, i) => ({
    ...r,
    endDate: i === 0 ? undefined : sorted[i - 1].startDate
  }))
}

export function findFromRange<T extends { startDate: string }>(
  ranges: T[],
  key: string
): T | undefined {
  return ranges.find(r => r.startDate <= key)
}
