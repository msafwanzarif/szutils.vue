<template>
  <div class="container-fluid">
    <!-- Sticky Top Select -->
    <div class="position-sticky top-0 bg-white py-3 shadow-sm z-3">
      <div class="container" style="max-width: 800px;">
        <select v-model="selectedKey" class="form-select">
          <option disabled value="">Select a demo</option>
          <option v-for="demo in demos" :key="demo.key" :value="demo.key">
            {{ demo.label }}
          </option>
        </select>
      </div>
    </div>

    <!-- Centered Card -->
    <div
      class="d-flex justify-content-center align-items-center"
      style="min-height: calc(100vh - 200px);"
    >
      <div class="container" style="max-width: 800px;">
        <div v-if="selectedKey" class="card shadow">
          <div class="card-body">
            <component :is="selectedComponent" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent, computed, markRaw } from 'vue'

const demos = [
  { key: 'details', label: 'Timer Details' },
  { key: 'list', label: 'List of Timers' },
  // Add more demo entries here
]

const selectedKey = ref<string>('')

const selectedComponent = computed(() =>
  selectedKey.value
    ? markRaw(defineAsyncComponent(() => import(`./demos/${selectedKey.value}.vue`)))
    : null
)
</script>
