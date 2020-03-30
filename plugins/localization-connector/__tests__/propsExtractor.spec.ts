import {
  extractLocales,
  extractMemsourceToken
} from '../src/services/propsExtractor'

describe('Extract Locales', () => {
  describe('Given source locale is in builder page data', () => {
    const ctx = {
      designerState: {
        editingContentModel: {
          data: { toJSON: () => ({ locale: 'locale-1' }) }
        }
      }
    }
    it('should return its value', () => {
      const [sourceLocale, _] = extractLocales(ctx)

      expect(sourceLocale).toEqual('locale-1')
    })
  })

  describe('Given source locale is not in builder page data', () => {
    const ctx = {
      designerState: { editingContentModel: { data: { toJSON: () => ({}) } } }
    }

    it('should return undefined', () => {
      const [sourceLocale, _] = extractLocales(ctx)

      expect(sourceLocale).toBeUndefined()
    })
  })

  describe('Given locale enum is in builder model fields', () => {
    const ctx = {
      designerState: {
        editingContentModel: {
          model: {
            fields: [
              {
                name: 'locale',
                enum: { toJSON: () => ['locale-1', 'locale-2'] }
              }
            ]
          }
        }
      }
    }
    it('should return the array', () => {
      const [_, targetLocales] = extractLocales(ctx)

      expect(targetLocales).toEqual(['locale-1', 'locale-2'])
    })
  })

  describe('Given locale enum is not in builder model fields', () => {
    const ctx = {
      designerState: { editingContentModel: { model: { fields: [] } } }
    }

    it('should return undefined', () => {
      const [_, targetLocales] = extractLocales(ctx)

      expect(targetLocales).toBeUndefined()
    })
  })
})

describe('Extract Memsource Token', () => {
  describe('Given token is in builder model fields', () => {
    const ctx = {
      designerState: {
        editingContentModel: {
          model: {
            fields: [
              {
                name: 'memsourceToken',
                toJSON: () => ({ defaultValue: '1234' })
              }
            ]
          }
        }
      }
    }
    it('should return its value', () => {
      const token = extractMemsourceToken(ctx)

      expect(token).toEqual('1234')
    })
  })

  describe('Given token is not in builder model fields', () => {
    const ctx = {
      designerState: {
        editingContentModel: {
          model: {
            fields: []
          }
        }
      }
    }
    it('should return empty string', () => {
      const token = extractMemsourceToken(ctx)

      expect(token).toEqual('')
    })
  })
})
