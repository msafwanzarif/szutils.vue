import { ComputedRef } from 'https://cdn.jsdelivr.net/npm/vue@3/dist/vue.esm-browser.js';
import { Duration, DurationObjectUnits } from 'https://cdn.jsdelivr.net/npm/luxon@3/build/es6/luxon.js';

export interface UseDuration {
    state: {
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
}
export declare function useDuration(initial?: DurationObjectUnits): UseDuration;
