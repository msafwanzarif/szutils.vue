import { ref, computed, ComputedRef, Ref } from 'vue'
import { DateTime } from 'luxon'
import { toDateTime, generateId, getDateKey, computeEntryStats,computeReversedRanges,findFromRange } from '../utility'
import type { HabitEntry, ComputedEntry, GoalRecord, OffDayRecord, GoalRange, OffDayRange, UseHabitTracker, GroupRecord, HabitTrackerJSON } from './types'

export function useHabitTracker(initialId?: string, initialLabel?: string) : UseHabitTracker {
  const id = initialId || generateId()
  const label = ref<string | undefined>(initialLabel)

  const entries = ref<HabitEntry[]>([])
  const dailyGoals = ref<GoalRecord[]>([])
  const weeklyGoals = ref<GoalRecord[]>([])
  const monthlyGoals = ref<GoalRecord[]>([])

  const minDaily = ref<number>(0)
  const minWeekly = ref<number>(0)
  const minMonthly = ref<number>(0)
  
  const dayBreaks = ref<string[]>([])    // e.g., "2025-07-09"
  const weekBreaks = ref<string[]>([])   // e.g., "2025-W28"
  const monthBreaks = ref<string[]>([])  // e.g., "2025-07"
  const offDayRecords = ref<OffDayRecord[]>([])

  const dailyGoalsRanges = computed<GoalRange[]>(() => computeReversedRanges(dailyGoals.value))
  const weeklyGoalsRanges = computed<GoalRange[]>(() => computeReversedRanges(weeklyGoals.value))
  const monthlyGoalsRanges = computed<GoalRange[]>(() => computeReversedRanges(monthlyGoals.value))
  const offDayRanges = computed<OffDayRange[]>(() => computeReversedRanges(offDayRecords.value))

  const computedEntries = computed(() =>
    entries.value
      .map(entry => {
        const timestamp = toDateTime(entry.timestamp)
        return {
          id: entry.id,
          timestamp,
          reps: entry.reps,
          note: entry.note,
          dayKey: getDateKey(timestamp, 1),
          weekKey: getDateKey(timestamp, 2),
          monthKey: getDateKey(timestamp, 3)
        }
      })
      .sort((a, b) => a.timestamp.toMillis() - b.timestamp.toMillis())
  )

  const dailyGroups = computed(() => buildGroups(1))
  const weeklyGroups = computed(() => buildGroups(2))
  const monthlyGroups = computed(() => buildGroups(3))

  const entriesToday = computed(() => query.getEntries("today"))
  const entriesYesterday = computed(() => query.getEntries("yesterday"))
  const entriesThisWeek = computed(() => query.getEntries("week"))
  const entriesLastWeek = computed(() => query.getEntries("lastWeek"))
  const entriesThisMonth = computed(() => query.getEntries("month"))
  const entriesLastMonth = computed(() => query.getEntries("lastMonth"))

  const entriesTodayRaw = computed(() => entriesToday.value?.entries ?? [])
  const entriesYesterdayRaw = computed(() => entriesYesterday.value?.entries ?? [])
  const entriesThisWeekRaw = computed(() => entriesThisWeek.value?.entries ?? [])
  const entriesLastWeekRaw = computed(() => entriesLastWeek.value?.entries ?? [])
  const entriesThisMonthRaw = computed(() => entriesThisMonth.value?.entries ?? [])
  const entriesLastMonthRaw = computed(() => entriesLastMonth.value?.entries ?? [])

  const dailyStats = computed(() => buildStats(dailyGroups.value))
  const weeklyStats = computed(() => buildStats(weeklyGroups.value))
  const monthlyStats = computed(() => buildStats(monthlyGroups.value))
  const allTimeStats = computed(() => computeEntryStats(entries.value, 'reps'))
  const lifeTimeTotal = computed(() => allTimeStats.value.total)
  const personalBest = computed(() => allTimeStats.value.max)

  const today = computed(() => query.getStatus(1))
  const thisWeek = computed(() => query.getStatus(2))
  const thisMonth = computed(() => query.getStatus(3))

  function toggleOffDay(day: number, date?: DateTime | string | number | Date) {
    const dt = toDateTime(date)
    const key = getDateKey(dt, 1)

    const existing = offDayRecords.value.find(r => r.startDate === key)

    if (existing) {
      const index = existing.days.indexOf(day)
      if (index !== -1) {
        existing.days.splice(index, 1)
      } else {
        existing.days.push(day)
      }
      existing.days.sort((a, b) => a - b)
    } else {
      offDayRecords.value.push({ startDate: key, days: [day] })
    }
  }

  function setOffDay(startDate: string, days: number[]) {
    const existing = offDayRecords.value.find(r => r.startDate === startDate)
    if (existing) {
      existing.days = days
    } else {
      offDayRecords.value.push({ startDate, days })
    }
  }

  function setBreak(type: 1 | 2 | 3 = 1, date?: DateTime | string | number | Date) {
    const dt = toDateTime(date)
    const key = getDateKey(dt, type)

    const list =
      type === 1 ? dayBreaks.value :
      type === 2 ? weekBreaks.value :
      monthBreaks.value

    if (!list.includes(key)) {
      list.push(key)
    }
  }


  
  function recordRep(rep: number, note?: string, date?: DateTime | string | number | Date) {
    const d = toDateTime(date)
    const entry: HabitEntry = {
      id: generateId(),
      timestamp: d,
      reps: rep,
      note,
    }
    entries.value.push(entry)
    return entry.id
  }

  function updateRep(id: string, payload: { reps?: number; timestamp?: DateTime | string | number | Date; note?: string }) {
    const entry = entries.value.find(e => e.id === id)
    if (!entry) return

    if (payload.reps) entry.reps = payload.reps
    if (payload.timestamp) entry.timestamp = toDateTime(payload.timestamp)
    if (payload.note) entry.note = payload.note
  }

  function deleteRep(id: string) {
    const index = entries.value.findIndex(e => e.id === id)
    if (index !== -1) {
      entries.value.splice(index, 1)
    }
  }

   function setGoal(type: 1 | 2 | 3, target: number, date?: DateTime | string | number | Date) {
    const dt = toDateTime(date)
    const key = getDateKey(dt, type)
    const goals =
      type === 1 ? dailyGoals.value :
      type === 2 ? weeklyGoals.value :
      monthlyGoals.value
    const currentGoal = query.getGoal(type, dt)
    if( currentGoal === target ) return
    const existing = goals.find(g => g.startDate === key)
    if (existing && existing.target === target) return
    if (existing) existing.target = target
    else goals.push({ startDate: key, target })
  }

  function removeGoal(dateKey: string, type: 1 | 2 | 3) {
    const goals =
      type === 1 ? dailyGoals.value :
      type === 2 ? weeklyGoals.value :
      monthlyGoals.value
    const index = goals.findIndex(g => g.startDate === dateKey)
    if (index !== -1) goals.splice(index, 1)
  }

  function setDailyGoal(target: number, date?: DateTime | string | number | Date) { setGoal(1, target, date) }
  function setWeeklyGoal(target: number, date?: DateTime | string | number | Date) { setGoal(2, target, date) }
  function setMonthlyGoal(target: number, date?: DateTime | string | number | Date) { setGoal(3, target, date) }

  const query = {
    getGoal: (type: 1 | 2 | 3, date?: DateTime | string | number | Date) =>
      findFromRange(
        type === 1 ? dailyGoalsRanges.value :
        type === 2 ? weeklyGoalsRanges.value :
        monthlyGoalsRanges.value,
        getDateKey(toDateTime(date), type)
      )?.target ?? 0,

    getCustomGroups: (type: 1 | 2 | 3, start?: DateTime, end?: DateTime) => {
      const groups = type === 1 ? dailyGroups.value : type === 2 ? weeklyGroups.value : monthlyGroups.value
      const s = start ? getDateKey(start, type) : null
      const e = end ? getDateKey(end, type) : null
      return groups.filter(g => (!s || g.key >= s) && (!e || g.key <= e))
    },

    getCustomStats: (type: 1 | 2 | 3, start?: DateTime, end?: DateTime) => {
      const filtered = query.getCustomGroups(type, start, end)

      const totalRepsStats = computeEntryStats(filtered, 'totalReps')
      const summary = {
        totalDayOff: filtered.filter(f => f.isOff).length,
        totalPassed: filtered.filter(f => f.passed).length,
        totalMissed: filtered.filter(f => f.missed).length,
        totalSuccess: filtered.filter(f => f.success).length,
        totalOvertime: filtered.filter(f => f.overtime).length,
        maxPassedStreak: Math.max(0, ...filtered.map(f => f.passedStreak)),
        maxSuccessStreak: Math.max(0, ...filtered.map(f => f.successStreak)),
        totalTracked: filtered.length,
      }

      return { ...totalRepsStats, ...summary }
    },

    getEntries: (typeOrName: 1 | 2 | 3 | string, date?: DateTime | string | number | Date): GroupRecord => {
      const dt = toDateTime(date)
      const presets: Record<string, [1 | 2 | 3, DateTime]> = {
        today: [1, DateTime.now()],
        yesterday: [1, DateTime.now().minus({ days: 1 })],
        week: [2, DateTime.now()],
        lastWeek: [2, DateTime.now().minus({ weeks: 1 })],
        month: [3, DateTime.now()],
        lastMonth: [3, DateTime.now().minus({ months: 1 })],
      }

      if (typeof typeOrName === 'string' && typeOrName in presets) {
        const [type, d] = presets[typeOrName]
        return query.getEntries(type, d)
      }

      const key = getDateKey(dt, typeOrName as 1 | 2 | 3)
      const group = (typeOrName === 1
        ? dailyGroups.value
        : typeOrName === 2
        ? weeklyGroups.value
        : monthlyGroups.value
      ).find(g => g.key === key)

      return group?? emptyGroupRecord()
    },

    getStatus: (type: 1 | 2 | 3, date?: DateTime | string | number | Date) => {
      const now = toDateTime(date)
      const key = getDateKey(now, type)

      const group = (type === 1
        ? dailyGroups.value
        : type === 2
        ? weeklyGroups.value
        : monthlyGroups.value
      ).find(g => g.key === key)

      const prevKey = getDateKey(
        type === 1
          ? now.minus({ days: 1 })
          : type === 2
          ? now.minus({ weeks: 1 })
          : now.minus({ months: 1 }),
        type
      )

      const prevGroup =
        (type === 1
        ? dailyGroups.value
        : type === 2
        ? weeklyGroups.value
        : monthlyGroups.value
      ).find(g => g.key === prevKey)

      const goal = query.getGoal(type, now)
      const progress = group?.totalReps ?? 0

      const min =
        type === 1 ? minDaily.value
        : type === 2 ? minWeekly.value
        : minMonthly.value

      const best =
        type === 1 ? dailyStats.value.max
        : type === 2 ? weeklyStats.value.max
        : monthlyStats.value.max

      const passedStreak = group?.passed?  group?.passedStreak ?? 0 : progress > 0
        ? group?.passedStreak ?? 0
        : prevGroup?.passedStreak ?? 0

      const successStreak = group?.success?  group?.successStreak ?? 0 : progress > 0
        ? group?.successStreak ?? 0
        : prevGroup?.successStreak ?? 0

      return {
        isBreak: check.isBreak(now, type),
        isOff: type === 1 ? check.isOffDay(now) : false,

        goal,
        progress,
        isPassed: progress > (min ?? 0),
        isSuccess: progress >= goal,

        best,
        passedStreak,
        successStreak,
      }
    }
  }

  const check = {
    isBreakDay: (date?: DateTime | string | number | Date) =>
      dayBreaks.value.includes(getDateKey(toDateTime(date), 1)),

    isBreakWeek: (date?: DateTime | string | number | Date) =>
      weekBreaks.value.includes(getDateKey(toDateTime(date), 2)),

    isBreakMonth: (date?: DateTime | string | number | Date) =>
      monthBreaks.value.includes(getDateKey(toDateTime(date), 3)),

    isBreak: (date?: DateTime | string | number | Date, type: 1 | 2 | 3 = 1) => {
      const key = getDateKey(toDateTime(date), type)
      return (type === 1 ? dayBreaks.value : type === 2 ? weekBreaks.value : monthBreaks.value).includes(key)
    },

    isOffDay: (date?: DateTime | string | number | Date): boolean => {
      const dt = toDateTime(date)
      const key = getDateKey(dt, 1) // daily key format: 'YYYY-MM-DD'
      const weekday = dt.weekday    // Luxon: 1 (Mon) to 7 (Sun)

      const match = findFromRange(offDayRanges.value, key)
      return match?.days.includes(weekday) ?? false
    }
  }

  // helpers
  function emptyGroupRecord(): GroupRecord {
    return {
      key: 'XXX-XX-XX', // placeholder key
      entries: [],
      totalReps: 0,
      targetReps: 0,
      isOff: false,
      passed: false,
      success: false,
      missed: false,
      overtime: false,
      passedStreak: 0,
      successStreak: 0
    }
  }
  function buildGroups(type: 1 | 2 | 3) {
    const grouped: Record<string, ComputedEntry[]> = {}
    const entries = computedEntries.value
    for (const entry of entries) {
      const key = getDateKey(entry.timestamp, type)
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(entry)
    }

    const keys = Object.keys(grouped)
    if (keys.length === 0) return []

    const first = toDateTime(entries[0].timestamp)
    const last = toDateTime(entries[entries.length - 1].timestamp)
    const results = []

    let cursor = first.startOf(type === 1 ? 'day' : type === 2 ? 'week' : 'month')
    let passedStreak = 0
    let successStreak = 0

    while (cursor <= last.endOf(type === 1 ? 'day' : type === 2 ? 'week' : 'month')) {
      const key = getDateKey(cursor, type)
      const entries = grouped[key] || []
      const totalReps = entries.reduce((sum, e) => sum + e.reps, 0)
      const goal = query.getGoal(type, cursor)
      const min = type === 1 ? minDaily.value : type === 2 ? minWeekly.value : minMonthly.value

      const isOff = check.isBreak(cursor, type) || (type === 1 && check.isOffDay(cursor))
      const passed = totalReps > min
      const success = totalReps >= goal
      const missed = !passed && !isOff
      const overtime = isOff && passed

      if (passed) passedStreak++
      else if (missed) passedStreak = 0

      if (success) successStreak++
      else if (!isOff) successStreak = 0

      results.push({
        key,
        entries,
        totalReps,
        targetReps: goal,
        isOff,
        passed,
        success,
        missed,
        overtime,
        passedStreak,
        successStreak,
      })

      cursor = cursor.plus({ [type === 1 ? 'days' : type === 2 ? 'weeks' : 'months']: 1 })
    }

    return results
  }

  function buildStats(groups: {
    totalReps: number
    isOff: boolean
    passed: boolean
    missed: boolean
    success: boolean
    overtime: boolean
    passedStreak: number
    successStreak: number
  }[]) {
    const totalTracked = groups.length

    if (totalTracked === 0) return {
      totalTracked,
      min: 0, max: 0, total: 0, count: 0, avg: 0,
      totalDayOff: 0, totalPassed: 0, totalMissed: 0,
      totalSuccess: 0, totalOvertime: 0,
      maxPassedStreak: 0, maxSuccessStreak: 0
    }

    let min = Infinity
    let max = -Infinity
    let total = 0
    let count = 0

    let totalDayOff = 0
    let totalPassed = 0
    let totalMissed = 0
    let totalSuccess = 0
    let totalOvertime = 0
    let maxPassedStreak = 0
    let maxSuccessStreak = 0

    for (const g of groups) {
      const reps = g.totalReps
      if (reps > 0) {
        count++
        total += reps
        if (reps < min) min = reps
        if (reps > max) max = reps
      }

      if (g.isOff) totalDayOff++
      if (g.passed) totalPassed++
      if (g.missed) totalMissed++
      if (g.success) totalSuccess++
      if (g.overtime) totalOvertime++

      if (g.passedStreak > maxPassedStreak) maxPassedStreak = g.passedStreak
      if (g.successStreak > maxSuccessStreak) maxSuccessStreak = g.successStreak
    }

    return {
      totalTracked,
      min: isFinite(min) ? min : 0,
      max: isFinite(max) ? max : 0,
      total,
      count,
      avg: count > 0 ? total / count : 0,
      totalDayOff,
      totalPassed,
      totalMissed,
      totalSuccess,
      totalOvertime,
      maxPassedStreak,
      maxSuccessStreak
    }
  }

  function toJSON() : HabitTrackerJSON {
    return {
      id,
      label: label.value,
      entries: entries.value.map(e => ({
        ...e,
        timestamp: e.timestamp.toMillis(), // convert to epoch millis
      })),
      dailyGoals: [...dailyGoals.value],
      weeklyGoals: [...weeklyGoals.value],
      monthlyGoals: [...monthlyGoals.value],
      offDayRecords: [...offDayRecords.value],
      dayBreaks: [...dayBreaks.value],
      weekBreaks: [...weekBreaks.value],
      monthBreaks: [...monthBreaks.value],
      minDaily: minDaily.value,
      minWeekly: minWeekly.value,
      minMonthly: minMonthly.value,
    }
  }

  function loadFromJSON(data: HabitTrackerJSON) {
    if (!data || typeof data !== 'object') return

    label.value = data.label || ''

    entries.value = Array.isArray(data.entries)
      ? data.entries.map((e: any) => ({
          id: e.id,
          reps: e.reps,
          note: e.note,
          timestamp: toDateTime(e.timestamp), // handles millis or ISO
        }))
      : []

    dailyGoals.value = Array.isArray(data.dailyGoals) ? [...data.dailyGoals] : []
    weeklyGoals.value = Array.isArray(data.weeklyGoals) ? [...data.weeklyGoals] : []
    monthlyGoals.value = Array.isArray(data.monthlyGoals) ? [...data.monthlyGoals] : []

    offDayRecords.value = Array.isArray(data.offDayRecords) ? [...data.offDayRecords] : []

    dayBreaks.value = Array.isArray(data.dayBreaks) ? [...data.dayBreaks] : []
    weekBreaks.value = Array.isArray(data.weekBreaks) ? [...data.weekBreaks] : []
    monthBreaks.value = Array.isArray(data.monthBreaks) ? [...data.monthBreaks] : []

    minDaily.value = typeof data.minDaily === 'number' ? data.minDaily : 0
    minWeekly.value = typeof data.minWeekly === 'number' ? data.minWeekly : 0
    minMonthly.value = typeof data.minMonthly === 'number' ? data.minMonthly : 0
  }

  return {
    id,
    label,

    // state
    entries,
    dailyGoals,
    weeklyGoals,
    monthlyGoals,
    offDayRecords,
    dayBreaks,
    weekBreaks,
    monthBreaks,
    minDaily,
    minWeekly,
    minMonthly,

    // ranges
    dailyGoalsRanges,
    weeklyGoalsRanges,
    monthlyGoalsRanges,
    offDayRanges,

    // groups and stats
    computedEntries,
    dailyGroups,
    weeklyGroups,
    monthlyGroups,
    dailyStats,
    weeklyStats,
    monthlyStats,
    allTimeStats,
    lifeTimeTotal,
    personalBest,

    // presets
    entriesToday,
    entriesYesterday,
    entriesThisWeek,
    entriesLastWeek,
    entriesThisMonth,
    entriesLastMonth,

    entriesTodayRaw,
    entriesYesterdayRaw,
    entriesThisWeekRaw,
    entriesLastWeekRaw,
    entriesThisMonthRaw,
    entriesLastMonthRaw,

    // methods
    recordRep,
    updateRep,
    deleteRep,
    setDailyGoal,
    setWeeklyGoal,
    setMonthlyGoal,
    setGoal,
    removeGoal,
    toggleOffDay,
    setOffDay,
    setBreak,

    // status
    today,
    thisWeek,
    thisMonth,

    // scopes
    query,
    getEntries: query.getEntries, // alias
    check,
    toJSON,
    loadFromJSON
  }
}




