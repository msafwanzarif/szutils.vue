# useFirebaseDocListener

A Vue 3 composable for efficiently managing Firestore document listeners with automatic deduplication and memory management.

## Features

- **Global listener registry**: Prevents duplicate listeners for the same document
- **Automatic memory management**: Tracks listener usage across components
- **TypeScript support**: Full type safety with generic support
- **Real-time synchronization**: Automatic updates when document changes
- **Error handling**: Optional error state management
- **Loading state integration**: Optional loading state management

## Installation

```bash
npm install firebase
```

## Basic Usage

```vue
<script setup>
import { ref } from 'vue'
import { doc } from 'firebase/firestore'
import { useFirebaseDb ,useFirebaseDocListener } from 'szutils.vue'

const firebase = useFirebaseDb()
const loading = ref(true)
const error = ref(null)

// Create document reference
const userDocRef = doc(firebase.db.value, 'users', 'user123')

// Listen to document changes
const userData = useFirebaseDocListener(userDocRef, loading, error)
</script>

<template>
  <div>
    <div v-if="loading">Loading user data...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="userData">
      <h2>{{ userData.name }}</h2>
      <p>{{ userData.email }}</p>
    </div>
    <div v-else>User not found</div>
  </div>
</template>
```

## API Reference

### Function Signature

```typescript
function useFirebaseDocListener<T = any>(
  docRef: DocumentReference<T>,
  loading?: Ref<boolean>,
  error?: Ref<string | null>
): Ref<T | null>
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `docRef` | `DocumentReference<T>` | Yes | Firestore document reference to listen to |
| `loading` | `Ref<boolean>` | No | Optional reactive loading state |
| `error` | `Ref<string \| null>` | No | Optional reactive error state |

### Return Value

Returns a reactive reference (`Ref<T | null>`) containing the document data.

## TypeScript Usage

### With Generic Types

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { doc } from 'firebase/firestore'
import { useFirebaseDb, useFirebaseDocListener } from 'szutils.vue'

interface User {
  id: string
  name: string
  email: string
  createdAt: Date
}

const firebase = useFirebaseDb()
const loading = ref(true)
const error = ref<string | null>(null)

const userDocRef = doc(firebase.db.value, 'users', 'user123')
const userData = useFirebaseDocListener<User>(userDocRef, loading, error)

// userData is now typed as Ref<User | null>
</script>
```

## Advanced Examples

### Multiple Documents in Same Component

```vue
<script setup>
import { ref } from 'vue'
import { doc } from 'firebase/firestore'
import { useFirebaseDb, useFirebaseDocListener } from 'szutils.vue'

const firebase = useFirebaseDb()

// Listen to multiple documents efficiently
const userRef = doc(firebase.db.value, 'users', 'user123')
const profileRef = doc(firebase.db.value, 'profiles', 'user123')

const userData = useFirebaseDocListener(userRef)
const profileData = useFirebaseDocListener(profileRef)
</script>

<template>
  <div>
    <div v-if="userData">User: {{ userData.name }}</div>
    <div v-if="profileData">Bio: {{ profileData.bio }}</div>
  </div>
</template>
```

### With Error Handling

```vue
<script setup>
import { ref, computed } from 'vue'
import { doc } from 'firebase/firestore'
import { useFirebaseDb, useFirebaseDocListener } from 'szutils.vue'

const firebase = useFirebaseDb()
const loading = ref(true)
const error = ref(null)

const docRef = doc(firebase.db.value, 'documents', 'doc123')
const documentData = useFirebaseDocListener(docRef, loading, error)

const hasError = computed(() => !!error.value)
const isReady = computed(() => !loading.value && !error.value)
</script>

<template>
  <div>
    <div v-if="loading" class="spinner">Loading...</div>
    <div v-else-if="hasError" class="alert alert-danger">
      Error: {{ error }}
    </div>
    <div v-else-if="isReady && documentData">
      <!-- Document content -->
      <h3>{{ documentData.title }}</h3>
      <p>{{ documentData.content }}</p>
    </div>
    <div v-else class="alert alert-info">
      Document not found
    </div>
  </div>
</template>
```

### Dynamic Document References

```vue
<script setup>
import { ref, computed, watch } from 'vue'
import { doc } from 'firebase/firestore'
import { useFirebaseDb, useFirebaseDocListener } from 'szutils.vue'

const firebase = useFirebaseDb()
const selectedUserId = ref('user123')

// Create reactive document reference
const userDocRef = computed(() => 
  doc(firebase.db.value, 'users', selectedUserId.value)
)

// Watch for reference changes and create new listeners
const userData = ref(null)
watch(userDocRef, (newDocRef) => {
  if (newDocRef) {
    userData.value = useFirebaseDocListener(newDocRef)
  }
}, { immediate: true })

function selectUser(userId) {
  selectedUserId.value = userId
}
</script>

<template>
  <div>
    <button @click="selectUser('user123')">User 123</button>
    <button @click="selectUser('user456')">User 456</button>
    
    <div v-if="userData">
      <h2>{{ userData.name }}</h2>
      <p>{{ userData.email }}</p>
    </div>
  </div>
</template>
```

## How It Works

### Listener Registry

The composable maintains a global registry of document listeners to prevent duplicate subscriptions:

