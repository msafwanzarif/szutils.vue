# `useTimeTick`

A lightweight Vue 3 composable for running code on every animation frame (using `requestAnimationFrame`), with automatic cleanup when the effect scope is disposed.

---

## Features

- Calls your callback every animation frame
- Provides `deltaMs` (elapsed milliseconds) and `now` (timestamp)
- Reactive `isRunning` state
- Safe cleanup via `onScopeDispose` (if inside a Vue effect scope)

---

## Usage

```ts
import { useTimeTick } from 'szutils.vue'

const { run, stop, isRunning } = useTimeTick({
  onTick: (deltaMs, now) => {
    // Your animation logic here
    console.log(`Elapsed: ${deltaMs}ms, Timestamp: ${now}`)
  }
})

// Start ticking
run()

// Stop ticking
stop()
```

---

## API

### `useTimeTick(options: { onTick: (deltaMs: number, now: number) => void })`

Returns:

- `run()`: Start the animation frame loop
- `stop()`: Stop the loop
- `isRunning`: `ComputedRef<boolean>`, true if ticking

---

## Cleanup

If used inside a Vue component or effect scope, the timer is automatically stopped when the scope is disposed.

---
