# useFirebaseDb

A Vue 3 composable for Firebase Firestore database integration with reactive authentication and configuration management.

## Features

✅ **Reactive Firebase App Management** - Automatically handles Firebase app initialization and switching  
✅ **Authentication Integration** - Built-in email/password authentication with signup, login, and logout  
✅ **Firestore Database Access** - Reactive database instance with automatic updates  
✅ **Dynamic Configuration** - Runtime Firebase config setup with JSON/JS object parsing  
✅ **Multi-Project Support** - Handle multiple Firebase projects in one application  
✅ **TypeScript Support** - Fully typed with proper Firebase types  

## Basic Usage

```vue
<script setup>
import { useFirebaseDb } from 'szutils.vue'
import { doc, getDoc, setDoc } from 'firebase/firestore'

// Initialize composable
const firebase = useFirebaseDb()

// Configure Firebase
firebase.setConfig({
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdefghijklmnop"
})

// Login user
await firebase.login('user@example.com', 'password')

// Or signup new user
await firebase.signup('newuser@example.com', 'password')

// Logout current user
await firebase.logout()

// Use Firestore
const docRef = doc(firebase.db.value, 'collection', 'documentId')
const docSnap = await getDoc(docRef)
</script>

<template>
  <div>
    <p>Project: {{ firebase.currentId }}</p>
    <p>Authenticated: {{ firebase.isAuthenticated }}</p>
    <p>User: {{ firebase.user?.email }}</p>
  </div>
</template>
```

## API Reference

### Composable

```typescript
const firebase = useFirebaseDb(projectId?: string)
```

**Parameters:**
- `projectId` (optional): Existing Firebase project ID to connect to

### Reactive Properties

#### `app`
- **Type**: `Ref<FirebaseApp | null>`
- **Description**: Current Firebase app instance

#### `auth`
- **Type**: `ComputedRef<Auth | null>`
- **Description**: Firebase Auth instance for current app

#### `db`
- **Type**: `ComputedRef<Firestore | null>`
- **Description**: Firestore database instance for current app

#### `user`
- **Type**: `ComputedRef<User | null>`
- **Description**: Currently authenticated user

#### `isAuthenticated`
- **Type**: `ComputedRef<boolean>`
- **Description**: Whether user is currently authenticated

#### `currentId`
- **Type**: `ComputedRef<string | null>`
- **Description**: Current project ID

### Methods

#### `setConfig(config: FirebaseOptions)`
Configure Firebase with project settings.

```typescript
firebase.setConfig({
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdefghijklmnop",
  measurementId: "G-XXXXXXXXXX" // optional
})
```

#### `login(email: string, password: string)`
Authenticate user with email and password.

```typescript
try {
  const user = await firebase.login('user@example.com', 'password')
  console.log('Logged in:', user)
} catch (error) {
  console.error('Login failed:', error)
}
```

#### `signup(email: string, password: string)`
Create a new user account with email and password.

```typescript
try {
  const user = await firebase.signup('newuser@example.com', 'password')
  console.log('User created:', user)
} catch (error) {
  console.error('Signup failed:', error)
}
```

#### `logout()`
Sign out the current user.

```typescript
try {
  await firebase.logout()
  console.log('Logged out successfully')
} catch (error) {
  console.error('Logout failed:', error)
}
```

#### `useExisting(projectId?: string)`
Switch to an existing Firebase app by project ID.

```typescript
firebase.useExisting('my-other-project')
```

#### `getList()`
Get list of available Firebase project IDs.

```typescript
const projects = firebase.getList()
console.log('Available projects:', projects)
```

## Advanced Examples

### Multi-Project Setup

```vue
<script setup>
import { useFirebaseDb } from 'szutils.vue'

// Production database
const prodDb = useFirebaseDb()
prodDb.setConfig({
  projectId: "my-app-prod",
  // ... other prod config
})

// Development database  
const devDb = useFirebaseDb()
devDb.setConfig({
  projectId: "my-app-dev", 
  // ... other dev config
})

// Use different databases
const prodDoc = doc(prodDb.db.value, 'users', 'user1')
const devDoc = doc(devDb.db.value, 'users', 'user1')
</script>
```

### Reactive Document Fetching

```vue
<script setup>
import { useFirebaseDb } from 'szutils.vue'
import { doc, getDoc } from 'firebase/firestore'
import { ref, watch } from 'vue'

const firebase = useFirebaseDb()
const docData = ref(null)

// Watch for database changes and refetch document
const docRef = computed(() => 
  firebase.db.value ? doc(firebase.db.value, 'posts', 'post1') : null
)

watch(docRef, async (newRef) => {
  if (newRef) {
    const snap = await getDoc(newRef)
    docData.value = snap.exists() ? snap.data() : null
  }
})
</script>
```

### Dynamic Configuration from JSON

```vue
<script setup>
import { useFirebaseDb } from 'szutils.vue'

const firebase = useFirebaseDb()

// From JSON string (supports both quoted and unquoted keys)
const configJson = `{
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com", 
  projectId: "your-project-id"
}`

try {
  const config = JSON.parse(configJson)
  firebase.setConfig(config)
} catch (error) {
  // Handle JSON parsing error
}
</script>
```

## Error Handling

```vue
<script setup>
import { useFirebaseDb } from 'szutils.vue'

const firebase = useFirebaseDb()

// Handle authentication errors
async function handleAuth(email, password, isSignup = false) {
  try {
    const user = isSignup 
      ? await firebase.signup(email, password)
      : await firebase.login(email, password)
    console.log('Success:', user)
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.error('User not found')
    } else if (error.code === 'auth/wrong-password') {
      console.error('Invalid password')
    } else if (error.code === 'auth/email-already-in-use') {
      console.error('Email already registered')
    } else if (error.code === 'auth/weak-password') {
      console.error('Password too weak')
    }
  }
}

// Handle database errors
async function fetchDocument() {
  if (!firebase.db.value) {
    console.error('Database not configured')
    return
  }
  
  try {
    const docRef = doc(firebase.db.value, 'collection', 'doc')
    const snap = await getDoc(docRef)
    return snap.data()
  } catch (error) {
    console.error('Failed to fetch document:', error)
  }
}
</script>
```

## Requirements

- Vue 3
- Firebase SDK v9+
- Node.js environment with Firebase project setup

## Demo

See `Demo.vue` for a complete interactive example with:
- Configuration forms (individual fields and JSON input)
- Authentication flow (signup, login, logout)
- Document operations
- Multi-project switching
- Error handling
- Bootstrap UI components

The demo shows practical usage patterns and best practices for integrating Firebase with Vue 3 applications.
