import { defineNuxtModule } from '@nuxt/kit';

export default defineNuxtModule({
  setup(options, nuxt) {
    /**
     * Add the compiled Builder.io CSS to the Nuxt CSS array.
     */
    nuxt.options.css.push('@builder.io/sdk-vue/css');
    /**
     * This is because Vite tries to optimize the isolated-vm dependency while
     * running the dev server (first build), which is not needed and throws an error.
     * `isolated-vm` is a Node.js native module which should only be imported and used in Node.js environments.
     */
    if (nuxt.options.vite?.optimizeDeps?.exclude) {
      nuxt.options.vite.optimizeDeps.exclude.push(
        "@builder.io/sdk-vue/node/init"
      );
    } else {
      nuxt.options.vite = {
        ...nuxt.options.vite,
        optimizeDeps: {
          ...nuxt.options.vite?.optimizeDeps,
          exclude: ["@builder.io/sdk-vue/node/init"],
        },
      };
    }
  },
});
