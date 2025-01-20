import { isBrowser } from '../functions/is-browser.js';
import { getCookieSync, setCookie } from './cookie.js';

export interface UserAttributes {
  [key: string]: any;
}

export const USER_ATTRIBUTES_COOKIE_NAME = 'builder.userAttributes';

export function createUserAttributesSubscriber() {
  let canTrack = true;
  const subscribers = new Set<(attrs: UserAttributes) => void>();
  return {
    setUserAttributes(newAttrs: UserAttributes) {
      if (!isBrowser()) {
        return;
      }
      const userAttributes: UserAttributes = {
        ...this.getUserAttributes(),
        ...newAttrs,
      };
      setCookie({
        name: USER_ATTRIBUTES_COOKIE_NAME,
        value: JSON.stringify(userAttributes),
        canTrack,
      });
      subscribers.forEach((callback) => callback(userAttributes));
    },
    getUserAttributes() {
      if (!isBrowser()) {
        return {};
      }
      return JSON.parse(
        getCookieSync({ name: USER_ATTRIBUTES_COOKIE_NAME, canTrack }) || '{}'
      );
    },
    subscribeOnUserAttributesChange(callback: (attrs: UserAttributes) => void) {
      subscribers.add(callback);
      return () => {
        subscribers.delete(callback);
      };
    },
    setCanTrack(value: boolean) {
      canTrack = value;
    },
  };
}

export const userAttributesSubscriber = createUserAttributesSubscriber();

export const setClientUserAttributes = (attributes: UserAttributes) => {
  userAttributesSubscriber.setUserAttributes(attributes);
};
