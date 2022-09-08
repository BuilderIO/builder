import { join } from 'path';

export default function () {
  // Make sure components is enabled
  if (!this.nuxt.options.components) {
    throw new Error(
      'Please set `components: true` inside `nuxt.config` and ensure using `nuxt >= 2.13.0`'
    );
  }

  // TO-DO: this is probably no longer working, given that we now bundle w `vite` and no longer have these folders.
  this.nuxt.hook('components:dirs', (dirs) => {
    // Add ./components dir to the list
    dirs.push({
      path: join(__dirname, 'dist/vue-2/src/components'),
      prefix: 'builder',
    });
    // Add ./blocks dir to the list
    dirs.push({
      path: join(__dirname, 'dist/vue-2/src/blocks'),
      prefix: 'builder',
      pattern: '**/index.*',
    });
  });
}
