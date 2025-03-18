<script lang="ts">
  import { Blocks, type BuilderBlock } from '@builder.io/sdk-svelte';

  export let column1: BuilderBlock[];
  export let column2: BuilderBlock[];
  export let builderBlock: BuilderBlock;
</script>

<!-- Left Column -->
<Blocks parent={builderBlock.id} path="column1" blocks={column1} />

<!-- Right Column -->
<Blocks parent={builderBlock.id} path="column2" blocks={column2} />
