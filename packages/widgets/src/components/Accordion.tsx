import {
  BuilderBlock,
  BuilderElement,
  BuilderBlocks,
  BuilderStoreContext,
  BuilderBlockComponent,
  stringToFunction,
  BuilderAsyncRequestsContext,
  withBuilder
} from '@builder.io/react'
import React from 'react'
import get from 'lodash-es/get'
import isArray from 'lodash-es/isArray'
import last from 'lodash-es/last'
// import { get, isArray, last } from 'lodash';

const defaultTitle: BuilderElement = {
  '@type': '@builder.io/sdk:Element',
  layerName: 'Accordion item title',
  responsiveStyles: {
    large: {
      marginTop: '10px',
      position: 'relative',
      display: 'flex',
      alignItems: 'stretch',
      flexDirection: 'column',
      paddingBottom: '10px'
    }
  },
  children: [
    {
      '@type': '@builder.io/sdk:Element',
      responsiveStyles: {
        large: {
          textAlign: 'left',
          display: 'flex',
          flexDirection: 'column'
        }
      },
      component: {
        name: 'Text',
        options: {
          text: 'I am an accordion title. Click me!'
        }
      }
    }
  ]
}

const defaultDetail: BuilderElement = {
  '@type': '@builder.io/sdk:Element',
  layerName: 'Accordion item detail',
  responsiveStyles: {
    large: {
      position: 'relative',
      display: 'flex',
      alignItems: 'stretch',
      flexDirection: 'column',
      marginTop: '10px',
      paddingBottom: '10px'
    }
  },
  children: [
    {
      '@type': '@builder.io/sdk:Element',
      responsiveStyles: {
        large: {
          paddingTop: '50px',
          textAlign: 'left',
          display: 'flex',
          flexDirection: 'column',
          paddingBottom: '50px'
        }
      },
      component: {
        name: 'Text',
        options: {
          text: 'I am an accordion detail, hello!'
        }
      }
    }
  ]
}

interface AccordionProps {
  items: {
    title: BuilderElement[]
    detail: BuilderElement[]
  }[]

  oneAtATime?: boolean
  grid?: boolean
  defaultOpen?: number
  animate?: boolean
  builderBlock?: BuilderElement
  // TODO: gridRowWidth
  gridRowWidth?: number
  useChildrenForItems?: boolean
}

// TODO: change to slick grid
class BuilderAccordionComponent extends React.Component<AccordionProps> {
  divRef: HTMLElement | null = null

  state = {
    open: [] as number[]
  }

  private _errors?: Error[]
  private _logs?: string[]

  componentDidMount() {
    setTimeout(() => {
      if (this.divRef) {
        this.divRef.dispatchEvent(
          new CustomEvent('builder:accordion:load', {
            bubbles: true,
            cancelable: false,
            detail: {
              ref: this
            }
          })
        )
      }
    })
  }

  getAccordionItem(
    titleBlocks: BuilderElement[],
    detailBlocks: BuilderElement[],
    index: number,
    openGridItemOrder: number | null,
    onlyOneAtATime: boolean,
    fromChildren = false
  ) {
    const open = this.state.open.indexOf(index) !== -1
    const { grid } = this.props

    return (
      // This will not work as expected with react 15
      // Did preact get the span replacmenet too?
      <React.Fragment key={index}>
        <div
          className={`builder-accordion-title builder-accordion-title-${open ? 'open' : 'closed'}`}
          style={{
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            ...(grid && {
              width: this.props.gridRowWidth,
              ...(typeof openGridItemOrder === 'number' && {
                order: index < openGridItemOrder ? index : index + 1
              })
            })
          }}
          data-index={index}
          onClick={() => {
            if (open) {
              this.setState({
                ...this.state,
                open: onlyOneAtATime ? [] : this.state.open.filter(item => item !== index)
              })
            } else {
              this.setState({
                ...this.state,
                open: onlyOneAtATime ? [index] : this.state.open.concat(index)
              })
            }
          }}
        >
          {fromChildren ? (
            titleBlocks.map((block, index) => (
              <BuilderBlockComponent
                key={index}
                block={{
                  ...block,
                  repeat: null
                }}
                index={index}
                child={true} /* TODO: fieldname? */
              />
            ))
          ) : (
            <BuilderBlocks blocks={titleBlocks} dataPath={`items.${index}.title`} />
          )}
        </div>
        {open && (
          <div
            className={`builder-accordion-detail builder-accordion-detail-${
              open ? 'open' : 'closed'
            }`}
            style={{
              order: typeof openGridItemOrder === 'number' ? openGridItemOrder : undefined,
              maxHeight: this.props.animate ? (open ? '100vh' : 0) : undefined,
              transition: this.props.animate ? 'max-height 0.5s' : undefined,
              ...(grid && {
                width: '100%'
              })
            }}
          >
            {open &&
              (fromChildren ? (
                detailBlocks.map((block, index) => (
                  <BuilderBlockComponent
                    key={index}
                    block={{
                      ...block,
                      repeat: null
                    }}
                    index={index}
                    child={true} /* TODO: fieldname? */
                  />
                ))
              ) : (
                <BuilderBlocks blocks={detailBlocks} dataPath={`items.${index}.detail`} />
              ))}
          </div>
        )}
      </React.Fragment>
    )
  }

