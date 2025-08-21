<script setup lang="ts">
import { computed, ref, reactive, watch, Ref } from 'vue';
import { useFirebaseDb, firebaseAppList } from '.';
import { doc, getDoc, setDoc, DocumentData } from "firebase/firestore";
import FormModal from '../../components/FormModal.vue';

const firebase = useFirebaseDb();
const { db, userEmail } = firebase;

// Get available project IDs
const availableProjects = computed(() => firebaseAppList.value)
const docRef = ref(db.value ? doc(db.value, "test", "testId") : null);
const isError = ref(false);
watch(db, (newDb) => {
  docRef.value = newDb ? doc(newDb, "test", "testId") : null;
});
async function reloadDoc() {
  if (!docRef.value) return;
  try {
    isError.value = false;
    const snap = await getDoc(docRef.value);
    if (snap.exists()) {
      return docData.value = snap.data();
    } else {
      console.log("No such document!");
      docData.value = null;
      return;
    }
  } catch (error) {
    console.error("Error fetching document:", error);
    isError.value = true;
    docData.value = null;
    return;
  }


}
const docData: Ref<DocumentData | null> = ref(null);
watch(docRef, async (newRef) => {
  if (newRef) {
    reloadDoc()
  } else {
    console.log("Document reference is null");
  }
});
async function setDocData() {
  showSetDoc.value = true;
}

async function submitSetDoc() {
  if (!docRef.value) return alert("Document reference is null");
  await setDoc(docRef.value, { title: docForm.title }, { merge: true });
  showSetDoc.value = false;
  docForm.title = '';
  reloadDoc();
}

// Modal state
const showLogin = ref(false);
const showSignup = ref(false);
const showConfig = ref(false);
const showConfigJson = ref(false);
const showSetDoc = ref(false);
const showSwitchDb = ref(false);

// Document form
const docForm = reactive({
  title: ''
});

// Switch database form
const switchDbForm = reactive({
  projectId: ''
});

// Signup form
const signupForm = reactive({
  email: '',
  password: ''
});
const signupLoading = ref(false);
async function submitSignup() {
  signupLoading.value = true;
  try {
    await firebase.signup(signupForm.email, signupForm.password);
    showSignup.value = false;
    signupForm.email = '';
    signupForm.password = '';
    reloadDoc();
  } catch (error) {
    console.error('Signup failed:', error);
    alert("Fail to Signup")
  }
  signupLoading.value = false;
}

// Login form
const loginForm = reactive({
  email: '',
  password: ''
});
const loginLoading = ref(false);
async function submitLogin() {
  loginLoading.value = true;
  try {
    await firebase.login(loginForm.email, loginForm.password);
    showLogin.value = false;
    loginForm.email = '';
    loginForm.password = '';
    reloadDoc();
  } catch (error) {
    console.error('Login failed:', error);
    alert("Fail to Login")
  }
  loginLoading.value = false;
}

// Logout function
async function handleLogout() {
  try {
    await firebase.logout();
    docData.value = null;
  } catch (error) {
    console.error('Logout failed:', error);
    alert("Failed to Logout")
  }
}

// Google login function
const googleLoading = ref(false);
async function handleGoogleLogin() {
  googleLoading.value = true;
  try {
    await firebase.loginWithGoogle();
    reloadDoc();
  } catch (error) {
    console.error('Google login failed:', error);
    if ((error as any).code === 'auth/popup-closed-by-user') {
      console.log('User cancelled Google sign-in');
    } else if ((error as any).code === 'auth/popup-blocked') {
      alert('Popup blocked by browser. Please allow popups for this site.');
    } else {
      alert('Google sign-in failed');
    }
  }
  googleLoading.value = false;
}

// Config form
const configForm = reactive({
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
  measurementId: ''
});
function submitConfig() {
  firebase.setConfig({ ...configForm });
  showConfig.value = false;
}

