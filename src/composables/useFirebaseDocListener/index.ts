import { ref as vueRef, onUnmounted, MaybeRefOrGetter, Ref } from "vue";
import { onSnapshot, DocumentReference } from "firebase/firestore";

// Keep a global registry of listeners
const docRegistry = new Map<
  string,
  {
    data: ReturnType<typeof vueRef>;
    listeners: number;
    unsubscribe: () => void;
  }
>();

export function useFirebaseDocListener<T = any>(docRef: DocumentReference<T>,  loading?: Ref<boolean>, error?: Ref<string | null>) {
  const path = docRef.path;
  const db = docRef.firestore?.app.name;
  const key = `${db}|${path}`;
  // If already listening, reuse the entry
  if (docRegistry.has(key)) {
    const entry = docRegistry.get(key)!;
    entry.listeners++;
    const data = entry.data;
    if (loading) loading.value = false;

    // Auto-decrement when component unmounts
    onUnmounted(() => {
      entry.listeners--;
      // if (entry.listeners === 0) {
      //   entry.unsubscribe();
      //   docRegistry.delete(key);
      // }
    });

    return data;
  }

  // Otherwise, set up a new Firestore listener
  const data = vueRef<T | null>(null);

  const unsubscribe = onSnapshot(docRef, (snap) => {
    //console.log("New Document Snapshot:", snap);
    if (loading) loading.value = false;
    data.value = snap.exists() ? (snap.data() as T) : null;
  }, (err) => {
    data.value = null;
    if (loading) loading.value = false;
    if (error) error.value = err.message;
    console.error("Firestore listener error:", err);
  });

  docRegistry.set(key, {
    data,
    listeners: 1,
    unsubscribe,
  });

  onUnmounted(() => {
    const entry = docRegistry.get(key);
    if (!entry) return;
    entry.listeners--;
    // if (entry.listeners === 0) {
    //   entry.unsubscribe();
    //   docRegistry.delete(key);
    // }
  });

  return data;
}
