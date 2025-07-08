import { reactive, computed, ComputedRef, ref } from 'vue';
import { Duration, DurationObjectUnits } from 'luxon';

export interface UseDuration {
  luxon: {
    raw: Duration;
  };
  normalized: ComputedRef<Duration>;
  days: ComputedRef<number>;
  hours: ComputedRef<number>;
  minutes: ComputedRef<number>;
  seconds: ComputedRef<number>;
  milliseconds: ComputedRef<number>;
  asSeconds: ComputedRef<number>;
  asMinutes: ComputedRef<number>;
  asHours: ComputedRef<number>;
  formatted: ComputedRef<string>;
  set: (newDur: DurationObjectUnits) => void;
  add: (newDur: DurationObjectUnits) => void;
  subtract: (newDur: DurationObjectUnits) => void;
  reset: () => void;
  run: () => void;
  stop: () => void;
  isRunning: ComputedRef<boolean>;
}

export function useDuration(initial: DurationObjectUnits = { hours: 0, minutes: 0, seconds: 0 }): UseDuration {
  const luxon = reactive({
    raw: Duration.fromObject(initial)
  });

  const state = reactive({
    timer: null as number | null
  });

  const normalized = computed(() =>
    luxon.raw.shiftTo('days', 'hours', 'minutes', 'seconds', 'milliseconds')
  );

  const days = computed(() => normalized.value.days);
  const hours = computed(() => normalized.value.hours);
  const minutes = computed(() => normalized.value.minutes);
  const seconds = computed(() => normalized.value.seconds);
  const milliseconds = computed(() => Math.floor(normalized.value.milliseconds));

  const asSeconds = computed(() => luxon.raw.as('seconds'));
  const asMinutes = computed(() => luxon.raw.as('minutes'));
  const asHours = computed(() => luxon.raw.as('hours'));

  const formatted = computed(() =>
    normalized.value.toFormat("d'd' hh:mm:ss")
  );

  function set(newDur: DurationObjectUnits) {
    luxon.raw = Duration.fromObject(newDur);
  }

  function add(newDur: DurationObjectUnits) {
    luxon.raw = luxon.raw.plus(newDur);
  }

  function subtract(newDur: DurationObjectUnits) {
    luxon.raw = luxon.raw.minus(newDur);
  }

  function reset() {
    luxon.raw = Duration.fromMillis(0);
  }

  // 🔄 Real-time update
  let lastTime: number = 0;

  const isRunning = computed(() => state.timer !== null);

  function run() {
    if (state.timer !== null) return; // already running

    lastTime = performance.now();

    state.timer = window.requestAnimationFrame(tick);
  }

  function tick(now: number) {
    const delta = now - lastTime;
    lastTime = now;
    add({ milliseconds: delta });

    state.timer = window.requestAnimationFrame(tick);
  }

  function stop() {
    if (state.timer !== null) {
      window.cancelAnimationFrame(state.timer);
      state.timer = null;
    }
  }

  return {
    luxon,
    normalized,
    days, hours, minutes, seconds, milliseconds,
    asSeconds, asMinutes, asHours,
    formatted,
    set, add, subtract, reset,
    run, stop, isRunning
  };
}
