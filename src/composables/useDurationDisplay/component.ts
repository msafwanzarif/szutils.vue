import { defineComponent, PropType, computed } from 'vue'
import { Duration } from 'luxon'
import { 
  useDurationDisplay,
  useDurationDisplayFromMilliseconds,
  useDurationDisplayFromSeconds,
  useDurationDisplayFromMinutes,
  useDurationDisplayFromHours,
  useDurationDisplayFromDays,
  useDurationDisplayFromWeeks
} from './index'

export interface DurationDisplayOptions {
  useWeek: boolean
}

export interface DurationDisplaySlotProps {
  normalized: Duration
  days: number
  hours: number
  minutes: number
  seconds: number
  milliseconds: number
  display: {
    weeks: string
    days: string
    hours: string
    minutes: string
    seconds: string
    milliseconds: string
    timer: string
    timerMilli: string
    normal: string
    bahasa: string
  }
  asMilliseconds: number
  asSeconds: number
  asMinutes: number
  asHours: number
  asDays: number
  asWeeks: number
  formatted: string
  formattedToMilli: string
  humanLike: string
  bahasa: string
}

// Helper function to unwrap computed refs
function createSlotProps(durationDisplay: ReturnType<typeof useDurationDisplay>): DurationDisplaySlotProps {
  return {
    normalized: durationDisplay.normalized.value,
    days: durationDisplay.days.value,
    hours: durationDisplay.hours.value,
    minutes: durationDisplay.minutes.value,
    seconds: durationDisplay.seconds.value,
    milliseconds: durationDisplay.milliseconds.value,
    display: durationDisplay.display.value,
    asMilliseconds: durationDisplay.asMilliseconds.value,
    asSeconds: durationDisplay.asSeconds.value,
    asMinutes: durationDisplay.asMinutes.value,
    asHours: durationDisplay.asHours.value,
    asDays: durationDisplay.asDays.value,
    asWeeks: durationDisplay.asWeeks.value,
    formatted: durationDisplay.formatted.value,
    formattedToMilli: durationDisplay.formattedToMilli.value,
    humanLike: durationDisplay.humanLike.value,
    bahasa: durationDisplay.bahasa.value
  }
}

/**
 * Renderless component for displaying duration information using Luxon Duration
 * 
 * @example
 * ```vue
 * <DurationDisplay :duration="myDuration" :options="{ useWeek: true }">
 *   <template #default="{ display, formatted, humanLike }">
 *     <div>
 *       <p>Timer: {{ formatted }}</p>
 *       <p>Human readable: {{ humanLike }}</p>
 *       <p>Hours: {{ display.hours }}</p>
 *     </div>
 *   </template>
 * </DurationDisplay>
 * ```
 */
export const DurationDisplay = defineComponent({
  name: 'DurationDisplay',
  props: {
    /**
     * Luxon Duration object to display
     */
    duration: {
      type: Object as PropType<Duration>,
      default: () => Duration.fromMillis(0)
    },
    /**
     * Display options
     */
    options: {
      type: Object as PropType<DurationDisplayOptions>,
      default: () => ({ useWeek: false })
    }
  },
  setup(props, { slots }) {
    const durationDisplay = useDurationDisplay(
      computed(() => props.duration),
      computed(() => props.options)
    )

    // Create unwrapped slot props
    const slotProps = computed(() => createSlotProps(durationDisplay))

    return () => {
      return slots.default?.(slotProps.value)
    }
  }
})

/**
 * Renderless component for displaying duration from milliseconds
 * 
 * @example
 * ```vue
 * <DurationDisplayFromMilliseconds :milliseconds="5000">
 *   <template #default="{ formatted, humanLike }">
 *     <span>{{ humanLike }}</span>
 *   </template>
 * </DurationDisplayFromMilliseconds>
 * ```
 */