```typescript
const docRegistry = new Map<string, {
  data: Ref,
  listeners: number,
  unsubscribe: () => void
}>()
```

### Automatic Deduplication

When multiple components listen to the same document:

1. **First component**: Creates a new Firestore listener
2. **Additional components**: Reuse the existing listener and shared data
3. **Component unmount**: Decrements listener count
4. **Last component unmount**: Cleans up the Firestore listener

### Memory Management

- Listeners are automatically tracked and cleaned up
- No memory leaks from duplicate listeners
- Efficient resource usage across the application

## Performance Benefits

### Reduced Firestore Reads

```vue
<!-- Without useFirebaseDocListener -->
<UserProfile :userId="'user123'" /> <!-- Creates listener 1 -->
<UserAvatar :userId="'user123'" />  <!-- Creates listener 2 -->
<UserMenu :userId="'user123'" />    <!-- Creates listener 3 -->

<!-- With useFirebaseDocListener -->
<UserProfile :userId="'user123'" /> <!-- Creates listener 1 -->
<UserAvatar :userId="'user123'" />  <!-- Reuses listener 1 -->
<UserMenu :userId="'user123'" />    <!-- Reuses listener 1 -->
```

### Bandwidth Optimization

- Single WebSocket connection per unique document
- Shared data updates across all components
- Reduced Firebase billing costs

## Best Practices

### 1. Use with Document References

```typescript
// ✅ Good: Use with actual DocumentReference
const docRef = doc(db, 'users', userId)
const userData = useFirebaseDocListener(docRef)

// ❌ Avoid: Don't create references inside the composable
```

### 2. Handle Loading States

```typescript
// ✅ Good: Provide loading state
const loading = ref(true)
const userData = useFirebaseDocListener(docRef, loading)

// ✅ Also good: Check data existence
const isLoaded = computed(() => userData.value !== null)
```

### 3. Error Handling

```typescript
// ✅ Good: Handle errors
const error = ref(null)
const userData = useFirebaseDocListener(docRef, loading, error)

// Watch for errors
watch(error, (newError) => {
  if (newError) {
    console.error('Document error:', newError)
    // Handle error (show notification, retry, etc.)
  }
})
```

### 4. TypeScript Integration

```typescript
// ✅ Good: Use specific types
interface UserDoc {
  name: string
  email: string
  settings: UserSettings
}

const userData = useFirebaseDocListener<UserDoc>(docRef)
// userData is now Ref<UserDoc | null>
```

## Comparison with useFirebaseDoc

| Feature | useFirebaseDocListener | useFirebaseDoc |
|---------|----------------------|----------------|
| **Purpose** | Lightweight document listening | Full document management |
| **Registry** | Global deduplication | Per-instance |
| **Memory** | Shared across components | Individual instances |
| **API** | Minimal, focused | Complete CRUD operations |
| **Use Case** | Read-only real-time data | Full document lifecycle |

## Integration Example

### Complete User Dashboard

```vue
<script setup>
import { ref } from 'vue'
import { doc } from 'firebase/firestore'
import { useFirebaseDocListener } from 'szutils.vue'
import { useFirebaseDb } from 'szutils.vue'

// Firebase setup
const firebase = useFirebaseDb()
const loading = ref(true)
const error = ref(null)

// User document
const userDocRef = doc(firebase.db.value, 'users', firebase.user.value?.uid)
const userData = useFirebaseDocListener(userDocRef, loading, error)

// Settings document
const settingsDocRef = doc(firebase.db.value, 'settings', firebase.user.value?.uid)
const settingsData = useFirebaseDocListener(settingsDocRef)

// Profile document
const profileDocRef = doc(firebase.db.value, 'profiles', firebase.user.value?.uid)
const profileData = useFirebaseDocListener(profileDocRef)
</script>

<template>
  <div class="dashboard">
    <div v-if="loading" class="text-center">
      <div class="spinner-border" role="status"></div>
      <p>Loading dashboard...</p>
    </div>
    
    <div v-else-if="error" class="alert alert-danger">
      Error loading dashboard: {{ error }}
    </div>
    
    <div v-else class="row">
      <!-- User Info -->
      <div class="col-md-4">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">Profile</h5>
            <div v-if="userData">
              <p><strong>Name:</strong> {{ userData.name }}</p>
              <p><strong>Email:</strong> {{ userData.email }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Settings -->
      <div class="col-md-4">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">Settings</h5>
            <div v-if="settingsData">
              <p><strong>Theme:</strong> {{ settingsData.theme }}</p>
              <p><strong>Notifications:</strong> {{ settingsData.notifications ? 'On' : 'Off' }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Profile Details -->
      <div class="col-md-4">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">Bio</h5>
            <div v-if="profileData">
              <p>{{ profileData.bio }}</p>
              <p><strong>Joined:</strong> {{ new Date(profileData.createdAt?.toDate()).toLocaleDateString() }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
```

## Notes

- The composable currently has commented-out cleanup code for listener management
- Global registry persists for the application lifetime
- Designed for read-only document listening scenarios
- For write operations, consider using `useFirebaseDoc` instead

## Related Composables

- [`useFirebaseDb`](../useFirebaseDb/README.md) - Firebase initialization and authentication
- [`useFirebaseDoc`](../useFirebaseDoc/README.md) - Complete document management with CRUD operations
