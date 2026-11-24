<script lang="ts">
  import { Blocks } from '@builder.io/sdk-svelte5';

  let { builderBlock, content }: { builderBlock: any; content: any } = $props();
</script>

<div>
  <Blocks
    parent={builderBlock?.id}
    path="component.options.content"
    blocks={content}
    className="test-class-name"
  />
</div>
