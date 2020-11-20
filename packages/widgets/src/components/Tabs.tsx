import * as React from 'react';
import { BuilderBlocks } from '@builder.io/react';

// TODO: manual typings and documentation for this with typedoc and in builder guides pages
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

export class TabsComponent extends React.Component<TabsProps, { activeTab: number }> {
  state = {
    activeTab: 0,
  };

  get activeTabSpec() {
    return this.props.tabs && this.props.tabs[this.state.activeTab];
  }

  componentWillMount() {
    if (this.props.defaultActiveTab) {
      this.activeTab = this.props.defaultActiveTab - 1;
    }
  }

  get activeTab() {
    return this.state.activeTab;
  }

  set activeTab(tab) {
    this.setState({
      ...this.state,
      activeTab: tab,
    });
  }

  render() {
    return (
      <React.Fragment>
        {/* TODO: tab overflow wrap option */}
        <span
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: this.props.tabHeaderLayout,
            overflow: 'auto',
            WebkitOverflowScrolling: 'touch',
          }}
          className="builder-tabs-wrap"
        >
          {this.props.tabs &&
            this.props.tabs.map((item, index) => (
              <span
                key={index}
                className={
                  'builder-tab-wrap ' + (this.activeTabSpec === item ? 'builder-tab-active' : '')
                }
                style={{
                  ...((this.activeTabSpec === item && this.props.activeTabStyle) || undefined),
                }}
                onClick={() => {
                  if (index === this.activeTab && this.props.collapsible) {
                    this.activeTab = -1;
                  } else {
                    this.activeTab = index;
                  }
                }}
              >
                <BuilderBlocks
                  // TODO: parent={this.props.builderBlock}
                  parentElementId={this.props.builderBlock.id}
                  // TODO: start with just "tabs." when bump react version
                  dataPath={`component.options.tabs.${this.state.activeTab}.label`}
                  blocks={item.label}
                />
              </span>
            ))}
        </span>

        {/* TODO: way to do react node or elements can be here  */}
        {this.activeTabSpec && (
          <BuilderBlocks
            parentElementId={this.props.builderBlock.id}
            dataPath={`component.options.tabs.${this.state.activeTab}.content`}
            blocks={this.activeTabSpec.content}
          />
        )}
      </React.Fragment>
    );
  }
}
