import { FirebaseApp, initializeApp, getApps, getApp, FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { computed, ref, Ref, onMounted } from "vue";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";

export const firebaseAppList = ref<string[]>([]);

function syncFirebaseAppList() {
  firebaseAppList.value = getApps().reduce((acc: string[], app) => {
    const projectId = app.options.projectId
    if (projectId && !acc.includes(projectId)) {
      acc.push(projectId)
    }
    return acc
  }, [])
}

export function useFirebaseDb(projectId?: string) {

  const app: Ref<FirebaseApp | null> = ref(null);
  if (projectId) {
    try {
      app.value = getApp(projectId);
    } catch (err) {
      console.error("❌ Error getting app:", err);
    }
  }
  const auth = computed(() => app.value ? getAuth(app.value) : null);
  const db = computed(() => app.value ? getFirestore(app.value) : null);

  const user = computed(() => auth.value?.currentUser);
  const userEmail = computed(() => user.value ? user.value.email : null);
  const isAuthenticated = computed(() => !!user.value);

  const currentId = computed(() => app.value ? app.value.options.projectId : null);

  function setConfig(newConfig: FirebaseOptions) {
    if (!newConfig.projectId) return
    const existingApp = getApps().find(app => app.name === newConfig.projectId);
    existingApp ? app.value = existingApp : app.value = initializeApp(newConfig, newConfig.projectId || "default");
    return syncFirebaseAppList();
  }

  function useExisting(projectId?: string) {
    const existingApps = getApps()
    if (!existingApps.length) return
    let existingApp: FirebaseApp | undefined = existingApps[0];
    if (projectId) existingApp = existingApps.find(app => app.name === projectId);
    if (existingApp) app.value = existingApp;
  }

  async function login(email: string, password: string) {
    if (!app.value || !auth.value) return
    try {
      const userCred = await signInWithEmailAndPassword(auth.value, email, password);
      console.log("Logged in:", userCred.user);
      return userCred.user;
    } catch (err) {
      console.error("Login failed", err);
      throw err;
    }
  }

  async function signup(email: string, password: string) {
    if (!app.value || !auth.value) return
    try {
      const userCred = await createUserWithEmailAndPassword(auth.value, email, password);
      console.log("User created:", userCred.user);
      return userCred.user;
    } catch (err) {
      console.error("Signup failed", err);
      throw err;
    }
  }

  async function logout() {
    if (!auth.value) return
    try {
      await signOut(auth.value);
      console.log("Logged out");
    } catch (err) {
      console.error("Logout failed", err);
      throw err;
    }
  }

  function getList() {
    return firebaseAppList.value;
  }

  const isSet = computed(() => !!app.value && !!db.value);

  onMounted(() => {
    if (!isSet.value) {
      useExisting()
    }
    syncFirebaseAppList()
  })

  return {
    app,
    auth,
    user,
    userEmail,
    isSet,
    isAuthenticated,
    db,
    currentId,
    useExisting,
    setConfig,
    login,
    signup,
    logout,
    getList
  }
}