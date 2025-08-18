import { computed, MaybeRefOrGetter, ref,Ref, toValue } from 'vue';
import { Duration, DurationObjectUnits, ToHumanDurationOptions } from 'luxon';
import { useDurationDisplay } from '../useDurationDisplay';

export function useDuration(initial: MaybeRefOrGetter<DurationObjectUnits> = { hours: 0, minutes: 0, seconds: 0 },options:{useWeek: false} = {useWeek: false}) {
  const additionalDurationObject = ref<DurationObjectUnits>({ hours: 0, minutes: 0, seconds: 0 });
  const additionalDuration = computed(() => Duration.fromObject(additionalDurationObject.value));
  const luxon = computed(() => Duration.fromObject(toValue(initial)).plus(additionalDuration.value));
  const useWeek:Ref<boolean> = ref(options.useWeek)
  const displayOptions = computed(() =>{ return { useWeek:useWeek.value }})
  const {
    normalized,
    days, hours, minutes, seconds, milliseconds,
    display,
    asMilliseconds,asSeconds, asMinutes, asHours,asDays,asWeeks,
    formatted,formattedToMilli,humanLike,bahasa
  } = useDurationDisplay(luxon,displayOptions);

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

  function toFormat(fmt:string){
    return luxon.value.toFormat(fmt)
  }

  function toHuman(opts?: ToHumanDurationOptions){
    return luxon.value.toHuman(opts)
  }

  function toggleWeek(value?:boolean){
    if(value === undefined) return useWeek.value = !useWeek.value
    return useWeek.value = value
  }

  return {
    luxon,
    normalized, days, hours, minutes, seconds, milliseconds,
    display,
    asMilliseconds,asSeconds, asMinutes, asHours,asDays,asWeeks,
    formatted,formattedToMilli,humanLike,bahasa,
    toFormat,toHuman,
    set, add, subtract, reset,toggleWeek
  };
}

export function useDurationFromMilliseconds(milliseconds: MaybeRefOrGetter<number>) {
  return useDuration({ milliseconds:toValue(milliseconds) });
}
export function useDurationFromSeconds(seconds: MaybeRefOrGetter<number>) {
  return useDuration({ seconds:toValue(seconds) });
}
export function useDurationFromMinutes(minutes: MaybeRefOrGetter<number>) {
  return useDuration({ minutes:toValue(minutes) });
}
export function useDurationFromHours(hours: MaybeRefOrGetter<number>) {
  return useDuration({ hours:toValue(hours) });
}
export function useDurationFromDays(days: MaybeRefOrGetter<number>) {
  return useDuration({ days:toValue(days) });
}

