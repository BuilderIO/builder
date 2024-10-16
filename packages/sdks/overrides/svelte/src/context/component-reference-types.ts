import type { SvelteComponent } from 'svelte';

export type ComponentReference =
  | {
      /**
       * Either:
       * - A dynamic import function pointing to the component.
       * Example: `() => import('../components/my-component.svelte')`
       * - A string representing the path to the component.
       * Example: `'../components/my-component.svelte'`
       */
      load: string | (() => Promise<{ default: typeof SvelteComponent<any> }>);
      /**
       * An optional fallback component to render while the dynamic component is loading.
       */
      fallback?: typeof SvelteComponent<any>;
    }
  | typeof SvelteComponent<any>;
