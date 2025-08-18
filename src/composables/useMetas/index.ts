import { ref, computed } from 'vue'
import { generateId } from '../../utility'

type MetaValue = string | number | boolean | null | string[] | number[]
type MetaRecord = Record<string, MetaValue>

export function useMetas(options?: {
  id?: string
  label?: string
}) {
  const id = ref(options?.id || generateId())
  const label = ref(options?.label ?? '')
  const note = ref('')
  const tags = ref<string[]>([])
  const customs = ref<MetaRecord>({})

  const metaFunctions = {
    // Tags
    addTags(...newTags: string[]) {
      for (const tag of newTags.flat()) {
        if (!tags.value.includes(tag)) {
          tags.value.push(tag)
        }
      }
    },

    removeTags(...tagsToRemove: string[]) {
      const toRemove = new Set(tagsToRemove.flat())
      tags.value = tags.value.filter(tag => !toRemove.has(tag))
    },

    clearTags() {
      tags.value = []
    },

    hasTag(tag: string) {
      return tags.value.includes(tag)
    },

    getTags(): string[] {
      return [...tags.value]
    },

    // Label / Note
    setLabel(newLabel: string) {
      label.value = newLabel
    },

    setNote(newNote: string) {
      note.value = newNote
    },

    // Customs
    setMeta(key: string, value: MetaValue) {
      customs.value[key] = value
    },

    getMeta(key: string): MetaValue | undefined {
      return meta.value[key]
    },

    setMetas(obj: MetaRecord) {
      customs.value = { ...customs.value, ...obj }
    },

    // Serialization
    toJSON(): MetaRecord {
      return {
        ...customs.value,
        id: id.value,
        label: label.value,
        note: note.value,
        tags: [...tags.value],
      }
    },

    fromJSON(data: Partial<MetaRecord>) {
      if (data.id && typeof data.id === 'string') id.value = data.id
      if (data.label && typeof data.label === 'string') label.value = data.label
      if (data.note && typeof data.note === 'string') note.value = data.note
      if (Array.isArray(data.tags)) tags.value = data.tags.map(String)

      const reserved = new Set(['id', 'label', 'note', 'tags'])
      customs.value = Object.entries(data)
        .filter(([key]) => !reserved.has(key))
        .reduce((acc, [k, v]) => {
          acc[k] = v as MetaValue
          return acc
        }, {} as MetaRecord)
    }
  }

  const meta = computed<MetaRecord>(() => ({
    ...customs.value,
    id: id.value,
    label: label.value,
    note: note.value,
    tags: [...tags.value],
  }))

  return {
    id,
    label,
    note,
    tags,
    meta,
    metaFunctions,
  }
}
