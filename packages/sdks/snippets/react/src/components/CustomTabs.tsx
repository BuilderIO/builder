/**
 * https://www.builder.io/c/docs/custom-components-children
 * src/components/customTabs.tsx
 */

import { useState } from 'react';
import { Blocks, BuilderBlock } from '@builder.io/sdk-react';

type Tab = {
  tabName: string,
  children: BuilderBlock[]
}
type TabProps = {
  tabList: Tab[];
  builderBlock: {
    id: string | undefined;
  };
}

const CustomTabs = (props: TabProps) => {
  const [activeTab, setActiveTab] = useState(0);

  const selectTab = (tab: number) => {
    setActiveTab(tab);
  };

  return (
    <div>
      <h2>Custom Component with editable regions</h2>

      <div>
        <div>
          {/* 
            The tabList[] prop is an array that represents the tabs.
            Each tab has a tabName, which is displayed as the button label,
            and children, which are the content blocks rendered inside the tab.
          */}
          {props.tabList && props.tabList.map((tab, index) => (
            <button
              key={index}
              className={activeTab === index ? 'active' : ''}
              onClick={() => selectTab(index)}
            >
              {tab.tabName}
            </button>
          ))}
        </div>
      </div>

      {props.tabList && props.tabList.length !== 0 && (
        <div>
          {props.tabList.map((tab, index) => (
            <div key={index} style={{ display: activeTab === index ? 'block' : 'none' }}>
               {/** 
                The Blocks component from Builder.io dynamically renders the content inside the tab.
                - `parent` is the ID of the Builder's parent div, ensuring correct content rendering.
                - `path` defines where to find the content for this Tab
                - `blocks` contains the actual content to be displayed inside the tab.
              */}
              <Blocks
                parent={props.builderBlock?.id}
                path={`component.options.tabList.${index}.children`}
                blocks={tab.children}
              />
            </div>
          ))}

        </div>
      )}
    </div>
  );
};

export default CustomTabs;

