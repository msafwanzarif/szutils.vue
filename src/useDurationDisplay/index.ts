import { computed, ComputedRef, MaybeRefOrGetter, toValue } from 'vue';
import { Duration } from 'luxon';

export function useDurationDisplay(luxon: MaybeRefOrGetter<Duration> = Duration.fromMillis(0),options:MaybeRefOrGetter<{useWeek: boolean}> = {useWeek: false}) {

  const normalized = computed(() =>{
    // return toValue(luxon).shiftTo(...unitTracked.value,"milliseconds")
    return toValue(luxon).rescale()
  });

  const unitTracked : ComputedRef<("weeks" | "days" | "hours" | "minutes" | "seconds" | "milliseconds")[]> = computed(() =>{
    let units: ("weeks" | "days" | "hours" | "minutes" | "seconds" | "milliseconds")[] = ["seconds"]
    if(asMinutes.value < 1) return units
    units.unshift("minutes")
    if(asHours.value < 1) return units
    units.unshift("hours")
    if(asDays.value < 1) return units
    units.unshift("days")
    if(asWeeks.value < 1 || !toValue(options).useWeek) return units
    units.unshift("weeks")
    return units
  }) 

  const weeks = computed(() => normalized.value.weeks);
  const days = computed(() => normalized.value.days);
  const hours = computed(() => normalized.value.hours);
  const minutes = computed(() => normalized.value.minutes);
  const seconds = computed(() => normalized.value.seconds);
  const milliseconds = computed(() => normalized.value.milliseconds);

  const display = computed(() => {
    return {
      weeks: weeks.value.toString(),
      days: days.value.toString(),
      hours: hours.value.toString().padStart(2, "0"),
      minutes: minutes.value.toString().padStart(2, "0"),
      seconds: seconds.value.toString().padStart(2, "0"),
      milliseconds: Math.floor(milliseconds.value).toString().padStart(3, "0"),
      timer: formatted.value,
      normal: humanLike.value,
      bahasa: bahasa.value,
    }
  })

  const asMilliseconds = computed(() => toValue(luxon).as('milliseconds'));
  const asSeconds = computed(() => toValue(luxon).as('seconds'));
  const asMinutes = computed(() => toValue(luxon).as('minutes'));
  const asHours = computed(() => toValue(luxon).as('hours'));
  const asDays = computed(() => toValue(luxon).as('days'));
  const asWeeks = computed(() => toValue(luxon).as('weeks'));

  const formatted = computed(() => {
    if (toValue(options).useWeek && asWeeks.value >= 1) return normalized.value.toFormat("w'w' d'd' hh:mm:ss")
    if (asDays.value >= 1) return normalized.value.toFormat("d'd' hh:mm:ss")
    return normalized.value.toFormat("hh:mm:ss")
  });

  const formattedToMilli = computed(() => {
    if (toValue(options).useWeek && asWeeks.value >= 1) return normalized.value.toFormat("w'w' d'd' hh:mm:ss:S")
    if (asDays.value >= 1) return normalized.value.toFormat("d'd' hh:mm:ss:S")
    return normalized.value.toFormat("hh:mm:ss:S")
  });

  const humanLike = computed(() => {
    if(!normalized.value) return "0"
    let toDisplay : string[] = []
    let changeMap = {
      "weeks":"week",
      "days": "day",
      "hours":"hour",
      "minutes":"minute",
      "seconds":"second",
      "milliseconds":"millisecond"
    }
    let normalize = normalized.value.shiftTo(...unitTracked.value)
    for (let unit of unitTracked.value){
      let value = normalize[unit]
      if(value > 0) toDisplay.push(`${value} ${value > 1? unit: changeMap[unit]}`)
    }
    if(toDisplay.length) return toDisplay.join(", ")
    return "0"
  });

  const bahasa = computed(() => {
    if(!normalized.value) return "0"
    let toDisplay : string[] = []
    let changeMap = {
      "weeks":"minggu",
      "days": "hari",
      "hours":"jam",
      "minutes":"minit",
      "seconds":"saat",
      "milliseconds":"milisaat"
    }
    let normalize = normalized.value.shiftTo(...unitTracked.value)
    for (let unit of unitTracked.value){
      let value = normalize[unit]
      if(value > 0) toDisplay.push(`${value} ${changeMap[unit]}`)
    }
    if(toDisplay.length) return toDisplay.join(", ")
    return "0"
  });

  return {
    normalized,
    days, hours, minutes, seconds, milliseconds,
    display,
    asMilliseconds,asSeconds, asMinutes, asHours,asDays,asWeeks,
    formatted,formattedToMilli,humanLike,bahasa
  };
}

