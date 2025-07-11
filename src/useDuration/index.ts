import { computed, ComputedRef, MaybeRefOrGetter, ref, Ref, toRefs, toValue } from 'vue';
import { Duration, DurationObjectUnits } from 'luxon';
import { useDurationDisplay } from '../useDurationDisplay';
import { useTimer } from '../useTimer';

export interface UseDuration {
  luxon: Ref<Duration>;
  normalized: ComputedRef<Duration>;
  days: ComputedRef<number>;
  hours: ComputedRef<number>;
  minutes: ComputedRef<number>;
  seconds: ComputedRef<number>;
  milliseconds: ComputedRef<number>;
  asMilliseconds: ComputedRef<number>;
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

export function useDuration(initial: MaybeRefOrGetter<DurationObjectUnits> = { hours: 0, minutes: 0, seconds: 0 }): UseDuration {
  const additionalDurationObject = ref<DurationObjectUnits>({ hours: 0, minutes: 0, seconds: 0 });
  const additionalDuration = computed(() => Duration.fromObject(additionalDurationObject.value));
  const luxon = computed(() => Duration.fromObject(toValue(initial)).plus(additionalDuration.value));

  const { normalized, days, hours, minutes, seconds, milliseconds, asMilliseconds, asSeconds, asMinutes, asHours, formatted } = useDurationDisplay(luxon);

  function set(newDur: DurationObjectUnits) {
    additionalDurationObject.value = Duration.fromObject({ seconds: 0 }).minus(toValue(initial)).plus(newDur).toObject();
  }

  function add(newDur: DurationObjectUnits) {
    additionalDurationObject.value = additionalDuration.value.plus(newDur).toObject();
  }

  function subtract(newDur: DurationObjectUnits) {
    additionalDurationObject.value = additionalDuration.value.minus(newDur).toObject();
  }

  function reset() {
    additionalDurationObject.value = Duration.fromObject({ seconds: 0 }).minus(toValue(initial)).toObject();
  }

  // Timer logic via useTimer composable
  const timer = useTimer({
    onTick(deltaMs: number) {
      add({ milliseconds: deltaMs });
    }
  });

  function run() {
    timer.run();
  }

  function stop() {
    timer.stop();
  }

  const isRunning = timer.isRunning;

  return {
    luxon,
    normalized,
    days, hours, minutes, seconds, milliseconds,
    asMilliseconds, asSeconds, asMinutes, asHours,
    formatted,
    set, add, subtract, reset,
    run, stop, isRunning
  };
}

export function useDurationFromMilliseconds(milliseconds: MaybeRefOrGetter<number>): UseDuration {
  return useDuration({ milliseconds:toValue(milliseconds) });
}
export function useDurationFromSeconds(seconds: MaybeRefOrGetter<number>): UseDuration {
  return useDuration({ seconds:toValue(seconds) });
}
export function useDurationFromMinutes(minutes: MaybeRefOrGetter<number>): UseDuration {
  return useDuration({ minutes:toValue(minutes) });
}
export function useDurationFromHours(hours: MaybeRefOrGetter<number>): UseDuration {
  return useDuration({ hours:toValue(hours) });
}
export function useDurationFromDays(days: MaybeRefOrGetter<number>): UseDuration {
  return useDuration({ days:toValue(days) });
}

