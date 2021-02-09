import { safeEvaluate } from '../src/helpers/mapperEvaluator';

describe('Safe evaluate', () => {
  it('Works', () => {
    expect(safeEvaluate('() => true')).toBe(true);
    expect(safeEvaluate('({foo}) => foo.bar', { foo: { bar: 'hi' } })).toBe('hi');
  });
});
