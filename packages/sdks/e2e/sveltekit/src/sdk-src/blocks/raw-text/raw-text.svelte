<script context="module" lang="ts">
  export interface RawTextProps {
    attributes?: any;
    text?: string;
    // builderBlock?: any;
  }
</script>

<script lang="ts">
  export let attributes: RawTextProps["attributes"];
  export let text: RawTextProps["text"];
</script>

<span class={attributes?.class || attributes?.className}
  >{@html text || ""}</span
>