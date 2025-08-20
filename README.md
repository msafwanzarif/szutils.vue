# szutils.vue

A modular Vue 3 composables collection designed for reactive productivity, time tracking, and habit building. Each utility is independently packaged, documented, and demo-ready.

> 🔧 Built with Vite + TypeScript  
> 📦 Published as ESM & UMD on npm and CDN 
> 🎯 Lightweight and reactive Vue composables

## 🚀 Quick Start & Demo

To run the interactive demo app and explore all composables:

```bash
# Install dependencies in root
npm install

# Navigate to the demo app
cd lab/vite

# Install demo app dependencies
npm install

# Start the demo app
npm run dev
```

The demo app showcases all composables with interactive examples and live code demos.

---

## 📚 Utilities

### 1. [`useDuration`](./src/composables/useDuration)

A reactive Luxon-based stopwatch/timer with real-time tracking support.  
✅ Features `run()`, `stop()`, `reset()`, and `elapsed` tracking with `isRunning` status.

---

### 2. [`useDurationDisplay`](./src/composables/useDurationDisplay)

Format and display durations in a readable way.  
✅ Converts milliseconds or Luxon durations to human-friendly strings.

---

### 3. [`useTimeTracker`](./src/composables/useTimeTracker)

Track how much time has been spent doing something — session-by-session or continuously.  
✅ Entries, streaks, grouping by day/week/month, and total duration.

---

### 4. [`useHabitTracker`](./src/composables/useHabitTracker)

A powerful daily/weekly/monthly habit tracker with goal setting, breaks, off-days, and personal best tracking.  
✅ Tracks reps per day, calculates pass/success, off/break days, streaks, and supports localStorage persistence.

> Demos:
- `entries.vue` — record reps, diary view  
- `settings.vue` — goal/offday/break configuration  
- `dashboard.vue` — summary of performance

---

### 5. [`useMetas`](./src/composables/useMetas)

Reactive metadata management for composables and utilities.  
✅ Store, update, and retrieve meta info for tracking and display.

---

### 6. [`useTimer`](./src/composables/useTimer)

Simple interval-based timer composable.  
✅ Start, stop, reset, and tick events for periodic actions.

---

### 7. [`useTimeTick`](./src/composables/useTimeTick)

Reactive ticking composable for time-based updates.  
✅ Emits ticks at specified intervals for UI refresh or polling.

---

### 8. [`useTimeTickShared`](./src/composables/useTimeTickShared)

Shared ticking composable for global time updates across components.  
✅ Centralized tick source for synchronized updates.

---

### 9. [`useFirebaseDb`](./src/composables/useFirebaseDb)

Firebase Firestore database integration composable.  
✅ Reactive Firebase authentication and database operations with configuration management.

---

### 10. [`useFirebaseDoc`](./src/composables/useFirebaseDoc)

Reactive Firestore document management composable with real-time synchronization.  
✅ Document CRUD operations, real-time updates via `onSnapshot`, dynamic document switching, and multi-project support.

---

### 11. [`generateId`](./src/utility)

Utility function to generate unique IDs.  
✅ Useful for keys, tracking, and dynamic lists.

---

## 📁 Project Structure

```
src/
├─ composables/
│   ├─ useDuration/
│   ├─ useDurationDisplay/
│   ├─ useTimeTracker/
│   ├─ useHabitTracker/
│   │   ├─ index.ts
│   │   ├─ README.md
│   │   ├─ Demo.vue
│   │   ├─ demos/
│   │   │   ├─ entries.vue
│   │   │   ├─ settings.vue
│   │   │   └─ dashboard.vue
│   ├─ useMetas/
│   ├─ useTimer/
│   ├─ useTimeTick/
│   ├─ useTimeTickShared/
│   ├─ useTimeTracker/
│   ├─ useFirebaseDb/
│   └─ useFirebaseDoc/
└─ utility/
```

Each utility folder is self-contained with its own:
- `index.ts` (main logic)
- `README.md` (docs)
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