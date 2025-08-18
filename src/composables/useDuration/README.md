# `useDuration`

A reactive duration utility based on Luxon for Vue 3.

## Features

- Reactive access to duration parts (days, hours, minutes, seconds)
- Normalization using Luxon's `.shiftTo()`
- Utility methods: `add`, `subtract`, `set`, `reset`
- Formatted output via `toFormat()`

## Usage

```ts
const duration = useDuration({ minutes: 1 });

duration.add({ seconds: 90 });
console.log(duration.formatted.value); // "0d 00:02:30"
```
