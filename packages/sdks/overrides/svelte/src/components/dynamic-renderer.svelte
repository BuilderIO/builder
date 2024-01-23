<script lang="ts">
  import { setAttrs } from '../blocks/helpers';

  /**
   * https://developer.mozilla.org/en-US/docs/Glossary/Empty_element
   */
  const EMPTY_HTML_ELEMENTS = new Set([
    'area',
    'base',
    'br',
    'col',
    'embed',
    'hr',
    'img',
    'input',
    'keygen',
    'link',
    'meta',
    'param',
    'source',
    'track',
    'wbr',
  ]);

  export let tagName: any;
  export let attributes: any;
  export let actionAttributes: any;
</script>

{#if EMPTY_HTML_ELEMENTS.has(tagName)}
  <svelte:element
    this={tagName}
    use:setAttrs={actionAttributes}
    {...attributes}
  />
{:else if typeof tagName === 'string'}
  <svelte:element
    this={tagName}
    use:setAttrs={actionAttributes}
    {...attributes}
  >
    <slot />
  </svelte:element>
{:else}
  <svelte:component this={tagName} {...attributes} {actionAttributes}>
    <slot />
  </svelte:component>
{/if}
