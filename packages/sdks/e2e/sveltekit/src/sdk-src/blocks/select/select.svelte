<script context="module" lang="ts">
  export interface FormSelectProps {
    options?: {
      name?: string;
      value: string;
    }[];
    attributes?: any;
    name?: string;
    value?: string;
    defaultValue?: string;
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

  export let attributes: FormSelectProps["attributes"];
  export let value: FormSelectProps["value"];
  export let defaultValue: FormSelectProps["defaultValue"];
  export let name: FormSelectProps["name"];
  export let options: FormSelectProps["options"];
</script>

<select
  {...filterAttrs(attributes, isNonEvent)}
  {value}
  key={isEditing() && defaultValue ? defaultValue : "default-key"}
  {defaultValue}
  {name}
  use:setAttrs={filterAttrs(attributes, isEvent)}
>
  {#each options as option}
    <option value={option.value}>{option.name || option.value}</option>
  {/each}
</select>