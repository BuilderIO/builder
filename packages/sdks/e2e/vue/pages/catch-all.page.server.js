import { _processContentResult } from '@builder.io/sdk-vue';
import { getProps } from '@e2e/tests';
import 'cross-fetch/dist/node-polyfill.js';

export { onBeforeRender };

/**
 *
 * @param {import('vite-plugin-ssr/types').PageContextBuiltIn} pageContext
 * @returns
 */
async function onBeforeRender(pageContext) {
  const props = await getProps({
    _processContentResult,
    pathname: pageContext.urlParsed.pathname,
  });

  return {
    pageContext: {
      pageProps: { props },
    },
  };
}
