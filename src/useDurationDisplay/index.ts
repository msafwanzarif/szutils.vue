import { computed, ComputedRef, MaybeRefOrGetter, toValue } from 'vue';
import { Duration } from 'luxon';

export interface useDurationDisplay {
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
}

export function useDurationDisplay(luxon: MaybeRefOrGetter<Duration> = Duration.fromMillis(0)): useDurationDisplay {

  const normalized = computed(() =>
    toValue(luxon).shiftTo('days', 'hours', 'minutes', 'seconds', 'milliseconds')
  );

  const days = computed(() => normalized.value.days);
  const hours = computed(() => normalized.value.hours);
  const minutes = computed(() => normalized.value.minutes);
  const seconds = computed(() => normalized.value.seconds);
  const milliseconds = computed(() => Math.floor(normalized.value.milliseconds));

  const asMilliseconds = computed(() => toValue(luxon).as('milliseconds'));
  const asSeconds = computed(() => toValue(luxon).as('seconds'));
  const asMinutes = computed(() => toValue(luxon).as('minutes'));
  const asHours = computed(() => toValue(luxon).as('hours'));

  const formatted = computed(() =>
    normalized.value.toFormat("d'd' hh:mm:ss")
  );

  return {
    normalized,
    days, hours, minutes, seconds, milliseconds,
    asMilliseconds, asSeconds, asMinutes, asHours,
    formatted
  };
}

