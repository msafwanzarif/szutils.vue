import { onScopeDispose, getCurrentScope, computed, Ref, ref } from 'vue'

type BatchedTimer = {
  onTick: (deltaMs: number, now: number,length: number) => void
  onStop?: (length: number) => void
  lastTime: number
  running: boolean
}

const timers: BatchedTimer[] = []
let rafId: number | null = null

function loop(now: number) {
  timers.forEach(timer => {
    if (timer.running) {
      const delta = now - timer.lastTime
      timer.lastTime = now
      timer.onTick(delta, now,timers.length)
    }
  })
  rafId = window.requestAnimationFrame(loop)
}

function startLoop() {
  if (rafId === null) {
    rafId = window.requestAnimationFrame(loop)
  }
}

function stopLoop() {
  if (rafId !== null) {
    window.cancelAnimationFrame(rafId)
    rafId = null
  }
}

// Usage: create a batched timer
export function useTimeTickShared(opts:{onTick: (deltaMs: number, now: number,length:number) => void,onStop?: (length:number) => void}) {
  const timer: Ref<BatchedTimer> = ref({
    onTick:opts.onTick,
    onStop:opts.onStop,
    lastTime: performance.now(),
    running: false
  })

  function removeTimer() {
    const idx = timers.indexOf(timer.value)
    if (idx !== -1) timers.splice(idx, 1)
    if (timers.length < 1) stopLoop()
  }

  function run() {
    timer.value.running = true
    timer.value.lastTime = performance.now()
    timers.push(timer.value)
    startLoop()
  }

  function stop() {
    timer.value.running = false
    if(timer.value.onStop) timer.value.onStop(timers.length)
    removeTimer()
  }

  const isRunning = computed(() => timer.value.running)

  if (getCurrentScope()) {
    onScopeDispose(() => {
      stop()
    })
  }

  return { run, stop, isRunning }
}