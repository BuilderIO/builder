<script context="module" lang="ts">
  export interface ButtonProps {
    attributes?: any;
    text?: string;
    link?: string;
    openLinkInNewTab?: boolean;
  }
</script>

<script lang="ts">
  const isEvent = (attr) => attr.startsWith("on:");
  const isNonEvent = (attr) => !attr.startsWith("on:");
  const filterAttrs = (attrs = {}, filter) => {
    const validAttr = {};
    Object.keys(attrs).forEach((attr) => {
      if (filter(attr)) {
        validAttr[attr] = attrs[attr];
      }
    });
    return validAttr;
  };
  const setAttrs = (node, attrs = {}) => {
    const attrKeys = Object.keys(attrs);
    const setup = (attr) => node.addEventListener(attr.substr(3), attrs[attr]);
    const teardown = (attr) =>
      node.removeEventListener(attr.substr(3), attrs[attr]);
    attrKeys.map(setup);
    return {
      update(attrs = {}) {
        const attrKeys = Object.keys(attrs);
        attrKeys.map(teardown);
        attrKeys.map(setup);
      },
      destroy() {
        attrKeys.map(teardown);
      },
    };
  };

  export let attributes: ButtonProps["attributes"];
  export let text: ButtonProps["text"];
  export let link: ButtonProps["link"];
  export let openLinkInNewTab: ButtonProps["openLinkInNewTab"];
</script>

{#if link}
  <a
    role="button"
    {...filterAttrs(attributes, isNonEvent)}
    href={link}
    target={openLinkInNewTab ? "_blank" : undefined}
    use:setAttrs={filterAttrs(attributes, isEvent)}
  >
    {text}
  </a>
{:else}
  <button
    class={/** * We have to explicitly provide `class` so that Mitosis knows to merge it with `css`. */
    attributes.class + " button"}
    {...filterAttrs(attributes, isNonEvent)}
    use:setAttrs={filterAttrs(attributes, isEvent)}
  >
    {text}
  </button>
{/if}

<style>
  .button {
    all: unset;
  }
</style>