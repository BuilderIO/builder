import * as React from 'react';
import MuiTabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
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

export class MaterialTabs extends React.Component<
  MaterialTabsProps,
  { activeTab: number }
> {
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
    if (
      prevProps.autoRotateTabsInterval !== this.props.autoRotateTabsInterval
    ) {
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
        this.props.autoRotateTabsInterval * 1000,
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
      <div
        className="builder-tabs"
        css={{ display: 'flex', flexDirection: 'column' }}
      >
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
            this.props.tabs.map((item, index) => (
              <Tab key={index} label={item.label} />
            ))}
        </MuiTabs>
        {/* {this.props.includeDivider && <Divider />} */}
        {this.props.useDisplay ? (
          <>
            {this.props.tabs.map((tab, index) => (
              <BuilderBlocks
                key={index}
                css={{
                  display: this.state.activeTab === index ? undefined : 'none',
                }}
                parentElementId={
                  this.props.builderBlock && this.props.builderBlock.id
                }
                dataPath={`component.options.tabs.${index}.content`}
                child
                blocks={tab.content}
              />
            ))}
          </>
        ) : (
          <>
            {/* TODO: way to do react node or elements can be here  */}
            {this.activeTabSpec && (
              <BuilderBlocks
                parentElementId={
                  this.props.builderBlock && this.props.builderBlock.id
                }
                dataPath={`component.options.tabs.${this.state.activeTab}.content`}
                child
                blocks={this.activeTabSpec.content}
              />
            )}
          </>
        )}
      </div>
    );
  }
}
