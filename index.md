# szutils.vue

A modular Vue 3 utility collection designed for reactive productivity, time tracking, and habit building. Each utility is independently packaged, documented, and demo-ready.

> 🔧 Built with Vite + TypeScript  
> 📦 Published as ESM & UMD on npm and CDN  
> 🎯 Lightweight, reactive, and composable

---

## 📚 Utilities

### 1. [`useDuration`](./src/useDuration/index.md)

A reactive Luxon-based stopwatch/timer with real-time tracking support.  
✅ Features `run()`, `stop()`, `reset()`, and `elapsed` tracking with `isRunning` status.

> Demo: `src/useDuration/Demo.vue`

---

### 2. [`useTimeTracker`](./src/useTimeTracker/index.md)

Track how much time has been spent doing something — session-by-session or continuously.  
✅ Entries, streaks, grouping by day/week/month, and total duration.

> Demo: `src/useTimeTracker/Demo.vue`

---

### 3. [`useHabitTracker`](./src/useHabitTracker/index.md)

A powerful daily/weekly/monthly habit tracker with goal setting, breaks, off-days, and personal best tracking.  
✅ Tracks reps per day, calculates pass/success, off/break days, streaks, and supports localStorage persistence.

> Demos:
- `entries.vue` — record reps, diary view  
- `settings.vue` — goal/offday/break configuration  
- `dashboard.vue` — summary of performance

---

## 📁 Project Structure

```
src/
├─ useDuration/
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