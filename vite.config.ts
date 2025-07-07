import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'SzUtilsVue',
      fileName: (format) => `szutils.vue.${format}.js`,
      formats: ['es', 'umd']
    },
    rollupOptions: {
      external: ['vue', 'luxon'],
      output: {
        globals: {
          vue: 'Vue',
          luxon: 'luxon'
        }
      }
    }
  },
  plugins: [dts()]
});
