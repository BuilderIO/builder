<script context="module" lang="ts">
  export interface FormInputProps {
    type?: string;
    attributes?: any;
    name?: string;
    value?: string;
    placeholder?: string;
    defaultValue?: string;
    required?: boolean;
  }
</script>

<script lang="ts">
  import { isEditing } from "../../functions/is-editing.js";

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

  export let attributes: FormInputProps["attributes"];
  export let defaultValue: FormInputProps["defaultValue"];
  export let placeholder: FormInputProps["placeholder"];
  export let type: FormInputProps["type"];
  export let name: FormInputProps["name"];
  export let value: FormInputProps["value"];
  export let required: FormInputProps["required"];
</script>

<input
  {...filterAttrs(attributes, isNonEvent)}
  key={isEditing() && defaultValue ? defaultValue : "default-key"}
  {placeholder}
  {type}
  {name}
  {value}
  {defaultValue}
  {required}
  use:setAttrs={filterAttrs(attributes, isEvent)}
/>