/**
 * @type {import('@nuxt/types').NuxtOptions}
 */
export default {
  components: true,

  buildModules: [
    '@nuxt/components',
    // Commented out since it currently does not work
    // '@builder.io/sdk-vue/nuxt'
  ],

  build: {
    extend(config, ctx) {
      if (ctx.isDev) {
        config.devtool = ctx.isClient ? 'source-map' : 'inline-source-map'
      }
    },
    // This is needed because the package is an ESM module
    transpile: ['@builder.io/sdk-vue'],
  },

  // We need to import the CSS for the SDK in the Nuxt Config here
  css: ['@builder.io/sdk-vue/vue2/css'],

  server: { port: 3001 },
}
