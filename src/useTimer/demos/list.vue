<template>
  <div class="demo-list-card">
    <h2>⏱ Timer List Demo</h2>
    <ul>
      <li v-for="(timer, i) in timers" :key="i">
        <span>Timer {{ i + 1 }}: <strong>{{ timer.display.timerMilli }}</strong></span>
        <button @click="toggleTimer(i)" style="margin-left:1em;">
          {{ !timer.isPaused ? '⏸' : '▶️' }}
        </button>
        <button @click="removeTimer(i)" style="margin-left:0.5em;">❌</button>
      </li>
      <li>
        <a href="#" @click.prevent="addTimer">➕ Add Timer</a>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useTimer } from '..'

const timers = ref([reactive(useTimer({ autoStart: true }))])

function addTimer() {
  timers.value.push(reactive(useTimer({ autoStart: true })))
}

function removeTimer(idx: number) {
  timers.value[idx].stop()
  timers.value.splice(idx, 1)
}

function toggleTimer(idx: number) {
  const timer = timers.value[idx]
  if (timer.isPaused) {
    timer.resume()
  } else {
    timer.pause()
  }
}
</script>

<style scoped>
.demo-list-card {
  border: 1px solid #ccc;
  border-radius: 12px;
  padding: 1.5rem;
  max-width: 400px;
  margin: 2rem auto;
  font-family: system-ui, sans-serif;
  background: #f9f9f9;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06);
  text-align: center;
}
ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
li {
  margin: 0.7em 0;
}
a {
  color: #2563eb;
  text-decoration: underline;
  cursor: pointer;
  font-weight: 500;
}
a:hover {
  color: #1d4ed8;
}
</style>
