<script lang="ts">
  import { Blocks } from '@builder.io/sdk-svelte';

  export let builderBlock: any;
  export let content: any;
</script>

<div>
  <Blocks
    parent={builderBlock?.id}
    path="component.options.content"
    blocks={content}
    className="test-class-name"
  />
</div>
