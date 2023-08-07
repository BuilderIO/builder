<script context="module" lang="ts">
  /**
   * This import is used by the Svelte SDK. Do not remove.
   */ // eslint-disable-next-line unused-imports/no-unused-imports, @typescript-eslint/no-unused-vars
  export interface TextareaProps {
    attributes?: any;
    name?: string;
    value?: string;
    defaultValue?: string;
    placeholder?: string;
  }
</script>

<script lang="ts">
  import { filterAttrs } from "../helpers.js";
  import { setAttrs } from "../helpers.js";

  export let attributes: TextareaProps["attributes"];
  export let placeholder: TextareaProps["placeholder"];
  export let name: TextareaProps["name"];
  export let value: TextareaProps["value"];
  export let defaultValue: TextareaProps["defaultValue"];
</script>

<textarea
  {...filterAttrs(attributes, "on:", false)}
  {placeholder}
  {name}
  {value}
  {defaultValue}
  use:setAttrs={filterAttrs(attributes, "on:", true)}
/>