export default function builderioCssModule() {
  /**
   * Add the compiled Builder.io CSS to the Nuxt CSS array.
   */
  this.options.css.push('@builder.io/sdk-vue/css');
}
