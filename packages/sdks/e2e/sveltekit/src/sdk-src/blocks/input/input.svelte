<script context="module" lang="ts">
  /**
   * This import is used by the Svelte SDK. Do not remove.
   */ // eslint-disable-next-line unused-imports/no-unused-imports, @typescript-eslint/no-unused-vars
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
  import { filterAttrs } from "../helpers.js";
  import { setAttrs } from "../helpers.js";

  export let attributes: FormInputProps["attributes"];
  export let defaultValue: FormInputProps["defaultValue"];
  export let placeholder: FormInputProps["placeholder"];
  export let type: FormInputProps["type"];
  export let name: FormInputProps["name"];
  export let value: FormInputProps["value"];
  export let required: FormInputProps["required"];
</script>

<input
  {...filterAttrs(attributes, "on:", false)}
  key={isEditing() && defaultValue ? defaultValue : "default-key"}
  {placeholder}
  {type}
  {name}
  {value}
  {defaultValue}
  {required}
  use:setAttrs={filterAttrs(attributes, "on:", true)}
/>