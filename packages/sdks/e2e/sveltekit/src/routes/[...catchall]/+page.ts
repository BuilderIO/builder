import { browser } from '$app/environment';
import NotLazyComponent from '../../components/NotLazyComponent.svelte';

/**
 * Vite/Rollup does not allow arbitrary paths to be dynamic imports.
 * https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars#limitations
 *
 * Imports must start with `./` or `../`, so we recommend placing all components in a specific directory,
 * and using that to lazy-load the components into Builder.
 */
const getLazyLoadedComponentImport = (path: string) =>
  import(`../../components/${path}.svelte`);

/**
 * This helper function guarantees that:
 * 1. On the server, the component is loaded eagerly.
 * 2. On the client, the component is loaded lazily.
 */
const getComponentLoader = async (path: string) => {
  if (browser) {
    return () => getLazyLoadedComponentImport(path);
  } else {
    const compImport = await getLazyLoadedComponentImport(path);
    return () => compImport;
  }
};

/** @type {import('./$types').PageLoad} */
export async function load({ data }) {
  const lazyImport = await getComponentLoader('LazyComponent');
  return {
    ...data,
    customComponents: [
      {
        name: 'LazyComponent',
        component: {
          load: lazyImport,
        },
      },
      {
        name: 'NotLazyComponent',
        component: NotLazyComponent,
      },
    ],
  };
}
