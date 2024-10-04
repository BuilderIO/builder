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
import Slider, { ResponsiveObject, Settings } from 'react-slick';

type BuilderBlockType = BuilderElement;

interface CarouselProps {
  slides: Array<
    React.ReactNode | { content: BuilderBlockType[] } /* BuilderBlock <- export this type */
  >;
  builderBlock: BuilderBlockType;
  nextButton?: BuilderBlockType[];
  prevButton?: BuilderBlockType[];
  autoplay?: boolean;
  autoplaySpeed?: number;
  hideDots?: boolean;
  useChildrenForSlides?: boolean;
  slickProps?: Settings;
  responsive?: ResponsiveObject[];
}

// TODO: change to slick grid
export class CarouselComponent extends React.Component<CarouselProps> {
  divRef = React.createRef<HTMLDivElement>();
  sliderRef = React.createRef<Slider>();

  private _errors?: Error[];
  private _logs?: string[];

  componentDidMount() {
    setTimeout(() => {
      this.divRef.current?.dispatchEvent(
        new CustomEvent('builder:carousel:load', {
          bubbles: true,
          cancelable: false,
          detail: {
            block: this.props.builderBlock,
            carousel: this.sliderRef.current,
          },
        })
      );
    });
  }

  render() {
    let slides = this.props.slides;

    if (slides && !Builder.isBrowser) {
      slides = slides.slice(0, 1);
    }

    return (
      <BuilderAsyncRequestsContext.Consumer>
        {value => {
          this._errors = value && value.errors;
          this._logs = value && value.logs;

          return (
            <BuilderStoreContext.Consumer>
              {state => (
                <div ref={this.divRef} className="builder-carousel">
                  {/* Strange encoding issue workaround... */}
                  {Builder.isServer ? (
                    <style
                      type="text/css"
                      dangerouslySetInnerHTML={{ __html: slickStyles }}
                    ></style>
                  ) : (
                    <style type="text/css">{slickStyles}</style>
                  )}
                  <Slider
                    responsive={this.props.responsive}
                    ref={this.sliderRef}
                    afterChange={slide => {
                      // TODO; callbacks
                      if (this.divRef) {
                        this.divRef.current?.dispatchEvent(
                          new CustomEvent('builder:carousel:change', {
                            bubbles: true,
                            cancelable: false,
                            detail: {
                              slide,
                              block: this.props.builderBlock,
                              carousel: this.sliderRef.current,
                            },
                          })
                        );
                      }
                    }}
                    autoplay={this.props.autoplay}
                    autoplaySpeed={
                      this.props.autoplaySpeed ? this.props.autoplaySpeed * 1000 : undefined
                    }
                    dots={!this.props.hideDots}
                    // TODO: on change emit event on element?
                    // renderBottomCenterControls={this.props.hideDots ? () => null : undefined}

                    // OOF!!
                    nextArrow={
                      <div>
                        <BuilderBlocks
                          parentElementId={this.props.builderBlock.id}
                          dataPath="component.options.prevButton"
                          blocks={this.props.prevButton}
                        />
                      </div>
                    }
                    // OOF!!
                    prevArrow={
                      <div>
                        <BuilderBlocks
                          parentElementId={this.props.builderBlock.id}
                          dataPath="component.options.nextButton"
                          blocks={this.props.nextButton}
                        />
                      </div>
                    }
                    {...this.props.slickProps}
                  >
                    {/* todo: children.forEach hmm insert block inside */}
                    {this.props.useChildrenForSlides
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
                                    [itemName]: data,
                                    $index: index,
                                    $item: data,
                                  };

                                  return (
                                    <BuilderStoreContext.Provider
                                      key={block.id}
                                      value={{ ...state, state: childState } as any}
                                    >
                                      <BuilderBlockComponent
                                        block={{
                                          ...block,
                                          repeat: null,
                                        }}
                                        index={index}
                                        child /* TODO: fieldname? */
                                      />
                                    </BuilderStoreContext.Provider>
                                  );
                                });
                              }
                            }
                            return (
                              <BuilderBlockComponent
                                key={block.id}
                                block={block}
                                index={index}
                                child /* TODO: fieldname? */
                              />
                            );
                          }
                        )
                      : this.props.slides &&
                        this.props.slides.map((slide, index) => (
                          // TODO: how make react compatible with plain react components
                          // slides: <Foo><Bar> <- builder blocks if passed react nodes as blocks just forward them
                          <React.Fragment key={index}>
                            <BuilderBlocks
                              parentElementId={this.props.builderBlock && this.props.builderBlock.id}
                              dataPath={`component.options.slides.${index}.content`}
                              child
                              blocks={(slide as any).content || slide}
                            />
                          </React.Fragment>
                        ))}
                  </Slider>
                </div>
              )}
            </BuilderStoreContext.Consumer>
          );
        }}
      </BuilderAsyncRequestsContext.Consumer>
    );
  }
}

