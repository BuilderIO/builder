<script lang="ts">
  import Blocks from '../../components/blocks/blocks.svelte';
  import type { BuilderBlock } from '../../types/builder-block.js';
  import type { BuilderComponentsProp, BuilderDataProps } from '../../types/builder-props.js';

  type DropzoneProps = BuilderDataProps &
    BuilderComponentsProp & {
      name: string;
      attributes: any;
    };

  let { name, builderContext, builderComponents }: DropzoneProps = $props();

  const symbolId = $derived(builderContext.context?.symbolId as string | undefined);
</script>

<div style="pointer-events:auto;" {...!symbolId ? { 'builder-slot': name } : {}}>
  <Blocks
    parent={symbolId}
    path={`symbol.data.${name}`}
    blocks={builderContext.rootState?.[name] as BuilderBlock[]}
    context={builderContext}
    registeredComponents={builderComponents}
  />
</div>
