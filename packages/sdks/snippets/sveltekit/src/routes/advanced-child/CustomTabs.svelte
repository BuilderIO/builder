<script lang="ts">
  import { Blocks, type BuilderBlock } from '@builder.io/sdk-svelte';

  export let builderBlock: BuilderBlock;
  export let tabList: Array<{ tabName: string; blocks: BuilderBlock[] }>;

  let activeTab = 0;
</script>

{#if tabList.length}
  <div class="dynamics-slots">
    {#each tabList as tab, index}
      <button on:click={() => (activeTab = index)}>
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
