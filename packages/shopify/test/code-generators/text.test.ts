import { Text } from '../../src/components/text';
import { el } from '../modules/helpers';

const getTextCode = (options: any): string =>
  Text(
    el({
      component: {
        options,
        name: 'Text',
      },
    }),
    {}
  );

describe('Text code generator', () => {
  test('values for all attributes', () => {
    const code = getTextCode({
      text: 'Look at this great text',
    });

    expect(code).toMatchSnapshot();
  });

  test('no values for attributes', () => {
    const code = getTextCode({});
    expect(code).toMatchSnapshot();
  });
});
