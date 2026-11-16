import {
  getPersonalizationScript,
  isVariantForLocale,
  type Query,
} from './helpers.js';

const localeIs = (value: string | string[]): Query => ({
  property: 'locale',
  operator: 'is',
  value,
});

describe('isVariantForLocale', () => {
  test('keeps every variant when no locale is known', () => {
    expect(isVariantForLocale([localeIs('fr-FR')], undefined)).toBe(true);
  });

  test('keeps variants without targeting', () => {
    expect(isVariantForLocale(undefined, 'en-US')).toBe(true);
    expect(isVariantForLocale([], 'en-US')).toBe(true);
  });

  test('drops variants targeting another locale', () => {
    expect(isVariantForLocale([localeIs('fr-FR')], 'en-US')).toBe(false);
    expect(isVariantForLocale([localeIs(['fr-FR', 'de-DE'])], 'en-US')).toBe(
      false
    );
  });

  test('keeps variants targeting the page locale', () => {
    expect(isVariantForLocale([localeIs('en-US')], 'en-US')).toBe(true);
    expect(isVariantForLocale([localeIs(['fr-FR', 'en-US'])], 'en-US')).toBe(
      true
    );
  });

  test('ignores non-locale rules that depend on visitor attributes', () => {
    const query: Query[] = [
      localeIs('en-US'),
      { property: 'loggedIn', operator: 'is', value: true },
    ];
    expect(isVariantForLocale(query, 'en-US')).toBe(true);
  });
});

describe('getPersonalizationScript', () => {
  test('does not inline variant blocks', () => {
    const script = getPersonalizationScript(
      [
        {
          query: [localeIs('fr-FR')],
          blocks: [{ '@type': '@builder.io/sdk:Element', id: 'secret-fr' }],
        },
      ],
      'block-1',
      'en-US'
    );
    expect(script).not.toContain('secret-fr');
    expect(script).toContain('fr-FR');
  });
});
