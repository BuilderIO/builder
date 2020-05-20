import { ThemeProvider } from '../../src/components/theme-provider';
import { el } from '../modules/helpers';
import * as simplePage from '../pages/compare/simple.json';
import { BuilderElement } from '@builder.io/sdk';

const mockState = {
  settings: {
    key: 'value',
    boolean_key: true,
    number_key: 1,
  },
};

const getThemeProviderCode = (options: any, children: BuilderElement[] = []): string =>
  ThemeProvider(
    el({
      children,
      component: {
        options,
        name: 'Shopify:ThemeProvider',
      },
    }),
    {}
  );

describe('ThemProvider code generator', () => {
  test('no values for attributes', () => {
    const code = getThemeProviderCode({});
    expect(code).toMatchSnapshot();
  });

  test('with children', () => {
    const children = simplePage.data.blocks as BuilderElement[];
    const code = getThemeProviderCode({ state: mockState }, children);
    expect(code).toMatchSnapshot();
  });
});
