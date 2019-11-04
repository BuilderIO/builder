import {
  BuilderBlock,
  BuilderBlocks,
  BuilderBlockComponent,
  BuilderElement,
  BuilderStoreContext,
  stringToFunction,
  BuilderAsyncRequestsContext,
  Builder,
  withBuilder
} from '@builder.io/react'
import React from 'react'
import Masonry from 'react-masonry-component'
import isArray from 'lodash-es/isArray'
import last from 'lodash-es/last'

const defaultTile: BuilderElement = {
  '@type': '@builder.io/sdk:Element',
  responsiveStyles: {
    large: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      position: 'relative',
      flexShrink: '0',
      boxSizing: 'border-box',
      marginTop: '20px',
      minHeight: '20px',
      minWidth: '20px',
      overflow: 'hidden',
      marginLeft: '20px'
    }
  },
  component: {
    name: 'Image',
    options: {
      image:
        'https://builder.io/api/v1/image/assets%2Fpwgjf0RoYWbdnJSbpBAjXNRMe9F2%2Ffb27a7c790324294af8be1c35fe30f4d?width=2000&height=1200',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      aspectRatio: 0.7041
    }
  }
}

const getRandomAspectTile = (): BuilderElement => ({
  ...defaultTile,
  component: {
    ...defaultTile.component!,
    options: {
      ...defaultTile.component!.options,
      // range from 0.5 to 2, rounded to 2 decimal points
      aspectRatio: Math.round((Math.random() * 1.5 + 0.5) * 100) / 100
    }
  }
})

type BuilderBlockType = BuilderElement

interface MasonryProps {
  tiles: Array<
    React.ReactNode | { content: BuilderBlockType[] } /* BuilderBlock <- export this type */
  >
  builderBlock: BuilderBlockType
  useChildrenForTiles?: boolean
  gutterSize?: string
  columnWidth?: string
}

// TODO: column with, gutter, etc options
export class BuilderMasonryComponent extends React.Component<MasonryProps> {
  divRef: HTMLElement | null = null
  masonryRef: React.Component<Masonry.MasonryPropTypes> | null = null

  private _errors?: Error[]
  private _logs?: string[]

  state = {
    layoutComplete: false
  }

  componentDidMount() {
    setTimeout(() => {
      if (this.divRef) {
        this.divRef.dispatchEvent(
          new CustomEvent('builder:masonry:load', {
            bubbles: true,
            cancelable: false,
            detail: {
              block: this.props.builderBlock,
              ref: this.divRef,
              masonry: this.masonryRef
            }
          })
        )
      }

      if (Builder.isEditing) {
        // mutation observer?
      }
    })
  }

