import { DateTime, Duration, DurationObjectUnits } from "luxon"
import { ComputedRef, Ref } from "vue"

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

export interface TrackerGroup {
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
  entries: Ref<TrackerEntryRaw[]>

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