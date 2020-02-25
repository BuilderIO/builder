import { getMassagedProps } from '../src/dropdownPropsExtractor'

describe('Get Massaged Props', () => {
  describe('should throw', () => {
    it.each([[null], [undefined], [''], [' '], [{}], [73], [[]]])(
      'when url is %o',
      invalidUrl => {
        try {
          getMassagedProps({ field: { options: { url: invalidUrl } } })
          fail('Should have thrown')
        } catch (e) {
          expect(e.message).toBe('Missing { url: "" } required option')
        }
      }
    )

    it.each([[null], [undefined], [{}], [73], [[]]])(
      'when mapper is %o',
      invalidMapper => {
        try {
          getMassagedProps({
            field: {
              options: { url: 'any-url', mapper: invalidMapper }
            }
          })
          fail('Should have thrown')
        } catch (e) {
          expect(e.message).toBe('Missing { mapper: "" } required option')
        }
      }
    )
  })

  describe('should return', () => {
    const locale = 'en-CA'
    const mock = jest.fn()
    const builderPluginContext = {
      context: {
        designerState: { editingContentModel: { data: { toJSON: mock } } }
      }
    }

    beforeAll(() => {
      mock.mockReturnValue({ locale })
    })

    it('url after replacing templated url with context tokens', () => {
      const templatedUrl = 'https://www.domain.net/v2/{{locale}}/endpoint'
      const expectedUrl = `https://www.domain.net/v2/${locale}/endpoint`

      const actual = getMassagedProps({
        field: { options: { url: templatedUrl, mapper: '() => {}' } },
        ...builderPluginContext
      })

      expect(actual.url).toBe(expectedUrl)
    })

    it('mapper function as mapper', () => {
      const expected = '() => {}'

      const actual = getMassagedProps({
        field: { options: { url: 'any-url', mapper: expected } },
        ...builderPluginContext
      })

      expect(actual.mapper).toBe(expected)
    })
  })
})
