<script lang="ts">
  import { Blocks, type BuilderBlock } from '@builder.io/sdk-svelte';

  export let leftContent: BuilderBlock[];
  export let rightContent: BuilderBlock[];
  export let builderBlock: BuilderBlock;
</script>

<!-- Left Column -->
<Blocks parent={builderBlock.id} path="leftContent" blocks={leftContent} />

<!-- Right Column -->
<Blocks parent={builderBlock.id} path="rightContent" blocks={rightContent} />
