import { For, Show, useStore, useTarget } from '@builder.io/mitosis';
import Blocks from '../../components/blocks/blocks.lite.jsx';
import type { BuilderBlock } from '../../types/builder-block.js';
import type { TabsProps } from './tabs.types.js';

export default function Tabs(props: TabsProps) {
  const state = useStore({
    activeTab: props.defaultActiveTab ? props.defaultActiveTab - 1 : 0,
    activeTabContent(active: number): BuilderBlock[] | undefined {
      return props.tabs && props.tabs[active].content;
    },
    onClick(index: number) {
      if (index === state.activeTab && props.collapsible) {
        state.activeTab = -1;
      } else {
        state.activeTab = index;
      }
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
            <span
              key={index}
              class={`builder-tab-wrap ${state.activeTab === index ? 'builder-tab-active' : ''}`}
              style={{
                ...(state.activeTab === index ? props.activeTabStyle : {}),
              }}
              onClick={() => state.onClick(index)}
            >
              <Blocks
                parent={props.builderBlock.id}
                path={`component.options.tabs.${index}.label`}
                blocks={tab.label}
                context={props.builderContext}
                registeredComponents={props.builderComponents}
                linkComponent={props.builderLinkComponent}
              />
            </span>
          )}
        </For>
      </div>
      {/* Display blocks for the active tab's content */}
      <Show when={state.activeTabContent(state.activeTab)}>
        <div>
          <Blocks
            parent={props.builderBlock.id}
            path={`component.options.tabs.${state.activeTab}.content`}
            blocks={state.activeTabContent(state.activeTab)}
            context={props.builderContext}
            registeredComponents={props.builderComponents}
            linkComponent={props.builderLinkComponent}
          />
        </div>
      </Show>
    </div>
  );
}
