<script setup lang="ts">
import { computed, ref, reactive,Reactive } from 'vue';
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

type TimerType = Reactive<ReturnType<typeof useDurationFromSeconds>>;

function addTimer() {
  collectionOfTimers.value.push(reactive(useDurationFromSeconds(0)));
}

// Helper functions for adding/subtracting units
function addMinutes(timer: TimerType, amount = 1) {
  timer.add({ minutes: amount });
}
function addHours(timer: TimerType, amount = 1) {
  timer.add({ hours: amount });
}
function addDays(timer: TimerType, amount = 1) {
  timer.add({ days: amount });
}
function addWeeks(timer: TimerType, amount = 1) {
  timer.add({ weeks: amount });
}
function subtractMinutes(timer: TimerType, amount = 1) {
  timer.subtract({ minutes: amount });
}
function subtractHours(timer: TimerType, amount = 1) {
  timer.subtract({ hours: amount });
}
function subtractDays(timer: TimerType, amount = 1) {
  timer.subtract({ days: amount });
}
function subtractWeeks(timer: TimerType, amount = 1) {
  timer.subtract({ weeks: amount });
}
</script>

<template>
  <div class="demo-card" v-for="timer,i in collectionOfTimers">
      <h2>♦ Duration {{ i + 1 }}</h2>

      <ul>
        <li><strong>Days:</strong> {{ timer.days }}</li>
        <li><strong>Hours:</strong> {{ timer.hours }}</li>
        <li><strong>Minutes:</strong> {{ timer.minutes }}</li>
        <li><strong>Seconds:</strong> {{ timer.seconds }}</li>
        <li><strong>MilliSeconds:</strong> {{ timer.display.milliseconds }}</li>
        <li><strong>As MilliSeconds:</strong> {{ timer.asMilliseconds }}</li>
        <li><strong>toHuman:</strong> {{ timer.humanLike }}</li>
        <li><strong>Bahasa:</strong> {{ timer.bahasa }}</li>
        <li> {{ timer.formatted }} </li>
      </ul>
      <div class="controls">
        <button @click="timer.reset()">🔁 Reset</button>
        <button @click="timer.add({ seconds: 10 })">+10s</button>
        <button @click="timer.subtract({ seconds: 10 })">-10s</button>
        <!-- New buttons for minutes, hours, days, weeks -->
        <button @click="addMinutes(timer)">+1m</button>
        <button @click="subtractMinutes(timer)">-1m</button>
        <button @click="addHours(timer)">+1h</button>
        <button @click="subtractHours(timer)">-1h</button>
        <button @click="addDays(timer)">+1d</button>
        <button @click="subtractDays(timer)">-1d</button>
        <button @click="addWeeks(timer)">+1w</button>
        <button @click="subtractWeeks(timer)">-1w</button>
        <button @click="timer.toggleWeek()">Toggle Week</button>
        <button v-if="i == collectionOfTimers.length - 1" @click="addTimer">Add Duration</button>
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
