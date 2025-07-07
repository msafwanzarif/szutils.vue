import { ComputedRef } from 'vue';
import { Duration, DurationObjectUnits } from 'luxon';

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
