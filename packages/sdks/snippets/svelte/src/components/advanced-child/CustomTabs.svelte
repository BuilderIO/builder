<script lang="ts">
  import { Blocks, type BuilderBlock } from '@builder.io/sdk-svelte';

  interface Props {
    builderBlock: BuilderBlock;
    tabList: Array<{ tabName: string; blocks: BuilderBlock[] }>;
  }

  let { builderBlock, tabList }: Props = $props();

  let activeTab = $state(0);
</script>

{#if tabList.length}
  <div class="dynamics-slots">
    {#each tabList as tab, index}
      <button onclick={() => (activeTab = index)}>
        {tab.tabName}
      </button>
    {/each}

    <Blocks
      blocks={tabList[activeTab].blocks}
      path={`tabList.${activeTab}.blocks`}
      parent={builderBlock.id}
    />
  </div>
{/if}
