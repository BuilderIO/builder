// vite.config.js
import react from "file:///Users/samijaber/code/work/builder/packages/sdks/output/nextjs/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { defineConfig } from "file:///Users/samijaber/code/work/builder/packages/sdks/output/nextjs/node_modules/vite/dist/node/index.js";
import {
  viteOutputGenerator,
  getEvaluatorPathAlias,
  getSdkOutputPath
} from "file:///Users/samijaber/code/work/builder/packages/sdks/output-generation/index.js";
import dts from "file:///Users/samijaber/code/work/builder/packages/sdks/output/nextjs/node_modules/vite-plugin-dts/dist/index.mjs";
var USE_CLIENT_BUNDLE_NAME = "USE_CLIENT_BUNDLE";
var USE_SERVER_BUNDLE_NAME = "USE_SERVER_BUNDLE";
var typeIndexGenerator = () => ({
  name: "type-index-generator",
  enforce: "pre",
  generateBundle(options, bundle) {
    const isESM = options.format === "es";
    this.emitFile({
      type: "asset",
      fileName: `index.d.${isESM ? "mts" : "cts"}`,
      source: `export * from '../../types/index-${isESM ? "esm" : "cjs"}.d.ts';`
    });
  }
});
var vite_config_default = defineConfig({
  plugins: [
    viteOutputGenerator(),
    react(),
    typeIndexGenerator()
    // dts({
    //   compilerOptions: {
    //     paths: getEvaluatorPathAlias(),
    //     outFile: 'index.d.ts',
    //     outDir: getSdkOutputPath(),
    //     module: 'commonjs',
    //   },
    //   afterBuild: () => {
    //     const dir = getSdkOutputPath();
    //     /**
    //      * https://github.com/qmhc/vite-plugin-dts/issues/267#issuecomment-1786996676
    //      */
    //     // renameSync(`${dir}/index.d.ts`, `${dir}/index.d.cts`);
    //   },
    //   copyDtsFiles: true,
    // }),
    // dts({
    //   compilerOptions: {
    //     paths: getEvaluatorPathAlias(),
    //     outDir: getSdkOutputPath(),
    //   },
    //   afterBuild: () => {
    //     const dir = getSdkOutputPath();
    //     /**
    //      * https://github.com/qmhc/vite-plugin-dts/issues/267#issuecomment-1786996676
    //      */
    //     renameSync(`${dir}/index.d.ts`, `${dir}/index.d.mts`);
    //   },
    //   copyDtsFiles: true,
    // }),
  ],
  build: {
    emptyOutDir: true,
    lib: {
      entry: "./src/index.ts",
      formats: ["es", "cjs"],
      fileName: (format) => `index.${format === "es" ? "mjs" : "cjs"}`
    },
    rollupOptions: {
      external: [
        "next/navigation",
        "react",
        "react/jsx-runtime",
        "react-dom",
        "lru-cache"
      ],
      output: {
        manualChunks(id, { getModuleInfo }) {
          const code = getModuleInfo(id).code;
          if (code.match(/^['"]use client['"]/) || // context file has to be in the client bundle due to `createContext` not working in RSCs.
          id.endsWith("context.ts")) {
            return USE_CLIENT_BUNDLE_NAME;
          } else if (code.match(/^['"]use server['"]/)) {
            return USE_SERVER_BUNDLE_NAME;
          } else {
            return "bundle";
          }
        },
        banner(chunk) {
          if (chunk.name === USE_CLIENT_BUNDLE_NAME) {
            return "'use client';";
          } else if (chunk.name === USE_SERVER_BUNDLE_NAME) {
            return "'use server';";
          }
        },
        globals: {
          react: "react",
          "react-dom": "ReactDOM",
          "react/jsx-runtime": "react/jsx-runtime"
        }
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvc2FtaWphYmVyL2NvZGUvd29yay9idWlsZGVyL3BhY2thZ2VzL3Nka3Mvb3V0cHV0L25leHRqc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL3NhbWlqYWJlci9jb2RlL3dvcmsvYnVpbGRlci9wYWNrYWdlcy9zZGtzL291dHB1dC9uZXh0anMvdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL3NhbWlqYWJlci9jb2RlL3dvcmsvYnVpbGRlci9wYWNrYWdlcy9zZGtzL291dHB1dC9uZXh0anMvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyByZW5hbWVTeW5jIH0gZnJvbSAnbm9kZTpmcyc7XG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQge1xuICB2aXRlT3V0cHV0R2VuZXJhdG9yLFxuICBnZXRFdmFsdWF0b3JQYXRoQWxpYXMsXG4gIGdldFNka091dHB1dFBhdGgsXG59IGZyb20gJ0BidWlsZGVyLmlvL3Nka3Mvb3V0cHV0LWdlbmVyYXRpb24vaW5kZXguanMnO1xuaW1wb3J0IGR0cyBmcm9tICd2aXRlLXBsdWdpbi1kdHMnO1xuXG5jb25zdCBVU0VfQ0xJRU5UX0JVTkRMRV9OQU1FID0gJ1VTRV9DTElFTlRfQlVORExFJztcbmNvbnN0IFVTRV9TRVJWRVJfQlVORExFX05BTUUgPSAnVVNFX1NFUlZFUl9CVU5ETEUnO1xuXG4vKipcbiAqIEB0eXBlZGVmIHtpbXBvcnQoJ3ZpdGUnKS5QbHVnaW59IFZpdGVQbHVnaW5cbiAqL1xuXG4vKipcbiAqIFZpdGUgUGx1Z2luIHRoYXQgZ2VuZXJhdGVzIGBpbmRleC5kLmN0c2AgYW5kIGBpbmRleC5kLm10c2AgZmlsZXMgdGhhdCByZS1leHBvcnQgdGhlIGB0eXBlcy9pbmRleC5kLnRzYCBmaWxlLlxuICogQHJldHVybnMge1ZpdGVQbHVnaW59XG4gKi9cbmNvbnN0IHR5cGVJbmRleEdlbmVyYXRvciA9ICgpID0+ICh7XG4gIG5hbWU6ICd0eXBlLWluZGV4LWdlbmVyYXRvcicsXG4gIGVuZm9yY2U6ICdwcmUnLFxuICBnZW5lcmF0ZUJ1bmRsZShvcHRpb25zLCBidW5kbGUpIHtcbiAgICBjb25zdCBpc0VTTSA9IG9wdGlvbnMuZm9ybWF0ID09PSAnZXMnO1xuICAgIHRoaXMuZW1pdEZpbGUoe1xuICAgICAgdHlwZTogJ2Fzc2V0JyxcbiAgICAgIGZpbGVOYW1lOiBgaW5kZXguZC4ke2lzRVNNID8gJ210cycgOiAnY3RzJ31gLFxuICAgICAgc291cmNlOiBgZXhwb3J0ICogZnJvbSAnLi4vLi4vdHlwZXMvaW5kZXgtJHtcbiAgICAgICAgaXNFU00gPyAnZXNtJyA6ICdjanMnXG4gICAgICB9LmQudHMnO2AsXG4gICAgfSk7XG4gIH0sXG59KTtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW1xuICAgIHZpdGVPdXRwdXRHZW5lcmF0b3IoKSxcbiAgICByZWFjdCgpLFxuICAgIHR5cGVJbmRleEdlbmVyYXRvcigpLFxuICAgIC8vIGR0cyh7XG4gICAgLy8gICBjb21waWxlck9wdGlvbnM6IHtcbiAgICAvLyAgICAgcGF0aHM6IGdldEV2YWx1YXRvclBhdGhBbGlhcygpLFxuICAgIC8vICAgICBvdXRGaWxlOiAnaW5kZXguZC50cycsXG4gICAgLy8gICAgIG91dERpcjogZ2V0U2RrT3V0cHV0UGF0aCgpLFxuICAgIC8vICAgICBtb2R1bGU6ICdjb21tb25qcycsXG4gICAgLy8gICB9LFxuICAgIC8vICAgYWZ0ZXJCdWlsZDogKCkgPT4ge1xuICAgIC8vICAgICBjb25zdCBkaXIgPSBnZXRTZGtPdXRwdXRQYXRoKCk7XG5cbiAgICAvLyAgICAgLyoqXG4gICAgLy8gICAgICAqIGh0dHBzOi8vZ2l0aHViLmNvbS9xbWhjL3ZpdGUtcGx1Z2luLWR0cy9pc3N1ZXMvMjY3I2lzc3VlY29tbWVudC0xNzg2OTk2Njc2XG4gICAgLy8gICAgICAqL1xuICAgIC8vICAgICAvLyByZW5hbWVTeW5jKGAke2Rpcn0vaW5kZXguZC50c2AsIGAke2Rpcn0vaW5kZXguZC5jdHNgKTtcbiAgICAvLyAgIH0sXG4gICAgLy8gICBjb3B5RHRzRmlsZXM6IHRydWUsXG4gICAgLy8gfSksXG4gICAgLy8gZHRzKHtcbiAgICAvLyAgIGNvbXBpbGVyT3B0aW9uczoge1xuICAgIC8vICAgICBwYXRoczogZ2V0RXZhbHVhdG9yUGF0aEFsaWFzKCksXG4gICAgLy8gICAgIG91dERpcjogZ2V0U2RrT3V0cHV0UGF0aCgpLFxuICAgIC8vICAgfSxcbiAgICAvLyAgIGFmdGVyQnVpbGQ6ICgpID0+IHtcbiAgICAvLyAgICAgY29uc3QgZGlyID0gZ2V0U2RrT3V0cHV0UGF0aCgpO1xuXG4gICAgLy8gICAgIC8qKlxuICAgIC8vICAgICAgKiBodHRwczovL2dpdGh1Yi5jb20vcW1oYy92aXRlLXBsdWdpbi1kdHMvaXNzdWVzLzI2NyNpc3N1ZWNvbW1lbnQtMTc4Njk5NjY3NlxuICAgIC8vICAgICAgKi9cbiAgICAvLyAgICAgcmVuYW1lU3luYyhgJHtkaXJ9L2luZGV4LmQudHNgLCBgJHtkaXJ9L2luZGV4LmQubXRzYCk7XG4gICAgLy8gICB9LFxuICAgIC8vICAgY29weUR0c0ZpbGVzOiB0cnVlLFxuICAgIC8vIH0pLFxuICBdLFxuICBidWlsZDoge1xuICAgIGVtcHR5T3V0RGlyOiB0cnVlLFxuICAgIGxpYjoge1xuICAgICAgZW50cnk6ICcuL3NyYy9pbmRleC50cycsXG4gICAgICBmb3JtYXRzOiBbJ2VzJywgJ2NqcyddLFxuICAgICAgZmlsZU5hbWU6IChmb3JtYXQpID0+IGBpbmRleC4ke2Zvcm1hdCA9PT0gJ2VzJyA/ICdtanMnIDogJ2Nqcyd9YCxcbiAgICB9LFxuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIGV4dGVybmFsOiBbXG4gICAgICAgICduZXh0L25hdmlnYXRpb24nLFxuICAgICAgICAncmVhY3QnLFxuICAgICAgICAncmVhY3QvanN4LXJ1bnRpbWUnLFxuICAgICAgICAncmVhY3QtZG9tJyxcbiAgICAgICAgJ2xydS1jYWNoZScsXG4gICAgICBdLFxuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIG1hbnVhbENodW5rcyhpZCwgeyBnZXRNb2R1bGVJbmZvIH0pIHtcbiAgICAgICAgICBjb25zdCBjb2RlID0gZ2V0TW9kdWxlSW5mbyhpZCkuY29kZTtcblxuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgIGNvZGUubWF0Y2goL15bJ1wiXXVzZSBjbGllbnRbJ1wiXS8pIHx8XG4gICAgICAgICAgICAvLyBjb250ZXh0IGZpbGUgaGFzIHRvIGJlIGluIHRoZSBjbGllbnQgYnVuZGxlIGR1ZSB0byBgY3JlYXRlQ29udGV4dGAgbm90IHdvcmtpbmcgaW4gUlNDcy5cbiAgICAgICAgICAgIGlkLmVuZHNXaXRoKCdjb250ZXh0LnRzJylcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIHJldHVybiBVU0VfQ0xJRU5UX0JVTkRMRV9OQU1FO1xuICAgICAgICAgIH0gZWxzZSBpZiAoY29kZS5tYXRjaCgvXlsnXCJddXNlIHNlcnZlclsnXCJdLykpIHtcbiAgICAgICAgICAgIHJldHVybiBVU0VfU0VSVkVSX0JVTkRMRV9OQU1FO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gJ2J1bmRsZSc7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBiYW5uZXIoY2h1bmspIHtcbiAgICAgICAgICBpZiAoY2h1bmsubmFtZSA9PT0gVVNFX0NMSUVOVF9CVU5ETEVfTkFNRSkge1xuICAgICAgICAgICAgcmV0dXJuIFwiJ3VzZSBjbGllbnQnO1wiO1xuICAgICAgICAgIH0gZWxzZSBpZiAoY2h1bmsubmFtZSA9PT0gVVNFX1NFUlZFUl9CVU5ETEVfTkFNRSkge1xuICAgICAgICAgICAgcmV0dXJuIFwiJ3VzZSBzZXJ2ZXInO1wiO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZ2xvYmFsczoge1xuICAgICAgICAgIHJlYWN0OiAncmVhY3QnLFxuICAgICAgICAgICdyZWFjdC1kb20nOiAnUmVhY3RET00nLFxuICAgICAgICAgICdyZWFjdC9qc3gtcnVudGltZSc6ICdyZWFjdC9qc3gtcnVudGltZScsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFDQSxPQUFPLFdBQVc7QUFDbEIsU0FBUyxvQkFBb0I7QUFDN0I7QUFBQSxFQUNFO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxPQUNLO0FBQ1AsT0FBTyxTQUFTO0FBRWhCLElBQU0seUJBQXlCO0FBQy9CLElBQU0seUJBQXlCO0FBVS9CLElBQU0scUJBQXFCLE9BQU87QUFBQSxFQUNoQyxNQUFNO0FBQUEsRUFDTixTQUFTO0FBQUEsRUFDVCxlQUFlLFNBQVMsUUFBUTtBQUM5QixVQUFNLFFBQVEsUUFBUSxXQUFXO0FBQ2pDLFNBQUssU0FBUztBQUFBLE1BQ1osTUFBTTtBQUFBLE1BQ04sVUFBVSxXQUFXLFFBQVEsUUFBUSxLQUFLO0FBQUEsTUFDMUMsUUFBUSxvQ0FDTixRQUFRLFFBQVEsS0FDbEI7QUFBQSxJQUNGLENBQUM7QUFBQSxFQUNIO0FBQ0Y7QUFFQSxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxvQkFBb0I7QUFBQSxJQUNwQixNQUFNO0FBQUEsSUFDTixtQkFBbUI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQWlDckI7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLGFBQWE7QUFBQSxJQUNiLEtBQUs7QUFBQSxNQUNILE9BQU87QUFBQSxNQUNQLFNBQVMsQ0FBQyxNQUFNLEtBQUs7QUFBQSxNQUNyQixVQUFVLENBQUMsV0FBVyxTQUFTLFdBQVcsT0FBTyxRQUFRLEtBQUs7QUFBQSxJQUNoRTtBQUFBLElBQ0EsZUFBZTtBQUFBLE1BQ2IsVUFBVTtBQUFBLFFBQ1I7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDRjtBQUFBLE1BQ0EsUUFBUTtBQUFBLFFBQ04sYUFBYSxJQUFJLEVBQUUsY0FBYyxHQUFHO0FBQ2xDLGdCQUFNLE9BQU8sY0FBYyxFQUFFLEVBQUU7QUFFL0IsY0FDRSxLQUFLLE1BQU0scUJBQXFCO0FBQUEsVUFFaEMsR0FBRyxTQUFTLFlBQVksR0FDeEI7QUFDQSxtQkFBTztBQUFBLFVBQ1QsV0FBVyxLQUFLLE1BQU0scUJBQXFCLEdBQUc7QUFDNUMsbUJBQU87QUFBQSxVQUNULE9BQU87QUFDTCxtQkFBTztBQUFBLFVBQ1Q7QUFBQSxRQUNGO0FBQUEsUUFDQSxPQUFPLE9BQU87QUFDWixjQUFJLE1BQU0sU0FBUyx3QkFBd0I7QUFDekMsbUJBQU87QUFBQSxVQUNULFdBQVcsTUFBTSxTQUFTLHdCQUF3QjtBQUNoRCxtQkFBTztBQUFBLFVBQ1Q7QUFBQSxRQUNGO0FBQUEsUUFDQSxTQUFTO0FBQUEsVUFDUCxPQUFPO0FBQUEsVUFDUCxhQUFhO0FBQUEsVUFDYixxQkFBcUI7QUFBQSxRQUN2QjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
