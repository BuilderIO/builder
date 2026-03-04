<script lang="ts">
  import { Blocks, type BuilderBlock } from '@builder.io/sdk-svelte';

  interface Props {
    column1: BuilderBlock[];
    column2: BuilderBlock[];
    builderBlock: BuilderBlock;
  }

  let { column1, column2, builderBlock }: Props = $props();
</script>

<!-- Left Column -->
<Blocks parent={builderBlock.id} path="column1" blocks={column1} />

<!-- Right Column -->
<Blocks parent={builderBlock.id} path="column2" blocks={column2} />
