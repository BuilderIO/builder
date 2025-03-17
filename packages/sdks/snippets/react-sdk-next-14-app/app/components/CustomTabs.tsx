'use client';
import type { BuilderBlock, RegisteredComponent } from '@builder.io/sdk-react';
import { Blocks } from '@builder.io/sdk-react';
import React, { useEffect, useState } from 'react';

interface CustomTabsProps {
  tabList: {
    tabName: string;
    blocks: BuilderBlock[];
  }[];
  builderBlock: BuilderBlock;
}

export const CustomTabs = ({ tabList, builderBlock }: CustomTabsProps) => {
  const [activeTab, setActiveTab] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!tabList?.length) return null;

  return (
    <div className="custom-tabs">
      {tabList.map((tab, index) => (
        <button
          key={index}
          onClick={() => setActiveTab(index)}
          className={activeTab === index ? 'active' : ''}
        >
          {tab.tabName}
        </button>
      ))}
      {isClient && (
        <Blocks
          parent={builderBlock.id}
          path={`tabList.${activeTab}.blocks`}
          blocks={tabList[activeTab].blocks}
        />
      )}
    </div>
  );
};

export const customTabsInfo: RegisteredComponent = {
  name: 'TabFields',
  component: CustomTabs,
  shouldReceiveBuilderProps: { builderBlock: true },
  inputs: [
    {
      name: 'tabList',
      type: 'list',
      subFields: [
        { name: 'tabName', type: 'string' },
        { name: 'blocks', type: 'uiBlocks', defaultValue: [] },
      ],
    },
  ],
};
