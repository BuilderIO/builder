import { getMassagedProps } from '../src/helpers/dropdownPropsExtractor';

describe('Get Massaged Props', () => {
  const mock = jest.fn();
  const locale = 'en-CA';

  const builderPluginContext = {
    context: {
      designerState: { editingContentModel: { data: { toJSON: mock } } },
    },
  };

  describe('should throw', () => {
    it.each([[null], [undefined], [''], [' '], [{}], [73], [[]]])('when url is %o', invalidUrl => {
      try {
        getMassagedProps({ field: { options: { url: invalidUrl } } });
        fail('Should have thrown');
      } catch (e) {
        expect(e.message).toBe('Missing { url: "" } required option');
      }
    });

    it.each([[null], [undefined], [{}], [73], [[]]])('when mapper is %o', invalidMapper => {
      try {
        getMassagedProps({
          field: {
            options: { url: 'any-url', mapper: invalidMapper },
          },
        });
        fail('Should have thrown');
      } catch (e) {
        expect(e.message).toBe('Missing { mapper: "" } required option');
      }
    });

    it('when templated url with missing component tokens', () => {
      const templatedUrl = 'https://www.domain.net/v2/{{locale}}/endpoint/{{componentVariable}}';
      const builderComponentVariables: { [key: string]: string } = { anotherVariable: 'X' };
      const builderPluginObject = {
        object: { get: (key: string): any => builderComponentVariables[key] },
      };
      mock.mockReturnValue({ locale });
      try {
        getMassagedProps({
          field: {
            options: {
              url: templatedUrl,
              mapper: '() => {}',
              dependencyComponentVariables: ['componentVariable'],
            },
          },
          ...builderPluginContext,
          ...builderPluginObject,
        });
        fail('Should have thrown');
      } catch (e) {
        expect(e.message).toBe('Tokens {{componentVariable}} not replaced');
      }
    });
  });

  describe('should return', () => {
    beforeAll(() => {
      mock.mockReturnValue({ locale });
    });

    it('url after replacing templated url with context tokens', () => {
      const templatedUrl = 'https://www.domain.net/v2/{{locale}}/endpoint';
      const expectedUrl = `https://www.domain.net/v2/${locale}/endpoint`;

      const actual = getMassagedProps({
        field: { options: { url: templatedUrl, mapper: '() => {}' } },
        ...builderPluginContext,
      });

      expect(actual.url).toBe(expectedUrl);
    });

    it('url after replacing templated url with component tokens', () => {
      const templatedUrl = 'https://www.domain.net/v2/{{locale}}/endpoint/{{componentVariable}}';
      const A_VALUE = 'A VARIABLE';
      const builderComponentVariables: { [key: string]: string } = { componentVariable: A_VALUE };
      const builderPluginObject = {
        object: { get: (key: string): any => builderComponentVariables[key] },
      };
      const actual = getMassagedProps({
        field: {
          options: {
            url: templatedUrl,
            mapper: '() => {}',
            dependencyComponentVariables: ['componentVariable'],
          },
        },
        ...builderPluginContext,
        ...builderPluginObject,
      });

      const expectedUrl = `https://www.domain.net/v2/${locale}/endpoint/${A_VALUE}`;
      expect(actual.url).toBe(expectedUrl);
    });

    it('replaces templated url with nested component tokens', () => {
      const templatedUrl = 'https://www.domain.net/v2/{{targeting.locale.0}}/users';

      const builderComponentVariables = { targeting: { locale: [locale] } };
      const builderPluginObject = {
        object: { get: (key: string): any => builderComponentVariables[key] },
      };
      const actual = getMassagedProps({
        field: {
          options: {
            url: templatedUrl,
            mapper: '() => {}',
            dependencyComponentVariables: ['componentVariable'],
          },
        },
        ...builderPluginContext,
        ...builderPluginObject,
      });

      const expectedUrl = `https://www.domain.net/v2/${locale}/users`;
      expect(actual.url).toBe(expectedUrl);
    });

    it('mapper function as mapper', () => {
      const expected = '() => {}';

      const actual = getMassagedProps({
        field: { options: { url: 'any-url', mapper: expected } },
        ...builderPluginContext,
      });

      expect(actual.mapper).toBe(expected);
    });
  });
});