export const DurationDisplayFromMilliseconds = defineComponent({
  name: 'DurationDisplayFromMilliseconds',
  props: {
    /**
     * Milliseconds to convert and display
     */
    milliseconds: {
      type: Number,
      required: true
    },
    /**
     * Display options
     */
    options: {
      type: Object as PropType<DurationDisplayOptions>,
      default: () => ({ useWeek: false })
    }
  },
  setup(props, { slots }) {
    const durationDisplay = useDurationDisplayFromMilliseconds(
      computed(() => props.milliseconds),
      computed(() => props.options)
    )

    // Create unwrapped slot props
    const slotProps = computed(() => createSlotProps(durationDisplay))

    return () => {
      return slots.default?.(slotProps.value)
    }
  }
})

/**
 * Renderless component for displaying duration from seconds
 */
export const DurationDisplayFromSeconds = defineComponent({
  name: 'DurationDisplayFromSeconds',
  props: {
    seconds: {
      type: Number,
      required: true
    },
    options: {
      type: Object as PropType<DurationDisplayOptions>,
      default: () => ({ useWeek: false })
    }
  },
  setup(props, { slots }) {
    const durationDisplay = useDurationDisplayFromSeconds(
      computed(() => props.seconds),
      computed(() => props.options)
    )

    const slotProps = computed(() => createSlotProps(durationDisplay))

    return () => {
      return slots.default?.(slotProps.value)
    }
  }
})

/**
 * Renderless component for displaying duration from minutes
 */
export const DurationDisplayFromMinutes = defineComponent({
  name: 'DurationDisplayFromMinutes',
  props: {
    minutes: {
      type: Number,
      required: true
    },
    options: {
      type: Object as PropType<DurationDisplayOptions>,
      default: () => ({ useWeek: false })
    }
  },
  setup(props, { slots }) {
    const durationDisplay = useDurationDisplayFromMinutes(
      computed(() => props.minutes),
      computed(() => props.options)
    )

    const slotProps = computed(() => createSlotProps(durationDisplay))

    return () => {
      return slots.default?.(slotProps.value)
    }
  }
})

/**
 * Renderless component for displaying duration from hours
 */
export const DurationDisplayFromHours = defineComponent({
  name: 'DurationDisplayFromHours',
  props: {
    hours: {
      type: Number,
      required: true
    },
    options: {
      type: Object as PropType<DurationDisplayOptions>,
      default: () => ({ useWeek: false })
    }
  },
  setup(props, { slots }) {
    const durationDisplay = useDurationDisplayFromHours(
      computed(() => props.hours),
      computed(() => props.options)
    )

    const slotProps = computed(() => createSlotProps(durationDisplay))

    return () => {
      return slots.default?.(slotProps.value)
    }
  }
})

/**
 * Renderless component for displaying duration from days
 */
export const DurationDisplayFromDays = defineComponent({
  name: 'DurationDisplayFromDays',
  props: {
    days: {
      type: Number,
      required: true
    },
    options: {
      type: Object as PropType<DurationDisplayOptions>,
      default: () => ({ useWeek: false })
    }
  },
  setup(props, { slots }) {
    const durationDisplay = useDurationDisplayFromDays(
      computed(() => props.days),
      computed(() => props.options)
    )

    const slotProps = computed(() => createSlotProps(durationDisplay))

    return () => {
      return slots.default?.(slotProps.value)
    }
  }
})

/**
 * Renderless component for displaying duration from weeks
 */
export const DurationDisplayFromWeeks = defineComponent({
  name: 'DurationDisplayFromWeeks',
  props: {
    weeks: {
      type: Number,
      required: true
    },
    options: {
      type: Object as PropType<DurationDisplayOptions>,
      default: () => ({ useWeek: false })
    }
  },
  setup(props, { slots }) {
    const durationDisplay = useDurationDisplayFromWeeks(
      computed(() => props.weeks),
      computed(() => props.options)
    )

    const slotProps = computed(() => createSlotProps(durationDisplay))

    return () => {
      return slots.default?.(slotProps.value)
    }
  }
})

// Export all components as default for convenience
export default {
  DurationDisplay,
  DurationDisplayFromMilliseconds,
  DurationDisplayFromSeconds,
  DurationDisplayFromMinutes,
  DurationDisplayFromHours,
  DurationDisplayFromDays,
  DurationDisplayFromWeeks
}
