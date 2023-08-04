import 'cross-fetch/dist/node-polyfill.js';

export { onBeforeRender };
import { getProps } from '@e2e/tests';
import { _processContentResult } from '@builder.io/sdk-vue/vue3';

async function onBeforeRender(pageContext) {
  const props = await getProps({
    _processContentResult,
    pathname: pageContext.urlOriginal,
  });

  return {
    pageContext: {
      pageProps: { props },
    },
  };
}
