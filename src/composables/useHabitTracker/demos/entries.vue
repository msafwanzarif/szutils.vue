<template>
  <div class="container">
    <h3 class="mb-3">📘 Learning Tracker</h3>

    <!-- Note Input -->
    <div class="mb-3">
      <label class="form-label">Note (optional)</label>
      <input type="text" class="form-control" v-model="note" placeholder="e.g. Practiced flashcards" />
    </div>

    <!-- Add Rep Buttons -->
    <div class="mb-4 d-flex gap-2 flex-wrap">
      <button class="btn btn-primary" @click="addNow">Add Rep Now</button>
      <button class="btn btn-secondary" @click="addYesterday">Add Rep Yesterday</button>
      <button class="btn btn-warning" @click="addRandomThisWeek">Add Rep Random Day This Week</button>
      <button class="btn btn-danger ms-auto" @click="reset" v-if="entries.length">Reset All</button>
    </div>

    <!-- Diary: This Week -->
    <div class="mb-4">
      <h5>This Week's Diary</h5>
      <ul class="list-group">
        <li
          v-for="entry in entriesThisWeekRaw"
          :key="entry.id"
          class="list-group-item d-flex justify-content-between align-items-center"
        >
          <div>
            <strong>{{ entry.timestamp.toFormat('ccc dd LLL yyyy') }}</strong>
            — {{ entry.reps }} reps
            <span v-if="entry.note" class="text-muted">({{ entry.note }})</span>
          </div>
          <button class="btn btn-sm btn-outline-danger" @click="deleteRep(entry.id)">
            Delete
          </button>
        </li>
      </ul>
    </div>

    <!-- Diary: This Week -->
    <div class="mb-4">
      <h5>Last Week's Diary</h5>
      <ul class="list-group">
        <li
          v-for="entry in entriesLastWeekRaw"
          :key="entry.id"
          class="list-group-item d-flex justify-content-between align-items-center"
        >
          <div>
            <strong>{{ entry.timestamp.toFormat('ccc dd LLL yyyy') }}</strong>
            — {{ entry.reps }} reps
            <span v-if="entry.note" class="text-muted">({{ entry.note }})</span>
          </div>
          <button class="btn btn-sm btn-outline-danger" @click="deleteRep(entry.id)">
            Delete
          </button>
        </li>
      </ul>
    </div>

    

    <!-- Summary Stats -->
    <div class="row text-center">
      <div class="col">
        <h6>Today</h6>
        <p class="fw-bold">{{ today.progress }} reps</p>
      </div>
      <div class="col">
        <h6>Yesterday</h6>
        <p class="fw-bold">{{ entriesYesterday.totalReps }} reps</p>
      </div>
      <div class="col">
        <h6>This Week</h6>
        <p class="fw-bold">
          {{ thisWeek.progress }} reps<br />
          <small class="text-muted">Best Reps in a Day : {{ today.best }} reps</small>
        </p>
      </div>
      <div class="col">
        <h6>All Time</h6>
        <p class="fw-bold">{{ lifeTimeTotal }} reps</p>
      </div>
      <div class="col">
        <h6>Best Session</h6>
        <p class="fw-bold">{{ personalBest }} reps</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { DateTime } from 'luxon'
import { useHabitTracker } from '../index'

import { watch, onMounted } from 'vue'
import { useFirebaseDoc } from '../../useFirebaseDoc'

const STORAGE_KEY = 'habit-learning'
const started = ref(false)
const useFirebase = ref(true)
const firebaseDoc = useFirebaseDoc({collectionId:"habit-tracker", documentId:"learning-tracker"})
const { isSet, exists } = firebaseDoc
const learning = useHabitTracker('learning-tracker', 'Learning Tracker', started, firebaseDoc)

onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      if(!useFirebase.value || !isSet.value || !exists.value){
        learning.loadFromJSON(JSON.parse(saved))
      }
    } catch (e) {
      console.warn('Failed to load saved tracker data:', e)
    }
  }
  started.value = true
})

watch(
  () => learning.toJSON(),
  (json) => {
    if (!started) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(learning.toJSON(true)))
  },
  { deep: true }
)

// Shortcuts
const {
  recordRep,
  deleteRep,
  entries,
  today,
  thisWeek,
  entriesYesterday,
  entriesThisWeek,
  entriesLastWeekRaw,
  entriesThisWeekRaw,
  lifeTimeTotal,
  personalBest,
} = learning

const note = ref('')

function addNow() {
  recordRep(randomRep(), note.value)
  note.value = ''
}

function addYesterday() {
  const dt = DateTime.now().minus({ days: 1 })
  recordRep(randomRep(), note.value || 'added yesterday', dt)
  note.value = ''
}

function addRandomThisWeek() {
  const daysAgo = Math.floor(Math.random() * 6) + 1
  const dt = DateTime.now().minus({ days: daysAgo })
  recordRep(randomRep(), note.value || `random day (${dt.toFormat('ccc')})`, dt)
  note.value = ''
}

function randomRep() {
  return Math.floor(Math.random() * 5) + 1 // 1–5 reps
}

function reset() {
  entries.value.length = 0
}
</script>
