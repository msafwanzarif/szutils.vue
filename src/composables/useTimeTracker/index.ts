import { computed, ref } from 'vue'
import { DateTime, Duration, DurationObjectUnits } from 'luxon'
import { toDateTime, generateId } from '../../utility'
import { useMetas } from '../useMetas'
import { TrackerEntryComputed, TrackerEntryRaw,TrackerGroup,StatsSummary } from './types'

export function useTimeTracker(initialId?: string, initialLabel?: string) {
  const entries = ref<TrackerEntryRaw[]>([])

  const { id, label, note, tags, metaFunctions, meta } = useMetas({
    id: initialId,
    label: initialLabel
  })

  function record(startInput: DateTime | string | number, durationUnits: DurationObjectUnits, note?: string) {
    const start = toDateTime(startInput)
    const duration = Duration.fromObject(durationUnits)
    const end = start.plus(duration)
    entries.value.push({ id: generateId(), start, end, note })
  }

  function recordDuration(durationUnits: DurationObjectUnits, endInput?: DateTime | string | number, note?: string) {
    const end = endInput ? toDateTime(endInput) : DateTime.now()
    const duration = Duration.fromObject(durationUnits)
    const start = end.minus(duration)
    entries.value.push({ id: generateId(), start, end, note })
  }

  function recordTime(startInput: DateTime | string | number, endInput: DateTime | string | number, note?: string) {
    const start = toDateTime(startInput)
    const end = toDateTime(endInput)
    entries.value.push({ id: generateId(), start, end, note })
  }

  function updateEntry(id: string, updates: Partial<Pick<TrackerEntryRaw, 'start' | 'end' | 'note'>>) {
    const entry = entries.value.find(e => e.id === id)
    if (!entry) return
    if (updates.start) entry.start = toDateTime(updates.start)
    if (updates.end) entry.end = toDateTime(updates.end)
    if (updates.note !== undefined) entry.note = updates.note
  }

  function deleteEntry(id: string) {
    const index = entries.value.findIndex(e => e.id === id)
    if (index !== -1) entries.value.splice(index, 1)
  }

  const computedEntries = computed<TrackerEntryComputed[]>(() => {
    return entries.value.map(({ id, start, end, note }) => {
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
    trackerId:id.value,
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
    allTimeStats,
    meta,
    tags,
    note,
    ...metaFunctions
  }
}


// --- Helper ---
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



