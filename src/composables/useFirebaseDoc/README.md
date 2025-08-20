# useFirebaseDoc

A Vue 3 composable for reactive Firestore document management with real-time synchronization, dynamic document switching, and automatic resource cleanup.

## Features

✅ **Real-time Document Sync** - Automatic updates via `onSnapshot` listener  
✅ **Dynamic Document Switching** - Change collection/document/project at runtime  
✅ **Multi-Project Support** - Switch between Firebase projects seamlessly  
✅ **Automatic Resource Cleanup** - Listeners cleaned up on component unmount  
✅ **Reactive Properties** - Document data, loading states, and existence checks  
✅ **TypeScript Support** - Fully typed with proper Firebase and Vue types  
✅ **Error Handling** - Comprehensive error states and logging  

## Basic Usage

```vue
<script setup>
import { useFirebaseDoc } from 'szutils.vue'

// Initialize with document reference
const firebaseDoc = useFirebaseDoc({
  collectionId: 'posts',
  documentId: 'my-post-123'
})

// Save data to document
await firebaseDoc.saveData({
  title: 'My Blog Post',
  content: 'Hello world!',
  author: 'John Doe',
  createdAt: new Date().toISOString()
})

// Data updates automatically via real-time listener
console.log(firebaseDoc.data.value) // Current document data
</script>

<template>
  <div>
    <!-- Document info -->
    <p>Collection: {{ firebaseDoc.collection }}</p>
    <p>Document: {{ firebaseDoc.id }}</p>
    <p>Exists: {{ firebaseDoc.exists }}</p>
    
    <!-- Real-time document data -->
    <div v-if="firebaseDoc.loading">Loading...</div>
    <div v-else-if="firebaseDoc.error">Error: {{ firebaseDoc.error }}</div>
    <pre v-else>{{ firebaseDoc.data }}</pre>
  </div>
</template>
```

## API Reference

### Composable

```typescript
const firebaseDoc = useFirebaseDoc(options: UseFirebaseDocOptions)
```

**Options:**
```typescript
interface UseFirebaseDocOptions {
  projectId?: string        // Optional Firebase project ID
  collectionId: string      // Firestore collection name
  documentId: string        // Document ID within collection
  mergeOnSave?: boolean     // Whether to merge data on save (default: true)
}
```

### Reactive Properties

#### `data`
- **Type**: `Ref<DocumentData | null>`
- **Description**: Real-time document data from Firestore

#### `loading`
- **Type**: `Ref<boolean>`
- **Description**: Loading state for operations

#### `error`
- **Type**: `Ref<string | null>`
- **Description**: Error message from operations

#### `exists`
- **Type**: `ComputedRef<boolean>`
- **Description**: Whether the document exists in Firestore

#### `docRef`
- **Type**: `ComputedRef<DocumentReference | null>`
- **Description**: Firestore document reference

#### `id`
- **Type**: `ComputedRef<string>`
- **Description**: Current document ID

#### `collection`
- **Type**: `ComputedRef<string>`
- **Description**: Current collection ID

### Inherited from useFirebaseDb

All properties and methods from [`useFirebaseDb`](../useFirebaseDb) are also available:
- `app`, `auth`, `db`, `user`, `isAuthenticated`, `currentId`
- `setConfig()`, `login()`, `useExisting()`, `getList()`

### Methods

#### `saveData(data: DocumentData)`
Save data to the document with optional merging.

```typescript
await firebaseDoc.saveData({
  title: 'Updated Title',
  content: 'New content',
  updatedAt: new Date().toISOString()
})
```

#### `getData(): Promise<DocumentData | null>`
One-time fetch of current document data.

```typescript
const currentData = await firebaseDoc.getData()
console.log('Current data:', currentData)
```

#### `changeDoc(collectionId: string, documentId: string, projectId?: string)`
Dynamically change the document reference.

```typescript
// Change to different document in same collection
firebaseDoc.changeDoc('posts', 'different-post')

// Change collection and document
firebaseDoc.changeDoc('users', 'user-123')

// Change project, collection, and document
firebaseDoc.changeDoc('posts', 'post-456', 'my-other-project')
```

## Advanced Examples

### Real-time Document Editor