  render() {
    const { grid, oneAtATime } = this.props

    const onlyOneAtATime = Boolean(grid || oneAtATime)

    const getOpenGridItemPosition = grid && this.state.open.length
    let openGridItemOrder: number | null = null
    if (getOpenGridItemPosition && this.divRef) {
      const openItemIndex = this.state.open[0]
      const openItem = this.divRef.querySelector(
        `.builder-accordion-title[data-index="${openItemIndex}"]`
      )

      let subjectItem = openItem
      openGridItemOrder = openItemIndex

      if (subjectItem) {
        let prevItemRect = subjectItem.getBoundingClientRect()

        while ((subjectItem = subjectItem && subjectItem.nextElementSibling)) {
          if (subjectItem) {
            if (subjectItem.classList.contains('builder-accordion-detail')) {
              continue
            }
            const subjectItemRect = subjectItem.getBoundingClientRect()
            if (subjectItemRect.left > prevItemRect.left) {
              const index = parseInt(subjectItem.getAttribute('data-index') || '', 10)
              if (!isNaN(index)) {
                prevItemRect = subjectItemRect
                openGridItemOrder = index
              }
            } else {
              break
            }
          }
        }
      }
    }

    if (typeof openGridItemOrder === 'number') {
      openGridItemOrder = openGridItemOrder + 1
    }

    return (
      <BuilderAsyncRequestsContext.Consumer>
        {value => {
          this._errors = value && value.errors
          this._logs = value && value.logs

          return (
            <BuilderStoreContext.Consumer>
              {state => (
                <div
                  ref={ref => (this.divRef = ref)}
                  className="builder-accordion"
                  style={{
                    display: 'flex',
                    alignItems: 'stretch',
                    flexDirection: 'column',
                    ...(grid && {
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      flexWrap: 'wrap'
                    })
                  }}
                >
                  {/* TODO: helper static method for builder blocks to do this stuff */}
                  {this.props.useChildrenForItems
                    ? this.props.builderBlock &&
                      this.props.builderBlock.children &&
                      this.props.builderBlock.children.map(
                        (block: BuilderElement, index: number) => {
                          if (block.repeat && block.repeat.collection) {
                            const collectionPath = block.repeat.collection
                            const collectionName = last(
                              (collectionPath || '')
                                .split(/\.\w+\(/)[0]
                                .trim()
                                .split('.')
                            )
                            const itemName =
                              block.repeat.itemName ||
                              (collectionName ? collectionName + 'Item' : 'item')

                            let array: any[] | void = stringToFunction(
                              collectionPath,
                              true,
                              this._errors,
                              this._logs
                            )(state.state)
                            if (isArray(array)) {
                              return array.map((data, index) => {
                                // TODO: Builder state produce the data
                                const childState = {
                                  ...state.state,
                                  $index: index,
                                  $item: data,
                                  [itemName]: data
                                }

                                return (
                                  <BuilderStoreContext.Provider
                                    key={block.id}
                                    value={{ ...state, state: childState } as any}
                                  >
                                    {this.getAccordionItem(
                                      block.children ? [block.children[0]] : [],
                                      block.children ? [block.children[1]] : [],
                                      index,
                                      openGridItemOrder,
                                      onlyOneAtATime,
                                      true
                                    )}
                                  </BuilderStoreContext.Provider>
                                )
                              })
                            }
                          }
                          return this.getAccordionItem(
                            block.children ? [block.children[0]] : [],
                            block.children ? [block.children[1]] : [],
                            index,
                            openGridItemOrder,
                            onlyOneAtATime,
                            true
                          )
                        }
                      )
                    : this.props.items &&
                      this.props.items.map((item, index) => {
                        return this.getAccordionItem(
                          item.title,
                          item.detail,
                          index,
                          openGridItemOrder,
                          onlyOneAtATime
                        )
                      })}
                </div>
              )}
            </BuilderStoreContext.Consumer>
          )
        }}
      </BuilderAsyncRequestsContext.Consumer>
    )
  }
}

export const BuilderAccordion = withBuilder(BuilderAccordionComponent, {
  name: 'Builder:Accordion',
  canHaveChildren: true,
  image:
    'https://cdn.builder.io/api/v1/image/assets%2FagZ9n5CUKRfbL9t6CaJOyVSK4Es2%2Ffab6c1fd3fe542408cbdec078bca7f35',
  defaultStyles: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch'
  },
  inputs: [
    {
      name: 'items',
      type: 'list',
      subFields: [
        {
          name: 'title',
          type: 'uiBlocks',
          hideFromUI: true,
          defaultValue: [defaultTitle]
        },
        {
          name: 'detail',
          type: 'uiBlocks',
          hideFromUI: true,
          defaultValue: [defaultDetail]
        }
      ],
      defaultValue: [
        {
          title: [defaultTitle],
          detail: [defaultDetail]
        },
        {
          title: [defaultTitle],
          detail: [defaultDetail]
        }
      ],
      showIf: options => !options.get('useChildrenForItems')
    },
    {
      name: 'oneAtATime',
      helperText: 'Only allow opening one at a time (collapse all others when new item openned)',
      type: 'boolean',
      defaultValue: false
    },
    {
      name: 'animate',
      helperText: 'Animate openning and closing',
      type: 'boolean',
      defaultValue: true
    },
    {
      name: 'grid',
      helperText: 'Display as a grid',
      type: 'boolean',
      defaultValue: false
    },
    {
      name: 'gridRowWidth',
      helperText: 'Display as a grid',
      type: 'string',
      showIf: options => options.get('grid'),
      defaultValue: '25%'
    },
    {
      name: 'useChildrenForItems',
      type: 'boolean',
      helperText:
        'Use child elements for each slide, instead of the array. Useful for dynamically repeating items',
      advanced: true,
      defaultValue: false,
      onChange: (options: Map<string, any>) => {
        if (options.get('useChildrenForItems') === true) {
          options.set('items', [])
        }
      }
    }
    // TODO: best way to do this? how multiple, comma? All with "*"? Have as a per item option?
    // {
    //   name: 'defaultOpen',
    //   helperText: 'Number of the accordion item to have open default (e.g. choose 1 for the first)',
    // }
  ]
})
