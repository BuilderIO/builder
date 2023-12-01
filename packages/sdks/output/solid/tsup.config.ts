/**
 * This is reusing a public template, and making necessary modifications:
 * https://github.com/solidjs-community/solid-lib-starter
 */
import {
  esbuildOutputGenerator,
  getSdkEnv,
} from '@builder.io/sdks/output-generation/index.js';
import { defineConfig } from 'tsup';
import * as preset from 'tsup-preset-solid';

const preset_options: preset.PresetOptions = {
  // array or single object
  entries: [
    // default entry (index)
    {
      // entries with '.tsx' extension will have `solid` export condition generated
      entry: 'solid-index.tsx',
      // will generate a separate development entry
      dev_entry: true,
    },
  ],
  // Set to `true` to remove all `console.*` calls and `debugger` statements in prod builds
  drop_console: true,
  // Set to `true` to generate a CommonJS build alongside ESM
  // cjs: true,

  modify_esbuild_options: (options) => {
    options.platform = getSdkEnv() === 'node' ? 'node' : 'browser';

    return options;
  },
  esbuild_plugins: [
    esbuildOutputGenerator({
      pointTo: 'full-input',
      format: 'js',
    }),
  ],
};

export default defineConfig((config) => {
  const watching = !!config.watch;

  const parsed_options = preset.parsePresetOptions(preset_options, watching);

  return preset.generateTsupOptions(parsed_options);
});
