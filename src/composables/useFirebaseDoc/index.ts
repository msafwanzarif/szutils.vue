import { ref, computed, watch, Ref, ComputedRef } from 'vue'
import { doc, getDoc, setDoc, DocumentData, DocumentReference } from 'firebase/firestore'
import { useFirebaseDb } from '../useFirebaseDb'
import { useFirebaseDocListener } from '../useFirebaseDocListener'

export interface UseFirebaseDocOptions {
  projectId?: string
  writeDebounceMs?: number
  mergeOnSave?: boolean
  onUpdate?: (data: DocumentData | null) => void
}

export type UseFirebaseDoc = ReturnType<typeof useFirebaseDb> & {
  docRef: ComputedRef<DocumentReference | null>
  data: ComputedRef<DocumentData | null>
  loading: Ref<boolean>
  error: Ref<string | null>
  exists: ComputedRef<boolean>
  id: ComputedRef<string>
  collection: ComputedRef<string>
  canWrite: Ref<boolean>,
  saveData: (newData: DocumentData) => Promise<void>
  getData: () => Promise<DocumentData | null>
  changeDoc: (path:string,...pathSegments:string[]) => void
  changeProject: (projectId:string) => void
}

export function useFirebaseDoc(options: UseFirebaseDocOptions,path:string,...pathSegments:string[]): UseFirebaseDoc {
  const { projectId, mergeOnSave = true, onUpdate } = options

  // Make collection and document IDs reactive
  const currentPath = ref(path)
  const currentPathSegments = ref(pathSegments)

  // Use the base Firebase composable
  const firebase = useFirebaseDb(projectId)
  
  // Document data state
  let data = computed(() => docRef.value? useFirebaseDocListener(docRef.value, loading, error).value as DocumentData | null : null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const canWrite = ref(true)
  
  // Track last write timestamp to prevent rapid saves
  let lastWriteTimestamp = 0
  const WRITE_DEBOUNCE_MS = options.writeDebounceMs || 500 // 0.5 seconds
  
  // Document reference
  const docRef = computed(() => 
    firebase.db.value ? doc(firebase.db.value, currentPath.value, ...currentPathSegments.value) : null
  )
  
  // Setup real-time listener when docRef changes
  const { userEmail } = firebase
  watch(userEmail, (newEmail) => {
    getData()
    canWrite.value = true
  })

  watch(firebase.isSet, (isSet) => {
    if(isSet){
      firebase.useExisting()
    }
  })
  
  /**
   * Save data to the document
   */
  async function saveData(newData: DocumentData) {
    try {
      // Check if enough time has passed since last write
      const now = Date.now()
      const timeSinceLastWrite = now - lastWriteTimestamp
      
      if (timeSinceLastWrite < WRITE_DEBOUNCE_MS) {
        const remainingTime = WRITE_DEBOUNCE_MS - timeSinceLastWrite
        const message = `Write blocked: ${remainingTime}ms remaining until next write allowed`
        console.error(message)
        error.value = message
        return
      }
      
      if (!docRef.value) {
        throw new Error('Document reference not available. Make sure Firebase is configured.')
      }
      
      loading.value = true
      error.value = null
      console.log("Saving data to", docRef.value.path, newData)
      
      await setDoc(docRef.value, newData, { merge: mergeOnSave })
      
      // Update timestamp after successful write
      lastWriteTimestamp = now
      canWrite.value = true;
      
      // Note: data will be updated automatically via onSnapshot
    } catch (err) {
      canWrite.value = false;
      error.value = (err as Error).message
      throw err
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Get current document data (one-time fetch)
   */
  async function getData(): Promise<DocumentData | null> {
    try {
      if (!docRef.value) {
        throw new Error('Document reference not available. Make sure Firebase is configured.')
      }
      loading.value = true
      error.value = null
      
      const docSnap = await getDoc(docRef.value)
      const result = docSnap.exists() ? docSnap.data() : null
      //data.value = result;
      return result
    } catch (err) {
      error.value = (err as Error).message
      throw err
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Check if document exists
   */
  const exists = computed(() => data.value !== null)
  
  /**
   * Document ID
   */
  const id = computed(() => currentPath.value + '/' + currentPathSegments.value.join('/'))

  /**
   * Collection ID
   */
  const collection = computed(() => currentPath.value)

  /**
   * Change document reference
   */
  function changeDoc(path:string,...pathSegments:string[]) {

    // Update current path and segments
    currentPath.value = path
    currentPathSegments.value = pathSegments
    canWrite.value = true

    // Reset write timestamp when changing documents
    lastWriteTimestamp = 0
  }

  function changeProject(projectId:string) {
    firebase.useExisting(projectId)
  }

  watch(data, (newData) => {
    //if (newData) {
      if(onUpdate) {
        onUpdate(newData as DocumentData | null);
      }
    //}
  }, { deep: true })

  return {
    // Extend firebase composable
    ...firebase,
    
    // Document-specific properties
    docRef,
    data,
    loading,
    error,
    exists,
    id,
    collection,
    canWrite,
    
    // Document-specific methods
    saveData,
    getData,
    changeDoc,
    changeProject
  }
}
