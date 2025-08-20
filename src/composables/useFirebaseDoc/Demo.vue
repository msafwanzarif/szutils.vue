<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useFirebaseDoc } from '.'
import { firebaseAppList } from '../useFirebaseDb'
import FormModal from '../../components/FormModal.vue'

// Initialize the composable
const firebaseDoc = useFirebaseDoc({
  collectionId: 'posts',
  documentId: 'demo-post'
})

// Get available project IDs
const availableProjects = computed(() => firebaseAppList.value)

// Modal state
const showSaveData = ref(false)
const showChangeDoc = ref(false)

// Data form
const dataForm = reactive({
  title: '',
  content: '',
  author: '',
  tags: ''
})

// Change document form
const changeDocForm = reactive({
  collectionId: '',
  documentId: '',
  projectId: ''
})

const saveLoading = ref(false)

// Methods
async function submitSaveData() {
  saveLoading.value = true
  try {
    const dataToSave = {
      title: dataForm.title,
      content: dataForm.content,
      author: dataForm.author,
      tags: dataForm.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      updatedAt: new Date().toISOString()
    }
    
    await firebaseDoc.saveData(dataToSave)
    showSaveData.value = false
    
    // Clear form
    dataForm.title = ''
    dataForm.content = ''
    dataForm.author = ''
    dataForm.tags = ''
  } catch (error) {
    console.error('Save failed:', error)
  } finally {
    saveLoading.value = false
  }
}

async function fetchData() {
  try {
    const data = await firebaseDoc.getData()
    console.log('Fetched data:', data)
  } catch (error) {
    console.error('Fetch failed:', error)
  }
}

function openChangeDoc() {
  // Pre-fill form with current values
  changeDocForm.collectionId = firebaseDoc.collection.value
  changeDocForm.documentId = firebaseDoc.id.value
  changeDocForm.projectId = firebaseDoc.currentId.value || ''
  showChangeDoc.value = true
}

function submitChangeDoc() {
  const selectedProjectId = changeDocForm.projectId === firebaseDoc.currentId.value 
    ? undefined 
    : changeDocForm.projectId || undefined
  
  firebaseDoc.changeDoc(
    changeDocForm.collectionId,
    changeDocForm.documentId,
    selectedProjectId
  )
  showChangeDoc.value = false
}
</script>

<template>
  <div class="card shadow-sm p-4 my-4 mx-auto" style="max-width: 600px;">
    <h2 class="mb-3">useFirebaseDoc Demo</h2>
    
    <!-- Document Info -->
    <div class="row mb-3">
      <div class="col-5">
        <small class="text-muted">Collection:</small>
        <div>{{ firebaseDoc.collection }}</div>
      </div>
      <div class="col-5">
        <small class="text-muted">Document:</small>
        <div>{{ firebaseDoc.id }}</div>
      </div>
      <div class="col-2">
        <button class="btn btn-sm btn-outline-secondary" @click="openChangeDoc">
          Edit
        </button>
      </div>
    </div>
    
    <!-- DB Status -->
    <div class="alert" :class="firebaseDoc.isSet.value ? 'alert-success' : 'alert-warning'">
      <strong>DB Status:</strong> {{ firebaseDoc.isSet.value ? `Configured (projectId: ${firebaseDoc.currentId.value})` : 'Is Not Configured' }}
    </div>
    <div v-if="firebaseDoc.isSet.value" class="alert" :class="firebaseDoc.isAuthenticated.value ? 'alert-success' : 'alert-warning'">
      <strong>Auth Status:</strong> {{ firebaseDoc.isAuthenticated.value ? `Authenticated: (User: ${firebaseDoc.user.value?.email})` : 'Not Authenticated' }}
    </div>
    <!-- Document Status -->
    <div class="alert" :class="firebaseDoc.exists.value ? 'alert-success' : 'alert-warning'">
      <strong>Document Status:</strong> {{ firebaseDoc.exists.value ? 'Exists' : 'Does not exist' }}
      <span v-if="firebaseDoc.loading.value" class="ms-2">
        <span class="spinner-border spinner-border-sm"></span> Loading...
      </span>
    </div>
    
    <!-- Error Display -->
    <div v-if="firebaseDoc.error.value" class="alert alert-danger">
      <strong>Error:</strong> {{ firebaseDoc.error }}
    </div>
    
    <!-- Document Data Display -->
    <div class="mb-3">
      <h5>Document Data (Real-time):</h5>
      <pre class="bg-light p-3 rounded">{{ firebaseDoc.data || 'No data' }}</pre>
    </div>
    
    <!-- Action Buttons -->
    <div class="d-flex gap-2 flex-wrap">
      <button 
        class="btn btn-primary" 
        @click="showSaveData = true"
      >
        Save Data
      </button>
      <button 
        class="btn btn-outline-primary" 
        @click="fetchData"
      >
        Fetch Data
      </button>
      <button 
        class="btn btn-outline-secondary" 
        @click="openChangeDoc"
      >
        Change Document
      </button>
    </div>
  </div>

  <!-- Change Document Modal -->
  <FormModal 
    v-model:show="showChangeDoc" 
    title="Change Document Reference" 
    submit-text="Change"
    submit-class="btn-warning"
    @submit="submitChangeDoc"
  >
    <template #body>
      <div class="mb-3">
        <label class="form-label">Collection ID</label>
        <input v-model="changeDocForm.collectionId" class="form-control" required />
      </div>
      <div class="mb-3">
        <label class="form-label">Document ID</label>
        <input v-model="changeDocForm.documentId" class="form-control" required />
      </div>
      <div class="mb-3">
        <label class="form-label">Project ID</label>
        <select v-model="changeDocForm.projectId" class="form-select">
          <option value="">-- Select Project --</option>
          <option 
            v-for="projectId in availableProjects" 
            :key="projectId" 
            :value="projectId"
          >
            {{ projectId }}
            <span v-if="projectId === firebaseDoc.currentId.value"> (current)</span>
          </option>
        </select>
        <small class="form-text text-muted">
          Select a different project to switch contexts, or keep current selection
        </small>
      </div>
    </template>
  </FormModal>

  <!-- Save Data Modal -->
  <FormModal 
    v-model:show="showSaveData" 
    title="Save Document Data" 
    submit-text="Save"
    submit-class="btn-success"
    :loading="saveLoading"
    @submit="submitSaveData"
  >
    <template #body>
      <div class="mb-3">
        <label class="form-label">Title</label>
        <input v-model="dataForm.title" class="form-control" required />
      </div>
      <div class="mb-3">
        <label class="form-label">Content</label>
        <textarea v-model="dataForm.content" class="form-control" rows="4" required></textarea>
      </div>
      <div class="mb-3">
        <label class="form-label">Author</label>
        <input v-model="dataForm.author" class="form-control" required />
      </div>
      <div class="mb-3">
        <label class="form-label">Tags (comma-separated)</label>
        <input v-model="dataForm.tags" class="form-control" placeholder="vue, firebase, demo" />
      </div>
    </template>
  </FormModal>
</template>

<style scoped>
/* No custom styles needed, Bootstrap is used */
</style>
