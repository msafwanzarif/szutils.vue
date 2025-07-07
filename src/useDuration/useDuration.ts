import { reactive, computed, ComputedRef } from 'https://cdn.jsdelivr.net/npm/vue@3/dist/vue.esm-browser.js';
import { Duration, DurationObjectUnits } from 'https://cdn.jsdelivr.net/npm/luxon@3/build/es6/luxon.js';

export interface UseDuration {
  state: { raw: Duration };
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
}

export function useDuration(initial: DurationObjectUnits = { hours: 0, minutes: 0, seconds: 0 }): UseDuration {
  const state = reactive({
    raw: Duration.fromObject(initial)
  });

  const normalized = computed(() =>
    state.raw.shiftTo('days', 'hours', 'minutes', 'seconds', 'milliseconds')
  );

  const days = computed(() => normalized.value.days);
  const hours = computed(() => normalized.value.hours);
  const minutes = computed(() => normalized.value.minutes);
  const seconds = computed(() => normalized.value.seconds);
  const milliseconds = computed(() => normalized.value.milliseconds);

  const asSeconds = computed(() => state.raw.as('seconds'));
  const asMinutes = computed(() => state.raw.as('minutes'));
  const asHours = computed(() => state.raw.as('hours'));

  const formatted = computed(() =>
    normalized.value.toFormat("d'd' hh:mm:ss")
  );

  function set(newDur: DurationObjectUnits) {
    state.raw = Duration.fromObject(newDur);
  }

  function add(newDur: DurationObjectUnits) {
    state.raw = state.raw.plus(newDur);
  }

  function subtract(newDur: DurationObjectUnits) {
    state.raw = state.raw.minus(newDur);
  }

  function reset() {
    state.raw = Duration.fromMillis(0);
  }

  return {
    state,
    normalized,
    days, hours, minutes, seconds, milliseconds,
    asSeconds, asMinutes, asHours,
    formatted,
    set, add, subtract, reset
  };
}
