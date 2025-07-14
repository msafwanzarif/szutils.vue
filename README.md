# szutils.vue

A modular Vue 3 composables collection designed for reactive productivity, time tracking, and habit building. Each utility is independently packaged, documented, and demo-ready.

> 🔧 Built with Vite + TypeScript  
> 📦 Published as ESM & UMD on npm and CDN 
> 🎯 Lightweight and reactive Vue composables

---

## 📚 Utilities

### 1. [`useDuration`](./src/useDuration)

A reactive Luxon-based stopwatch/timer with real-time tracking support.  
✅ Features `run()`, `stop()`, `reset()`, and `elapsed` tracking with `isRunning` status.

> Demo: `src/useDuration/Demo.vue`

---

### 2. [`useDurationDisplay`](./src/useDurationDisplay)

Format and display durations in a readable way.  
✅ Converts milliseconds or Luxon durations to human-friendly strings.

---

### 3. [`useTimeTracker`](./src/useTimeTracker)

Track how much time has been spent doing something — session-by-session or continuously.  
✅ Entries, streaks, grouping by day/week/month, and total duration.

> Demo: `src/useTimeTracker/Demo.vue`

---

### 4. [`useHabitTracker`](./src/useHabitTracker)

A powerful daily/weekly/monthly habit tracker with goal setting, breaks, off-days, and personal best tracking.  
✅ Tracks reps per day, calculates pass/success, off/break days, streaks, and supports localStorage persistence.

> Demos:
- `entries.vue` — record reps, diary view  
- `settings.vue` — goal/offday/break configuration  
- `dashboard.vue` — summary of performance

---

### 5. [`useMetas`](./src/useMetas)

Reactive metadata management for composables and utilities.  
✅ Store, update, and retrieve meta info for tracking and display.

---

### 6. [`useTimer`](./src/useTimer)

Simple interval-based timer composable.  
✅ Start, stop, reset, and tick events for periodic actions.

---

### 7. [`useTimeTick`](./src/useTimeTick)

Reactive ticking composable for time-based updates.  
✅ Emits ticks at specified intervals for UI refresh or polling.

---

### 8. [`useTimeTickShared`](./src/useTimeTickShared)

Shared ticking composable for global time updates across components.  
✅ Centralized tick source for synchronized updates and avoid too much instances of scheduler.

---

### 9. [`generateId`](./src/utility)

Utility function to generate unique IDs.  
✅ Useful for keys, tracking, and dynamic lists.

---

## 📁 Project Structure

```
src/
├─ useDuration/
├─ useDurationDisplay/
├─ useTimeTracker/
├─ useHabitTracker/
│   ├─ index.ts
│   ├─ index.md
│   ├─ Demo.vue
│   ├─ demos/
│   │   ├─ entries.vue
│   │   ├─ settings.vue
│   │   └─ dashboard.vue
```

Each utility folder is self-contained with its own:
- `index.ts` (main logic)
- `index.md` (docs)
- `Demo.vue` (interactive demo)
- `demos/` folder (use-case demos, if needed)

## 📦 Installation

```bash
npm install szutils.vue
```

Or use via CDN:
```html
<script src="https://unpkg.com/szutils.vue"></script>
```

---

## 📄 License

MIT

---

## 🙌 Contributions

Contributions are welcome! Open an issue or submit a PR with ideas, improvements, or new utilities.