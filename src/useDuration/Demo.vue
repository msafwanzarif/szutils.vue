<script setup lang="ts">
import { computed,ref,reactive } from 'vue';
import { useDuration } from '.';

const duration = reactive(useDuration({ minutes: 0 }));

function start() {
  duration.run();
}

function stop() {
  duration.stop();
}

function reset() {
  duration.reset();
}

</script>

<template>
  <div class="demo-card">
    <h2>⏱ useDuration Demo</h2>
    
    <ul>
      <li><strong>Days:</strong> {{ duration.formatted }}</li>
      <li><strong>Hours:</strong> {{ duration.hours }}</li>
      <li><strong>Minutes:</strong> {{ duration.minutes }}</li>
      <li><strong>Seconds:</strong> {{ duration.seconds }}</li>
      <li><strong>MilliSeconds:</strong> {{ duration.milliseconds }}</li>
      <li><strong>Is Running:</strong> {{ duration.isRunning }}</li>
      <li><strong>To Object:</strong> {{ duration.luxon.raw.toObject() }}</li>
    </ul>

    <div class="controls">
      <button @click="start" :disabled="duration.isRunning">▶️ Start</button>
      <button @click="stop" :disabled="!duration.isRunning">⏸️ Stop</button>
      <button @click="reset">🔁 Reset</button>
      <button @click="duration.add({seconds:10})">+10s</button>
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
