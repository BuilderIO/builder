import type { SvelteComponent } from 'svelte';

export type ComponentReference =
  | {
      /**
       * A dynamic import function pointing to the component.
       * Example: `() => import('../components/my-component.svelte')`
       * @returns A Promise that resolves to the loaded component.
       */
      load: () => Promise<{ default: typeof SvelteComponent<any> }>;
      /**
       * An optional fallback component to render while the dynamic component is loading.
       */
      fallback?: typeof SvelteComponent<any>;
    }
  | typeof SvelteComponent<any>;
