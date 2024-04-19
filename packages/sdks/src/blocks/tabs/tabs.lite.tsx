import { For, useStore, useTarget } from '@builder.io/mitosis';
import Blocks from '../../components/blocks/index.js';
import type { BuilderBlock } from '../../types/builder-block.js';

export interface TabsProps {
  tabs: {
    label: BuilderBlock[];
    content: BuilderBlock[];
  }[];
  builderBlock: BuilderBlock;
  defaultActiveTab?: number;
  collapsible?: boolean;
  tabHeaderLayout?:
    | 'center'
    | 'flex-start'
    | 'flex-end'
    | 'space-between'
    | 'space-around'
    | 'space-evenly';
  activeTabStyle?: any;
}

export default function Tabs(props: TabsProps) {
  const state = useStore({
    Tag: useTarget({
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      reactNative: TouchableOpacity,
      default: 'span',
    }),
    activeTab: props.defaultActiveTab ? props.defaultActiveTab - 1 : 0,
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
          flexDirection: useTarget({
            reactNative: 'row' as 'row' | 'column' | 'column-reverse',
            default: 'row',
          }),
          justifyContent: props.tabHeaderLayout || 'flex-start',
          overflow: useTarget({
            reactNative: 'scroll' as 'scroll' | 'visible' | 'hidden',
            default: 'auto',
          }),
        }}
      >
        <For each={props.tabs}>
          {(tab, index) => (
            <state.Tag
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
            </state.Tag>
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
