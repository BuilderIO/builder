import RenderBlocks from '../../components/render-blocks.lite';
import { Show, For, useStore } from '@builder.io/mitosis';

type ElementType = any;

export interface TabsProps {
  tabs: {
    label: ElementType[];
    content: ElementType[];
  }[];
  builderBlock: any;
  defaultActiveTab?: number;
  collapsible?: boolean;
  tabHeaderLayout?: string;
  activeTabStyle?: any;
}

export default function Tabs(props: TabsProps) {
  const state = useStore({
    activeTab: 0,
  });

  return (
    <span
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: props.tabHeaderLayout,
        overflow: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}
      className="builder-tabs-wrap"
    >
      <Show when={props.tabs}>
        <For each={props.tabs}>
          {(item, index) => (
            <span
              key={index}
              className={
                'builder-tab-wrap ' +
                (props.tabs[state.activeTab] === item
                  ? 'builder-tab-active'
                  : '')
              }
              style={{
                ...((props.tabs[state.activeTab] === item &&
                  props.activeTabStyle) ||
                  undefined),
              }}
              onClick={() => {
                if (index === state.activeTab && props.collapsible) {
                  state.activeTab = -1;
                } else {
                  state.activeTab = index;
                }
              }}
            >
              <RenderBlocks
                parent={props.builderBlock.id}
                path={`component.options.tabs.${state.activeTab}.label`}
                blocks={item.label}
              />
            </span>
          )}
        </For>
      </Show>
      <Show when={props.tabs && props.tabs[state.activeTab] !== null}>
        <RenderBlocks
          parent={props.builderBlock.id}
          path={`component.options.tabs.${state.activeTab}.content`}
          blocks={props.tabs[state.activeTab].content}
        />
      </Show>
    </span>
  );
}
