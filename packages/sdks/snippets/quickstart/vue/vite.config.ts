import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import ssr from 'vite-plugin-ssr/plugin';

export default defineConfig({
  plugins: [vue(), ssr()],
  resolve: {
    // Vue 3 monorepo workaround:
    // https://github.com/vitejs/vite/issues/2446
    dedupe: ['vue'],
  },
});
