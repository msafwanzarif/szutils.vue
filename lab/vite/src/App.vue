<template>
  <div>
    <nav class="navbar navbar-expand-lg navbar-light bg-light px-5">
      <a class="navbar-brand" href="#">MyApp</a>
      <div class="dropdown">
        <ul class="navbar-nav mr-auto">
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              Functions
            </a>
            <div class="dropdown-menu" aria-labelledby="navbarDropdown">
              <a v-for="(label, key) in pageMap" class="dropdown-item" href="#" @click.prevent="setPage(key)">{{ label }}</a>
            </div>
          </li>
        </ul>
      </div>
    </nav>

    <div class="container mt-4">
      <component v-if="currentComponent" :is="currentComponent" />
      <div v-else >Welcome to Demo </div>
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent,markRaw } from 'vue'

export default {
  name: 'App',
  data() {
    return {
      currentComponent: null,
      pageMap: {
        useDuration: 'UseDuration',
        useTimeTracker: 'UseTimeTracker',
        useHabitTracker: 'UseHabitTracker',
      }
    }
  },
  mounted() {
    //this.setPage('HomePage') // default page
  },
  methods: {
    setPage(pageName) {
      if(!pageName) return;
      this.currentComponent = markRaw(defineAsyncComponent(() =>
        import(`../../../src/${pageName}/Demo.vue`)
      ))
    }
  }
}
</script>
