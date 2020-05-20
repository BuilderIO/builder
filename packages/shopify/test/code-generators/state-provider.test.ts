import { StateProvider } from '../../src/components/state-provider';
import { el } from '../modules/helpers';
import { StateProviderProps } from '../../react/interfaces/component-props';
import * as simplePage from '../pages/compare/simple.json';
import { BuilderElement } from '@builder.io/sdk';

const children = simplePage.data.blocks as BuilderElement[];

const getStateProviderCode = (
  options: StateProviderProps,
  children: BuilderElement[] = []
): string =>
  StateProvider(
    el({
      children,
      component: {
        options,
        name: 'Builder:StateProvider',
      },
    }),
    {}
  );

describe('State provider code generator', () => {
  test('Simple string', () => {
    const code = getStateProviderCode({
      state: {
        _sourceFile: `snippets/something.liquid`,
      },
    });

    expect(code).toMatchSnapshot();
  });

  test('with children', () => {
    const code = getStateProviderCode(
      {
        state: {
          someState: true,
        },
      },
      children
    );

    expect(code).toMatchSnapshot();
  });
});
