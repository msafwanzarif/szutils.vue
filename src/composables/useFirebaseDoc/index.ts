import { ref, computed, watch, Ref, ComputedRef } from 'vue'
import { doc, getDoc, setDoc, DocumentData, DocumentReference } from 'firebase/firestore'
import { useFirebaseDb } from '../useFirebaseDb'
import { useFirebaseDocListener } from '../useFirebaseDocListener'

export interface UseFirebaseDocOptions {
  projectId?: string
  collectionId: string
  documentId: string
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
  changeDoc: (newCollectionId: string, newDocumentId: string, newProjectId?: string) => void
}

export function useFirebaseDoc(options: UseFirebaseDocOptions): UseFirebaseDoc {
  const { projectId, mergeOnSave = true, onUpdate } = options

  // Make collection and document IDs reactive
  const collectionId = ref(options.collectionId)
  const documentId = ref(options.documentId)
  
  // Use the base Firebase composable
  const firebase = useFirebaseDb(projectId)
  
  // Document data state
  let data = computed(() => docRef.value? useFirebaseDocListener(docRef.value, loading, error).value as DocumentData | null : null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const canWrite = ref(true)
  
  // Document reference
  const docRef = computed(() => 
    firebase.db.value ? doc(firebase.db.value, collectionId.value, documentId.value) : null
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
      if (!docRef.value) {
        throw new Error('Document reference not available. Make sure Firebase is configured.')
      }
      loading.value = true
      error.value = null
      console.log("Saving data to", docRef.value.path, newData)
      await setDoc(docRef.value, newData, { merge: mergeOnSave })
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
  const id = computed(() => documentId.value)
  
  /**
   * Collection ID
   */
  const collection = computed(() => collectionId.value)
  
  /**
   * Change document reference
   */
  function changeDoc(newCollectionId: string, newDocumentId: string, newProjectId?: string) {
    // If projectId is provided, try to switch Firebase project
    if (newProjectId) {
      firebase.useExisting(newProjectId)
    }
    
    // Update collection and document IDs
    collectionId.value = newCollectionId
    documentId.value = newDocumentId
    canWrite.value = true

    // The docRef computed will automatically update and trigger the watcher
    // which will clean up the old listener and set up a new one
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
    changeDoc
  }
}
