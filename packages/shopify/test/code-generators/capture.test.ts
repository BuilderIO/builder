import { Capture } from '../../src/components/capture';
import { el } from '../modules/helpers';
import { CaptureBlockProps } from '../../react/interfaces/component-props';

const getCaptureCode = (options: CaptureBlockProps): string =>
  Capture(
    el({
      component: {
        options,
        name: 'Shopify:Capture',
      },
    }),
    {}
  );

describe('Capture code generator', () => {
  test('no state', () => {
    const code = getCaptureCode({
      expression: 'I am 30 and my favorite food is pizza',
      variableName: 'about_me',
    });

    expect(code).toMatchSnapshot();
  });

  test('with interpolation', () => {
    const code = getCaptureCode({
      expression: 'I am {{age}} and my favorite food is {{favorite_food}}',
      variableName: 'about_me',
    });

    expect(code).toMatchSnapshot();
  });
});
