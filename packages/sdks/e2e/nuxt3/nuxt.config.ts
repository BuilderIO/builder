// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  nitro: {
    imports: {
      /**
       * https://github.com/nuxt/nuxt/issues/18823#issuecomment-1812992935
       */
      exclude: [/.*.nuxt\/dist\/server.*/],
    },
  },
});
