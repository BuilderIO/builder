import { BuilderElement } from '@builder.io/react';

const defaultElement: BuilderElement = {
  '@type': '@builder.io/sdk:Element',
  responsiveStyles: {
    large: {
      // TODO: always apply these if not given
      position: 'relative',
      display: 'flex',
      alignItems: 'stretch',
      flexDirection: 'column',
      height: '400px',
    },
  },
  children: [
    {
      '@type': '@builder.io/sdk:Element',
      responsiveStyles: {
        large: {
          marginTop: '50px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
        },
      },
      component: {
        name: 'Text',
        options: {
          text: 'I am a slide',
        },
      },
    },
  ],
};
const defaultButton: BuilderElement = {
  '@type': '@builder.io/sdk:Element',
  responsiveStyles: {
    large: {
      position: 'relative',
      display: 'flex',
      alignItems: 'stretch',
      flexDirection: 'column',
      height: '30px',
    },
  },
};

export const carouselConfig: any = {
  name: 'Builder:Carousel',
  // TODO: default children
  canHaveChildren: true,
  defaultStyles: {
    paddingLeft: '30px',
    paddingRight: '30px',
    paddingBottom: '30px',
  },
  inputs: [
    {
      name: 'slides',
      type: 'list',
      broadcast: true,
      subFields: [
        {
          name: 'content',
          type: 'uiBlocks',
          hideFromUI: true,
          defaultValue: [defaultElement],
        },
      ],
      defaultValue: [
        {
          content: [defaultElement],
        },
        {
          content: [defaultElement],
        },
      ],
      showIf: (options: any) => !options.get('useChildrenForSlides'),
    },
    {
      name: 'hideDots',
      helperText: 'Show pagination dots',
      type: 'boolean',
      defaultValue: false,
    },
    {
      name: 'autoplay',
      helperText: 'Automatically rotate to the next slide every few seconds',
      type: 'boolean',
      defaultValue: false,
    },
    {
      name: 'autoplaySpeed',
      type: 'number',
      defaultValue: 5,
      helperText:
        'If auto play is on, how many seconds to wait before automatically changing each slide',
      showIf: (options: any) => options.get('autoplay'),
    },
    {
      name: 'prevButton',
      type: 'uiBlocks',
      hideFromUI: true,
      defaultValue: [
        {
          ...defaultButton,
          component: {
            name: 'Image',
            options: {
              image:
                'https://cdn.builder.io/api/v1/image/assets%2FagZ9n5CUKRfbL9t6CaJOyVSK4Es2%2Fd909a5b91650499c9e0524cc904eeb77',
            },
          },
        },
      ],
    },
    {
      name: 'nextButton',
      type: 'uiBlocks',
      hideFromUI: true,
      defaultValue: [
        {
          ...defaultButton,
          component: {
            name: 'Image',
            options: {
              image:
                'https://cdn.builder.io/api/v1/image/assets%2FagZ9n5CUKRfbL9t6CaJOyVSK4Es2%2Fdb2a9827561249aea3817b539aacdcdc',
            },
          },
        },
      ],
    },
    {
      name: 'useChildrenForSlides',
      type: 'boolean',
      helperText:
        'Use child elements for each slide, instead of the array. Useful for dynamically repeating slides',
      advanced: true,
      defaultValue: false,
      onChange: (options: Map<string, any>) => {
        if (options.get('useChildrenForSlides') === true) {
          options.set('slides', []);
        }
      },
    },
    {
      name: 'responsive',
      type: 'array',
      helperText: 'Responsive settings - e.g. see https://kenwheeler.github.io/slick/',
      advanced: true,
      defaultValue: [
        {
          width: 3000,
          slidesToShow: 2,
          slidesToScroll: 2,
        },
        {
          width: 400,
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      ],
      subFields: [
        {
          name: 'breakpoint',
          type: 'number',
          defaultValue: 400,
          required: true,
        },
        {
          name: 'settings',
          type: 'object',
          defaultValue: {
            slidesToShow: 2,
            slidesToScroll: 2,
          },
          subFields: [
            {
              name: 'slidesToShow',
              type: 'number',
              defaultValue: 2,
            },
            {
              name: 'slidesToScroll',
              type: 'number',
              defaultValue: 2,
            },
            {
              name: 'infinite',
              type: 'boolean',
              defaultValue: true,
            },
            {
              name: 'dots',
              type: 'boolean',
              defaultValue: true,
            },
          ],
        },
      ],
    },
  ],
};
