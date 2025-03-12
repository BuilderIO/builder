<script lang="ts">
  import { Blocks } from '@builder.io/sdk-svelte';
  import type { BuilderBlock } from '@builder.io/sdk-svelte';

  interface TabItem {
    tabName: string;
    blocks: BuilderBlock[];
  }

  export let builderBlock: BuilderBlock;
  export let tabList: TabItem[] = [];

  let activeTab = 0;

  function handleTabClick(index: number) {
    activeTab = index;
  }
</script>

{#if tabList && tabList.length}
  <div class="dynamics-slots">
    {#each tabList as tab, index}
      <button
        class:active={activeTab === index}
        on:click={() => handleTabClick(index)}
      >
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
