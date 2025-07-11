<script setup lang="ts">
import { computed, ref, reactive } from 'vue';
import { useDuration, useDurationFromSeconds } from '.';

const seconds = ref(0);
const durationObject = computed(() => ({
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: seconds.value,
  milliseconds: 0
}));
const duration = reactive(useDurationFromSeconds(seconds));
const collectionOfTimers = ref([reactive(useDurationFromSeconds(0))]);

function addTimer() {
  collectionOfTimers.value.push(reactive(useDurationFromSeconds(0)));
}

</script>

<template>
  <div class="demo-card" v-for="timer,i in collectionOfTimers">
      <h2>⏱ Timer {{ i + 1 }}</h2>

      <ul>
        <li><strong>Days:</strong> {{ timer.formatted }}</li>
        <li><strong>Hours:</strong> {{ timer.hours }}</li>
        <li><strong>Minutes:</strong> {{ timer.minutes }}</li>
        <li><strong>Seconds:</strong> {{ timer.seconds }}</li>
        <li><strong>MilliSeconds:</strong> {{ timer.milliseconds }}</li>
        <li><strong>As MilliSeconds:</strong> {{ timer.asMilliseconds }}</li>
        <li><strong>Is Running:</strong> {{ timer.isRunning }}</li>
        <li><strong>To Object:</strong> {{ timer.luxon.toFormat(`hh:mm:ss`) }}</li>
      </ul>
      <div class="controls">
        <button @click="timer.run()" :disabled="timer.isRunning">▶️ Start</button>
        <button @click="timer.stop()" :disabled="!timer.isRunning">⏸️ Stop</button>
        <button @click="timer.reset()">🔁 Reset</button>
        <button @click="timer.add({ seconds: 10 })">+10s</button>
        <button @click="timer.subtract({ seconds: 10 })">-10s</button>
        <button v-if="i == collectionOfTimers.length - 1" @click="addTimer">Add Timer</button>
      </div>
  </div>
</template>

<style scoped>
.demo-card {
  border: 1px solid #ccc;
  border-radius: 12px;
  padding: 1.5rem;
  max-width: 400px;
  margin: 1rem auto;
  font-family: system-ui, sans-serif;
  background: #f9f9f9;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06);
}

.controls {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}

button {
  padding: 0.4rem 0.8rem;
  font-size: 0.9rem;
  border-radius: 6px;
  border: 1px solid #aaa;
  cursor: pointer;
  background: white;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
