# useHabitTracker

A reactive Vue 3 utility for tracking and enforcing daily, weekly, and monthly habits with goals, off-days, breaks, and performance summaries.

---

## 📌 Purpose

`useHabitTracker` helps you manage good habits with flexible goal-setting, streak tracking, and smart date-based aggregation.

---

## 🔧 Setup

```ts
import { useHabitTracker } from 'szutils.vue'

const tracker = useHabitTracker('tracker-id', 'Label (optional)')
```

You can use `.toJSON()` and `.loadFromJSON()` for persistence.

---

## 🧠 State

These are reactive:

```ts
label: Ref<string>
entries: Ref<Entry[]>
dailyGoals, weeklyGoals, monthlyGoals: Ref<GoalRecord[]>
offDayRecords: Ref<OffDayRecord[]>
dayBreaks, weekBreaks, monthBreaks: Ref<string[]>
minDaily, minWeekly, minMonthly: Ref<number>
```

### Entry Structure

```ts
{
  id: string
  timestamp: DateTime
  reps: number
  note?: string
}
```

---

## 📦 Methods

```ts
recordRep(reps: number, note?: string, timestamp?: DateTime | string | number | Date)
updateRep(id: string, { rep?, timestamp?, note? })
deleteRep(id: string)
```

---

## 🎯 Goal & Break Management

```ts
setGoal(type: 1|2|3, target: number, date?)
removeGoal(dateKey: string, type)
setOffDay(startDate: string, days: number[])
toggleOffDay(date)
setBreak(type: 1|2|3, date?)
```

---

## 📊 Computed Groups & Stats

```ts
computedEntries: ComputedRef<Entry[]>
dailyGroups, weeklyGroups, monthlyGroups: ComputedRef<GroupRecord[]>
dailyStats, weeklyStats, monthlyStats: CustomStats
allTimeStats: StatsSummary
```

GroupRecord contains:

```ts
{
  key: string // date key
  totalReps: number
  targetReps: number
  passed: boolean
  success: boolean
  isOff: boolean
  isBreak: boolean
  entries: Entry[]
  passedStreak: number
  successStreak: number
}
```

---

## 🧪 Shortcuts

Preset group and raw entries:

```ts
entriesToday, entriesYesterday, entriesThisWeek, entriesLastWeek, ...
entriesTodayRaw, entriesThisMonthRaw, ...
personalBest, lifeTimeTotal
```

---

## 🔎 query scope

```ts
query.getGoal(type: 1|2|3, date?): number
query.getCustomGroups(type, start?, end?): GroupRecord[]
query.getCustomStats(type, start?, end?): CustomStats
query.getEntries(typeOrName: 1|2|3 | string, date?): Entry[]
query.getStatus(date?): CurrentStatus
```

CurrentStatus includes:

```ts
{
  isBreak: boolean
  isOff: boolean
  goals: { day, week, month }
  progress: { day, week, month }
  isPassed: { day, week, month }
  isSuccess: { day, week, month }
  totalReps: number
}
```

---

## ✅ check scope

```ts
check.isBreakDay(date)
check.isBreakWeek(date)
check.isBreakMonth(date)
check.isBreak(date, type)
check.isOffDay(date)
```

---

## 💾 Persistence

```ts
tracker.toJSON()
tracker.loadFromJSON(data)
```

Use with `localStorage`, `sessionStorage`, or file export.

---

## 🧪 Demo Ready

- **entries.vue** — logging reps with diary and stats  
- **settings.vue** — adjust thresholds, goals, breaks  
- **dashboard.vue** — summary of yesterday, today, and this week  

---

## 🧩 TypeScript Support

Fully typed via `UseHabitTracker`, `Entry`, `GroupRecord`, `CustomStats`, etc.

---