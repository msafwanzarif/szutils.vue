<script setup lang="ts">
import { useDuration } from 'szutils.vue';

const duration = useDuration({ minutes: 1 });

function add90Seconds() {
  duration.add({ seconds: 90 });
}
</script>

<template>
  <h2>Duration: {{ duration.hours }}:{{ duration.minutes }}:{{ duration.seconds }}</h2>
  <button @click="add90Seconds">+90 Seconds</button>
</template>
