import React from 'react'
import { BuilderBlocks, BuilderBlock, withBuilder } from '@builder.io/react'

// TODO: manual typings and documentation for this with typedoc and in builder guides pages
type ElementType = any

export interface TabsProps {
  tabs: {
    label: ElementType[]
    content: ElementType[]
  }[]
  builderBlock: any
  defaultActiveTab?: number
  collapsible?: boolean
  tabHeaderLayout?: string
  activeTabStyle?: any
}

const defaultTab = {
  '@type': '@builder.io/sdk:Element',
  responsiveStyles: {
    large: {
      paddingLeft: '20px',
      paddingRight: '20px',
      paddingTop: '10px',
      paddingBottom: '10px',
      minWidth: '100px',
      textAlign: 'center',
      // TODO: add to all
      display: 'flex',
      flexDirection: 'column',
      cursor: 'pointer',
      userSelect: 'none'
    }
  },
  component: {
    // Builder:text
    name: 'Text',
    options: {
      text: 'New tab'
    }
  }
}

const defaultElement = {
  '@type': '@builder.io/sdk:Element',
  responsiveStyles: {
    large: {
      height: '200px',
      display: 'flex',
      marginTop: '20px',
      flexDirection: 'column'
    }
  },
  component: {
    name: 'Text',
    options: {
      text: 'New tab content '
    }
  }
}

class TabsComponent extends React.Component<TabsProps, { activeTab: number }> {
  state = {
    activeTab: 0
  }

  get activeTabSpec() {
    return this.props.tabs && this.props.tabs[this.state.activeTab]
  }

  componentWillMount() {
    if (this.props.defaultActiveTab) {
      this.activeTab = this.props.defaultActiveTab - 1
    }
  }

  get activeTab() {
    return this.state.activeTab
  }

  set activeTab(tab) {
    this.setState({
      ...this.state,
      activeTab: tab
    })
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
            WebkitOverflowScrolling: 'touch'
          }}
          className="builder-tabs-wrap"
        >
          {this.props.tabs &&
            this.props.tabs.map((item, index) => (
              <span
                key={index}
                className={
                  'builder-tab-wrap ' +
                  (this.activeTabSpec === item ? 'builder-tab-active' : '')
                }
                style={{
                  ...((this.activeTabSpec === item &&
                    this.props.activeTabStyle) ||
                    undefined)
                }}
                onClick={() => {
                  if (index === this.activeTab && this.props.collapsible) {
                    this.activeTab = -1
                  } else {
                    this.activeTab = index
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
    )
  }
}

export const Tabs = withBuilder(TabsComponent, {
  name: 'Builder: Tabs',
  inputs: [
    {
      name: 'tabs',
      type: 'list',
      subFields: [
        {
          name: 'label',
          type: 'uiBlocks',
          hideFromUI: true,
          defaultValue: [defaultTab]
        },
        {
          name: 'content',
          type: 'uiBlocks',
          hideFromUI: true,
          defaultValue: [defaultElement]
        }
      ],
      defaultValue: [
        {
          label: [
            {
              ...defaultTab,
              component: {
                name: 'Text',
                options: {
                  text: 'Tab 1'
                }
              }
            }
          ],
          content: [
            {
              ...defaultElement,
              component: {
                name: 'Text',
                options: {
                  text: 'Tab 1 content'
                }
              }
            }
          ]
        },
        {
          label: [
            {
              ...defaultTab,
              component: {
                name: 'Text',
                options: {
                  text: 'Tab 2'
                }
              }
            }
          ],
          content: [
            {
              ...defaultElement,
              component: {
                name: 'Text',
                options: {
                  text: 'Tab 2 content'
                }
              }
            }
          ]
        }
      ]
    },
    {
      name: 'activeTabStyle',
      type: 'uiStyle',
      helperText: 'CSS styles for the active tab',
      defaultValue: {
        backgroundColor: 'rgba(0, 0, 0, 0.1)'
      }
    },
    {
      name: 'defaultActiveTab',
      type: 'number',
      helperText:
        'Deafult tab to open to. Set to "1" for the first tab, "2" for the second, or choose "0" for none',
      defaultValue: 1,
      advanced: true
    },
    {
      name: 'collapsible',
      type: 'boolean',
      helperText: 'If on, clicking an open tab closes it so no tabs are active',
      defaultValue: false,
      advanced: true
    },
    {
      name: 'tabHeaderLayout',
      type: 'enum',
      helperText: 'Change the layout of the tab headers (uses justify-content)',
      defaultValue: 'flex-start',
      enum: [
        { label: 'Center', value: 'center' },
        { label: 'Space between', value: 'space-between' },
        { label: 'Space around', value: 'space-around' },
        { label: 'Left', value: 'flex-start' },
        { label: 'Right', value: 'flex-end' }
      ]
    }
  ]
})
