<script context="module" lang="ts">
  interface Props {
    styles: string;
    id?: string;
  }
</script>

<script lang="ts">
  export let styles: Props["styles"];
  export let id: Props["id"];
</script>

<svelte:element this={"sty" + "le"} {id}>{@html styles}</svelte:element>