```vue
<script setup>
import { useFirebaseDoc } from 'szutils.vue'
import { ref, watch } from 'vue'

const firebaseDoc = useFirebaseDoc({
  collectionId: 'documents',
  documentId: 'shared-doc'
})

// Local editing state
const title = ref('')
const content = ref('')

// Sync with document data
watch(firebaseDoc.data, (newData) => {
  if (newData) {
    title.value = newData.title || ''
    content.value = newData.content || ''
  }
}, { immediate: true })

// Auto-save on changes
const saveChanges = async () => {
  await firebaseDoc.saveData({
    title: title.value,
    content: content.value,
    lastModified: new Date().toISOString(),
    modifiedBy: firebaseDoc.user.value?.email
  })
}
</script>

<template>
  <div>
    <input v-model="title" @blur="saveChanges" placeholder="Document title" />
    <textarea v-model="content" @blur="saveChanges" placeholder="Content"></textarea>
    
    <div v-if="firebaseDoc.loading" class="status">Saving...</div>
    <div v-if="firebaseDoc.error" class="error">{{ firebaseDoc.error }}</div>
  </div>
</template>
```

### Dynamic Document Browser

```vue
<script setup>
import { useFirebaseDoc } from 'szutils.vue'
import { ref } from 'vue'

const firebaseDoc = useFirebaseDoc({
  collectionId: 'posts',
  documentId: 'default'
})

const newCollection = ref('')
const newDocument = ref('')

const switchDocument = () => {
  firebaseDoc.changeDoc(newCollection.value, newDocument.value)
}
</script>

<template>
  <div>
    <!-- Current document info -->
    <h3>{{ firebaseDoc.collection }}/{{ firebaseDoc.id }}</h3>
    
    <!-- Document switcher -->
    <input v-model="newCollection" placeholder="Collection ID" />
    <input v-model="newDocument" placeholder="Document ID" />
    <button @click="switchDocument">Switch Document</button>
    
    <!-- Document content -->
    <pre v-if="firebaseDoc.exists">{{ firebaseDoc.data }}</pre>
    <p v-else>Document does not exist</p>
  </div>
</template>
```

### Multi-Project Document Manager

```vue
<script setup>
import { useFirebaseDoc } from 'szutils.vue'
import { computed } from 'vue'

const firebaseDoc = useFirebaseDoc({
  collectionId: 'settings',
  documentId: 'app-config'
})

// Available Firebase projects
const projects = computed(() => firebaseDoc.getList())

const switchProject = (projectId) => {
  firebaseDoc.changeDoc('settings', 'app-config', projectId)
}
</script>

<template>
  <div>
    <!-- Project selector -->
    <select @change="switchProject($event.target.value)">
      <option v-for="project in projects" :key="project" :value="project">
        {{ project }}
      </option>
    </select>
    
    <!-- Current project config -->
    <h4>Config for {{ firebaseDoc.currentId }}</h4>
    <pre>{{ firebaseDoc.data }}</pre>
  </div>
</template>
```

## Error Handling

```vue
<script setup>
import { useFirebaseDoc } from 'szutils.vue'

const firebaseDoc = useFirebaseDoc({
  collectionId: 'posts',
  documentId: 'my-post'
})

const handleSave = async () => {
  try {
    await firebaseDoc.saveData({ title: 'New Title' })
    console.log('Saved successfully')
  } catch (error) {
    console.error('Save failed:', error)
    // Error is also available in firebaseDoc.error.value
  }
}

const handleFetch = async () => {
  try {
    const data = await firebaseDoc.getData()
    console.log('Fetched:', data)
  } catch (error) {
    console.error('Fetch failed:', error)
  }
}
</script>
```

## Lifecycle Management

The composable automatically manages Firestore listeners:

- **Setup**: Listener created when `docRef` becomes available
- **Cleanup**: Previous listener cleaned up when document changes
- **Unmount**: All listeners cleaned up when component unmounts

No manual cleanup required!

## Requirements

- Vue 3
- Firebase SDK v9+
- Configured Firebase project with Firestore

## Demo

See `Demo.vue` for a complete interactive example featuring:
- Real-time document synchronization
- Document switching interface
- Multi-project support
- Data editing and saving
- Error handling and loading states
- Bootstrap UI components

The demo shows practical patterns for building document-based applications with reactive Firebase integration.
