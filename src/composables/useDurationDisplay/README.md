# useDurationDisplay

A Vue composable for formatting and displaying durations using [Luxon](https://moment.github.io/luxon/).

## Features

- Format durations in various styles (timer, human-like, Bahasa, etc.)
- Automatically chooses units (weeks, days, hours, minutes, seconds, milliseconds)
- Supports reactive input and options

## API

### `useDurationDisplay(luxon: MaybeRefOrGetter<Duration>, options?: MaybeRefOrGetter<{ useWeek: boolean }>)`

Returns an object with:

- `display`: `{ weeks, days, hours, minutes, seconds, milliseconds, timer, timerMilli, normal, bahasa }`
- `normalized`: normalized Luxon Duration
- `formatted`, `formattedToMilli`: formatted strings
- `humanLike`, `bahasa`: human-readable strings
- `asMilliseconds`, `asSeconds`, `asMinutes`, `asHours`, `asDays`, `asWeeks`: numeric values

### Helper Functions

- `useDurationDisplayFromMilliseconds(milliseconds, options?)`
- `useDurationDisplayFromSeconds(seconds, options?)`
- `useDurationDisplayFromMinutes(minutes, options?)`
- `useDurationDisplayFromHours(hours, options?)`
- `useDurationDisplayFromDays(days, options?)`
- `useDurationDisplayFromWeeks(weeks, options?)`

All helpers accept a number or ref and an optional `{ useWeek: boolean }` options object.

## Example

```ts
import { ref } from 'vue'
import { useDurationDisplayFromMilliseconds } from './index'

const ms = ref(123456789)
const { display } = useDurationDisplayFromMilliseconds(ms, { useWeek: true })

// display.timer -> "2w 0d 06:56:56"
// display.normal -> "2 weeks, 6 hours, 56 minutes, 56 seconds"
// display.bahasa -> "2 minggu, 6 jam, 56 minit, 56 saat"
```

## Demo

See [`Demo.vue`](./Demo.vue) for a live example.
