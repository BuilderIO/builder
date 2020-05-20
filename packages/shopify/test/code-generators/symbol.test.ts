import { Symbol } from '../../src/components/symbol';
import { el } from '../modules/helpers';
import * as simplePage from '../pages/compare/simple.json';

const getSymbolCode = (options: any): string =>
  Symbol(
    el({
      component: {
        options,
        name: 'Symbol',
      },
    }),
    { useBuilderSignature: false }
  );

describe('Symbol code generator', () => {
  test('no content, not inline', () => {
    const code = getSymbolCode({
      symbol: {
        inline: false,
      },
    });

    expect(code).toMatchSnapshot();
  });

  test('no content, inline', () => {
    const code = getSymbolCode({
      symbol: {
        inline: true,
      },
    });

    expect(code).toMatchSnapshot();
  });

  test('content, not inline', () => {
    const code = getSymbolCode({
      symbol: {
        inline: false,
        content: simplePage,
      },
    });

    expect(code).toMatchSnapshot();
  });
});
