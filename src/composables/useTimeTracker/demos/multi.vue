<template>
  <div class="container mt-4">
    <h2>Time Trackers Demo</h2>

    <div class="row">
      <div class="col-md-6" v-for="(tracker, i) in trackers" :key="i">
        <div class="card mb-4">
          <div class="card-header d-flex justify-content-between align-items-center">
            <input v-model="tracker.label.value" class="form-control me-2" placeholder="Tracker Label" />
            <small class="text-muted">{{ tracker.trackerId }}</small>
          </div>
          <div class="card-body">
            <textarea v-model="tracker.note.value" class="form-control mb-2" placeholder="Note" />
            <input v-model="entryNotes[i]" class="form-control mb-2" placeholder="Entry Note" />
            <button class="btn btn-sm btn-primary mb-3" @click="addEntry(i)">
              Add 30 min Now
            </button>

            <ul class="list-group small mb-3">
              <li class="list-group-item" v-for="entry in tracker.computedEntries.value" :key="entry.id">
                {{ entry.start.toFormat('HH:mm') }} - {{ entry.end.toFormat('HH:mm') }}
                ({{ Math.round(entry.totalSeconds / 60) }} min)
                <br />
                <em>{{ entry.note }}</em>
              </li>
              <li v-if="!tracker.computedEntries.value.length" class="list-group-item text-muted">
                No entries
              </li>
            </ul>

            <div class="border-top pt-2">
              <p class="mb-1"><strong>All Time Stats</strong></p>
              <ul class="list-unstyled small">
                <li>Total: {{ secondsToMin(tracker.allTimeStats.value.total) }} min</li>
                <li>Count: {{ tracker.allTimeStats.value.count }}</li>
                <li>Avg: {{ secondsToMin(tracker.allTimeStats.value.avg) }} min</li>
              </ul>
            </div>

            <div class="mt-2">
              <span class="badge bg-secondary me-1" v-for="tag in tracker.tags.value" :key="tag">
                {{ tag }}
              </span>
              <input v-model="newTags[i]" @keydown.enter.prevent="addTag(i)" class="form-control form-control-sm mt-1"
                placeholder="Add tag..." />
            </div>
          </div>
        </div>
      </div>
      <div class="card mt-4">
        <div class="card-header">
          <strong>Stats Grouped by Tag (All Trackers)</strong>
        </div>
        <div class="card-body">
          <ul class="list-group list-group-flush small">
            <li v-for="tag in allTags" :key="tag" class="list-group-item">
              <strong>{{ tag }}</strong><br />
              Total: {{ secondsToMin(tagStats[tag].total) }} min<br />
              Avg: {{ secondsToMin(tagStats[tag].avg) }} min<br />
              Count: {{ tagStats[tag].count }}
            </li>
            <li v-if="allTags.length === 0" class="list-group-item text-muted">No tags found</li>
          </ul>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTimeTracker } from '..'

import { computed } from 'vue'
import { TrackerEntryComputed } from '../types'

// Get all unique tags from all trackers
const allTags = computed(() => {
  const tagSet = new Set<string>()
  for (const tracker of trackers) {
    for (const tag of tracker.tags.value) {
      tagSet.add(tag)
    }
  }
  return [...tagSet]
})

const tagStats = computed(() => {
  const result: Record<string, ReturnType<typeof computeStatsFromTrackers>> = {}

  for (const tag of allTags.value) {
    const taggedTrackers = trackers.filter(t => t.hasTag(tag))
    result[tag] = computeStatsFromTrackers(taggedTrackers)
  }

  return result
})

function computeStatsFromTrackers(taggedTrackers: typeof trackers) {
  let total = 0
  let count = 0
  let min = Infinity
  let max = -Infinity

  for (const tracker of taggedTrackers) {
    const stats = tracker.allTimeStats.value
    total += stats.total
    count += stats.count
    if (stats.count > 0) {
      min = Math.min(min, stats.min)
      max = Math.max(max, stats.max)
    }
  }

  const avg = count > 0 ? total / count : 0
  if (count === 0) {
    min = max = 0
  }

  return { min, max, avg, total, count }
}


const trackerA = useTimeTracker(undefined, 'Project Alpha')
const trackerB = useTimeTracker(undefined, 'Study Sessions')
const trackerC = useTimeTracker(undefined, 'Project Beta')

const trackers = [trackerA, trackerB, trackerC]

// UI input state
const entryNotes = ref(['', '',''])
const newTags = ref(['', '',''])

function addEntry(i: number) {
  trackers[i].recordDuration({ minutes: 30 }, undefined, entryNotes.value[i])
  entryNotes.value[i] = ''
}

function addTag(i: number) {
  const tag = newTags.value[i].trim().split(',')
  if (tag && tag.length) {
    trackers[i].addTags(...tag)
  }
  newTags.value[i] = ''
}

function secondsToMin(sec: number): number {
  return Math.round(sec / 60)
}
</script>
