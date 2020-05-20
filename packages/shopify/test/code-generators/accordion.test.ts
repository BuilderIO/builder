import { Accordion } from '../../src/components/widgets/accordion';
import { el } from '../modules/helpers';
import { BuilderElement } from '@builder.io/sdk';

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

const getAccordionCode = (options: any): string =>
  Accordion(
    el({
      component: {
        options,
        name: 'Builder:Accordion',
      },
    }),
    {}
  );

describe('Accordion code generator', () => {
  test('values for all attributes', () => {
    const code = getAccordionCode({
      grid: true,
      gridRowWidth: '300px',
    });

    expect(code).toMatchSnapshot();
  });

  test('no values for attributes', () => {
    const code = getAccordionCode({});
    expect(code).toMatchSnapshot();
  });

  test('no attributes, with items', () => {
    const code = getAccordionCode({
      items: [
        {
          title: [defaultTitle],
        },
      ],
      grid: true,
    });

    expect(code).toMatchSnapshot();
  });
});
