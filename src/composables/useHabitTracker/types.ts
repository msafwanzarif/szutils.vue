import type { Ref, ComputedRef } from 'vue'
import type { DateTime } from 'luxon'

export interface HabitEntry {
  id: string
  timestamp: DateTime
  reps: number
  note?: string
}

export interface ComputedEntry {
  id: string
  timestamp: DateTime
  reps: number
  note: string | undefined
  dayKey: string
  weekKey: string
  monthKey: string
}[]

export interface GoalRecord {
  startDate: string // ISO date (YYYY-MM-DD)
  target: number
}

export interface OffDayRecord {
  startDate: string
  days: number[]
}

export interface IntervalRecord {
  startDate: string
  interval: number
}

export interface GoalRange extends GoalRecord {
  endDate?: string
}

export interface OffDayRange extends OffDayRecord {
  endDate?: string
}

export interface Range<T> {
  startDate: string
  endDate?: string
  value: T
}

export interface StatusSummary {
  isBreak: boolean;
  isOff: boolean;
  goal: number;
  progress: number;
  isPassed: boolean;
  isSuccess: boolean;
  best: number;
  passedStreak: number;
  successStreak: number;
}

export interface GroupRecord {
  key: string
  entries: ComputedEntry[]
  totalReps: number
  targetReps: number
  isOff: boolean
  passed: boolean
  success: boolean
  missed: boolean
  overtime: boolean
  passedStreak: number
  successStreak: number
}

export interface StatsSummary {
  min: number
  max: number
  total: number
  count: number
  avg: number
}

export interface CustomStats extends StatsSummary {
  totalDayOff: number
  totalPassed: number
  totalMissed: number
  totalSuccess: number
  totalOvertime: number
  maxPassedStreak: number
  maxSuccessStreak: number
  totalTracked: number
}

export interface HabitTrackerJSON {
  id: string;
  currentVersion?:number;
  label: string | undefined;
  entries: {
    timestamp: number;
    id: string;
    reps: number;
    note?: string | undefined;
  }[];
  dailyGoals: {
    startDate: string;
    target: number;
  }[];
  weeklyGoals: {
    startDate: string;
    target: number;
  }[];
  monthlyGoals: {
    startDate: string;
    target: number;
  }[];
  offDayRecords: {
    startDate: string;
    days: number[];
  }[];
  dayBreaks: string[];
  weekBreaks: string[];
  monthBreaks: string[];
  minDaily: number;
  minWeekly: number;
  minMonthly: number;
}

export interface UseHabitTracker {
  id: string
  label: Ref<string | undefined>
  currentVersion: Ref<number>
  dbVersion: Ref<number>
  // Reactive data
  entries: Ref<HabitEntry[]>
  dailyGoals: Ref<GoalRecord[]>
  weeklyGoals: Ref<GoalRecord[]>
  monthlyGoals: Ref<GoalRecord[]>
  offDayRecords: Ref<OffDayRecord[]>
  dayBreaks: Ref<string[]>
  weekBreaks: Ref<string[]>
  monthBreaks: Ref<string[]>

  minDaily: Ref<number>
  minWeekly: Ref<number>
  minMonthly: Ref<number>

  // Computed entries
  computedEntries: ComputedRef<ComputedEntry[]>

  entriesToday: ComputedRef<GroupRecord>
  entriesYesterday: ComputedRef<GroupRecord>
  entriesThisWeek: ComputedRef<GroupRecord>
  entriesLastWeek: ComputedRef<GroupRecord>
  entriesThisMonth: ComputedRef<GroupRecord>
  entriesLastMonth: ComputedRef<GroupRecord>

  entriesTodayRaw: ComputedRef<ComputedEntry[]>
  entriesYesterdayRaw: ComputedRef<ComputedEntry[]>
  entriesThisWeekRaw: ComputedRef<ComputedEntry[]>
  entriesLastWeekRaw: ComputedRef<ComputedEntry[]>
  entriesThisMonthRaw: ComputedRef<ComputedEntry[]>
  entriesLastMonthRaw: ComputedRef<ComputedEntry[]>

  // Ranges (readonly, computed)
  dailyGoalsRanges: ComputedRef<GoalRange[]>
  weeklyGoalsRanges: ComputedRef<GoalRange[]>
  monthlyGoalsRanges: ComputedRef<GoalRange[]>
  offDayRanges: ComputedRef<OffDayRange[]>

  // Groups
  dailyGroups: ComputedRef<GroupRecord[]>
  weeklyGroups: ComputedRef<GroupRecord[]>
  monthlyGroups: ComputedRef<GroupRecord[]>
  dailyStats: ComputedRef<CustomStats>
  weeklyStats: ComputedRef<CustomStats>
  monthlyStats: ComputedRef<CustomStats>
  allTimeStats: ComputedRef<StatsSummary>
  lifeTimeTotal: ComputedRef<number>
  personalBest: ComputedRef<number>

  // Status
  today: ComputedRef<StatusSummary>
  thisWeek: ComputedRef<StatusSummary>
  thisMonth: ComputedRef<StatusSummary>
  // Methods
  recordRep(rep: number, note?: string, timestamp?: DateTime | string | number | Date): void
  updateRep(id: string, data: { rep?: number; note?: string; timestamp?: DateTime | string | number | Date }): void
  deleteRep(id: string): void

  setGoal(type: 1 | 2 | 3, target: number, date?: DateTime | string | number | Date): void
  setDailyGoal(target: number, date?: DateTime | string | number | Date): void
  setWeeklyGoal(target: number, date?: DateTime | string | number | Date): void
  setMonthlyGoal(target: number, date?: DateTime | string | number | Date): void
  removeGoal(dateKey: string, type: 1 | 2 | 3): void

  setOffDay(startDate: string, days: number[]): void
  toggleOffDay(day: number, date?: DateTime | string | number | Date): void
  setBreak(type: 1 | 2 | 3, date?: DateTime | string | number | Date): void
  getEntries(typeOrName: 1 | 2 | 3 | string, date?: DateTime | string | number | Date): GroupRecord
  // Scopes
  query: {
    getGoal(type: 1 | 2 | 3, date?: DateTime | string | number | Date): number
    getCustomGroups(type: 1 | 2 | 3, start?: DateTime, end?: DateTime): GroupRecord[]
    getCustomStats(type: 1 | 2 | 3, start?: DateTime, end?: DateTime): CustomStats
    getEntries(typeOrName: 1 | 2 | 3 | string, date?: DateTime | string | number | Date): GroupRecord
    getStatus(type: 1 | 2 | 3,date?: DateTime | string | number | Date): StatusSummary
  }

  check: {
    isBreakDay(date: DateTime | string | number | Date): boolean
    isBreakWeek(date: DateTime | string | number | Date): boolean
    isBreakMonth(date: DateTime | string | number | Date): boolean
    isBreak(date: DateTime | string | number | Date, type: 1 | 2 | 3): boolean
    isOffDay(date: DateTime | string | number | Date): boolean
  }

  toJSON: (version?:boolean) => HabitTrackerJSON
  loadFromJSON: (json: HabitTrackerJSON) => void
}