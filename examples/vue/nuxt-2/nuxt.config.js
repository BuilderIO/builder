export default {
  components: true,

  buildModules: ['@nuxt/components', '@builder.io/sdk-vue/nuxt'],

  build: {
    extend(config, ctx) {
      if (ctx.isDev) {
        config.devtool = ctx.isClient ? 'source-map' : 'inline-source-map'
      }
    },
    // This is needed because the package is an ESM module
    transpile: ['@builder.io/sdk-vue'],
  },

  server: { port: 3001 },
}
