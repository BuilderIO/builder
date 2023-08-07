<script context="module" lang="ts">
  export interface RawTextProps {
    attributes?: any;
    text?: string;
  }
</script>

<script lang="ts">
  export let text: RawTextProps["text"];
  export let attributes: RawTextProps["attributes"];
</script>

<span class={attributes.class}>{@html text?.toString() || ""}</span>