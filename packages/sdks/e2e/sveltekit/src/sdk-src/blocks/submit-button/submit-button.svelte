<script context="module" lang="ts">
  /**
   * This import is used by the Svelte SDK. Do not remove.
   */ // eslint-disable-next-line unused-imports/no-unused-imports, @typescript-eslint/no-unused-vars
  export interface ButtonProps {
    attributes?: any;
    text?: string;
  }
</script>

<script lang="ts">
  import { filterAttrs } from "../helpers.js";
  import { setAttrs } from "../helpers.js";

  export let attributes: ButtonProps["attributes"];
  export let text: ButtonProps["text"];
</script>

<button
  type="submit"
  {...filterAttrs(attributes, "on:", false)}
  use:setAttrs={filterAttrs(attributes, "on:", true)}
>
  {text}
</button>