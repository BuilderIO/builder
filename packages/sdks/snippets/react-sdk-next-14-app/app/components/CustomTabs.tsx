'use client';
import type { BuilderBlock, RegisteredComponent } from '@builder.io/sdk-react';
import { Blocks } from '@builder.io/sdk-react';
import React, { useState } from 'react';

interface TabItem {
  tabName: string;
  blocks: BuilderBlock[];
}

interface CustomTabsProps {
  tabList?: TabItem[];
  builderBlock: BuilderBlock;
}

export function CustomTabs({ tabList, builderBlock }: CustomTabsProps) {
  const [activeTab, setActiveTab] = useState(0);

  if (!tabList?.length) return null;

  return (
    <>
      {tabList.map((tab, index) => (
        <button
          key={index}
          onClick={() => setActiveTab(index)}
          className={activeTab === index ? 'active' : ''}
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
