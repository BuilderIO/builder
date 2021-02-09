import {
  Builder,
  BuilderAsyncRequestsContext,
  BuilderBlockComponent,
  BuilderBlocks,
  BuilderElement,
  BuilderStoreContext,
  stringToFunction,
} from '@builder.io/react';
import * as React from 'react';
import Masonry from 'react-masonry-component';

type BuilderBlockType = BuilderElement;

interface MasonryProps {
  tiles: Array<
    React.ReactNode | { content: BuilderBlockType[] } /* BuilderBlock <- export this type */
  >;
  builderBlock: BuilderBlockType;
  useChildrenForTiles?: boolean;
  gutterSize?: string;
  columnWidth?: string;
}

// TODO: column with, gutter, etc options
export class MasonryComponent extends React.Component<MasonryProps> {
  divRef: HTMLElement | null = null;
  masonryRef: React.Component<Masonry.MasonryPropTypes> | null = null;

  private _errors?: Error[];
  private _logs?: string[];

  state = {
    layoutComplete: false,
  };

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
              masonry: this.masonryRef,
            },
          })
        );
      }

      if (Builder.isEditing) {
        // mutation observer?
      }
    });
  }

  render() {
    let slides = this.props.tiles;

    // if (slides && !Builder.isBrowser) {
    //   slides = slides.slice(0, 1)
    // }

    const itemStyle: any = {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      width: this.props.columnWidth,
    };

    return (
      <div
        style={{
          opacity: Builder.isBrowser && this.state.layoutComplete ? 1 : 0,
          transition: 'opacity 0.2s',
        }}
      >
        <BuilderAsyncRequestsContext.Consumer>
          {value => {
            this._errors = value && value.errors;
            this._logs = value && value.logs;

            return (
              <BuilderStoreContext.Consumer>
                {state => (
                  <div ref={ref => (this.divRef = ref)} className="builder-masonry">
                    <Masonry
                      onLayoutComplete={() => {
                        if (!this.state.layoutComplete) {
                          this.setState({
                            ...this.state,
                            layoutComplete: true,
                          });
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
                          false,
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
                                const collectionPath = block.repeat.collection;
                                const collectionName = (collectionPath || '')
                                  .split(/\.\w+\(/)[0]
                                  .trim()
                                  .split('.')
                                  .pop();
                                const itemName =
                                  block.repeat.itemName ||
                                  (collectionName ? collectionName + 'Item' : 'item');

                                let array: any[] | void = stringToFunction(
                                  collectionPath,
                                  true,
                                  this._errors,
                                  this._logs
                                )(state.state);

                                if (Array.isArray(array)) {
                                  if (!Builder.isBrowser) {
                                    array = array.slice(0, 1);
                                  }

                                  return array.map((data, index) => {
                                    // TODO: Builder state produce the data
                                    const childState = {
                                      ...state.state,
                                      $index: index,
                                      $item: data,
                                      [itemName]: data,
                                    };

                                    return (
                                      <div className="masonry-item" style={itemStyle}>
                                        <BuilderStoreContext.Provider
                                          key={block.id}
                                          value={
                                            {
                                              ...state,
                                              state: childState,
                                            } as any
                                          }
                                        >
                                          <BuilderBlockComponent
                                            block={{
                                              ...block,
                                              repeat: null,
                                            }}
                                            index={index}
                                            child={true} /* TODO: fieldname? */
                                          />
                                        </BuilderStoreContext.Provider>
                                      </div>
                                    );
                                  });
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
                              );
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
            );
          }}
        </BuilderAsyncRequestsContext.Consumer>
      </div>
    );
  }
}
