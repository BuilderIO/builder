<script lang="ts">
  import Blocks from '../../components/blocks/blocks.svelte';
  import { styleString } from '../../helpers/style-string.js';
  import type { BuilderBlock } from '../../types/builder-block.js';
  import type { TabsProps } from './tabs.types.js';

  let {
    tabs,
    defaultActiveTab,
    collapsible,
    tabHeaderLayout,
    activeTabStyle,
    builderBlock,
    builderContext,
    builderComponents,
    builderLinkComponent,
  }: TabsProps = $props();

  // svelte-ignore state_referenced_locally
  let activeTab = $state(defaultActiveTab ? defaultActiveTab - 1 : 0);

  const activeTabContent = (active: number): BuilderBlock[] | undefined =>
    tabs && tabs[active]?.content;

  const getTabStyle = (index: number) => (index === activeTab ? activeTabStyle : {});

  function onClick(index: number) {
    if (index === activeTab && collapsible) {
      activeTab = -1;
    } else {
      activeTab = index;
    }
  }

  const wrapStyle = $derived(
    styleString({
      display: 'flex',
      flexDirection: 'row',
      justifyContent: tabHeaderLayout || 'flex-start',
      overflow: 'auto',
    })
  );
</script>

<div>
  <div class="builder-tabs-wrap" style={wrapStyle}>
    {#each tabs as tab, index (index)}
      <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
      <span
        class={`builder-tab-wrap ${activeTab === index ? 'builder-tab-active' : ''}`}
        style={styleString(getTabStyle(index))}
        onclick={() => onClick(index)}
      >
        <Blocks
          parent={builderBlock.id}
          path={`tabs.${index}.label`}
          blocks={tab.label}
          context={builderContext}
          registeredComponents={builderComponents}
          linkComponent={builderLinkComponent}
        />
      </span>
    {/each}
  </div>
  <!-- Display blocks for the active tab's content -->
  {#if activeTabContent(activeTab)}
    <div>
      <Blocks
        parent={builderBlock.id}
        path={`tabs.${activeTab}.content`}
        blocks={activeTabContent(activeTab)}
        context={builderContext}
        registeredComponents={builderComponents}
        linkComponent={builderLinkComponent}
      />
    </div>
  {/if}
</div>
