import { getProps } from '@builder.io/sdks-e2e-tests';

export const load: import('./$types').PageServerLoad = (event) => {
  const props = getProps(event.url.pathname);

  return { props };
};
