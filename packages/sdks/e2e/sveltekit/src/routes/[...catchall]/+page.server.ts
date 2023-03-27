import { getProps } from '@builder.io/sdks-e2e-tests';
import { getCustomComponents } from '@builder.io/sdks-tests-custom-components/output/svelte/src/index';

export const load: import('./$types').PageServerLoad = (event) => {
  const props = {
    ...getProps(event.url.pathname),
    customComponents: getCustomComponents(event.url.pathname),
  };

  return { props };
};
