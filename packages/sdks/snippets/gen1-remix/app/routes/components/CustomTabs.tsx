import { BuilderBlocks, BuilderElement } from '@builder.io/react';

import { useState } from 'react';

type TabProps = {
  tabList: { tabName: string; blocks: React.ReactNode[] }[];
  builderBlock: BuilderElement;
};

export default function CustomTabs({ tabList, builderBlock }: TabProps) {
  const [activeTab, setActiveTab] = useState(0);

  console.log('tabList', tabList);
  console.log('builderBlock', builderBlock);
  if (!tabList?.length) return null;

  return (
    <>
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

      <BuilderBlocks
        parentElementId={builderBlock?.id}
        dataPath={`tabList.${activeTab}.blocks`}
        blocks={tabList[activeTab].blocks}
      />
    </>
  );
}
