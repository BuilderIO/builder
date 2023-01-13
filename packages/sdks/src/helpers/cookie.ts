import { isBrowser } from '../functions/is-browser.js';
import type { CanTrack } from '../types/can-track.js';
import { checkIsDefined } from './nullable.js';
import { getTopLevelDomain } from './url.js';

/**
 * NOTE: This function is `async` because its react-native override is async. Do not remove the `async` keyword!
 */
export const getCookie = async ({
  name,
  canTrack,
}: {
  name: string;
} & CanTrack): Promise<string | undefined> => {
  try {
    if (!canTrack) {
      return undefined;
    }

    /**
     * Extracted from MDN docs
     * https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie#example_2_get_a_sample_cookie_named_test2
     */
    return document.cookie
      .split('; ')
      .find((row) => row.startsWith(`${name}=`))
      ?.split('=')[1];
  } catch (err) {
    console.debug('[COOKIE] GET error: ', err);
    return undefined;
  }
};

type CookieConfiguration = Array<
  | ['expires', string]
  | ['path', '/']
  | ['domain', string]
  | ['secure', '']
  | ['SameSite', 'None']
  | [string, string]
  | []
>;

const stringifyCookie = (cookie: CookieConfiguration): string =>
  cookie
    .map(([key, value]) => (value ? `${key}=${value}` : key))
    .filter(checkIsDefined)
    .join('; ');

const SECURE_CONFIG: CookieConfiguration = [
  ['secure', ''],
  ['SameSite', 'None'],
];

const createCookieString = ({
  name,
  value,
  expires,
}: {
  name: string;
  value: string;
  expires?: Date;
}) => {
  const secure = isBrowser() ? location.protocol === 'https:' : true;

  const secureObj: CookieConfiguration = secure ? SECURE_CONFIG : [[]];

  // TODO: need to know if secure server side
  const expiresObj: CookieConfiguration = expires
    ? [['expires', expires.toUTCString()]]
    : [[]];

  const cookieValue: CookieConfiguration = [
    [name, value],
    ...expiresObj,
    ['path', '/'],
    ['domain', getTopLevelDomain(window.location.hostname)],
    ...secureObj,
  ];
  const cookie = stringifyCookie(cookieValue);

  return cookie;
};

/**
 * NOTE: This function is `async` because its react-native override is async. Do not remove the `async` keyword!
 */
export const setCookie = async ({
  name,
  value,
  expires,
  canTrack,
}: {
  name: string;
  value: string;
  expires?: Date;
} & CanTrack): Promise<void> => {
  try {
    if (!canTrack) {
      return;
    }
    const cookie = createCookieString({ name, value, expires });
    document.cookie = cookie;
  } catch (err) {
    console.warn('[COOKIE] SET error: ', err);
  }
};
