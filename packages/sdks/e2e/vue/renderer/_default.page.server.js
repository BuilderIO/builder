import 'cross-fetch/dist/node-polyfill.js';

import { renderToString } from '@vue/server-renderer';
import { dangerouslySkipEscape, escapeInject } from 'vite-plugin-ssr/server';
import { createApp } from './app';

export { passToClient, render };

// See https://vite-plugin-ssr.com/data-fetching
const passToClient = ['pageProps'];

async function render(pageContext) {
  const app = createApp(pageContext);
  const appHtml = await renderToString(app);

  return escapeInject`<!DOCTYPE html>
    <html>
      <body>
        <div id="app">${dangerouslySkipEscape(appHtml)}</div>
      </body>
    </html>`;
}
