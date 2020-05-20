import { FormInput } from '../../src/components/forms/input';
import { el } from '../modules/helpers';

const getInputCode = (options: any): string =>
  FormInput(
    el({
      component: {
        options,
        name: 'Form:Input',
      },
    }),
    {}
  );

describe('Form Input code generator', () => {
  test('values for all attributes', () => {
    const code = getInputCode({
      placeholder: 'placeholder',
      name: 'name',
      type: 'text',
      value: 'value',
    });

    expect(code).toMatchSnapshot();
  });

  test('no values for attributes', () => {
    const code = getInputCode({});
    expect(code).toMatchSnapshot();
  });
});
