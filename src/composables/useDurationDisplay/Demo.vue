<template>
  <div class="demo-duration-card">
    <h2>🕒 Duration Display Demo</h2>
    <label>
      Milliseconds:
      <input type="number" v-model.number="inputMs" min="0" style="width:120px;" />
    </label>
    <label style="margin-left:1em;">
      Use Week:
      <input type="checkbox" v-model="useWeek" />
    </label>
    <div class="output">
      <div><strong>Timer:</strong> {{ display.timer }}</div>
      <div><strong>Timer (Milli):</strong> {{ display.timerMilli }}</div>
      <div><strong>Normal:</strong> {{ display.normal }}</div>
      <div><strong>Bahasa:</strong> {{ display.bahasa }}</div>
      <div><strong>Raw:</strong> {{ display }}</div>
    </div>
  </div>
  <DurationDisplayFromMilliseconds
    :milliseconds="inputMs"
    :options="{ useWeek }"
    class="mt-4"
    v-slot="{ humanLike, display }"
  >
    <div class="text-center"><strong>Human readable:</strong> {{ humanLike }}</div>
    <div class="text-center"><strong>Constructed:</strong><span v-if="display.days">{{ display.days }}D</span> {{ display.hours }}:{{ display.minutes }}:{{ display.seconds }}</div>
  </DurationDisplayFromMilliseconds>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDurationDisplayFromMilliseconds } from '.'
import { DurationDisplayFromMilliseconds } from './component'

const inputMs = ref(123456789)
const useWeek = ref(false)

const { display } = useDurationDisplayFromMilliseconds(
  computed(() => inputMs.value),
  computed(() => ({ useWeek: useWeek.value }))
)
</script>

<style scoped>
.demo-duration-card {
  border: 1px solid #ccc;
  border-radius: 12px;
  padding: 1.5rem;
  max-width: 500px;
  margin: 2rem auto;
  font-family: system-ui, sans-serif;
  background: #f9f9f9;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06);
}
label {
  font-weight: 500;
  margin-right: 1em;
}
.output {
  margin-top: 1.5em;
  font-size: 1.1em;
}
</style>
