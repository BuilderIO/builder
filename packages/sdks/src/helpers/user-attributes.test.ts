import { beforeEach, describe, expect, it, vi } from 'vitest';
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

describe('createUserAttributesService', () => {
  let service: ReturnType<typeof createUserAttributesService>;

  beforeEach(() => {
    vi.clearAllMocks();
    service = createUserAttributesService();
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
});
