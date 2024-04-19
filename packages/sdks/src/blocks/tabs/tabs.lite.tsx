import Blocks from '../../components/blocks';
import type { BuilderBlock } from '../../types/builder-block.js';
import { For, useStore } from '@builder.io/mitosis';

export interface TabsProps {
  tabs: {
    label: BuilderBlock[];
    content: BuilderBlock[];
  }[];
  builderBlock: any;
  defaultActiveTab?: number;
  collapsible?: boolean;
  tabHeaderLayout?: string;
  activeTabStyle?: any;
}

export default function Tabs(props: TabsProps) {
  const state = useStore({
    activeTab: props.defaultActiveTab || 0,
    get activeTabContent(): BuilderBlock[] | undefined {
      return props.tabs && props.tabs[state.activeTab].content;
    },
  });

  return (
    <div>
      <div
        class="builder-tabs-wrap"
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: props.tabHeaderLayout || 'flex-start',
          overflow: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <For each={props.tabs}>
          {(tab, index) => (
            <span
              key={index}
              class={`builder-tab-wrap ${
                state.activeTab === index ? 'builder-tab-active' : ''
              }`}
              style={
                state.activeTab === index ? props.activeTabStyle : undefined
              }
              onClick={() => {
                if (index === state.activeTab && props.collapsible) {
                  state.activeTab = -1;
                } else {
                  state.activeTab = index;
                }
              }}
            >
              <Blocks
                parent={props.builderBlock.id}
                path={`component.options.tabs.${index}.label`}
                blocks={tab.label}
              />
            </span>
          )}
        </For>
      </div>
      {/* Display blocks for the active tab's content */}
      {state.activeTabContent && (
        <div>
          <Blocks
            parent={props.builderBlock.id}
            path={`component.options.tabs.${state.activeTab}.content`}
            blocks={state.activeTabContent}
          />
        </div>
      )}
    </div>
  );
}
