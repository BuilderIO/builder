import * as React from 'react';
import { Tabs as MuiTabs, Tab } from '@material-ui/core';
import { Builder, BuilderBlocks, BuilderElement } from '@builder.io/react';

export interface MaterialTabsProps {
  centered: boolean;
  fullWidth: boolean;
  includeDivider: boolean;
  tabs: {
    label: string;
    content: BuilderElement[];
  }[];
  builderBlock: any;
  autoRotateTabsInterval: number;
  useDisplay: boolean;
  scrollable: boolean;
}

const defaultElement = {
  '@type': '@builder.io/sdk:Element',
  responsiveStyles: {
    large: {
      height: '200px',
    },
  },
};

export class MaterialTabs extends React.Component<MaterialTabsProps, { activeTab: number }> {
  state = {
    activeTab: 0,
  };

  intervalTimer: any;

  changeTab(index: number) {
    this.setState({ activeTab: index });
  }

  get activeTabSpec() {
    return this.props.tabs && this.props.tabs[this.state.activeTab];
  }

  componentDidUpdate(prevProps: MaterialTabsProps) {
    if (prevProps.autoRotateTabsInterval !== this.props.autoRotateTabsInterval) {
      this.resetInterval();
    }
  }

  componentDidMount() {
    if (this.props.autoRotateTabsInterval) {
      this.resetInterval();
    }
  }

  resetInterval() {
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
    }
    if (this.props.autoRotateTabsInterval && typeof window !== 'undefined') {
      this.intervalTimer = setInterval(
        () => this.rotateTabs(),
        this.props.autoRotateTabsInterval * 1000
      );
    }
  }

  rotateTabs() {
    const tab = this.state.activeTab;
    let newTab = tab + 1;
    if (newTab >= this.props.tabs.length) {
      newTab = 0;
    }
    this.setState({
      activeTab: newTab,
    });
  }

  render() {
    return (
      <div className="builder-tabs" css={{ display: 'flex', flexDirection: 'column' }}>
        <MuiTabs
          className="tabs"
          scrollButtons="off"
          indicatorColor="primary"
          textColor="primary"
          value={this.state.activeTab}
          css={
            this.props.centered && this.props.scrollable
              ? {
                  margin: 'auto',
                }
              : undefined
          }
          onChange={(e, index) => {
            this.setState({ activeTab: index });
            this.resetInterval();
          }}
        >
          {this.props.tabs &&
            this.props.tabs.map((item, index) => <Tab key={index} label={item.label} />)}
        </MuiTabs>
        {/* {this.props.includeDivider && <Divider />} */}
        {this.props.useDisplay ? (
          <React.Fragment>
            {this.props.tabs.map((tab, index) => (
              <BuilderBlocks
                key={index}
                css={{
                  display: this.state.activeTab === index ? undefined : 'none',
                }}
                parentElementId={this.props.builderBlock && this.props.builderBlock.id}
                dataPath={`component.options.tabs.${index}.content`}
                child
                blocks={tab.content}
              />
            ))}
          </React.Fragment>
        ) : (
          <React.Fragment>
            {/* TODO: way to do react node or elements can be here  */}
            {this.activeTabSpec && (
              <BuilderBlocks
                parentElementId={this.props.builderBlock && this.props.builderBlock.id}
                dataPath={`component.options.tabs.${this.state.activeTab}.content`}
                child
                blocks={this.activeTabSpec.content}
              />
            )}
          </React.Fragment>
        )}
      </div>
    );
  }
}

Builder.registerComponent(MaterialTabs, {
  name: 'Material Tabs',
  inputs: [
    {
      name: 'tabs',
      type: 'list',
      subFields: [
        { name: 'label', type: 'text', required: true, defaultValue: 'A tab' },
        {
          name: 'content',
          type: 'uiBlocks',
          hideFromUI: true,
          defaultValue: [defaultElement],
        },
      ],
      defaultValue: [
        {
          label: 'A tab',
          content: [defaultElement],
        },
      ],
    },
    {
      name: 'centered',
      type: 'boolean',
      defaultValue: false,
    },
    {
      name: 'fullWidth',
      type: 'boolean',
      defaultValue: false,
    },
    {
      name: 'scrollable',
      type: 'boolean',
      defaultValue: true,
    },
    {
      name: 'includeDivider',
      type: 'boolean',
      defaultValue: false,
    },
    {
      name: 'useDisplay',
      type: 'boolean',
      defaultValue: false,
    },
    {
      name: 'autoRotateTabsInterval',
      type: 'number',
      defaultValue: 0,
      helperText: 'Auto rotate tabs interval (in seconds)',
    },
  ],
});
