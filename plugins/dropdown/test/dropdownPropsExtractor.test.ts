import { getMassagedProps } from '../src/dropdownPropsExtractor'
import { when } from 'jest-when'

describe('Get Massaged Props', () => {
  afterEach(() => jest.resetModules())

  describe('should throw', () => {
    it('when url field does not contain "givenUrl"', () => {
      try {
        getMassagedProps({ field: { url: {} } })
        fail('Should have thrown')
      } catch (e) {
        expect(e.message).toBe(
          'Missing { url: { givenUrl: "" } } required option'
        )
      }
    })

    it('when mapper is undefined', () => {
      try {
        getMassagedProps({ field: { url: { givenUrl: 'any-url' } } })
        fail('Should have thrown')
      } catch (e) {
        expect(e.message).toBe('Missing { mapper: "" } required option')
      }
    })
  })

  describe('should return', () => {
    it('given url as givenUrl', () => {
      const actual = getMassagedProps({
        field: { url: { givenUrl: 'any-url' }, mapper: '' },
        context: {
          designerState: { editingContentModel: { data: {} } }
        }
      })

      expect(actual.givenUrl).toBe('any-url')
    })

    it('mapper function as mapper', () => {
      const expected = ''
      const actual = getMassagedProps({
        field: {
          url: { givenUrl: 'any-url' },
          mapper: expected
        },
        context: {
          designerState: { editingContentModel: { data: {} } }
        }
      })

      expect(actual.mapper).toBe(expected)
    })

    describe('given builder context as pluginContext', () => {
      it('pluginContext object extracted from editingContentModel data', () => {
        const fn = jest.fn()
        when(fn)
          .calledWith('locale')
          .mockReturnValueOnce('en-IE')

        const actual = getMassagedProps({
          field: {
            url: { givenUrl: 'any-url' },
            mapper: '',
            pluginContext: ['locale']
          },
          context: {
            designerState: { editingContentModel: { data: { get: fn } } }
          }
        })

        expect(actual.pluginContext).toMatchObject([{ ['locale']: 'en-IE' }])
      })

      it('filter out context keys not found in editingContentModel data', () => {
        const fn = jest.fn()
        when(fn)
          .calledWith('locale')
          .mockReturnValueOnce('en-IE')

        const actual = getMassagedProps({
          field: {
            url: { givenUrl: 'any-url' },
            mapper: '',
            pluginContext: ['inexistent-key', 'locale']
          },
          context: {
            designerState: { editingContentModel: { data: { get: fn } } }
          }
        })

        expect(actual.pluginContext).toMatchObject([{ ['locale']: 'en-IE' }])
      })
    })
  })
})
