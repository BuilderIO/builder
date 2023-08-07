<script context="module" lang="ts">
  /**
   * This import is used by the Svelte SDK. Do not remove.
   */ // eslint-disable-next-line unused-imports/no-unused-imports, @typescript-eslint/no-unused-vars
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
  import { filterAttrs } from "../helpers.js";
  import { setAttrs } from "../helpers.js";

  export let attributes: FormSelectProps["attributes"];
  export let value: FormSelectProps["value"];
  export let defaultValue: FormSelectProps["defaultValue"];
  export let name: FormSelectProps["name"];
  export let options: FormSelectProps["options"];
</script>

<select
  {...filterAttrs(attributes, "on:", false)}
  {value}
  key={isEditing() && defaultValue ? defaultValue : "default-key"}
  {defaultValue}
  {name}
  use:setAttrs={filterAttrs(attributes, "on:", true)}
>
  {#each options as option}
    <option value={option.value}>{option.name || option.value}</option>
  {/each}
</select>