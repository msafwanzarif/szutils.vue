<template>
  <div class="container">
    <h3 class="mb-4">📊 Progress Dashboard</h3>

    <!-- Yesterday Summary -->
    <div class="mb-4">
      <h5>🕒 Yesterday ({{ yesterday.toFormat('ccc dd LLL') }})</h5>
      <ul class="list-group">
        <li class="list-group-item">
          <strong>Off Day:</strong> {{ summaryYesterday.isOff ? 'Yes' : 'No' }}
        </li>
        <li class="list-group-item">
          <strong>Passed:</strong> {{ summaryYesterday.passed ? '✅' : '❌' }}
        </li>
        <li class="list-group-item">
          <strong>Success:</strong> {{ summaryYesterday.success ? '🏆' : '—' }}
        </li>
        <li class="list-group-item">
          <strong>Total Reps:</strong> {{ summaryYesterday.totalReps }} ({{ summaryYesterday.entryCount }} entries)
        </li>
      </ul>
    </div>

    <!-- Today Progress -->
    <div class="mb-4">
      <h5>📅 Today ({{ today.toFormat('ccc dd LLL') }})</h5>
      <ul class="list-group">
        <li class="list-group-item">
          <strong>Off Day:</strong> {{ summaryToday.isOff ? 'Yes' : 'No' }}
        </li>
        <li class="list-group-item">
          <strong>Reps Done:</strong> {{ summaryToday.totalReps }}
        </li>
        <li class="list-group-item">
          <strong>Passed:</strong> {{ summaryToday.passed ? '✅' : '❌' }}
        </li>
        <li class="list-group-item">
          <strong>
            {{ summaryToday.totalReps >= summaryToday.targetReps ? 'Extras' : 'To Goal' }}:
          </strong>
          {{ Math.abs(summaryToday.totalReps - summaryToday.targetReps) }} reps
        </li>
        <li v-if="summaryToday.isBest" class="list-group-item text-success fw-bold">
          🥇 New personal best for a single day!
        </li>
      </ul>
    </div>

    <!-- Weekly Planner -->
    <div class="mb-4">
      <h5>🗓️ This Week</h5>
      <div class="row g-2">
        <div class="col-6 col-sm-4 col-md-3" v-for="(day, index) in weekDays" :key="index">
          <div class="card text-center shadow-sm">
            <div class="card-header">
              {{ day.date.toFormat('ccc') }}
              <div class="small text-muted">{{ day.date.toFormat('dd/MM') }}</div>
            </div>
            <div class="card-body p-2">
              <p class="mb-1 fw-bold">{{ day.totalReps }} reps</p>
              <p class="mb-1 fw-bold">Streak: {{ day.successStreakS }}</p>
              <div class="d-flex flex-wrap justify-content-center gap-1">
                <span v-if="day.isOff" class="badge bg-dark">Off</span>
                <span v-else-if="day.isBreak" class="badge bg-warning text-dark">Break</span>
                <span v-if="day.passed" class="badge bg-primary">Passed</span>
                <span v-if="day.success" class="badge bg-success">Success</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { DateTime } from 'luxon'
import { useHabitTracker } from '../index'
import { useFirebaseDoc } from '../../useFirebaseDoc'

const STORAGE_KEY = 'habit-learning'
const started = ref(false)
const useFirebase = ref(true)
const firebaseDoc = useFirebaseDoc({collectionId:"habit-tracker", documentId:"learning-tracker"})
const tracker = useHabitTracker('learning-tracker', 'Learning Tracker', started, firebaseDoc)

onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      if(!useFirebase.value){
        tracker.loadFromJSON(JSON.parse(saved))
      }
    } catch (e) {
      console.warn('Failed to load saved tracker data:', e)
    }
  }
  started.value = true
})

watch(
  () => tracker.toJSON(),
  (json) => {
    if (started.value) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(json))
    }
  },
  { deep: true }
)

const today = DateTime.now()
const yesterday = today.minus({ days: 1 })

const dayGroup = (date: DateTime) =>
  tracker.query.getEntries(1,date)

const dayStatus = (date: DateTime) => tracker.query.getStatus(1,date)

const summaryYesterday = computed(() => {
  const group = dayGroup(yesterday)
  return {
    isOff: group?.isOff ?? false,
    passed: group?.passed ?? false,
    success: group?.success ?? false,
    totalReps: group?.totalReps ?? 0,
    entryCount: group?.entries.length ?? 0
  }
})

const summaryToday = computed(() => {
  const group = dayGroup(today)
  return {
    isOff: group?.isOff ?? false,
    passed: group?.passed ?? false,
    success: group?.success ?? false,
    totalReps: group?.totalReps ?? 0,
    targetReps: group?.targetReps ?? 0,
    isBest: tracker.personalBest.value > 0 && group?.totalReps === tracker.personalBest.value
  }
})

const startOfWeek = today.startOf('week').minus({weeks: 1}) // Start from last week
const weekDays = computed(() => { return Array.from({ length: 14 }).map((_, i) => {
  const date = startOfWeek.plus({ days: i })
  const status = dayStatus(date)
  const group = dayGroup(date)
  return {
    date,
    totalReps: status?.progress ?? 0,
    passed: status?.isPassed ?? false,
    success: status?.isSuccess ?? false,
    isOff: status?.isOff ?? false,
    isOffG: group?.isOff ?? false,
    isBreak: status?.isBreak ?? false,
    passedStreak: group?.passedStreak ?? 0,
    successStreak: group?.successStreak ?? 0,
    passedStreakS: status?.passedStreak ?? 0,
    successStreakS: status?.successStreak ?? 0,
    missed: group?.missed ?? false,
  }
})})
</script>
