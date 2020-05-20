import { FormInput } from '../../src/components/forms/form';
import { el } from '../modules/helpers';

const getFormCode = (options: any): string =>
  FormInput(
    el({
      component: {
        options,
        name: 'Form:Form',
      },
    }),
    {}
  );

describe('Form code generator', () => {
  test('values for all attributes', () => {
    const code = getFormCode({
      action: 'https://www.builder.io',
      name: 'name',
      method: 'GET',
      validate: true,
    });

    expect(code).toMatchSnapshot();
  });

  test('no values for attributes', () => {
    const code = getFormCode({});
    expect(code).toMatchSnapshot();
  });
});
