<script context="module" lang="ts">
  interface Props {
    scriptStr: string;
    id?: string;
  }
</script>

<script lang="ts">
  export let scriptStr: Props["scriptStr"];
  export let id: Props["id"];
</script>

<svelte:element this={"script"} {id}>{@html scriptStr}</svelte:element>