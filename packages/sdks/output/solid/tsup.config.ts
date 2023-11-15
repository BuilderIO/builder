/**
 * This is reusing a public template, and making necessary modifications:
 * https://github.com/solidjs-community/solid-lib-starter
 */

import { defineConfig } from 'tsup';
import * as preset from 'tsup-preset-solid';
import { esbuildOutputGenerator } from '@builder.io/sdks/output-generation/index.js';

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

  esbuild_plugins: [
    esbuildOutputGenerator({
      pointTo: 'full-input',
      format: 'js',
    }),
  ],
};

const CI =
  process.env['CI'] === 'true' ||
  process.env['GITHUB_ACTIONS'] === 'true' ||
  process.env['CI'] === '"1"' ||
  process.env['GITHUB_ACTIONS'] === '"1"';

export default defineConfig((config) => {
  const watching = !!config.watch;

  const parsed_options = preset.parsePresetOptions(preset_options, watching);

  if (!watching && !CI) {
    const package_fields = preset.generatePackageExports(parsed_options);

    console.log(
      `package.json: \n\n${JSON.stringify(package_fields, null, 2)}\n\n`
    );

    // will update ./package.json with the correct export fields
    // preset.writePackageJson(package_fields);
  }

  return preset.generateTsupOptions(parsed_options);
});
