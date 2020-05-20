import { CustomCode } from '../../src/components/custom-code';
import { el } from '../modules/helpers';

const getCustomCode = (options: any): string =>
  CustomCode(
    el({
      component: {
        options,
        name: 'Custom Code',
      },
    }),
    {}
  );

describe('Custom Code - code generator', () => {
  test('has code', () => {
    const code = getCustomCode({
      code: '<script>myGLobalVariable = "something"</script>',
    });

    expect(code).toMatchSnapshot();
  });

  test('no code', () => {
    const code = getCustomCode({});
    expect(code).toMatchSnapshot();
  });
});
