// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  nitro: {
    rollupConfig: {
      external: ['@builder.io/sdk-vue'],
    },
  },
  vite: {
    build: {
      rollupOptions: {
        external: ['@builder.io/sdk-vue'],
      },
    },
  },
});
