import { computed, ComputedRef, ref,Ref } from 'vue';
import { Duration, DurationObjectUnits } from 'luxon';

export interface UseDuration {
  luxon: Ref<Duration>;
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
  const luxon = ref( Duration.fromObject(initial) );

  const state = ref({
    timer: null as number | null
  });

  const normalized = computed(() =>
    luxon.value.shiftTo('days', 'hours', 'minutes', 'seconds', 'milliseconds')
  );

  const days = computed(() => normalized.value.days);
  const hours = computed(() => normalized.value.hours);
  const minutes = computed(() => normalized.value.minutes);
  const seconds = computed(() => normalized.value.seconds);
  const milliseconds = computed(() => Math.floor(normalized.value.milliseconds));

  const asSeconds = computed(() => luxon.value.as('seconds'));
  const asMinutes = computed(() => luxon.value.as('minutes'));
  const asHours = computed(() => luxon.value.as('hours'));

  const formatted = computed(() =>
    normalized.value.toFormat("d'd' hh:mm:ss")
  );

  function set(newDur: DurationObjectUnits) {
    luxon.value = Duration.fromObject(newDur);
  }

  function add(newDur: DurationObjectUnits) {
    luxon.value = luxon.value.plus(newDur);
  }

  function subtract(newDur: DurationObjectUnits) {
    luxon.value = luxon.value.minus(newDur);
  }

  function reset() {
    luxon.value = Duration.fromMillis(0);
  }

  // 🔄 Real-time update
  let lastTime: number = 0;

  const isRunning = computed(() => state.value.timer !== null);

  function run() {
    if (state.value.timer !== null) return; // already running

    lastTime = performance.now();

    state.value.timer = window.requestAnimationFrame(tick);
  }

  function tick(now: number) {
    const delta = now - lastTime;
    lastTime = now;
    add({ milliseconds: delta });

    state.value.timer = window.requestAnimationFrame(tick);
  }

  function stop() {
    if (state.value.timer !== null) {
      window.cancelAnimationFrame(state.value.timer);
      state.value.timer = null;
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
