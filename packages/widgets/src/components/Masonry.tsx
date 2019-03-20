import {
  BuilderBlock,
  BuilderBlocks,
  BuilderBlockComponent,
  BuilderElement,
  BuilderStoreContext,
  stringToFunction,
  BuilderAsyncRequestsContext,
  Builder
} from '@builder.io/react'
import React from 'react'
import Masonry from 'react-masonry-component'
import isArray from 'lodash-es/isArray'
import last from 'lodash-es/last'

const defaultTile: BuilderElement = {
  '@type': '@builder.io/sdk:Element',
  responsiveStyles: {
    large: {
      marginTop: '50px',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column'
    }
  },
  component: {
    name: 'Text',
    options: {
      text: 'I am a tile'
    }
  }
}
const defaultBigTile: BuilderElement = {
  '@type': '@builder.io/sdk:Element',
  responsiveStyles: {
    large: {
      marginTop: '50px',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column'
    }
  },
  component: {
    name: 'Text',
    options: {
      text: 'I am a bigger tile! '
    }
  }
}

type BuilderBlockType = BuilderElement

interface MasonryProps {
  tiles: Array<
    React.ReactNode | { content: BuilderBlockType[] } /* BuilderBlock <- export this type */
  >
  builderBlock: BuilderBlockType
  useChildrenForTiles?: boolean
}

// TODO: change to slick grid
@BuilderBlock({
  name: 'Builder:Masonry',
  // TODO: default children
  canHaveChildren: true,
  defaultStyles: {
    paddingLeft: '30px',
    paddingRight: '30px',
    paddingBottom: '30px'
  },
  inputs: [
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
      defaultValue: [
        {
          content: [defaultTile]
        },
        {
          content: [defaultBigTile]
        }
      ],
      showIf: (options: Map<string, any>) => !options.get('useChildrenForTiles')
    },
    {
      name: 'useChildrenForTiles',
      type: 'boolean',
      helperText:
        'Use child elements for each slide, instead of the array. Useful for dynamically repeating tiles',
      advanced: true,
      defaultValue: false,
      onChange: (options: Map<string, any>) => {
        if (options.get('useChildrenForTiles') === true) {
          options.set('tiles', [])
        }
      }
    }
  ]
})
export class BuilderMasonry extends React.Component<MasonryProps> {
  divRef: HTMLElement | null = null
  masonryRef: React.Component<Masonry.MasonryPropTypes> | null = null

  private _errors?: Error[]
  private _logs?: string[]

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

    if (slides && !Builder.isBrowser) {
      slides = slides.slice(0, 1)
    }

    return (
      <BuilderAsyncRequestsContext.Consumer>
        {value => {
          this._errors = value && value.errors
          this._logs = value && value.logs

          return (
            <BuilderStoreContext.Consumer>
              {state => (
                <div ref={ref => (this.divRef = ref)} className="builder-masonry">
                  <Masonry
                    ref={ref => this.masonryRef = ref}
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
                                  )
                                })
                              }
                            }
                            return (
                              <BuilderBlockComponent
                                key={block.id}
                                block={block}
                                index={index}
                                child={true} /* TODO: fieldname? */
                              />
                            )
                          }
                        )
                      : this.props.tiles &&
                        this.props.tiles.map((tile, index) => (
                          // TODO: how make react compatible with plain react components
                          // tiles: <Foo><Bar> <- builder blocks if passed react nodes as blocks just forward them
                          <BuilderBlocks
                            key={index}
                            parentElementId={this.props.builderBlock && this.props.builderBlock.id}
                            dataPath={`component.options.tiles.${index}.content`}
                            child
                            blocks={(tile as any).content || tile}
                          />
                        ))}
                  </Masonry>
                </div>
              )}
            </BuilderStoreContext.Consumer>
          )
        }}
      </BuilderAsyncRequestsContext.Consumer>
    )
  }
}
