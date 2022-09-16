import { isBrowser } from '../functions/is-browser.js';
import { CanTrack } from '../types/can-track.js';
import { getTopLevelDomain } from './url.js';
import { getDocumentCookie, setDocumentCookie } from './document-cookie';

export const getCookie = async ({
  name,
  canTrack,
}: {
  name: string;
} & CanTrack) => {
  try {
    if (!canTrack) {
      return undefined;
    }

    const cookie = await getDocumentCookie();

    /**
     * Extracted from MDN docs
     * https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie#example_2_get_a_sample_cookie_named_test2
     */
    return cookie
      .split('; ')
      .find((row) => row.startsWith(`${name}=`))
      ?.split('=')[1];
  } catch (err) {
    console.debug('[COOKIE] GET error: ', err);
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
  cookie.map(([key, value]) => (value ? `${key}=${value}` : key)).join('; ');

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

export const setCookie = async ({
  name,
  value,
  expires,
  canTrack,
}: {
  name: string;
  value: string;
  expires?: Date;
} & CanTrack) => {
  try {
    if (!canTrack) {
      return undefined;
    }
    const cookie = createCookieString({ name, value, expires });
    await setDocumentCookie(cookie);
  } catch (err) {
    console.warn('[COOKIE] SET error: ', err);
  }
};
