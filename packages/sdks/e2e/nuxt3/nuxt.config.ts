// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  nitro: {
    imports: {
      exclude: [/.*.nuxt\/dist\/server.*/],
    },
  },
});
