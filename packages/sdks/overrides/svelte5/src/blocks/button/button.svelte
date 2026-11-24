<script lang="ts">
  import type { ButtonProps } from './button.types.js';

  let { attributes = {}, text, link, openLinkInNewTab, builderLinkComponent }: ButtonProps =
    $props();

  // `attributes` carries the block's props and its actions as event attributes (`onclick`).
  const attrs = $derived({
    ...attributes,
    class: `${link ? '' : 'builder-button'} ${attributes.class || ''}`,
    ...(link
      ? { href: link, target: openLinkInNewTab ? '_blank' : undefined, role: 'link' }
      : { role: 'button' }),
  });
  const Link = $derived(builderLinkComponent);
</script>

{#if !link}
  <button {...attrs}>{text}</button>
{:else if Link}
  <Link {...attrs}>{text}</Link>
{:else}
  <a {...attrs}>{text}</a>
{/if}