// JSON Config
const configJson = ref('');
const configJsonError = ref('');
function submitConfigJson() {
  try {
    let parsedConfig;
    const trimmedValue = configJson.value.trim();

    try {
      // First try standard JSON parsing
      parsedConfig = JSON.parse(trimmedValue);
    } catch (jsonError) {
      // If JSON parsing fails, try to handle JS object notation with unquoted keys
      try {
        // Add quotes around unquoted keys using regex
        const quotedJson = trimmedValue
          .replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":')
          .replace(/:\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*([,}])/g, ': "$1"$2');
        parsedConfig = JSON.parse(quotedJson);
      } catch (jsError) {
        throw new Error('Invalid JSON or JavaScript object format');
      }
    }

    firebase.setConfig(parsedConfig);
    showConfigJson.value = false;
    configJsonError.value = '';
  } catch (error) {
    configJsonError.value = (error as Error).message || 'Invalid format';
  }
}

function openSwitchDb() {
  // Pre-fill with current project
  switchDbForm.projectId = firebase.currentId.value || ''
  showSwitchDb.value = true
}

function submitSwitchDb() {
  if (switchDbForm.projectId && switchDbForm.projectId !== firebase.currentId.value) {
    firebase.useExisting(switchDbForm.projectId)
  }
  showSwitchDb.value = false
}
</script>

