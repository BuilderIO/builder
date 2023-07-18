import 'cross-fetch/dist/node-polyfill.js';

export { onBeforeRender };
import { getProps } from '@builder.io/sdks-e2e-tests';
import { processContentResult } from '@builder.io/sdk-vue/vue3';

async function onBeforeRender(pageContext) {
  const props = await getProps({
    processContentResult,
    pathname: pageContext.urlOriginal,
  });

  return {
    pageContext: {
      pageProps: { props },
    },
  };
}
