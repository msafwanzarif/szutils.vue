import { FirebaseApp, initializeApp, getApps,getApp, FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { computed, ref, Ref } from "vue";
import { signInWithEmailAndPassword } from "firebase/auth";

// TODO: replace with your Firebase config (from Firebase Console)
// const firebaseConfig = {
//   apiKey: "AIzaSyB4Mkg5dhlKc47uaxQmrw3CZAO60x0sYxU",
//   authDomain: "test-firebase-70f4b.firebaseapp.com",
//   projectId: "test-firebase-70f4b",
//   storageBucket: "test-firebase-70f4b.firebasestorage.app",
//   messagingSenderId: "980380800452",
//   appId: "1:980380800452:web:853bfde34800a9c641c091",
//   measurementId: "G-ELCN4H7267"
// };

export function useFirebaseDb(projectId?:string){

  const app : Ref<FirebaseApp | null> = ref(null);
  if(projectId){
    try{
      app.value = getApp(projectId);
    }catch(err){
      console.error("❌ Error getting app:", err);
    }
  }
  const auth = computed(() => app.value? getAuth(app.value): null);
  const db = computed(() => app.value? getFirestore(app.value): null);

  const currentId = computed(() => app.value? app.value.options.projectId : null);

  function setConfig(newConfig: FirebaseOptions) {
    if (!newConfig.projectId) return
    const existingApp = getApps().find(app => app.name === newConfig.projectId);
    return existingApp ? app.value = existingApp : app.value = initializeApp(newConfig, newConfig.projectId || "default");
  }

  async function login(email:string, password:string) {
    if(!app.value || !auth.value) return
    try {
      const userCred = await signInWithEmailAndPassword(auth.value, email, password);
      console.log("Logged in:", userCred.user);
    } catch (err) {
      console.error("Login failed", err);
    }
  }

  return {
    app,
    auth,
    db,
    currentId,
    setConfig,
    login
  }
}