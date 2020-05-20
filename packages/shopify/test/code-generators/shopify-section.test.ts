import { ShopifySection } from '../../src/components/shopify-section';
import { el } from '../modules/helpers';
import * as simplePage from '../pages/compare/simple.json';
import { BuilderElement } from '@builder.io/sdk';

const mockState = {
  section: {
    type: 'collection-template',
    blocks: [
      {
        type: 'menu',
        settings: {
          custom_menu_linklist: '',
        },
      },
      {
        type: 'recently_viewed',
        settings: {
          sidebar_rv_title: 'Recently Viewed',
          sidebar_rv_per: 3,
        },
      },
    ],
    block_order: ['1558728638165', '1587417229636'],
    settings: {
      pagination_limit: 15,
      display_collection_title: false,
      collection_breadcrumb: true,
      collection_tags: false,
      collection_sort: false,
      featured_collection_image: false,
      image: '',
      image_darken: false,
      toggle: false,
      products_per_row: 8,
    },
  },
};

const getShopifySectionCode = (options: any, children: BuilderElement[] = []): string =>
  ShopifySection(
    el({
      children,
      component: {
        options,
        name: 'Shopify:Section',
      },
    }),
    {}
  );

describe('ShopifySection code generator', () => {
  test('values for all attributes, no children', () => {
    const code = getShopifySectionCode({
      state: mockState,
      schema: {
        name: 'Collection',
        class: 'collection-template-section',
      },
    });

    expect(code).toMatchSnapshot();
  });

  test('no values for attributes', () => {
    const code = getShopifySectionCode({});
    expect(code).toMatchSnapshot();
  });

  test('with children', () => {
    const children = simplePage.data.blocks as BuilderElement[];
    const code = getShopifySectionCode(
      {
        state: mockState,
        schema: {
          name: 'Collection',
          class: 'collection-template-section',
        },
      },
      children
    );
    expect(code).toMatchSnapshot();
  });
});