<template>
  <div class="card shadow-sm p-4 my-4 mx-auto" style="max-width: 480px;">
    <h2 class="mb-3">useFirebaseDb Demo</h2>
    
    <!-- Database Info -->
    <div class="row mb-3">
      <div class="col-8">
        <small class="text-muted">Current Database:</small>
        <div>{{ firebase.currentId.value || "No DB Configured" }}</div>
      </div>
      <div class="col-4" v-if="availableProjects.length > 1">
        <button class="btn btn-sm btn-outline-secondary" @click="openSwitchDb">
          Switch
        </button>
      </div>
    </div>
    
    <div v-if="firebase.currentId.value" class="mb-3">
      <small class="text-muted">Authentication Status:</small>
      <div>{{ firebase.isAuthenticated.value ? `Logged in as: ${userEmail}` : "Not logged in" }}</div>
    </div>
    
    <!-- Document Data Display -->
    <div v-if="firebase.currentId.value" class="mb-3">
      <h5>Test Document Data:</h5>
      <pre class="bg-light p-2 rounded">{{ isError ? "Error fetching document. You might need to login" : (docData ? JSON.stringify(docData, null, 2) : "No data set") }}</pre>
    </div>
    <div class="d-flex gap-2 mt-3 flex-wrap">
      <button class="btn btn-primary" @click="setDocData" v-show="firebase.currentId.value">Save Document</button>
      <div v-if="firebase.currentId.value" class="btn-group">
        <button class="btn btn-outline-success" @click="showSignup = true" v-if="!firebase.isAuthenticated.value">Signup</button>
        <button class="btn btn-outline-secondary" @click="showLogin = true" v-if="!firebase.isAuthenticated.value">Login</button>
        <button 
          class="btn btn-danger" 
          @click="handleGoogleLogin" 
          :disabled="googleLoading"
          v-if="!firebase.isAuthenticated.value"
        >
          <span v-if="googleLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
          {{ googleLoading ? 'Signing in...' : 'Google Login' }}
        </button>
        <button class="btn btn-outline-danger" @click="handleLogout" v-if="firebase.isAuthenticated.value">Logout</button>
      </div>
      <button class="btn btn-outline-info" @click="showConfig = true">Set Config</button>
      <button class="btn btn-outline-warning" @click="showConfigJson = true">Set Config (JSON)</button>
      <button 
        class="btn btn-outline-primary" 
        @click="openSwitchDb" 
        v-show="availableProjects.length > 1"
      >
        Switch Database
      </button>
    </div>
  </div>

  <!-- Switch Database Modal -->
  <FormModal 
    v-model:show="showSwitchDb" 
    title="Switch Database" 
    submit-text="Switch"
    submit-class="btn-primary"
    @submit="submitSwitchDb"
  >
    <template #body>
      <div class="mb-3">
        <label class="form-label">Select Database Project</label>
        <select v-model="switchDbForm.projectId" class="form-select" required>
          <option value="">-- Select Project --</option>
          <option 
            v-for="projectId in availableProjects" 
            :key="projectId" 
            :value="projectId"
          >
            {{ projectId }}
            <span v-if="projectId === firebase.currentId.value"> (current)</span>
          </option>
        </select>
        <small class="form-text text-muted">
          Available Firebase projects from initialized apps
        </small>
      </div>
    </template>
  </FormModal>

  <!-- Signup Modal -->
  <FormModal 
    v-model:show="showSignup" 
    title="Create Account" 
    submit-text="Signup"
    submit-class="btn-success"
    :loading="signupLoading"
    @submit="submitSignup"
  >
    <template #body>
      <div class="mb-3">
        <label class="form-label">Email</label>
        <input v-model="signupForm.email" type="email" class="form-control" required />
      </div>
      <div class="mb-3">
        <label class="form-label">Password</label>
        <input v-model="signupForm.password" type="password" class="form-control" required />
        <small class="form-text text-muted">Password should be at least 6 characters</small>
      </div>
    </template>
  </FormModal>

  <!-- Login Modal -->
  <FormModal 
    v-model:show="showLogin" 
    title="Login" 
    submit-text="Login"
    submit-class="btn-primary"
    :loading="loginLoading"
    @submit="submitLogin"
  >
    <template #body>
      <div class="mb-3">
        <label class="form-label">Email</label>
        <input v-model="loginForm.email" type="email" class="form-control" required />
      </div>
      <div class="mb-3">
        <label class="form-label">Password</label>
        <input v-model="loginForm.password" type="password" class="form-control" required />
      </div>
    </template>
  </FormModal>

  <!-- Config Modal -->
  <FormModal 
    v-model:show="showConfig" 
    title="Set Firebase Config" 
    submit-text="Set Config"
    submit-class="btn-info"
    @submit="submitConfig"
  >
    <template #body>
      <div class="mb-2">
        <label class="form-label">apiKey</label>
        <input v-model="configForm.apiKey" class="form-control" required />
      </div>
      <div class="mb-2">
        <label class="form-label">authDomain</label>
        <input v-model="configForm.authDomain" class="form-control" required />
      </div>
      <div class="mb-2">
        <label class="form-label">projectId</label>
        <input v-model="configForm.projectId" class="form-control" required />
      </div>
      <div class="mb-2">
        <label class="form-label">storageBucket</label>
        <input v-model="configForm.storageBucket" class="form-control" required />
      </div>
      <div class="mb-2">
        <label class="form-label">messagingSenderId</label>
        <input v-model="configForm.messagingSenderId" class="form-control" required />
      </div>
      <div class="mb-2">
        <label class="form-label">appId</label>
        <input v-model="configForm.appId" class="form-control" required />
      </div>
      <div class="mb-2">
        <label class="form-label">measurementId</label>
        <input v-model="configForm.measurementId" class="form-control" />
      </div>
    </template>
  </FormModal>

  <!-- Config JSON Modal -->
  <FormModal 
    v-model:show="showConfigJson" 
    title="Set Firebase Config (JSON)" 
    submit-text="Set Config"
    submit-class="btn-warning"
    :error="configJsonError"
    @submit="submitConfigJson"
  >
    <template #body>
      <div class="mb-3">
        <label class="form-label">Paste your Firebase config (JSON or JS object):</label>
        <textarea v-model="configJson" class="form-control" rows="8"
          placeholder='{ "apiKey": "...", "authDomain": "..." } or { apiKey: "...", authDomain: "..." }'
          required></textarea>
      </div>
    </template>
  </FormModal>

  <!-- Set Document Modal -->
  <FormModal 
    v-model:show="showSetDoc" 
    title="Set Document Title" 
    submit-text="Save Document"
    submit-class="btn-primary"
    @submit="submitSetDoc"
  >
    <template #body>
      <div class="mb-3">
        <label class="form-label">Title</label>
        <input v-model="docForm.title" class="form-control" placeholder="Enter document title" required />
      </div>
    </template>
  </FormModal>
</template>

<style scoped>
/* No custom styles needed, Bootstrap is used */
</style>