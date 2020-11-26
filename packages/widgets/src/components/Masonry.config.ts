import { BuilderElement } from '@builder.io/react';

const getRandomAspectTile = (): BuilderElement => ({
  ...defaultTile,
  component: {
    ...defaultTile.component!,
    options: {
      ...defaultTile.component!.options,
      // range from 0.5 to 2, rounded to 2 decimal points
      aspectRatio: Math.round((Math.random() * 1.5 + 0.5) * 100) / 100,
    },
  },
});

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
      marginLeft: '20px',
    },
  },
  component: {
    name: 'Image',
    options: {
      image:
        'https://builder.io/api/v1/image/assets%2Fpwgjf0RoYWbdnJSbpBAjXNRMe9F2%2Ffb27a7c790324294af8be1c35fe30f4d?width=2000&height=1200',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      aspectRatio: 0.7041,
    },
  },
};

export const masonryConfig: any = {
  name: 'Builder:Masonry',
  // TODO: default children
  image:
    'https://cdn.builder.io/api/v1/image/assets%2FBvYIl5jKN9QpChUB3PVzsTe2ZSI2%2F7ed6bd8129d148608ecec09300786d71?width=2000&height=1200',
  canHaveChildren: true,
  defaultStyles: {
    paddingLeft: '20px',
    paddingRight: '20px',
    paddingBottom: '20px',
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
    getRandomAspectTile(),
  ],
  inputs: [
    {
      name: 'columnWidth',
      // TODO: type: 'styleNumber'
      type: 'string',
      helperText: 'Width of each tile, as a CSS value. E.g. "200px" or "50%"',
      defaultValue: '200px',
    },
    {
      name: 'gutterSize',
      type: 'number',
      helperText: 'Horizontal space between tiles in pixels, e.g. "20" for 20 pixels wide',
      defaultValue: 0,
      advanced: true,
    },
    {
      name: 'tiles',
      type: 'list',
      subFields: [
        {
          name: 'content',
          type: 'uiBlocks',
          hideFromUI: true,
          defaultValue: [defaultTile],
        },
      ],
      defaultValue: [],
      showIf: (options: Map<string, any>) => !options.get('useChildrenForTiles'),
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
          options.set('tiles', []);
        }
      },
    },
  ],
};
