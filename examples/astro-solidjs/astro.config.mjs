import { defineConfig } from 'astro/config';

import solid from '@astrojs/solid-js';
import tailwind from '@astrojs/tailwind';
import turbolinks from '@astrojs/turbolinks';
import partytown from '@astrojs/partytown';

// https://astro.build/config
export default defineConfig({
  integrations: [solid(), tailwind(), turbolinks(), partytown()],
  vite: {
    build: {
      target: 'esnext',
      polyfillDynamicImport: false,
    },
  },
});
