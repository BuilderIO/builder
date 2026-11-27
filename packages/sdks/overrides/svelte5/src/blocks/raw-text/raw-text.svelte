<script lang="ts">
  interface RawTextProps {
    attributes?: any;
    text?: string;
  }

  let { attributes, text }: RawTextProps = $props();
</script>

<div class={attributes?.class}>{@html text?.toString() || ''}</div>
