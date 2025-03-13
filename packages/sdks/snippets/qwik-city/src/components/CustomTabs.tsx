import { component$, useSignal } from '@builder.io/qwik';
import {
  Blocks,
  type BuilderBlock,
  type RegisteredComponent,
} from '@builder.io/sdk-qwik';

interface TabProps {
  tabList: Array<{ tabName: string; blocks: BuilderBlock[] }>;
  builderBlock: BuilderBlock;
}

export const CustomTabs = component$((props: TabProps) => {
  const activeTab = useSignal(0);

  return (
    <div class="dynamic-slots">
      {props.tabList.map((tab, index) => (
        <button
          key={index}
          class={`tab-button ${activeTab.value === index ? 'active' : ''}`}
          onClick$={() => (activeTab.value = index)}
        >
          {tab.tabName}
        </button>
      ))}

      <Blocks
        parent={props.builderBlock?.id}
        path={`tabList.${activeTab.value}.blocks`}
        blocks={props.tabList[activeTab.value].blocks}
      />
    </div>
  );
});

export const customTabsInfo: RegisteredComponent = {
  component: CustomTabs,
  name: 'TabFields',
  shouldReceiveBuilderProps: {
    builderBlock: true,
  },
  inputs: [
    {
      name: 'tabList',
      type: 'list',
      subFields: [
        {
          name: 'tabName',
          type: 'string',
        },
        {
          name: 'blocks',
          type: 'uiBlocks',
          defaultValue: [],
        },
      ],
    },
  ],
};
