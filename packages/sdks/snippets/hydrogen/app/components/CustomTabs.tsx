import {useState} from 'react';
import {
  Blocks,
  type BuilderBlock,
  type RegisteredComponent,
} from '@builder.io/sdk-react';

interface CustomTabsProps {
  tabList: Array<{
    tabName: string;
    blocks: BuilderBlock[];
  }>;
  builderBlock: BuilderBlock;
}

export function CustomTabs({tabList, builderBlock}: CustomTabsProps) {
  const [activeTab, setActiveTab] = useState(0);

  if (!tabList?.length) return null;

  return (
    <>
      {tabList.map((tab, i) => (
        <button
          key={i}
          onClick={() => setActiveTab(i)}
          className={activeTab === i ? 'active' : ''}
        >
          {tab.tabName}
        </button>
      ))}

      <Blocks
        parent={builderBlock.id}
        path={`tabList.${activeTab}.blocks`}
        blocks={tabList[activeTab].blocks}
      />
    </>
  );
}

export const customTabsInfo: RegisteredComponent = {
  name: 'TabFields',
  component: CustomTabs,
  shouldReceiveBuilderProps: {
    builderBlock: true,
  },
  inputs: [
    {
      name: 'tabList',
      type: 'list',
      subFields: [
        {name: 'tabName', type: 'string'},
        {name: 'blocks', type: 'uiBlocks', defaultValue: []},
      ],
    },
  ],
};
