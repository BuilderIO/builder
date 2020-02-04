import { extractSelections } from '../src/mapperEvaluator'

describe('Safe evaluate', () => {
  it('Works', () => {
    expect(extractSelections('true')).toBe(true)
    expect(extractSelections('foo.bar', { foo: { bar: 'hi' } })).toBe('hi')
  })
})
