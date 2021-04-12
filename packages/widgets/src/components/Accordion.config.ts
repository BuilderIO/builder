import { BuilderElement } from '@builder.io/react';

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

export const accordionConfig: any = {
  name: 'Builder:Accordion',
  canHaveChildren: true,
  image:
    'https://cdn.builder.io/api/v1/image/assets%2FagZ9n5CUKRfbL9t6CaJOyVSK4Es2%2Ffab6c1fd3fe542408cbdec078bca7f35',
  defaultStyles: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  inputs: [
    {
      name: 'items',
      type: 'list',
      broadcast: true,
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
      showIf: (options: Map<string, any>) => !options.get('useChildrenForItems'),
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
    {
      name: 'useChildrenForItems',
      type: 'boolean',
      helperText:
        'Use child elements for each slide, instead of the array. Useful for dynamically repeating items',
      advanced: true,
      defaultValue: false,
      onChange: (options: Map<string, any>) => {
        if (options.get('useChildrenForItems') === true) {
          options.set('items', []);
        }
      },
    },
  ],
};
