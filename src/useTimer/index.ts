import { ref, computed, Ref, ComputedRef, reactive, toRefs } from 'vue';
import { useDurationFromMilliseconds } from '../useDuration';
import { useTimeTickShared } from '../useTimeTickShared';

export function useTimer(options?: { autoStart?: boolean }) {
  const onTick = (deltaMs: number, now: number,length:number) => {
    if (isPaused.value) return stopTicking()
    elapsed.value += deltaMs
    lastTick.value = now
    timerLength.value = length
  }

  const onStop = (length:number) => {
    timerLength.value = length
  }

  const timerLength = ref(0)

  const { run, stop:stopTicking, isRunning: isTicking } = useTimeTickShared({ onTick,onStop })

  function start() {
    if(startedAt.value > 0) return
    tickFrom.value = performance.timeOrigin
    startedAt.value = tickFrom.value + performance.now()
    run()
  }

  function pause() {
    if(isPaused.value) return
    stopTicking()
    isPaused.value = true
    pausedAt.value.push(tickFrom.value + performance.now())
  }

  function resume() {
    if(!isPaused.value) return
    isPaused.value = false
    resumedAt.value.push(tickFrom.value + performance.now())
    run()
  }

  function reset() {
    stopTicking()
    endedAt.value = 0
    startedAt.value = 0
    tickFrom.value = 0
    lastTick.value = 0
    isPaused.value = false
    elapsed.value = 0
    pausedAt.value.length = 0
    resumedAt.value.length = 0
  }

  function stop(){
    if(endedAt.value > 0) return
    stopTicking()
    let now = performance.now()
    lastTick.value = now
    return endedAt.value = tickFrom.value + now
  }

  const startedAt = ref(0)
  const endedAt = ref(0)
  const tickFrom = ref(0)
  const lastTick = ref(0)
  const isPaused = ref(false)
  const pausedAt: Ref<number[]> = ref([])
  const resumedAt: Ref<number[]> = ref([])
  const pausedRecords: ComputedRef<number[][]> = computed(() => {
    const records = []
    for(let i = 0; i < pausedAt.value.length; i++){
      const record = [pausedAt.value[i],resumedAt.value[i]]
      records.push(record)
    }
    return records
  })
  const elapsed = ref(0)
  const isRunning = computed(() => startedAt.value > 0 && isTicking.value);
  const hasStoped = computed(() => endedAt.value > 0);
  const notStarted = computed(() => startedAt.value <= 0);

  const useDuration = computed(() =>{return useDurationFromMilliseconds(elapsed)})

  const luxon = computed(() => useDuration.value.luxon.value)
  const display = computed(() => useDuration.value.display.value)

  function toJSON(){
    return {
      startedAt:startedAt.value,
      endedAt:endedAt.value,
      tickFrom:tickFrom.value,
      lastTick:lastTick.value,
      isPaused:isPaused.value,
      elapsed:elapsed.value,
      pausedAt:pausedAt.value,
      resumedAt:resumedAt.value
    }
  }

  function loadFromJSON(json: ReturnType<typeof toJSON>){
    reset()
    let {
      tickFrom:tickFromVal,
      startedAt:startedAtVal,
      endedAt:endedAtVal,
      lastTick:lastTickVal,
      isPaused:isPausedVal,
      elapsed:elapsedVal,
      pausedAt:pausedAtVal,
      resumedAt:resumedAtVal
    } = reactive(json)
    tickFrom.value = performance.timeOrigin
    startedAt.value = startedAtVal
    endedAt.value = endedAtVal
    isPaused.value = isPausedVal
    elapsed.value = elapsedVal
    pausedAt.value = pausedAtVal
    resumedAt.value = resumedAtVal
    if(startedAt.value > 0 && endedAt.value <= 0 && !isPaused.value){
      let now = tickFrom.value + performance.now()
      elapsed.value += now - (tickFromVal + lastTickVal)
      return run()
    }
  }

  // If autoStart is true, start timer on creation
  if (options?.autoStart) {
    start()
  }

  return {
    timerLength,
    start,
    pause,
    resume,
    stop,
    reset,
    elapsed,
    pausedRecords,
    hasStoped,
    notStarted,
    isRunning,
    isPaused,
    toJSON,
    loadFromJSON,
    luxon,
    display,
    startedAt,
    endedAt,
  };
}
