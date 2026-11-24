import type { Component, SvelteComponent } from 'svelte';

// Runes components are functions (`Component`); Svelte 4-style components compiled in legacy
// mode are still accepted.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyComponent = Component<any> | typeof SvelteComponent<any>;

export type ComponentReference =
  | {
      /**
       * A dynamic import of the component, e.g. `() => import('./my-component.svelte')`.
       * On the server, pass a loader that resolves immediately to server-render it.
       */
      load: string | (() => Promise<{ default: AnyComponent }>);
      /** Rendered while the component loads. */
      fallback?: AnyComponent;
    }
  | AnyComponent;
