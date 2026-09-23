import { afterEach, describe, expect, it, vi } from 'vitest';
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
    // builder.preview=<modelName> is the regular visual editor preview, which must
    // not pick up targeting overrides from the URL.
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
});
