/**
 * This Vite Config is unused at the moment because we want each component to be its own file with `use client;` at
 * the top, but we're not able to get it working.
 *
 * Vite strips them out, and `rollup-plugin-preserve-directives` is not working for us
 */

import { defineConfig, PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import preserveDirectives from 'rollup-plugin-preserve-directives';
import * as preserveDirectives2 from 'rollup-plugin-preserve-directives';
import MagicString from 'magic-string';

// https://github.com/Ephem/rollup-plugin-preserve-directives/issues/1
const fix: typeof preserveDirectives = (preserveDirectives as any).default;

/**
 * attempt at reimplementing `rollup-plugin-preserve-directives`
 */
const prependUseClientVitePlugin = (): PluginOption => ({
  name: 'prepend-use-client',
  renderChunk: {
    order: 'post',
    handler(code, chunk, options) {
      if (!options.preserveModules) {
        // if (!supressPreserveModulesWarning) {
        this.warn(
          'This plugin only works with the option preserveModules: true, if you want to add directives to the top of a bundled build, add it in a banner.'
        );
        // }

        return undefined;
      }

      let chunkHasDirectives: false | string[] = false;

      // Only do this for OutputChunks, not OutputAssets
      if ('modules' in chunk) {
        for (const moduleId of Object.keys(chunk.modules)) {
          const directives =
            this.getModuleInfo(moduleId)?.meta?.preserveDirectives;
          console.log('directives', directives);
          if (directives) {
            chunkHasDirectives = directives;
          }
        }

        if (chunkHasDirectives) {
          const directiveStrings = chunkHasDirectives
            .map((directive) => `'${directive}'`)
            .join(';\n');

          const s = new MagicString(code);
          s.prepend(`${directiveStrings};\n`);
          const srcMap = s.generateMap({ includeContent: true });

          return { code: s.toString(), map: srcMap };
        }
      }

      return null;
    },
  },
});

export default defineConfig(() => {
  return {
    build: {
      target: 'es2020',
      rollupOptions: {
        output: {
          preserveModules: true,
        },
        // plugins: [prependUseClientVitePlugin()],
      },
      lib: {
        entry: {
          sdk: './packages/react/src/index.ts',
          // For react v18, we need to use the new entry point that does not include any client components
          // This currently only includes the new `getContent` function which is used to fetch content on the server.
          server: './packages/react/src/functions/get-content/index.ts',
        },
        formats: ['es', 'cjs'],
        fileName: (format, entryName) =>
          `${entryName}.${format === 'es' ? 'mjs' : 'cjs'}`,
      },
      minify: false,
    },
    plugins: [react(), prependUseClientVitePlugin()],
  };
});
