<script context="module" lang="ts">
  export interface TextareaProps {
    attributes?: any;
    name?: string;
    value?: string;
    defaultValue?: string;
    placeholder?: string;
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

  export let attributes: TextareaProps["attributes"];
  export let placeholder: TextareaProps["placeholder"];
  export let name: TextareaProps["name"];
  export let value: TextareaProps["value"];
  export let defaultValue: TextareaProps["defaultValue"];
</script>

<textarea
  {...filterAttrs(attributes, isNonEvent)}
  {placeholder}
  {name}
  {value}
  {defaultValue}
  use:setAttrs={filterAttrs(attributes, isEvent)}
/>