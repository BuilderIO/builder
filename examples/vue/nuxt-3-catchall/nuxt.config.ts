// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  build: {
    /**
     * You need to transpile the Builder.io Vue SDK for it to work correctly.
     */
    transpile: ['@builder.io/sdk-vue'],
  },
});
