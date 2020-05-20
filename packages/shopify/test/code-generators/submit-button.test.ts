import { SubmitButton } from '../../src/components/forms/submit-button';
import { el } from '../modules/helpers';

const getSubmitButtonCode = (options: any): string =>
  SubmitButton(
    el({
      component: {
        options,
        name: 'Form:SubmitButton',
      },
    }),
    {}
  );

describe('Submit button code generator', () => {
  test('values for all attributes', () => {
    const code = getSubmitButtonCode({
      text: 'Submit',
    });

    expect(code).toMatchSnapshot();
  });

  test('no values for attributes', () => {
    const code = getSubmitButtonCode({});
    expect(code).toMatchSnapshot();
  });
});
