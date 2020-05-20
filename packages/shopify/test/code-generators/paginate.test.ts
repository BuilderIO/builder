import { Paginate } from '../../src/components/paginate';
import { el } from '../modules/helpers';
import * as simplePage from '../pages/compare/simple.json';
import { BuilderElement } from '@builder.io/sdk';

const children = simplePage.data.blocks as BuilderElement[];

const getCaptureCode = (options: any, rootOptions?: any): string =>
  Paginate(
    el({
      component: {
        options,
        name: 'Shopify:Paginate',
      },
      ...rootOptions,
    }),
    {}
  );

describe('Capture code generator', () => {
  test('simple expression', () => {
    const code = getCaptureCode(
      {
        expression: 'collection.products by 5',
      },
      { children }
    );

    expect(code).toMatchSnapshot();
  });

  test('complex expression', () => {
    const code = getCaptureCode(
      {
        expression: 'section.settings.pagination_limit',
      },
      { children }
    );

    expect(code).toMatchSnapshot();
  });
});
