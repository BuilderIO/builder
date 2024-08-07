import { SetStateAction, useState } from 'react';
import { Blocks } from '@builder.io/sdk-react';

type TabProps = {
  tabList: any[];
  builderBlock: {
    id: string | undefined;
  };
}
const Tabs = (props: TabProps) => {
  const [activeTab, setActiveTab] = useState(0);

  const selectTab = (tab: SetStateAction<number>) => {
    setActiveTab(tab);
  };

  console.log(props)

  return (
    <div>
      <h2>Custom Component with editable regions</h2>

      <div>
        <div>
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




export default Tabs;