const slickStyles = `@charset 'UTF-8';

.builder-carousel .slick-list,
.builder-carousel .slick-slider,
.builder-carousel .slick-track {
  position: relative;
  display: block
}

.builder-carousel .slick-loading .slick-slide,
.builder-carousel .slick-loading .slick-track {
  visibility: hidden
}

.builder-carousel .slick-slider {
  box-sizing: border-box;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  -webkit-touch-callout: none;
  -khtml-user-select: none;
  -ms-touch-action: pan-y;
  touch-action: pan-y;
  -webkit-tap-highlight-color: transparent
}

.builder-carousel .slick-list {
  overflow: hidden;
  margin: 0;
  padding: 0
}

.builder-carousel .slick-list:focus {
  outline: 0
}

.builder-carousel .slick-list.dragging {
  cursor: pointer;
  cursor: hand
}

.builder-carousel .slick-slider .slick-list,
.builder-carousel .slick-slider .slick-track {
  -webkit-transform: translate3d(0, 0, 0);
  -moz-transform: translate3d(0, 0, 0);
  -ms-transform: translate3d(0, 0, 0);
  -o-transform: translate3d(0, 0, 0);
  transform: translate3d(0, 0, 0)
}

.builder-carousel .slick-track {
  top: 0;
  left: 0
}

.builder-carousel .slick-track:after,
.builder-carousel .slick-track:before {
  display: table;
  content: ''
}

.builder-carousel .slick-track:after {
  clear: both
}

.builder-carousel .slick-slide {
  display: none;
  float: left;
  height: auto;
  min-height: 1px
}

.builder-carousel [dir=rtl] .slick-slide {
  float: right
}

.builder-carousel .slick-slide img {
  display: block
}

.builder-carousel .slick-slide.slick-loading img {
  display: none
}

.builder-carousel .slick-slide.dragging img {
  pointer-events: none
}

.builder-carousel .slick-initialized .slick-slide {
  display: block
}

.builder-carousel .slick-vertical .slick-slide {
  display: block;
  height: auto;
  border: 1px solid transparent
}

.builder-carousel .slick-arrow.slick-hidden {
  display: none
}

.builder-carousel .slick-dots,
.builder-carousel .slick-next,
.builder-carousel .slick-prev {
  position: absolute;
  display: block;
  padding: 0
}

.builder-carousel .slick-dots li button:before,
.builder-carousel .slick-next:before,
.builder-carousel .slick-prev:before {
  font-family: slick;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale
}

.builder-carousel .slick-loading .slick-list {
  background: url(ajax-loader.gif) center center no-repeat #fff
}

@font-face {
  font-display: swap;
  font-family: slick;
  font-weight: 400;
  font-style: normal;
  src: url(https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/fonts/slick.eot);
  src: local("slick"), url(https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/fonts/slick.eot?#iefix) format('embedded-opentype'), url(https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/fonts/slick.woff) format('woff'), url(https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/fonts/slick.ttf) format('truetype'), url(https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/fonts/slick.svg#slick) format('svg')
}

.builder-carousel .slick-next,
.builder-carousel .slick-prev {
  font-size: 0;
  line-height: 0;
  top: 50%;
  width: 20px;
  height: 20px;
  -webkit-transform: translate(0, -50%);
  -ms-transform: translate(0, -50%);
  transform: translate(0, -50%);
  cursor: pointer;
  color: transparent;
  border: none;
  outline: 0;
  background: 0 0
}

.builder-carousel .slick-next:focus,
.builder-carousel .slick-next:hover,
.builder-carousel .slick-prev:focus,
.builder-carousel .slick-prev:hover {
  color: transparent;
  outline: 0;
  background: 0 0
}

.builder-carousel .slick-next:focus:before,
.builder-carousel .slick-next:hover:before,
.builder-carousel .slick-prev:focus:before,
.builder-carousel .slick-prev:hover:before {
  opacity: 1
}

.builder-carousel .slick-next.slick-disabled:before,
.builder-carousel .slick-prev.slick-disabled:before {
  opacity: .25
}

.builder-carousel .slick-next:before,
.builder-carousel .slick-prev:before {
  font-size: 20px;
  line-height: 1;
  opacity: .75;
  color: #fff
}

.builder-carousel .slick-prev {
  left: -25px
}

.builder-carousel [dir=rtl] .slick-prev {
  right: -25px;
  left: auto
}

.builder-carousel .slick-prev:before {
  content: ''
}

.builder-carousel .slick-next:before,
.builder-carousel [dir=rtl] .slick-prev:before {
  content: ''
}

.builder-carousel .slick-next {
  right: -25px
}

.builder-carousel [dir=rtl] .slick-next {
  right: auto;
  left: -25px
}

.builder-carousel [dir=rtl] .slick-next:before {
  content: '•'
}

.builder-carousel .slick-dotted.slick-slider {
  margin-bottom: 30px
}

.builder-carousel .slick-dots {
  bottom: -25px;
  width: 100%;
  margin: 0;
  list-style: none;
  text-align: center
}

.builder-carousel .slick-dots li {
  position: relative;
  display: inline-block;
  width: 20px;
  height: 20px;
  margin: 0 5px;
  padding: 0;
  cursor: pointer
}

.builder-carousel .slick-dots li button {
  font-size: 0;
  line-height: 0;
  display: block;
  width: 20px;
  height: 20px;
  padding: 5px;
  cursor: pointer;
  color: transparent;
  border: 0;
  outline: 0;
  background: 0 0
}

.builder-carousel .slick-dots li button:focus,
.builder-carousel .slick-dots li button:hover {
  outline: 0
}

.builder-carousel .slick-dots li button:focus:before,
.builder-carousel .slick-dots li button:hover:before {
  opacity: 1
}

.builder-carousel .slick-dots li button:before {
  font-size: 6px;
  line-height: 20px;
  position: absolute;
  top: 0;
  left: 0;
  width: 20px;
  height: 20px;
  content: '•';
  text-align: center;
  opacity: .25;
  color: #000
}

.builder-carousel .slick-dots li.slick-active button:before {
  opacity: .75;
  color: #000
}

.builder-carousel img {
  pointer-events: none
}
`;
