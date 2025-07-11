import { ref, computed } from 'vue';

interface UseTimerOptions {
  onTick: (deltaMs: number, now: number) => void;
}

export function useTimer(options: UseTimerOptions) {
  const timer = ref<number | null>(null);
  let lastTime = 0;

  function run() {
    if (timer.value !== null) return;
    lastTime = performance.now();
    timer.value = window.requestAnimationFrame(tick);
  }

  function tick(now: number) {
    const delta = now - lastTime;
    lastTime = now;
    options.onTick(delta,now);
    timer.value = window.requestAnimationFrame(tick);
  }

  function stop() {
    if (timer.value !== null) {
      window.cancelAnimationFrame(timer.value);
      timer.value = null;
    }
  }

  const isRunning = computed(() => timer.value !== null);

  return {
    run,
    stop,
    isRunning
  };
}
