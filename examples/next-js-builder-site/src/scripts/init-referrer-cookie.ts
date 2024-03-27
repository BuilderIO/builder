export const COOKIE_NAME = 'builder.initialReferrer';

export function getQueryParam(url: string, variable: string): string | null {
  const query = url.split('?')[1] || '';
  const vars = query.split('&');
  for (let i = 0; i < vars.length; i++) {
    const pair = vars[i].split('=');
    if (decodeURIComponent(pair[0]) === variable) {
      return decodeURIComponent(pair[1]);
    }
  }
  return null;
}

export function getCookie(name: string) {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    name += '=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieParts = decodedCookie.split(';');
    for (let i = 0; i < cookieParts.length; i++) {
      let cookiePart = cookieParts[i];
      while (cookiePart.charAt(0) === ' ') {
        cookiePart = cookiePart.substring(1);
      }
      if (cookiePart.indexOf(name) === 0) {
        return cookiePart.substring(name.length, cookiePart.length);
      }
    }
  } catch (err) {
    // Not a huge deal, could be sandboxed iframe
    console.warn('Could not get cookie', err);
  }
  return '';
}

export function setCookie(
  cname: string,
  cvalue: string,
  exdays: number,
  otherInfo = '',
) {
  try {
    const date = new Date();
    date.setTime(date.getTime() + exdays * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${cname}=${cvalue};${expires};path=/${otherInfo}`;
  } catch (err) {
    // Not a huge deal, could be sandboxed iframe
    console.warn('Could not set cookie', err);
  }
}

if (process.browser) {
  // TODO: track initial UTM param(s) of some kind too?
  const referrer =
    getQueryParam(location.href, 'ref') || document.referrer || '';

  if (
    referrer &&
    !referrer.match(/https?:\/\/([^\.]+\.)?builder\.io/i) &&
    !getCookie(COOKIE_NAME)
  ) {
    setCookie(COOKIE_NAME, referrer, 365, ';domain=builder.io');
  }
}

export const getReferrerCookie = () => getCookie(COOKIE_NAME);
