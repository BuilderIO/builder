// app/components/CustomTabs.tsx
/**
 * Common Builder.io Integration Issues & Solutions:
 *
 * 1. Hydration Errors:
 *    - Issue: React hydration errors occur when the server-rendered content doesn't match the client-side render
 *    - Solution: Always pass builderComponents to <Blocks/> component and set builderComponents: true in shouldReceiveBuilderProps
 *
 * 2. "Could not find a registered component named 'Text'" Error:
 *    - Issue: Builder can't find built-in components like 'Text', 'Image', etc.
 *    - Solution: Make sure to:
 *      a) Import and register all needed Builder components in your root layout/page
 *      b) Pass the registered components through the builderComponents prop
 *      c) Set shouldReceiveBuilderProps.builderComponents = true in component registration
 */

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
  builderComponents: RegisteredComponents; // Required to avoid hydration errors
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
        registeredComponents={builderComponents} // Required: Prevents hydration errors and "Component not found" errors
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
