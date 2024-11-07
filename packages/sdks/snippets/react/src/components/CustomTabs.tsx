import {
  Blocks,
  BuilderBlock,
  RegisteredComponent,
} from '@builder.io/sdk-react';
import { useState } from 'react';

interface TabProps {
  tabList: { tabName: string; blocks: BuilderBlock[] }[];
  builderBlock: BuilderBlock;
}

export const CustomTabs = ({ tabList, builderBlock }: TabProps) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <>
      {tabList?.length > 0 && (
        <div className="tab-buttons">
          {tabList.map((tab, index) => (
            <button
              key={index}
              className={`tab-button ${activeTab === index ? 'active' : ''}`}
              onClick={() => setActiveTab(index)}
            >
              {tab.tabName}
            </button>
          ))}
        </div>
      )}

      <div className="tab-content">
        {tabList.map((tab, index) => (
          <div
            key={index}
            className="tab-panel"
            style={{ display: activeTab === index ? 'block' : 'none' }}
          >
            <Blocks
              parent={builderBlock?.id}
              path={`tabList.${index}.blocks`}
              blocks={tab.blocks}
            />
          </div>
        ))}
      </div>
    </>
  );
};

export const customTabsInfo: RegisteredComponent = {
  component: CustomTabs,
  name: 'TabFields',
  shouldReceiveBuilderProps: {
    builderBlock: true,
    builderComponents: true,
    builderContext: true,
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
          hideFromUI: true,
          defaultValue: [],
        },
      ],
    },
  ],
};
