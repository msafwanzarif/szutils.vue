import { ref, computed, onScopeDispose, getCurrentScope } from 'vue';

interface UseTimeTickOptions {
  onTick: (deltaMs: number, now: number) => void;
}

export function useTimeTick(options: UseTimeTickOptions) {
  const timer = ref<number | null>(null);
  let lastTime = 0;

  const isRunning = computed(() => timer.value !== null);
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

  if (getCurrentScope()) {
    onScopeDispose(stop);
  }

  return {
    run,
    stop,
    isRunning
  };
}
