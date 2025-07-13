<template>
  <div class="demo-card">
    <h2>⏱ useTimer Demo</h2>
    <p>
      <strong>Elapsed:</strong> {{ display.timerMilli }}<br>
      <strong>Milliseconds:</strong> {{ elapsed.toFixed(0) }}
    </p>
    <div class="controls">
      <button @click="start" :disabled="isRunning || !notStarted">Start</button>
      <button @click="pause" :disabled="!isRunning || isPaused">Pause</button>
      <button @click="resume" :disabled="isPaused || notStarted || hasStoped">Resume</button>
      <button @click="stop" :disabled="notStarted || hasStoped">Stop</button>
      <button @click="reset" :disabled="notStarted">Reset</button>
      <button @click="saveToStorage">💾 Save</button>
    </div>
    <div class="info">
      <p><strong>Status:</strong>
        <span v-if="notStarted">Not started</span>
        <span v-else-if="isPaused">Paused</span>
        <span v-else-if="hasStoped">Stopped</span>
        <span v-else>Running</span>
      </p>
      <p><strong>Started At:</strong> {{ startedAt }}</p>
      <p><strong>Stopped At:</strong> {{ endedAt }}</p>
      <p><strong>Pause Records:</strong> {{ pausedRecords }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue'
import { useTimer } from '..'

const STORAGE_KEY = 'timer-demo'

const {
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
  display,
  startedAt,
  endedAt,
  toJSON,
  loadFromJSON
} = useTimer()

const isPaused = computed(() => {
  return !isRunning && !notStarted && !hasStoped
})

// Load from localStorage on mount
onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      let toLoad = JSON.parse(saved)
      loadFromJSON(toLoad)
    } catch (e) {
      localStorage.removeItem(STORAGE_KEY)
      reset()
      console.warn('Failed to load timer:', e)
    }
  }
})

// Save to localStorage
function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toJSON()))
}
</script>

<style scoped>
.demo-card {
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
.controls {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 1rem;
  justify-content: center;
}
button {
  padding: 0.5rem 1.2rem;
  border-radius: 6px;
  border: 1px solid #aaa;
  background: white;
  font-size: 1rem;
  cursor: pointer;
}
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.info {
  margin-top: 1rem;
  font-size: 0.95rem;
  color: #444;
}
</style>