import { isBrowser } from '../functions/is-browser';
import type { CanTrack } from '../types/can-track';
import { logger } from './logger';
import { checkIsDefined } from './nullable';
import { getTopLevelDomain } from './url';
type GetCookieArgs = {
  name: string;
} & CanTrack;
export const getCookieSync = ({
  name,
  canTrack
}: GetCookieArgs): string | undefined => {
  try {
    if (!canTrack) {
      return undefined;
    }

    /**
     * Extracted from MDN docs
     * https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie#example_2_get_a_sample_cookie_named_test2
     */
    return document.cookie.split('; ').find(row => row.startsWith(`${name}=`))?.split('=')[1];
  } catch (err: any) {
    logger.warn('[COOKIE] GET error: ', err?.message || err);
    return undefined;
  }
};
/**
 * NOTE: This function is `async` because its react-native override is async. Do not remove the `async` keyword!
 * The sync version is only safe to use in code blocks that `react-native` is guaranteed not to not run.
 */
export const getCookie = async (args: GetCookieArgs) => getCookieSync(args);
type CookieConfiguration = Array<['expires', string] | ['path', '/'] | ['domain', string] | ['secure', ''] | ['SameSite', 'None'] | [string, string] | []>;
const stringifyCookie = (cookie: CookieConfiguration): string => cookie.map(([key, value]) => value ? `${key}=${value}` : key).filter(checkIsDefined).join('; ');
const SECURE_CONFIG: CookieConfiguration = [['secure', ''], ['SameSite', 'None']];
const createCookieString = ({
  name,
  value,
  expires
}: {
  name: string;
  value: string;
  expires?: Date;
}) => {
  const secure = isBrowser() ? location.protocol === 'https:' : true;
  const secureObj: CookieConfiguration = secure ? SECURE_CONFIG : [[]];

  // TODO: need to know if secure server side
  const expiresObj: CookieConfiguration = expires ? [['expires', expires.toUTCString()]] : [[]];
  const cookieValue: CookieConfiguration = [[name, value], ...expiresObj, ['path', '/'], ['domain', getTopLevelDomain(window.location.hostname)], ...secureObj];
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
  canTrack
}: {
  name: string;
  value: string;
  expires?: Date;
} & CanTrack): Promise<void> => {
  try {
    if (!canTrack) {
      return;
    }
    const cookie = createCookieString({
      name,
      value,
      expires
    });
    document.cookie = cookie;
  } catch (err: any) {
    logger.warn('[COOKIE] SET error: ', err?.message || err);
  }
}