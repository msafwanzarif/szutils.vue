# `useTimer`

A reactive timer composable for Vue 3, with pause/resume, elapsed time, and persistence support.

---

## Features

- Start, pause, resume, stop, and reset timer
- Tracks elapsed time in milliseconds
- Pause/resume records for streak analysis
- Reactive state: running, paused, stopped, not started
- Formatted duration output via Luxon
- Save/load timer state to/from JSON (for localStorage, etc.)

---

## Usage

```ts
import { useTimer } from 'szutils.vue'

const {
  start, pause, resume, stop, reset,
  elapsed, isRunning, isPaused, hasStoped, notStarted,
  display, luxon,
  toJSON, loadFromJSON
} = useTimer()

start()      // Start timer
pause()      // Pause timer
resume()     // Resume timer
stop()       // Stop timer
reset()      // Reset timer

console.log(elapsed.value)         // Milliseconds elapsed
console.log(display.value.timer)   // Formatted string (hh:mm:ss)
```

---

## API

- `start()`: Start the timer
- `pause()`: Pause the timer
- `resume()`: Resume after pause
- `stop()`: Stop the timer
- `reset()`: Reset all state
- `elapsed`: `Ref<number>` (ms)
- `isRunning`, `isPaused`, `hasStoped`, `notStarted`: `ComputedRef<boolean>`
- `display`: Formatted duration parts (see `useDurationDisplay`)
- `luxon`: Luxon Duration object
- `toJSON()`: Export timer state for persistence
- `loadFromJSON(json)`: Restore timer state

---

## Persistence Example

```ts
// Save
localStorage.setItem('timer', JSON.stringify(toJSON()))

// Load
loadFromJSON(JSON.parse(localStorage.getItem('timer')))
```

---

## Notes

- Uses `requestAnimationFrame` for smooth ticking.
- Pause/resume records are tracked for advanced analytics.
- Integrates with `useDurationDisplay` for formatting.

---
