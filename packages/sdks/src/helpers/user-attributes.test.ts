import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { isBrowser } from '../functions/is-browser';
import { getCookieSync, setCookie } from './cookie';
import {
  createUserAttributesService,
  type UserAttributes,
} from './user-attributes';

// Mock dependencies
vi.mock('./cookie', () => ({
  setCookie: vi.fn(),
  getCookieSync: vi.fn().mockReturnValue('{}'),
}));

vi.mock('../functions/is-browser', () => ({
  isBrowser: vi.fn().mockReturnValue(true),
}));

// isBrowser is mocked to true throughout, so a matching window has to exist for the
// Studio override lookup to read location.search from.
const setLocationSearch = (search: string) => {
  vi.stubGlobal('window', { location: { search } });
};

const STUDIO_DATE = '2026-09-25T18:30:00.000Z';
const STUDIO_SEARCH =
  '?builder.preview=BUILDER_STUDIO&builder.userAttributes.date=' + STUDIO_DATE;

describe('createUserAttributesService', () => {
  let service: ReturnType<typeof createUserAttributesService>;

  beforeEach(() => {
    vi.clearAllMocks();
    // clearAllMocks resets call history but not mockReturnValue, so a cookie stubbed
    // by one test would otherwise leak into the next.
    vi.mocked(getCookieSync).mockReturnValue(JSON.stringify({}));
    setLocationSearch('');
    service = createUserAttributesService();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('setUserAttributes', () => {
    it('should set user attributes and notify subscribers', () => {
      const callback = vi.fn();
      service.subscribeOnUserAttributesChange(callback);

      const attributes: UserAttributes = { name: 'John', age: 30 };
      service.setUserAttributes(attributes);

      expect(setCookie).toHaveBeenCalledWith({
        name: 'builder.userAttributes',
        value: JSON.stringify(attributes),
        canTrack: true,
      });
      expect(callback).toHaveBeenCalledWith(attributes);
    });

    it('should merge new attributes with existing ones', () => {
      const existingAttrs = { name: 'John' };
      const newAttrs = { age: 30 };

      vi.mocked(getCookieSync).mockReturnValue(JSON.stringify(existingAttrs));

      vi.mocked(setCookie).mockClear();
      service.setUserAttributes(existingAttrs);
      service.setUserAttributes(newAttrs);

      expect(setCookie).toHaveBeenLastCalledWith({
        name: 'builder.userAttributes',
        value: JSON.stringify({ ...existingAttrs, ...newAttrs }),
        canTrack: true,
      });
    });

    it('should not set attributes when not in browser environment', () => {
      vi.mocked(isBrowser).mockReturnValueOnce(false);

      service.setUserAttributes({ name: 'John' });

      expect(setCookie).not.toHaveBeenCalled();
    });
  });

  describe('getUserAttributes', () => {
    it('should return empty object when not in browser environment', () => {
      vi.mocked(isBrowser).mockReturnValueOnce(false);

      const attributes = service.getUserAttributes();

      expect(attributes).toEqual({});
    });
  });

  describe('subscribeOnUserAttributesChange', () => {
    it('should add and remove subscribers correctly', () => {
      const callback = vi.fn();

      const unsubscribe = service.subscribeOnUserAttributesChange(callback);
      service.setUserAttributes({ name: 'John' });
      service.setUserAttributes({ name: 'Ram' });
      service.setUserAttributes({ name: 'Doe' });

      expect(callback).toHaveBeenCalledTimes(3);

      unsubscribe();
      service.setUserAttributes({ age: 30 });

      expect(callback).toHaveBeenCalledTimes(3);
    });
  });

  describe('setCanTrack', () => {
    it('should update tracking settings', () => {
      service.setCanTrack(false);
      service.setUserAttributes({ name: 'John' });

      expect(setCookie).toHaveBeenCalledWith({
        name: 'builder.userAttributes',
        value: JSON.stringify({ name: 'John' }),
        canTrack: false,
      });
    });
  });

  describe('Studio preview overrides', () => {
    it('merges Studio URL attributes over the cookie so date targeting can be previewed', () => {
      vi.mocked(getCookieSync).mockReturnValue(
        JSON.stringify({ locale: 'en-US' })
      );
      setLocationSearch(STUDIO_SEARCH);

      expect(service.getUserAttributes()).toEqual({
        locale: 'en-US',
        date: STUDIO_DATE,
      });
    });

    it('lets Studio attributes win over the same key in the cookie', () => {
      vi.mocked(getCookieSync).mockReturnValue(
        JSON.stringify({ date: '2020-01-01T00:00:00.000Z' })
      );
      setLocationSearch(STUDIO_SEARCH);

      expect(service.getUserAttributes().date).toBe(STUDIO_DATE);
    });

    it('ignores userAttributes params when the Studio preview flag is absent', () => {
      // A normal visitor can have arbitrary query params; only Studio previews may
      // override targeting, otherwise any URL could spoof a real visitor.
      setLocationSearch('?builder.userAttributes.date=' + STUDIO_DATE);

      expect(service.getUserAttributes()).toEqual({});
    });

    it('never persists Studio overrides into the cookie', () => {
      // Writing preview state to the cookie would leak it into the rest of the
      // browsing session and affect real targeting on subsequent page loads.
      setLocationSearch(STUDIO_SEARCH);

      service.setUserAttributes({ name: 'John' });

      expect(setCookie).toHaveBeenCalledWith({
        name: 'builder.userAttributes',
        value: JSON.stringify({ name: 'John' }),
        canTrack: true,
      });
    });

    it('re-applies Studio overrides when notifying subscribers', () => {
      // A site calling setClientUserAttributes mid-session must not clobber the
      // override the preview is currently displaying.
      setLocationSearch(STUDIO_SEARCH);
      const callback = vi.fn();
      service.subscribeOnUserAttributesChange(callback);

      service.setUserAttributes({ name: 'John' });

      expect(callback).toHaveBeenCalledWith({
        name: 'John',
        date: STUDIO_DATE,
      });
    });
  });
});
