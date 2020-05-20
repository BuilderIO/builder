import { Section } from '../../src/components/section';
import { el } from '../modules/helpers';
import * as simplePage from '../pages/compare/simple.json';
import { BuilderElement } from '@builder.io/sdk';

const getSectionCode = (options: any, children: BuilderElement[] = []): string =>
  Section(
    el({
      children,
      component: {
        options,
        name: 'Core:Section',
      },
    }),
    {}
  );

describe('Section code generator', () => {
  test('values for all attributes', () => {
    const code = getSectionCode({
      maxWidth: 300,
    });

    expect(code).toMatchSnapshot();
  });

  test('no values for attributes', () => {
    const code = getSectionCode({});
    expect(code).toMatchSnapshot();
  });

  test('no attributes, with children', () => {
    const children = simplePage.data.blocks as BuilderElement[];

    const code = getSectionCode(
      {
        maxWidth: 300,
      },
      children
    );

    expect(code).toMatchSnapshot();
  });
});
