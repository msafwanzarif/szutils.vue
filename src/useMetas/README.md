# useMetas

`useMetas` is a Vue 3 composable for managing common metadata fields that can be reused across different entities. It includes support for:

- A unique `id` (auto-generated or manually set)
- Editable `label` and `note` fields
- Tag management (add, remove, clear, check, list)
- Custom key-value metadata
- Export/import to/from JSON
- A computed combined metadata object

---

## 🛠️ Usage

```ts
import { useMetas } from 'szutils.vue/useMetas'

const {
  id,
  label,
  note,
  tags,
  meta,
  metaFunctions
} = useMetas({ id: 'custom-id', label: 'Initial Label' })
```

---

## 🔑 Properties

| Key     | Type                      | Description                                |
|---------|---------------------------|--------------------------------------------|
| `id`    | `Ref<string>`             | Unique identifier (generated if omitted)   |
| `label` | `Ref<string>`             | Optional label                             |
| `note`  | `Ref<string>`             | Optional note                              |
| `tags`  | `Ref<string[]>`           | Array of string tags                       |
| `meta`  | `Computed<Record<string, MetaValue>>` | Combined metadata object (see below) |

---

## 🧩 Meta Functions (`metaFunctions`)

All metadata manipulation is done through the `metaFunctions` object.

### 🏷 Tags

```ts
metaFunctions.addTags('a', 'b')
metaFunctions.removeTags('a', 'b')
metaFunctions.clearTags()
metaFunctions.hasTag('a') // true / false
metaFunctions.getTags()   // string[]
```

### 📝 Label & Note

```ts
metaFunctions.setLabel('New Label')
metaFunctions.setNote('Some description')
```

### ⚙️ Custom Metadata

```ts
metaFunctions.setMeta('status', 'active')
metaFunctions.setMeta({
  level: 5,
  archived: false,
  scores: [1, 2, 3],
  notes: ['draft', 'review']
})

metaFunctions.getMeta('status') // 'active'
```

Allowed value types for customs:

```ts
type MetaValue = string | number | boolean | null | string[] | number[]
```

### 📦 Serialization

```ts
const data = metaFunctions.toJSON()
// => { ...customs, id, label, note, tags }

metaFunctions.fromJSON(data)
```

---

## 🧪 Demo

A Bootstrap-based demo is available in `Demo.vue`:
```ts
import Demo from './Demo.vue'
```

---

## 🔗 Meta Output Example

```ts
meta.value
// {
//   customKey1: 'value',
//   level: 5,
//   scores: [1, 2, 3],
//   id: 'abc123',
//   label: 'Example',
//   note: 'Some note',
//   tags: ['a', 'b']
// }
```

---

## 📁 File Structure

```
src/
└── useMetas/
    ├── index.ts      # composable logic
    ├── Demo.vue      # demo component using Bootstrap
    └── README.md     # this file
```

---

## ✅ Designed For

- General-purpose metadata tracking
- Integration with other composables
- Easy serialization for storage or syncing