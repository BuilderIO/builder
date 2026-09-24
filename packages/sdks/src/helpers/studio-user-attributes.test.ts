import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  STUDIO_USER_ATTRIBUTES_SCRIPT,
  getStudioUserAttributes as getStudioUserAttributesInline,
} from '../blocks/personalization-container/helpers/inlined-fns';
import { isBrowser } from '../functions/is-browser';
import { getStudioUserAttributes } from './studio-user-attributes';

vi.mock('../functions/is-browser', () => ({
  isBrowser: vi.fn().mockReturnValue(true),
}));

const setLocationSearch = (search: string) => {
  vi.stubGlobal('window', { location: { search } });
};

const withStudioPreview = (params: string) =>
  '?builder.preview=BUILDER_STUDIO&' + params;

describe('getStudioUserAttributes', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns nothing outside the browser', () => {
    vi.mocked(isBrowser).mockReturnValueOnce(false);

    expect(getStudioUserAttributes()).toEqual({});
  });

  it('returns nothing when the Studio preview flag is absent', () => {
    setLocationSearch('?builder.userAttributes.device=mobile');

    expect(getStudioUserAttributes()).toEqual({});
  });

  it('returns nothing for a non-Studio preview value', () => {
    // builder.preview=<modelName> is the normal editor preview, not Studio.
    setLocationSearch(
      '?builder.preview=page&builder.userAttributes.device=mobile'
    );

    expect(getStudioUserAttributes()).toEqual({});
  });

  it('extracts userAttributes params, stripping the prefix', () => {
    setLocationSearch(
      withStudioPreview(
        'builder.userAttributes.device=mobile&builder.userAttributes.date=2026-09-25T18:30:00.000Z'
      )
    );

    expect(getStudioUserAttributes()).toEqual({
      device: 'mobile',
      date: '2026-09-25T18:30:00.000Z',
    });
  });

  it('ignores unrelated builder params', () => {
    setLocationSearch(
      withStudioPreview(
        'builder.cachebust=true&builder.options.locale=Default&builder.userAttributes.device=tablet'
      )
    );

    expect(getStudioUserAttributes()).toEqual({ device: 'tablet' });
  });

  it('coerces boolean-like values so they match boolean targeting rules', () => {
    setLocationSearch(
      withStudioPreview(
        'builder.userAttributes.isLoggedIn=true&builder.userAttributes.isNew=false'
      )
    );

    expect(getStudioUserAttributes()).toEqual({
      isLoggedIn: true,
      isNew: false,
    });
  });

  it('leaves other values as strings', () => {
    setLocationSearch(
      withStudioPreview('builder.userAttributes.audienceSize=42')
    );

    expect(getStudioUserAttributes()).toEqual({ audienceSize: '42' });
  });

  it('keeps dotted attribute names flat rather than nesting them', () => {
    // filterWithCustomTargeting does a flat userattr[property] lookup, so nesting these
    // the way generate-content-url.ts does for the API would stop the rule matching.
    setLocationSearch(
      withStudioPreview('builder.userAttributes.account.plan=pro')
    );

    expect(getStudioUserAttributes()).toEqual({ 'account.plan': 'pro' });
  });
});

describe('inlined copy of getStudioUserAttributes', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const searches = [
    '',
    '?builder.userAttributes.device=mobile',
    '?builder.preview=page&builder.userAttributes.device=mobile',
    withStudioPreview('builder.userAttributes.date=2026-09-25T18:30:00.000Z'),
    withStudioPreview(
      'builder.cachebust=true&builder.userAttributes.isLoggedIn=true&builder.userAttributes.isNew=false'
    ),
    withStudioPreview('builder.userAttributes.account.plan=pro'),
  ];

  it.each(searches)('matches the module helper for %s', (search) => {
    setLocationSearch(search);

    expect(getStudioUserAttributesInline()).toEqual(getStudioUserAttributes());
  });

  it('still works once stringified into the page', () => {
    // Catches a module-scope reference, which stringifies into an undefined global.
    setLocationSearch(
      withStudioPreview('builder.userAttributes.date=2026-09-25T18:30:00.000Z')
    );

    const stringified = new Function(
      'return (' + STUDIO_USER_ATTRIBUTES_SCRIPT + ')'
    )();

    expect(stringified()).toEqual({ date: '2026-09-25T18:30:00.000Z' });
  });
});
