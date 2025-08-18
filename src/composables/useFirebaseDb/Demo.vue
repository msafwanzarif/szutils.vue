<script setup lang="ts">
import { computed, ref, reactive, watch, Ref } from 'vue';
import { useFirebaseDb } from '.';
import { doc, getDoc, setDoc, DocumentData } from "firebase/firestore";
import FormModal from '../../components/FormModal.vue';

const firebase = useFirebaseDb();
const { db } = firebase;
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
    console.log("Document reference set:", newRef);
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
const showConfig = ref(false);
const showConfigJson = ref(false);
const showSetDoc = ref(false);

// Document form
const docForm = reactive({
  title: ''
});

// Login form
const loginForm = reactive({
  email: '',
  password: ''
});
const loginLoading = ref(false);
async function submitLogin() {
  loginLoading.value = true;
  await firebase.login(loginForm.email, loginForm.password);
  loginLoading.value = false;
  showLogin.value = false;
  reloadDoc()
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
</script>

<template>
  <div class="card shadow-sm p-4 my-4 mx-auto" style="max-width: 480px;">
    <h2 class="mb-3">Document Data</h2>
    <p>Current DB: {{ firebase.currentId.value ?? "No DB Configured" }}</p>
    <pre v-if="firebase.currentId.value" class="bg-light p-2 rounded">{{ isError ? "Error fetching document. You might need to login" : (docData ? docData.title : "No Data Is set") }}</pre>
    <div class="d-flex gap-2 mt-3 flex-wrap">
      <button class="btn btn-primary" @click="setDocData" v-show="firebase.currentId.value">Save Document</button>
      <button class="btn btn-outline-secondary" @click="showLogin = true" v-show="firebase.currentId.value">Login</button>
      <button class="btn btn-outline-info" @click="showConfig = true">Set Config</button>
      <button class="btn btn-outline-warning" @click="showConfigJson = true">Set Config (JSON)</button>
    </div>
  </div>

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