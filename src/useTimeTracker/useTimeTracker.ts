import { reactive, computed, ComputedRef, Reactive, ref, Ref } from 'vue'
import { DateTime, Duration, DurationObjectUnits } from 'luxon'

export interface TrackerEntryRaw {
  id: string
  start: DateTime
  end: DateTime
  note?: string
}

export interface TrackerEntryComputed {
  id: string
  start: DateTime
  end: DateTime
  duration: Duration
  totalSeconds: number
  note?: string
}

interface TrackerGroup {
  date: string
  entries: TrackerEntryComputed[]
  totalSeconds: number
}

export interface StatsSummary {
  min: number
  max: number
  avg: number
  total: number
  count: number
}

export interface UseTimeTracker {
  trackerId: string
  label: Ref<string | undefined>
  entries: Reactive<TrackerEntryRaw[]>

  record: (start: DateTime | string | number, durationUnits: DurationObjectUnits, note?: string) => void
  recordDuration: (durationUnits: DurationObjectUnits, end?: DateTime | string | number, note?: string) => void
  recordTime: (start: DateTime | string | number, end: DateTime | string | number, note?: string) => void

  updateEntry: (id: string, updates: Partial<Pick<TrackerEntryRaw, 'start' | 'end' | 'note'>>) => void
  deleteEntry: (id: string) => void

  computedEntries: ComputedRef<TrackerEntryComputed[]>
  groupedByDay: ComputedRef<Record<string, TrackerGroup>>
  groupedByWeek: ComputedRef<Record<string, TrackerGroup>>
  groupedByMonth: ComputedRef<Record<string, TrackerGroup>>

  entriesToday: ComputedRef<TrackerGroup | undefined>
  entriesYesterday: ComputedRef<TrackerGroup | undefined>
  entriesThisWeek: ComputedRef<TrackerGroup | undefined>
  entriesLastWeek: ComputedRef<TrackerGroup | undefined>
  entriesThisMonth: ComputedRef<TrackerGroup | undefined>
  entriesLastMonth: ComputedRef<TrackerGroup | undefined>


  dailyStats: ComputedRef<StatsSummary>
  weeklyStats: ComputedRef<StatsSummary>
  monthlyStats: ComputedRef<StatsSummary>
  allTimeStats: ComputedRef<StatsSummary>
}

