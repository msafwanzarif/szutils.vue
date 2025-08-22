<template>
  <div class="container">
    <h3 class="mb-4">⚙️ Tracker Settings</h3>

    <!-- MIN THRESHOLDS -->
    <div class="mb-4">
      <h5>Minimum Reps</h5>
      <div class="row g-2">
        <div class="col">
          <label class="form-label">Daily</label>
          <input type="number" class="form-control" v-model.number="minDaily" />
        </div>
        <div class="col">
          <label class="form-label">Weekly</label>
          <input type="number" class="form-control" v-model.number="minWeekly" />
        </div>
        <div class="col">
          <label class="form-label">Monthly</label>
          <input type="number" class="form-control" v-model.number="minMonthly" />
        </div>
      </div>
    </div>

    <!-- DAILY / WEEKLY GOALS -->
<div class="mb-4">
  <h5>Goals</h5>

  <!-- Effective Date Input -->
  <div class="mb-2">
    <label class="form-label">Effective Date</label>
    <input type="date" class="form-control" v-model="effectiveDateInput" />
  </div>

  <div class="row g-2">
    <div class="col">
      <label class="form-label">Goal for {{ effectiveDate.toFormat('ccc dd') }}</label>
      <input type="number" class="form-control" v-model.number="goalToday" @change="updateGoal(1, effectiveDate, goalToday)" />
    </div>
    <div class="col">
      <label class="form-label">Goal for {{ effectiveYesterday.toFormat('ccc dd') }}</label>
      <input type="number" class="form-control" v-model.number="goalYesterday" @change="updateGoal(1, effectiveYesterday, goalYesterday)" />
    </div>
    <div class="col">
      <label class="form-label">Weekly Goal ({{ effectiveDate.toFormat('kkkk-\'W\'WW') }})</label>
      <input type="number" class="form-control" v-model.number="goalWeek" @change="updateGoal(2, effectiveDate, goalWeek)" />
    </div>
  </div>
</div>


    <!-- OFF DAY CHECKBOXES -->
    <div class="mb-4">
      <h5>Off Days This Week</h5>
      <div class="row row-cols-2 row-cols-sm-3 row-cols-md-4">
        <div v-for="day in 7" :key="day" class="form-check">
          <input
            class="form-check-input"
            type="checkbox"
            :id="'offday-' + day"
            :value="day"
            v-model="offDaySelection"
            @change="updateOffDays"
          />
          <label class="form-check-label" :for="'offday-' + day">
            {{ weekdayLabel(day) }}
          </label>
        </div>
      </div>
    </div>

    <!-- BREAK DAY SELECT -->
    <div class="mb-4">
      <h5>Take A Break</h5>
      <div class="input-group">
        <input type="date" class="form-control" v-model="breakDate" />
        <button class="btn btn-outline-danger" @click="toggleBreakDate">Toggle Break</button>
      </div>
    </div>
  </div>
  <!-- DAILY BREAKS LIST -->
<div class="mb-4">
  <h5>Break Days</h5>
  <ul class="list-group">
    <li
      class="list-group-item d-flex justify-content-between align-items-center"
      v-for="(breakDate, i) in learning.dayBreaks.value"
      :key="i"
    >
      {{ breakDate }}
      <button class="btn btn-sm btn-outline-danger" @click="removeBreak(breakDate)">
        Remove
      </button>
    </li>
    <li v-if="learning.dayBreaks.value.length === 0" class="list-group-item text-muted text-center">
      No breaks taken
    </li>
  </ul>
</div>

</template>

<script setup lang="ts">
import { ref, watch, onMounted,computed } from 'vue'
import { DateTime } from 'luxon'
import { useHabitTracker } from '../index'
import { useFirebaseDoc } from '../../useFirebaseDoc'

const STORAGE_KEY = 'habit-learning'
const started = ref(false)
const useFirebase = ref(true)

const firebaseDoc = useFirebaseDoc({collectionId:"habit-tracker", documentId:"learning-tracker"})
const learning = useHabitTracker('learning-tracker', 'Learning Tracker', started, firebaseDoc)

// Dates
const today = DateTime.now()
const yesterday = today.minus({ days: 1 })
const todayKey = today.toISODate()

// Reactive state bindings
const minDaily = learning.minDaily
const minWeekly = learning.minWeekly
const minMonthly = learning.minMonthly

const goalToday = ref(0)
const goalYesterday = ref(0)
const goalWeek = ref(0)

const offDaySelection = ref<number[]>([])
const breakDate = ref(today.toISODate())

const effectiveDateInput = ref(today.toISODate())

const effectiveDate = computed(() => DateTime.fromISO(effectiveDateInput.value))
const effectiveYesterday = computed(() => effectiveDate.value.minus({ days: 1 }))


// Load from localStorage
onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      if(!useFirebase.value){
        learning.loadFromJSON(JSON.parse(saved))
      }
    } catch (e) {
      console.warn('Failed to load tracker:', e)
    }
  }

  started.value = true
})

// Sync to localStorage
watch(
  () => learning.toJSON(),
  (json) => {
    if (started.value) {
      reconfigureValues()
      localStorage.setItem(STORAGE_KEY, JSON.stringify(json))
    }
  },
  { deep: true }
)

// Once started, initialize UI inputs
watch(started, (v) => {
  if (!v) return

  reconfigureValues()
})

function reconfigureValues(){
  goalToday.value = learning.query.getGoal(1, today)
  goalYesterday.value = learning.query.getGoal(1, yesterday)
  goalWeek.value = learning.query.getGoal(2, today)

  const current = learning.offDayRecords.value.find(r => r.startDate === todayKey)
  offDaySelection.value = current?.days ?? []
}

watch(effectiveDate, () => {
  goalToday.value = learning.query.getGoal(1, effectiveDate.value)
  goalYesterday.value = learning.query.getGoal(1, effectiveYesterday.value)
  goalWeek.value = learning.query.getGoal(2, effectiveDate.value)
}, { immediate: true })


// Label helpers
function weekdayLabel(day: number) {
  return DateTime.fromObject({ weekday: day as 1|2|3|4|5|6|7 }).toFormat('cccc') // 'Monday'
}

// Goal setter
function updateGoal(type: 1 | 2 | 3, date: DateTime, value: number) {
  learning.setGoal(type, value, date)
}

// Off day toggle
function updateOffDays() {
  learning.setOffDay(todayKey, [...offDaySelection.value])
}

// Break toggle
function toggleBreakDate() {
  const dt = DateTime.fromISO(breakDate.value)
  learning.setBreak(1, dt)
}

function removeBreak(dateKey: string) {
  const index = learning.dayBreaks.value.indexOf(dateKey)
  if (index !== -1) {
    learning.dayBreaks.value.splice(index, 1)
  }
}
</script>
