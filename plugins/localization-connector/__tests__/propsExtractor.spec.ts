import {
  extractLocales,
  extractMemsourceToken,
  extractProjectName
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

    describe('given both data locale and enum locales are defined in builder context', () => {
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
      it('should return source locale and target locales excluding source locale', () => {})
    })
  })

  describe('Given locale enum is not in builder model fields', () => {
    const ctx = {
      designerState: {
        editingContentModel: {
          data: { toJSON: () => ({ locale: 'locale-1' }) },
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
    it('should return undefined', () => {
      const [sourceLocale, targetLocales] = extractLocales(ctx)

      expect(sourceLocale).toBe('locale-1')
      expect(targetLocales).toStrictEqual(['locale-2'])
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
                hidden: true,
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

describe('Extract Project Name', () => {
  describe('Given all model name, page name and source locale is in builder context', () => {
    const ctx = {
      designerState: {
        editingContentModel: {
          data: { toJSON: () => ({ locale: 'locale1', title: 'title1' }) },
          model: {
            name: 'model-name'
          }
        }
      }
    }
    it('should return a project name', () => {
      const projectName = extractProjectName(ctx)

      expect(projectName).toEqual('model-name__title1__locale1')
    })
  })

  describe('Given one field at least is not in builder context', () => {
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
      const projectName = extractProjectName(ctx)

      expect(projectName).toEqual('')
    })
  })
})
