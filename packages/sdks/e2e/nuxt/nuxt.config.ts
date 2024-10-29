// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    [
      '@builder.io/sdk-vue/nuxt',
      {
        initializeNodeRuntime: true,
      },
    ],
  ],
  nitro: {
    imports: {
      /**
       * https://github.com/nuxt/nuxt/issues/18823#issuecomment-1812992935
       */
      exclude: [/.*.nuxt\/dist\/server.*/],
    },
  },
});
