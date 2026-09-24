import { TARGET } from '../constants/target.js';
import { isBrowser } from '../functions/is-browser.js';
import { getCookieSync, setCookie } from './cookie.js';
import { noSerializeWrapper } from './no-serialize-wrapper.js';
import { getStudioUserAttributes } from './studio-user-attributes.js';
export interface UserAttributes {
  [key: string]: any;
}

export const USER_ATTRIBUTES_COOKIE_NAME = 'builder.userAttributes';

export function createUserAttributesService() {
  let canTrack = true;
  const subscribers = new Set<(attrs: UserAttributes) => void>();

  const getCookieUserAttributes = (): UserAttributes => {
    const cookie = getCookieSync({
      name: USER_ATTRIBUTES_COOKIE_NAME,
      canTrack,
    });
    return cookie ? JSON.parse(cookie) : {};
  };

  return {
    setUserAttributes(newAttrs: UserAttributes) {
      if (!isBrowser()) {
        return;
      }
      const userAttributes: UserAttributes = {
        ...getCookieUserAttributes(),
        ...newAttrs,
      };
      setCookie({
        name: USER_ATTRIBUTES_COOKIE_NAME,
        value: JSON.stringify(userAttributes),
        canTrack,
      });
      // Kept out of the cookie above so previewing never persists into a real visitor's
      // session, but re-applied here so the site's own attributes cannot clobber it.
      const studioAttributes = getStudioUserAttributes();
      subscribers.forEach((callback) =>
        callback({ ...userAttributes, ...studioAttributes })
      );
    },
    getUserAttributes() {
      if (!isBrowser()) {
        return {};
      }
      return { ...getCookieUserAttributes(), ...getStudioUserAttributes() };
    },
    subscribeOnUserAttributesChange(
      callback: (attrs: UserAttributes) => void,
      { fireImmediately }: { fireImmediately?: boolean } = {}
    ) {
      subscribers.add(callback);
      if (fireImmediately) {
        callback(this.getUserAttributes());
      }
      return noSerializeWrapper(function () {
        subscribers.delete(callback);
      });
    },
    setCanTrack(value: boolean) {
      canTrack = value;
    },
  };
}

let _userAttributesService: ReturnType<typeof createUserAttributesService>;

if (isBrowser() && TARGET === 'qwik') {
  if (!(window as any).__BUILDER_USER_ATTRIBUTES_SERVICE__) {
    (window as any).__BUILDER_USER_ATTRIBUTES_SERVICE__ =
      createUserAttributesService();
  }
  _userAttributesService = (window as any).__BUILDER_USER_ATTRIBUTES_SERVICE__;
} else {
  _userAttributesService = createUserAttributesService();
}

export const userAttributesService = _userAttributesService;

export const setClientUserAttributes = (attributes: UserAttributes) => {
  userAttributesService.setUserAttributes(attributes);
};
