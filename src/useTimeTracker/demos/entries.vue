<template>
  <div class="p-4 space-y-6">
    <h2 class="text-2xl font-semibold">📊 useTracker Grouped Demo</h2>
    <h3>Tracking: {{ label }}</h3>
    <button @click="setLabel" class="btn">Set Label</button>

    <!-- Action Buttons -->
    <div class="space-x-2">
      <button @click="addToday" class="btn">+ Add to Today</button>
      <button @click="addYesterday" class="btn">+ Add to Yesterday</button>
      <button @click="addLastWeek" class="btn">+ Add to Last Week</button>
      <button @click="addRandomThisWeek" class="btn">+ Add Random (This Week)</button>
    </div>

    <!-- Performance Indicator -->
    <div v-if="entriesToday" class="flex items-center space-x-4">
      <div
        class="w-8 h-8 rounded-full"
        :class="{
          'bg-danger': isRed,
          'bg-warning': isYellow,
          'bg-success': isGreen
        }"
        style="min-height: 50px;"
        title="Today's performance"
      ></div>
      <div>
        <p class="text-sm font-medium">Today: {{ entriesToday.totalSeconds.toFixed(1) }}s</p>
        <p class="text-xs text-gray-500">Avg: {{ dailyStats.avg.toFixed(1) }}s | Max: {{ dailyStats.max.toFixed(1) }}s</p>
      </div>
    </div>

    <!-- Alert -->
    <div v-if="showAlert" class="text-sm text-red-600 font-semibold">
      You have reached a new daily record today! 🎉
    </div>

    <!-- Today's Entries -->
    <section v-if="entriesToday" class="bg-blue-50 p-4 rounded">
      <h3 class="text-lg font-bold mb-2">Today ({{ entriesToday.date }})</h3>
      <ul class="space-y-1">
        <li v-for="(entry, i) in entriesToday.entries" :key="i" class="text-sm">
          ▶️{{ entry.id }} {{ entry.start.toFormat('HH:mm:ss') }} → {{ entry.end.toFormat('HH:mm:ss') }}
          ({{ entry.totalSeconds.toFixed(1) }}s) {{ entry.note }} <span @click="deleteEntry(entry.id)">❌</span>
        </li>
      </ul>
    </section>

    <!-- Grouped by Day -->
    <section v-if="Object.keys(groupedByDay).length" class="bg-gray-50 p-4 rounded">
      <h3 class="text-lg font-bold mb-2">All Grouped by Day</h3>
      <div v-for="(group, date) in groupedByDay" :key="date" class="mb-3">
        <p class="font-semibold">{{ date }} — {{ group.totalSeconds.toFixed(1) }}s</p>
        <ul class="pl-4 list-disc text-sm text-gray-700">
          <li v-for="(entry, i) in group.entries" :key="i">
            {{ entry.start.toFormat('HH:mm:ss') }} → {{ entry.end.toFormat('HH:mm:ss') }} ({{ entry.totalSeconds.toFixed(1) }}s)
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { DateTime } from 'luxon'
import { computed } from 'vue'
import { useTimeTracker } from '..'

const {
  label,
  recordTime,
  entriesToday,
  groupedByDay,
  dailyStats,
  deleteEntry
} = useTimeTracker()

function setLabel() {
  const newLabel = prompt('Enter a new label for tracking:', label.value)
  if (newLabel) {
    label.value = newLabel
  }
}

function addToday() {
  const now = DateTime.now()
  recordTime(now.minus({ seconds: 30 }), now, 'Today Entry')
}

function addYesterday() {
  const y = DateTime.now().minus({ days: 1 }).set({ hour: 12, minute: 0, second: 0 })
  recordTime(y, y.plus({ seconds: 30 }))
}

function addLastWeek() {
  const lw = DateTime.now().minus({ weeks: 1 }).set({ weekday: 2, hour: 10 })
  recordTime(lw, lw.plus({ seconds: 30 }))
}

// Add random 30s entries to Mon–Fri this week
function addRandomThisWeek() {
  const base = DateTime.now().startOf('week') // Monday
  for (let i = 0; i < 5; i++) {
    const start = base.plus({ days: Math.floor(Math.random() * 6) + 1, hours: Math.floor(Math.random() * 8) + 9 }) // 9am–5pm
    recordTime(start, start.plus({ seconds: (Math.floor(Math.random() * 6) + 1) * 30 }))
  }
}

// Reactive logic
const isRed = computed(() =>
  !isGreen.value && (!entriesToday?.value || entriesToday.value.totalSeconds <= dailyStats.value.min)
)

const isGreen = computed(() =>
  entriesToday?.value && entriesToday?.value?.totalSeconds >= dailyStats.value.avg
)

const isYellow = computed(() => !isRed.value && !isGreen.value)

const showAlert = computed(() =>
  entriesToday?.value && entriesToday?.value?.totalSeconds >= dailyStats.value.max
)
</script>

<style scoped>
.btn {
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: background-color 0.2s ease;
}
.btn:hover {
  background-color: #2563eb;
}
</style>
