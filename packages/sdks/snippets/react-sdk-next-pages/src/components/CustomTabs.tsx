// components/CustomTabs.tsx
'use client';
import type {
  BuilderBlock,
  RegisteredComponent,
  RegisteredComponents,
} from '@builder.io/sdk-react';
import { Blocks } from '@builder.io/sdk-react';
import { useState } from 'react';

type CustomTabsProps = {
  tabList: {
    tabName: string;
    blocks: BuilderBlock[];
  }[];
  builderBlock: BuilderBlock;
  builderComponents: RegisteredComponents;
};

export function CustomTabs({
  tabList,
  builderBlock,
  builderComponents,
}: CustomTabsProps) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <>
      {tabList?.map((tab, index) => (
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
        registeredComponents={builderComponents} // Required: pass builderComponents to avoid hydration error and "Component not found" error
      />
    </>
  );
}

export const customTabsInfo: RegisteredComponent = {
  name: 'TabFields',
  component: CustomTabs,
  shouldReceiveBuilderProps: {
    builderBlock: true,
    builderComponents: true, // Required: Helps pass registered components to <Blocks/> component
  },
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