export function useTimeTracker(initialId?: string, initialLabel?: string): UseTimeTracker {
  const entries = reactive<TrackerEntryRaw[]>([])
  const trackerId = initialId || generateId()
  const label = ref<string | undefined>(initialLabel)

  function record(startInput: DateTime | string | number, durationUnits: DurationObjectUnits, note?: string) {
    const start = toDateTime(startInput)
    const duration = Duration.fromObject(durationUnits)
    const end = start.plus(duration)
    entries.push({ id: generateId(), start, end, note })
  }

  function recordDuration(durationUnits: DurationObjectUnits, endInput?: DateTime | string | number, note?: string) {
    const end = endInput ? toDateTime(endInput) : DateTime.now()
    const duration = Duration.fromObject(durationUnits)
    const start = end.minus(duration)
    entries.push({ id: generateId(), start, end, note })
  }

  function recordTime(startInput: DateTime | string | number, endInput: DateTime | string | number, note?: string) {
    const start = toDateTime(startInput)
    const end = toDateTime(endInput)
    entries.push({ id: generateId(), start, end, note })
  }

  function updateEntry(id: string, updates: Partial<Pick<TrackerEntryRaw, 'start' | 'end' | 'note'>>) {
    const entry = entries.find(e => e.id === id)
    if (!entry) return
    if (updates.start) entry.start = toDateTime(updates.start)
    if (updates.end) entry.end = toDateTime(updates.end)
    if (updates.note !== undefined) entry.note = updates.note
  }

  function deleteEntry(id: string) {
    const index = entries.findIndex(e => e.id === id)
    if (index !== -1) entries.splice(index, 1)
  }

  const computedEntries = computed<TrackerEntryComputed[]>(() => {
    return entries.map(({ id, start, end, note }) => {
      const duration = end.diff(start)
      return {
        id,
        start,
        end,
        note,
        duration,
        totalSeconds: duration.as('seconds')
      }
    })
  })

  const groupedByDay = computed(() =>
    groupEntriesBy(computedEntries.value, e => e.start.toISODate() ?? 'invalid-date')
  )

  const groupedByWeek = computed(() =>
    groupEntriesBy(computedEntries.value, e => e.start.toFormat("kkkk-'W'WW"))
  )

  const groupedByMonth = computed(() =>
    groupEntriesBy(computedEntries.value, e => e.start.toFormat("yyyy-MM"))
  )

  const entriesToday = computed(() => groupedByDay.value[DateTime.now().toISODate() ?? ''])
  const entriesYesterday = computed(() => groupedByDay.value[DateTime.now().minus({ days: 1 }).toISODate() ?? ''])
  const entriesThisWeek = computed(() => groupedByWeek.value[DateTime.now().toFormat("kkkk-'W'WW")])
  const entriesThisMonth = computed(() => groupedByMonth.value[DateTime.now().toFormat("yyyy-MM")])
  const entriesLastWeek = computed(() => {
    const lastWeekStart = DateTime.now().minus({ weeks: 1 }).startOf('week')
    const key = lastWeekStart.toFormat("kkkk-'W'WW")
    return groupedByWeek.value[key]
  })

  const entriesLastMonth = computed(() => {
    const lastMonthStart = DateTime.now().minus({ months: 1 }).startOf('month')
    const key = lastMonthStart.toFormat('yyyy-MM')
    return groupedByMonth.value[key]
  })


  const dailyStats = computed(() => computeStats(groupedByDay.value))
  const weeklyStats = computed(() => computeStats(groupedByWeek.value))
  const monthlyStats = computed(() => computeStats(groupedByMonth.value))
  const allTimeStats = computed(() => computeEntryStats(computedEntries.value))

  return {
    trackerId,
    label,
    entries,
    record,
    recordDuration,
    recordTime,
    updateEntry,
    deleteEntry,
    computedEntries,
    groupedByDay,
    groupedByWeek,
    groupedByMonth,
    entriesToday,
    entriesYesterday,
    entriesThisWeek,
    entriesLastWeek,
    entriesThisMonth,
    entriesLastMonth,
    dailyStats,
    weeklyStats,
    monthlyStats,
    allTimeStats
  }
}


// --- Helper ---
function toDateTime(val: DateTime | string | number): DateTime {
  return val instanceof DateTime
    ? val
    : typeof val === 'string'
    ? DateTime.fromISO(val)
    : DateTime.fromMillis(val)
}

function groupEntriesBy(
  entries: TrackerEntryComputed[],
  keyFn: (entry: TrackerEntryComputed) => string
): Record<string, TrackerGroup> {
  const groups: Record<string, TrackerGroup> = {}

  for (const entry of entries) {
    const key = keyFn(entry)

    if (!groups[key]) {
      groups[key] = {
        date: key,
        entries: [],
        totalSeconds: 0
      }
    }

    groups[key].entries.push(entry)
    groups[key].totalSeconds += entry.totalSeconds
  }

  return groups
}

function computeStats(groups: Record<string, TrackerGroup>) {
  const totals = Object.values(groups).map(g => g.totalSeconds)

  if (totals.length === 0) {
    return { min: 0, max: 0, avg: 0, total: 0, count: 0 }
  }

  const total = totals.reduce((sum, v) => sum + v, 0)
  const min = Math.min(...totals)
  const max = Math.max(...totals)
  const avg = total / totals.length
  const count = totals.length

  return { min, max, avg, total, count }
}

function computeEntryStats(entries: TrackerEntryComputed[]): StatsSummary {
  const totals = entries.map(e => e.totalSeconds)

  if (totals.length === 0) {
    return { min: 0, max: 0, avg: 0, total: 0, count: 0 }
  }

  const total = totals.reduce((sum, v) => sum + v, 0)
  const min = Math.min(...totals)
  const max = Math.max(...totals)
  const avg = total / totals.length
  const count = totals.length

  return { min, max, avg, total, count }
}

function generateId(): string {
  return cryptoRandomId(7)
}

function cryptoRandomId(length: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, byte => chars[byte % chars.length]).join('')
}



