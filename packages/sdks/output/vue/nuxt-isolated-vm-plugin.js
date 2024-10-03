export default defineNuxtPlugin((nuxtApp) => {
  // initialize Isolated VM on node runtime
  if (process.server || import.meta.server) {
    async function importIsolatedVM() {
      const { initializeNodeRuntime } = await import(
        '@builder.io/sdk-vue/node/init'
      );
      initializeNodeRuntime();
    }
    importIsolatedVM();
  }
});
