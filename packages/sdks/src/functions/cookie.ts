import { isBrowser } from './is-browser';

export function setCookie(name: string, value: string, expires?: Date) {
  try {
    let expiresString = '';

    // TODO: need to know if secure server side
    if (expires) {
      expiresString = '; expires=' + expires.toUTCString();
    }

    const secure = isBrowser() ? location.protocol === 'https:' : true;
    document.cookie =
      name +
      '=' +
      (value || '') +
      expiresString +
      '; path=/' +
      (secure ? '; secure; SameSite=None' : '');
  } catch (err) {
    console.warn('Could not set cookie', err);
  }
}

export function getCookie(name: string) {
  try {
    return (
      decodeURIComponent(
        document.cookie.replace(
          new RegExp(
            '(?:(?:^|.*;)\\s*' +
              encodeURIComponent(name).replace(/[-.+*]/g, '\\$&') +
              '\\s*\\=\\s*([^;]*).*$)|^.*$'
          ),
          '$1'
        )
      ) || null
    );
  } catch (err) {
    console.warn('Could not get cookie', err);
    return null;
  }
}
