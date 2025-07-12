<template>
  <div class="demo-card">
    <h2>⏱ useTimeTick Demo</h2>
    <p>
      <strong>Elapsed:</strong> {{ elapsed.toFixed(0) }} ms<br>
      <strong>Ticks:</strong> {{ ticks }}
    </p>
    <button @click="run" :disabled="isRunning">Start</button>
    <button @click="stop" :disabled="!isRunning">Stop</button>
    <button @click="reset">Reset</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTimeTick } from '.'

const elapsed = ref(0)
const ticks = ref(0)

const { run, stop, isRunning } = useTimeTick({
  onTick: (deltaMs) => {
    elapsed.value += deltaMs
    ticks.value++
  }
})

function reset() {
  elapsed.value = 0
  ticks.value = 0
}
</script>

<style scoped>
.demo-card {
  border: 1px solid #ccc;
  border-radius: 12px;
  padding: 1.5rem;
  max-width: 320px;
  margin: 2rem auto;
  font-family: system-ui, sans-serif;
  background: #f9f9f9;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06);
  text-align: center;
}
button {
  margin: 0.5rem;
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
</style>
