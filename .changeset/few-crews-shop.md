---
'@builder.io/sdk-svelte': patch
---

Feat: adds support for dynamically loading Svelte components using the `load` function and an optional `fallback` loader component.

To dynamically load your custom component, you can do the following:

```html
<script lang="ts">
  import LoadingSpinner from '../../components/LoadingSpinner.svelte'; // Fallback loader component
  import type { RegisteredComponent } from '@builder.io/sdk-svelte';

  const customComponents: RegisteredComponent[] = [
    {
      name: 'LazyComponent',
      component: {
        // dynamically loads the custom component only when it needs to be initialized
        load: () => import('../../components/LazyComponent.svelte'),
        fallback: LoadingSpinner,
      },
    },
  ];
</script>
```

Alternatively, you can pass the component directly, which will pre-bundle it as before:

```html
<script lang="ts">
  import type { RegisteredComponent } from '@builder.io/sdk-svelte';
  import NotLazyComponent from '../../components/NotLazyComponent.svelte';

  const customComponents: RegisteredComponent[] = [
    {
      name: 'NotLazyComponent',
      component: NotLazyComponent,
    },
  ];
</script>
```
