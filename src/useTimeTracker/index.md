# 📘 `useTimeTracker`

A Vue 3 composable utility for time tracking — track durations, categorize entries, compute statistics, and group by date — with reactive state and metadata.

---

## ✨ Features

- Track time with `start` and `end`, or durations only
- Reactive grouping by **day**, **week**, and **month**
- Built-in **stats**: min, max, avg, total, count
- Optional metadata: `note`, `label`
- Entry management: **update**, **delete**
- Unique IDs (crypto-safe) for both tracker and entries

---

## 🔧 Installation

Import `useTimeTracker` into your Vue 3 project:

```ts
import { useTimeTracker } from 'szutils.vue'
```

---

## 🚀 Usage

### 🔹 Initialize Tracker

```ts
const tracker = useTimeTracker() // auto-generates ID
```

or with optional `id` and `label`:

```ts
const tracker = useTimeTracker('tracker-1', 'My Session Log')
```

---

### 🔹 Add Entries

```ts
// Start + Duration
tracker.record(DateTime.now(), { minutes: 5 }, 'Standup Meeting')

// Duration only (ends now)
tracker.recordDuration({ seconds: 30 }, undefined, 'Quick Task')

// Start + End
tracker.recordTime(
  DateTime.now().minus({ minutes: 10 }),
  DateTime.now(),
  'Retrospective'
)
```

---

### 🔹 Edit Entry

```ts
tracker.updateEntry('entry-id-abc', {
  note: 'Updated',
  start: DateTime.now().minus({ minutes: 15 })
})
```

---

### 🔹 Delete Entry

```ts
tracker.deleteEntry('entry-id-abc')
```

---

## 🧱 Data Structures

### 🔸 `TrackerEntryRaw`

```ts
{
  id: string
  start: DateTime
  end: DateTime
  note?: string
}
```

### 🔸 `TrackerEntryComputed`

Adds:

- `duration`: Luxon `Duration`
- `totalSeconds`: number

---

## 📊 Computed Properties

### Entries

```ts
tracker.entries // reactive raw array
tracker.computedEntries // derived with duration, totalSeconds
```

### Grouped

```ts
tracker.groupedByDay
tracker.groupedByWeek
tracker.groupedByMonth
```

### Time-Specific Groups

```ts
tracker.entriesToday
tracker.entriesYesterday
tracker.entriesThisWeek
tracker.entriesLastWeek
tracker.entriesThisMonth
tracker.entriesLastMonth
```

---

### Stats

```ts
tracker.dailyStats
tracker.weeklyStats
tracker.monthlyStats
tracker.allTimeStats
```

All return:

```ts
{
  min: number
  max: number
  avg: number
  total: number
  count: number
}
```

---

## 🆔 ID Generation

- `tracker.trackerId`: Unique string per tracker
- Each entry has a short **crypto-random** ID (default 7–10 chars)
- Safe for tens of millions of entries with negligible collision risk

---

## 💡 Tips

- All time values use **Luxon **`` for safety and formatting.
- You can `watch()` computed entries to persist or export as needed.
- Integrates well with charting tools or activity visualizers.

---

## 📦 Possible Extensions

- Save/load to `localStorage`
- Import/export from JSON
- Tagging, sorting, filtering
- Vue UI component bindings

---

## 🛠 Example

```ts
const { entriesToday, dailyStats } = useTimeTracker()

if (entriesToday?.totalSeconds > dailyStats.max) {
  console.warn('🚨 You’ve exceeded your daily max!')
}
```

---

## 📎 Related

- [`luxon`](https://moment.github.io/luxon/)
- [`vue`](https://vuejs.org/)
- [Crypto-safe ID generation](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues)

