import { Label } from '../../src/components/forms/label';
import { el } from '../modules/helpers';

const getLabelCode = (options: any): string =>
  Label(
    el({
      component: {
        options,
        name: 'Form:Label',
      },
    }),
    {}
  );

describe('Label code generator', () => {
  test('values for all attributes', () => {
    const code = getLabelCode({
      for: 'name',
      text: 'your name',
    });

    expect(code).toMatchSnapshot();
  });

  test('no values for attributes', () => {
    const code = getLabelCode({});
    expect(code).toMatchSnapshot();
  });
});
