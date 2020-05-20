import { Assign } from '../../src/components/assign';
import { el } from '../modules/helpers';
import { AssignBlockProps } from '../../react/interfaces/component-props';

const getAssignCode = (options: AssignBlockProps): string =>
  Assign(
    el({
      component: {
        options,
        name: 'Shopify:Assign',
      },
    }),
    {}
  );

describe('Assign code generator', () => {
  test('Simple string', () => {
    const code = getAssignCode({
      expression: 'favorite_food = "pizza"',
    });

    expect(code).toMatchSnapshot();
  });

  test('Boolean', () => {
    const code = getAssignCode({
      expression: 'first_time_visitor = false',
    });

    expect(code).toMatchSnapshot();
  });
});
