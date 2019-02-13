import {
  BuilderBlock,
  BuilderBlocks,
  BuilderBlockComponent /*BuilderElement */
} from '@builder.io/react'
// import { ElementType } from '@builder.io/sdk'
import React from 'react'
import Carousel from 'nuka-carousel'

interface BuilderElement {
  '@type': '@builder.io/sdk:Element'
  '@version'?: number
  id?: string
  tagName?: string
  layerName?: string
  class?: string
  children?: BuilderElement[]
  responsiveStyles?: {
    large?: Partial<CSSStyleDeclaration>
    medium?: Partial<CSSStyleDeclaration>
    small?: Partial<CSSStyleDeclaration>
  }
  component?: {
    name: string
    options?: any
  }
  bindings?: {
    [key: string]: string
  }
  actions?: {
    [key: string]: string
  }
  properties?: {
    [key: string]: string
  }
  repeat?: {
    collection: string
    itemName?: string
  }
}

const defaultElement: BuilderElement = {
  '@type': '@builder.io/sdk:Element',
  responsiveStyles: {
    large: {
      height: '400px',
      display: 'flex',
      flexDirection: 'column'
    }
  },
  children: [
    {
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
          text: 'I am a slide'
        }
      }
    }
  ]
}
const defaultButton: BuilderElement = {
  '@type': '@builder.io/sdk:Element',
  responsiveStyles: {
    large: {
      display: 'flex',
      paddingLeft: '10px',
      paddingRight: '10px',
      paddingTop: '10px',
      paddingBottom: '10px',
      color: 'white',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      flexDirection: 'column'
    }
  }
}

type BuilderBlockType = BuilderElement

interface CarouselProps {
  slides: Array<
    React.ReactNode | { content: BuilderBlockType[] } /* BuilderBlock <- export this type */
  >
  builderBlock: BuilderBlockType
  nextButton?: BuilderBlockType[]
  prevButton?: BuilderBlockType[]
  autoplay?: boolean
  autoplaySpeed?: number
  hideDots?: boolean
  initialHeight?: number
  useChildrenForSlides?: boolean
}

// TODO: change to slick grid
@BuilderBlock({
  name: 'Builder:Carousel',
  // TODO: default children
  canHaveChildren: true,
  inputs: [
    {
      name: 'slides',
      type: 'list',
      subFields: [
        {
          name: 'content',
          type: 'uiBlocks',
          hideFromUI: true,
          defaultValue: [defaultElement]
        }
      ],
      defaultValue: [
        {
          content: [defaultElement]
        },
        {
          content: [defaultElement]
        }
      ],
      showIf: (options: Map<string, any>) => !options.get('useChildrenForSlides'),
      onChange: (options: Map<string, any>) => {
        if (options.get('useChildrenForSlides') === true) {
          const slides = options.get('slides')
          if (slides && Array.isArray(slides)) {
            slides.length = 0
          }
        }
      }
    },
    {
      name: 'hideDots',
      helperText: 'Show pagination dots',
      type: 'boolean',
      defaultValue: false
    },
    {
      name: 'autoplay',
      helperText: 'Automatically rotate to the next slide every few seconds',
      type: 'boolean',
      defaultValue: false
    },
    {
      name: 'autoplaySpeed',
      type: 'number',
      defaultValue: 5,
      helperText:
        'If auto play is on, how many seconds to wait before automatically changing each slide',
      // TODO: showIf option
      showIf: (options: Map<string, any>) => options.get('autoPlay')
      // showIf: (options) => options.get('autoPlay')
    },
    // TODO: on add new duplicate the prior or expect use templates
    // onChange:
    {
      name: 'prevButton',
      type: 'uiBlocks',
      hideFromUI: true,
      defaultValue: [
        {
          ...defaultButton,
          component: {
            name: 'Text',
            options: {
              text: '〈'
            }
          }
        }
      ]
    },
    {
      name: 'nextButton',
      type: 'uiBlocks',
      hideFromUI: true,
      defaultValue: [
        {
          ...defaultButton,
          component: {
            name: 'Text',
            options: {
              text: '〉'
            }
          }
        }
      ]
    },
    {
      name: 'initialHeight',
      type: 'number',
      helperText: 'The initial height to give the carousel before the content loads',
      advanced: true,
      defaultValue: 400
    },
    {
      name: 'useChildrenForSlides',
      type: 'boolean',
      helperText:
        'Use child elements for each slide, instead of the array. Useful for dynamically repeating slides',
      advanced: true,
      defaultValue: false
    }
  ]
})
export class BuilderCarousel extends React.Component<CarouselProps> {
  render() {
    return (
      <Carousel
        wrapAround
        heightMode="max"
        // Allow user to edit
        initialSlideHeight={this.props.initialHeight || 400}
        pauseOnHover
        autoplay={this.props.autoplay}
        autoplayInterval={this.props.autoplaySpeed ? this.props.autoplaySpeed * 1000 : undefined}
        renderBottomCenterControls={this.props.hideDots ? () => null : undefined}
        renderCenterLeftControls={({ previousSlide }) => (
          <span style={{ cursor: 'pointer' }} onClick={previousSlide}>
            <BuilderBlocks
              parentElementId={this.props.builderBlock.id}
              dataPath="component.options.prevButton"
              blocks={this.props.prevButton}
            />
          </span>
        )}
        renderCenterRightControls={({ nextSlide }) => (
          <span style={{ cursor: 'pointer' }} onClick={nextSlide}>
            <BuilderBlocks
              parentElementId={this.props.builderBlock.id}
              dataPath="component.options.nextButton"
              blocks={this.props.nextButton}
            />
          </span>
        )}
      >
        {/* todo: children.forEach hmm insert block inside */}
        {this.props.useChildrenForSlides
          ? this.props.builderBlock &&
            this.props.builderBlock.children &&
            this.props.builderBlock.children.map((block: any, index: number) => (
              <BuilderBlockComponent
                key={block.id}
                block={block}
                index={index}
                child={true} /* TODO: fieldname? */
              />
            ))
          : this.props.slides.map((slide, index) => (
              // TODO: how make react compatible with plain react components
              // slides: <Foo><Bar> <- builder blocks if passed react nodes as blocks just forward them
              <BuilderBlocks
                key={index}
                parentElementId={this.props.builderBlock && this.props.builderBlock.id}
                dataPath={`component.options.slides.${index}.content`}
                child
                blocks={(slide as any).content || slide}
              />
            ))}
      </Carousel>
    )
  }
}
