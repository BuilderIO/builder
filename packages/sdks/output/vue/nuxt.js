import { defineNuxtModule } from '@nuxt/kit';

export default defineNuxtModule({
  setup(options, nuxt) {
    /**
     * Add the compiled Builder.io CSS to the Nuxt CSS array.
     */
    nuxt.options.css.push('@builder.io/sdk-vue/css');
  },
});
