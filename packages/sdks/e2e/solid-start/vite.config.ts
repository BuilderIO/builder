import solid from 'solid-start/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [solid()],
  optimizeDeps: {
    // For some reason this is needed for the `dev` server to work
    exclude: ['nx', 'nx/cloud'],
  },
});
