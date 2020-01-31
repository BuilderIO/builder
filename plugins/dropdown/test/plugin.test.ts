import 'jest'
import { safeEvaluate } from '../src/dropdown'

/**
 * Safe evaluate
 */
describe('Safe evaluate', () => {
  it('Works', () => {
    expect(safeEvaluate('true')).toBe(true)
    expect(safeEvaluate('foo.bar', { foo: { bar: 'hi' } })).toBe('hi')
  })
})
