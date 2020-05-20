import { Condition } from '../../src/components/condition';
import { el } from '../modules/helpers';
import { ConditionBlockProps } from '../../react/interfaces/component-props';

/**
 * Helper to turn ConditionBlockProps into liquid for testing the output
 *
 * @example
 *    getConditionCode({ branches: [] })
 *
 * @returns The liquid code
 */
const getConditionCode = (options: ConditionBlockProps): string =>
  Condition(
    el({
      component: {
        options,
        name: 'Shopify:Condition',
      },
    }),
    {}
  );

// Helpers
const blockA = el({ id: 'blockA' });
const blockB = el({ id: 'blockB' });
const blockC = el({ id: 'blockC' });
const blockD = el({ id: 'blockD' });

const liquidExpressionA = 'products | first';
const liquidExpressionB = 'products | second';
const liquidExpressionC = 'products | third';

describe('Condition code generator', () => {
  test('Simple test', () => {
    const code = getConditionCode({
      branches: [
        {
          expression: `context.shopify.liquid.condition('${liquidExpressionA}', state)`,
          blocks: [blockA],
        },
      ],
    });

    expect(code).toMatchSnapshot();
  });
  test('2 branches', () => {
    const code = getConditionCode({
      branches: [
        {
          expression: `context.shopify.liquid.condition('${liquidExpressionA}', state)`,
          blocks: [blockA],
        },
        {
          expression: `context.shopify.liquid.condition('${liquidExpressionB}', state)`,
          blocks: [blockB],
        },
      ],
    });

    expect(code).toMatchSnapshot();
  });

  test('4 branches', () => {
    const code = getConditionCode({
      branches: [
        {
          expression: `context.shopify.liquid.condition('${liquidExpressionA}', state)`,
          blocks: [blockA],
        },
        {
          expression: `context.shopify.liquid.condition('${liquidExpressionB}', state)`,
          blocks: [blockB],
        },
        {
          expression: `context.shopify.liquid.condition('${liquidExpressionC}', state)`,
          blocks: [blockC],
        },
        {
          blocks: [blockD],
        },
      ],
    });

    expect(code).toMatchSnapshot();
  });
});
