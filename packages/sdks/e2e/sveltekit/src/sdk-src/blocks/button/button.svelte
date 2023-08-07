<script context="module" lang="ts">
  /**
   * This import is used by the Svelte SDK. Do not remove.
   */ // eslint-disable-next-line unused-imports/no-unused-imports, @typescript-eslint/no-unused-vars
  export interface ButtonProps {
    attributes?: any;
    text?: string;
    link?: string;
    openLinkInNewTab?: boolean;
  }
</script>

<script lang="ts">
  import { filterAttrs } from "../helpers.js";
  import { setAttrs } from "../helpers.js";

  export let attributes: ButtonProps["attributes"];
  export let text: ButtonProps["text"];
  export let link: ButtonProps["link"];
  export let openLinkInNewTab: ButtonProps["openLinkInNewTab"];

  function mitosis_styling(node, vars) {
    Object.entries(vars || {}).forEach(([p, v]) => {
      if (p.startsWith("--")) {
        node.style.setProperty(p, v);
      } else {
        node.style[p] = v;
      }
    });
  }
</script>

{#if link}
  <a
    role="button"
    {...filterAttrs(attributes, "on:", false)}
    href={link}
    target={openLinkInNewTab ? "_blank" : undefined}
    use:setAttrs={filterAttrs(attributes, "on:", true)}
  >
    {text}
  </a>
{:else}
  <button
    use:mitosis_styling={attributes.style}
    {...filterAttrs(attributes, "on:", false)}
    class={attributes.class + " button"}
    use:setAttrs={filterAttrs(attributes, "on:", true)}
  >
    {text}
  </button>
{/if}

<style>
  .button {
    all: unset;
  }
</style>