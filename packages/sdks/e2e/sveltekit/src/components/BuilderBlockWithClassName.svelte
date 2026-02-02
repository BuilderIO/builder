<script lang="ts">
  import { Blocks } from '@builder.io/sdk-svelte';

  interface Props {
    builderBlock: any;
    content: any;
  }

  let { builderBlock, content }: Props = $props();
</script>

<div>
  <Blocks
    parent={builderBlock?.id}
    path="component.options.content"
    blocks={content}
    className="test-class-name"
  />
</div>
