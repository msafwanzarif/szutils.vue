<template>
  <div class="container py-4">
    <h2 class="mb-4">useMetas Demo</h2>

    <div class="mb-3">
      <label class="form-label">ID (auto-generated)</label>
      <div><strong>{{ id }}</strong></div>
    </div>

    <div class="mb-3">
      <label class="form-label">Label</label>
      <input v-model="label" type="text" class="form-control" />
    </div>

    <div class="mb-3">
      <label class="form-label">Note</label>
      <textarea v-model="note" class="form-control" rows="2" />
    </div>

    <div class="mb-3">
      <label class="form-label">Tags</label>
      <input v-model="tagInput" class="form-control" placeholder="Enter tag(s), comma separated" />
      <div class="mt-2">
        <button class="btn btn-success btn-sm me-2" @click="addTags">Add Tags</button>
        <button class="btn btn-danger btn-sm" @click="clearTags">Clear</button>
      </div>
      <div class="mt-2">
        <span
          v-for="tag in tags"
          :key="tag"
          class="badge bg-secondary me-2"
        >
          {{ tag }}
          <button class="btn-close btn-close-white btn-sm ms-1" aria-label="Close" @click="removeTag(tag)"></button>
        </span>
      </div>
    </div>

    <div class="mb-4">
      <label class="form-label">Custom Fields (key = value)</label>
      <div v-for="key in Object.keys(localCustoms)" :key="key" class="input-group mb-2">
        <span class="input-group-text">{{ key }}</span>
        <input v-model="localCustoms[key]" class="form-control" />
        <button class="btn btn-primary" @click="saveCustom(key)">Save</button>
      </div>

      <div class="input-group">
        <input v-model="customKey" placeholder="Key" class="form-control" />
        <input v-model="customValue" placeholder="Value" class="form-control" />
        <button class="btn btn-success" @click="addCustom">Add</button>
      </div>
    </div>

    <div class="mb-4">
      <label class="form-label">Meta (Combined Output)</label>
      <pre class="bg-light p-3 border rounded">{{ meta }}</pre>
    </div>

    <div class="mb-4">
      <label class="form-label">Exported JSON</label>
      <pre class="bg-light p-3 border rounded">{{ exported }}</pre>
      <button class="btn btn-outline-primary mt-2" @click="exportJSON">Export</button>
    </div>

    <div>
      <label class="form-label">Import JSON</label>
      <textarea v-model="importInput" class="form-control" rows="4" placeholder="Paste JSON here" />
      <button class="btn btn-outline-secondary mt-2" @click="importJSON">Import</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useMetas } from '.'

const {
  id,
  label,
  note,
  tags,
  meta,
  metaFunctions
} = useMetas({ label: 'Example Label' })

// Tags
const tagInput = ref('')
function addTags() {
  const input = tagInput.value.split(',').map(t => t.trim()).filter(Boolean)
  metaFunctions.addTags(...input)
  tagInput.value = ''
}
function removeTag(tag: string) {
  metaFunctions.removeTags(tag)
}
function clearTags() {
  metaFunctions.clearTags()
}

// Customs
const localCustoms = ref<Record<string, string>>({})
function refreshLocalCustoms() {
  localCustoms.value = {}
  const all = meta.value
  for (const key in all) {
    if (!['id', 'label', 'note', 'tags'].includes(key)) {
      localCustoms.value[key] = String(all[key] ?? '')
    }
  }
}
watch(meta, refreshLocalCustoms, { immediate: true,deep:true })

const customKey = ref('')
const customValue = ref('')
function addCustom() {
  if (customKey.value.trim()) {
    metaFunctions.setMeta(customKey.value.trim(), customValue.value)
    localCustoms.value[customKey.value.trim()] = String(customValue.value)
    customKey.value = ''
    customValue.value = ''
  }
}
function saveCustom(key: string) {
  metaFunctions.setMeta(key, localCustoms.value[key])
}

// Export / Import
const exported = ref('')
function exportJSON() {
  exported.value = JSON.stringify(metaFunctions.toJSON(), null, 2)
}

const importInput = ref('')
function importJSON() {
  try {
    const parsed = JSON.parse(importInput.value)
    metaFunctions.fromJSON(parsed)
  } catch (e) {
    alert('Invalid JSON')
  }
}
</script>
