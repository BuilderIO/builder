<script lang="ts">
  import type { Snippet } from 'svelte';
  import { styleString } from '../../helpers/style-string.js';
  import type { SectionProps } from './section.types.js';

  let { maxWidth, attributes, children }: SectionProps & { children?: Snippet } = $props();

  const style = $derived(
    styleString({
      width: '100%',
      alignSelf: 'stretch',
      flexGrow: 1,
      boxSizing: 'border-box',
      maxWidth: maxWidth || 1200,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      marginLeft: 'auto',
      marginRight: 'auto',
    })
  );
</script>

<section {style} {...attributes}>{@render children?.()}</section>
