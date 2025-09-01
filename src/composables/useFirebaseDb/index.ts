import { FirebaseApp, initializeApp, getApps, getApp, FirebaseOptions } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { computed, ref, Ref, onMounted, watch } from "vue";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

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

  const updateHandle = ref(1)

  const user = computed(() => updateHandle.value && auth.value?.currentUser);
  const userEmail = computed(() => updateHandle.value && user.value ? user.value.email : null);
  const isAuthenticated = computed(() => updateHandle.value && !!user.value);

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

  async function loginWithGoogle() {
    if (!app.value || !auth.value) return
    try {
      const provider = new GoogleAuthProvider();
      const userCred = await signInWithPopup(auth.value, provider);
      console.log("Logged in with Google:", userCred.user);
      return userCred.user;
    } catch (err) {
      console.error("Google login failed", err);
      throw err;
    }
  }

  function getList() {
    return firebaseAppList.value;
  }

  const isSet = computed(() => !!app.value && !!db.value);

  const unsubscribe = ref<() => void>();

  onMounted(() => {
    if (!isSet.value) {
      useExisting()
    }
    if(auth.value) unsubscribe.value = onAuthStateChanged(auth.value, (user) => {
      if (user) {
        updateHandle.value++;
      } else {
        updateHandle.value++;
      }
    });
    syncFirebaseAppList()
  })

  // watch(app, (newApp) => {
  //   if (newApp) {
  //     if(unsubscribe.value) unsubscribe.value();
  //     if(auth.value) unsubscribe.value = onAuthStateChanged(auth.value, (user) => {
  //       if (user) {
  //         updateHandle.value++;
  //       } else {
  //         updateHandle.value++;
  //       }
  //     });
  //   }
  // });

  watch(auth, (newAuth) => {
    if (newAuth) {
      if(unsubscribe.value) unsubscribe.value();
      unsubscribe.value = onAuthStateChanged(newAuth, (user) => {
        if (user) {
          updateHandle.value++;
        } else {
          updateHandle.value++;
        }
      });
    }
  });

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
    loginWithGoogle,
    getList
  }
}