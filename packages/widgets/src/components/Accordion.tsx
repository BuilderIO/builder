import { BuilderBlock, BuilderElement, BuilderBlocks } from '@builder.io/react';
import React from 'react';

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
      paddingBottom: '10px',
    },
  },
  children: [
    {
      '@type': '@builder.io/sdk:Element',
      responsiveStyles: {
        large: {
          textAlign: 'left',
          display: 'flex',
          flexDirection: 'column',
        },
      },
      component: {
        name: 'Text',
        options: {
          text: 'I am an accordion title. Click me!',
        },
      },
    },
  ],
};

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
      paddingBottom: '10px',
    },
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
          paddingBottom: '50px',
        },
      },
      component: {
        name: 'Text',
        options: {
          text: 'I am an accordion detail, hello!',
        },
      },
    },
  ],
};

interface AccordionProps {
  items: {
    title: BuilderElement[];
    detail: BuilderElement[];
  }[];

  oneAtATime?: boolean;
  grid?: boolean;
  defaultOpen?: number;
  animate?: boolean;
  // TODO: gridRowWidth
  gridRowWidth?: number;
}

// TODO: change to slick grid
@BuilderBlock({
  name: 'Builder:Accordion',
  image:
    'https://cdn.builder.io/api/v1/image/assets%2FagZ9n5CUKRfbL9t6CaJOyVSK4Es2%2Ffab6c1fd3fe542408cbdec078bca7f35?width=2000&height=1200',
  defaultStyles: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
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
          defaultValue: [defaultTitle],
        },
        {
          name: 'detail',
          type: 'uiBlocks',
          hideFromUI: true,
          defaultValue: [defaultDetail],
        },
      ],
      defaultValue: [
        {
          title: [defaultTitle],
          detail: [defaultDetail],
        },
        {
          title: [defaultTitle],
          detail: [defaultDetail],
        },
      ],
    },
    {
      name: 'oneAtATime',
      helperText: 'Only allow opening one at a time (collapse all others when new item openned)',
      type: 'boolean',
      defaultValue: false,
    },
    {
      name: 'animate',
      helperText: 'Animate openning and closing',
      type: 'boolean',
      defaultValue: true,
    },
    {
      name: 'grid',
      helperText: 'Display as a grid',
      type: 'boolean',
      defaultValue: false,
    },
    {
      name: 'gridRowWidth',
      helperText: 'Display as a grid',
      type: 'string',
      showIf: (options: Map<string, any>) => options.get('grid'),
      defaultValue: '25%',
    },
    // TODO: best way to do this? how multiple, comma? All with "*"? Have as a per item option?
    // {
    //   name: 'defaultOpen',
    //   helperText: 'Number of the accordion item to have open default (e.g. choose 1 for the first)',
    // }
  ],
})
export class BuilderAccordion extends React.Component<AccordionProps> {
  divRef: HTMLElement | null = null;

  state = {
    open: [] as number[],
  };

  componentDidMount() {
    setTimeout(() => {
      if (this.divRef) {
        this.divRef.dispatchEvent(
          new CustomEvent('builder:accordion:load', {
            bubbles: true,
            cancelable: false,
            detail: {
              ref: this,
            },
          })
        );
      }
    });
  }

  render() {
    const { grid, oneAtATime } = this.props;

    const onlyOneAtATime = grid || oneAtATime;

    const getOpenGridItemPosition = grid && this.state.open.length;
    let openGridItemOrder: number | null = null;
    if (getOpenGridItemPosition && this.divRef) {
      const openItemIndex = this.state.open[0];
      const openItem = this.divRef.querySelector(
        `.builder-accordion-title[data-index="${openItemIndex}"]`
      );

      let subjectItem = openItem;
      openGridItemOrder = openItemIndex;

      if (subjectItem) {
        let prevItemRect = subjectItem.getBoundingClientRect();

        while ((subjectItem = subjectItem && subjectItem.nextElementSibling)) {
          if (subjectItem) {
            if (subjectItem.classList.contains('builder-accordion-detail')) {
              continue;
            }
            const subjectItemRect = subjectItem.getBoundingClientRect();
            if (subjectItemRect.left > prevItemRect.left) {
              const index = parseInt(subjectItem.getAttribute('data-index') || '', 10);
              if (!isNaN(index)) {
                prevItemRect = subjectItemRect;
                openGridItemOrder = index;
              }
            } else {
              break;
            }
          }
        }
      }
    }

    if (typeof openGridItemOrder === 'number') {
      openGridItemOrder = openGridItemOrder + 1;
    }

    return (
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
            flexWrap: 'wrap',
          }),
        }}
      >
        {this.props.items.map((item, index) => {
          const open = this.state.open.indexOf(index) !== -1;
          return (
            // This will not work as expected with react 15
            // Did preact get the span replacmenet too?
            <React.Fragment key={index}>
              <div
                className={`builder-accordion-title builder-accordion-title-${
                  open ? 'open' : 'closed'
                }`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'stretch',
                  ...(grid && {
                    width: this.props.gridRowWidth,
                    ...(typeof openGridItemOrder === 'number' && {
                      order: index < openGridItemOrder ? index : index + 1,
                    }),
                  }),
                }}
                data-index={index}
                onClick={() => {
                  if (open) {
                    this.setState({
                      ...this.state,
                      open: onlyOneAtATime ? [] : this.state.open.filter(item => item !== index),
                    });
                  } else {
                    this.setState({
                      ...this.state,
                      open: onlyOneAtATime ? [index] : this.state.open.concat(index),
                    });
                  }
                }}
              >
                <BuilderBlocks blocks={item.title} dataPath={`items.${index}.title`} />
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
                      width: '100%',
                    }),
                  }}
                >
                  {open && (
                    <BuilderBlocks blocks={item.detail} dataPath={`items.${index}.detail`} />
                  )}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  }
}
