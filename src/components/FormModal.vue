<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  show: boolean
  title: string
  submitText?: string
  submitClass?: string
  loading?: boolean
  error?: string
}

const props = withDefaults(defineProps<Props>(), {
  submitText: 'Submit',
  submitClass: 'btn-primary',
  loading: false,
  error: ''
})

const emit = defineEmits<{
  'update:show': [value: boolean]
  submit: []
  close: []
}>()

const handleClose = () => {
  emit('update:show', false)
  emit('close')
}

const handleSubmit = () => {
  emit('submit')
}
</script>

<template>
  <!-- Modal -->
  <div class="modal fade show" tabindex="-1" style="display: block;" v-if="show">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ title }}</h5>
          <button type="button" class="btn-close" @click="handleClose"></button>
        </div>
        <form @submit.prevent="handleSubmit">
          <div class="modal-body">
            <slot name="body"></slot>
            <div v-if="error" class="text-danger mt-2">{{ error }}</div>
          </div>
          <div class="modal-footer">
            <slot name="footer" :submit="handleSubmit" :close="handleClose" :loading="loading">
              <!-- Default footer content -->
              <button type="submit" :class="['btn', submitClass]" :disabled="loading">
                {{ submitText }}
              </button>
              <button type="button" class="btn btn-secondary" @click="handleClose">Cancel</button>
            </slot>
          </div>
        </form>
      </div>
    </div>
  </div>
  <div v-if="show" class="modal-backdrop fade show"></div>
</template>

<style scoped>
/* No custom styles needed, Bootstrap is used */
</style>
