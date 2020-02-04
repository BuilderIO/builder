import { safeEvaluate } from '../src/mapperEvaluator'

describe('Safe evaluate', () => {
  it('Works', () => {
    expect(safeEvaluate('true')).toBe(true)
    expect(safeEvaluate('foo.bar', { foo: { bar: 'hi' } })).toBe('hi')
  })
})