  render() {
    let slides = this.props.tiles

    // if (slides && !Builder.isBrowser) {
    //   slides = slides.slice(0, 1)
    // }

    const itemStyle: any = {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      width: this.props.columnWidth
    }

    return (
      <div
        style={{
          opacity: Builder.isBrowser && this.state.layoutComplete ? 1 : 0,
          transition: 'opacity 0.2s'
        }}
      >
        <BuilderAsyncRequestsContext.Consumer>
          {value => {
            this._errors = value && value.errors
            this._logs = value && value.logs

            return (
              <BuilderStoreContext.Consumer>
                {state => (
                  <div ref={ref => (this.divRef = ref)} className="builder-masonry">
                    <Masonry
                      onLayoutComplete={() => {
                        if (!this.state.layoutComplete) {
                          this.setState({
                            ...this.state,
                            layoutComplete: true
                          })
                        }
                      }}
                      options={{
                        gutter: this.props.gutterSize,
                        // Maybe us this
                        fitWidth:
                          this.props.columnWidth && this.props.columnWidth.endsWith('%')
                            ? false
                            : true,
                        percentPosition:
                          // TODO: option to override this too
                          (this.props.columnWidth &&
                            (this.props.columnWidth.endsWith('%') ||
                              this.props.columnWidth.startsWith('.'))) ||
                          false
                      }}
                      ref={ref => (this.masonryRef = ref)}
                    >
                      {/* todo: children.forEach hmm insert block inside */}
                      {this.props.useChildrenForTiles
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
                                  if (!Builder.isBrowser) {
                                    array = array.slice(0, 1)
                                  }

                                  return array.map((data, index) => {
                                    // TODO: Builder state produce the data
                                    const childState = {
                                      ...state.state,
                                      $index: index,
                                      $item: data,
                                      [itemName]: data
                                    }

                                    return (
                                      <div className="masonry-item" style={itemStyle}>
                                        <BuilderStoreContext.Provider
                                          key={block.id}
                                          value={{ ...state, state: childState } as any}
                                        >
                                          <BuilderBlockComponent
                                            block={{
                                              ...block,
                                              repeat: null
                                            }}
                                            index={index}
                                            child={true} /* TODO: fieldname? */
                                          />
                                        </BuilderStoreContext.Provider>
                                      </div>
                                    )
                                  })
                                }
                              }
                              return (
                                <div style={itemStyle} className="masonry-item">
                                  <BuilderBlockComponent
                                    key={block.id}
                                    block={block}
                                    index={index}
                                    child={true} /* TODO: fieldname? */
                                  />
                                </div>
                              )
                            }
                          )
                        : this.props.tiles &&
                          this.props.tiles.map((tile, index) => (
                            // TODO: how make react compatible with plain react components
                            // tiles: <Foo><Bar> <- builder blocks if passed react nodes as blocks just forward them
                            <div style={itemStyle} className="masonry-item">
                              <BuilderBlocks
                                key={index}
                                parentElementId={
                                  this.props.builderBlock && this.props.builderBlock.id
                                }
                                dataPath={`component.options.tiles.${index}.content`}
                                child
                                blocks={(tile as any).content || tile}
                              />
                            </div>
                          ))}
                    </Masonry>
                  </div>
                )}
              </BuilderStoreContext.Consumer>
            )
          }}
        </BuilderAsyncRequestsContext.Consumer>
      </div>
    )
  }
}

export const BuilderMasonry = withBuilder(BuilderMasonryComponent, {
  name: 'Builder:Masonry',
  // TODO: default children
  image:
    'https://cdn.builder.io/api/v1/image/assets%2FBvYIl5jKN9QpChUB3PVzsTe2ZSI2%2F7ed6bd8129d148608ecec09300786d71?width=2000&height=1200',
  canHaveChildren: true,
  defaultStyles: {
    paddingLeft: '20px',
    paddingRight: '20px',
    paddingBottom: '20px'
  },
  defaultChildren: [
    getRandomAspectTile(),
    getRandomAspectTile(),
    getRandomAspectTile(),
    getRandomAspectTile(),
    getRandomAspectTile(),
    getRandomAspectTile(),
    getRandomAspectTile(),
    getRandomAspectTile(),
    getRandomAspectTile()
  ],
  inputs: [
    {
      name: 'columnWidth',
      // TODO: type: 'styleNumber'
      type: 'string',
      helperText: 'Width of each tile, as a CSS value. E.g. "200px" or "50%"',
      defaultValue: '200px'
    },
    {
      name: 'gutterSize',
      type: 'number',
      helperText: 'Horizontal space between tiles in pixels, e.g. "20" for 20 pixels wide',
      defaultValue: 0,
      advanced: true
    },
    {
      name: 'tiles',
      type: 'list',
      subFields: [
        {
          name: 'content',
          type: 'uiBlocks',
          hideFromUI: true,
          defaultValue: [defaultTile]
        }
      ],
      defaultValue: [],
      showIf: options => !options.get('useChildrenForTiles')
    },
    {
      name: 'useChildrenForTiles',
      type: 'boolean',
      helperText:
        'Use child elements for each slide, instead of the array. Useful for dynamically repeating tiles',
      advanced: true,
      defaultValue: true,
      onChange: (options: Map<string, any>) => {
        if (options.get('useChildrenForTiles') === true) {
          options.set('tiles', [])
        }
      }
    }
  ]
})
