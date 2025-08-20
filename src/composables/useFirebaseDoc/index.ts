import { ref, computed, watch, onUnmounted, Ref, onMounted } from 'vue'
import { doc, getDoc, setDoc, onSnapshot, DocumentData, DocumentSnapshot, Unsubscribe } from 'firebase/firestore'
import { useFirebaseDb } from '../useFirebaseDb'

export interface UseFirebaseDocOptions {
  projectId?: string
  collectionId: string
  documentId: string
  mergeOnSave?: boolean
}

export function useFirebaseDoc(options: UseFirebaseDocOptions) {
  const { projectId, mergeOnSave = true } = options
  
  // Make collection and document IDs reactive
  const collectionId = ref(options.collectionId)
  const documentId = ref(options.documentId)
  
  // Use the base Firebase composable
  const firebase = useFirebaseDb(projectId)
  
  // Document data state
  const data: Ref<DocumentData | null> = ref(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // Document reference
  const docRef = computed(() => 
    firebase.db.value ? doc(firebase.db.value, collectionId.value, documentId.value) : null
  )
  
  // Snapshot unsubscriber
  let unsubscribe: Unsubscribe | null = null
  
  // Setup real-time listener when docRef changes
  watch(docRef, (newDocRef) => {
    // Clean up previous listener
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
    
    if (newDocRef) {
      loading.value = true
      error.value = null
      // Setup real-time listener
      unsubscribe = onSnapshot(
        newDocRef,
        (doc: DocumentSnapshot) => {
          loading.value = false
          if (doc.exists()) {
            data.value = doc.data()
          } else {
            data.value = null
          }
        },
        (err) => {
          loading.value = false
          error.value = err.message
          console.error('Document listener error:', err)
        }
      )
    } else {
      data.value = null
      loading.value = false
    }
  }, { immediate: true })
  
  // Clean up listener on unmount
  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe()
    }
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
      
      await setDoc(docRef.value, newData, { merge: mergeOnSave })
      
      // Note: data will be updated automatically via onSnapshot
    } catch (err) {
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
    
    // The docRef computed will automatically update and trigger the watcher
    // which will clean up the old listener and set up a new one
  }
  
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
    
    // Document-specific methods
    saveData,
    getData,
    changeDoc
  }
}
