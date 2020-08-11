/**
 * RegExp to match field-content in RFC 7230 sec 3.2
 *
 * field-content = field-vchar [ 1*( SP / HTAB ) field-vchar ]
 * field-vchar   = VCHAR / obs-text
 * obs-text      = %x80-FF
 */
const fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;

import { IncomingMessage, ServerResponse } from 'http';
import { getTopLevelDomain } from '../functions/get-top-level-domain';
interface Options {
  secure?: boolean;
  expires?: Date;
}

class Cookies {
  secure?: boolean;

  constructor(private request: IncomingMessage, private response: ServerResponse) {}

  get(name: string) {
    const header = this.request.headers['cookie'] as string;
    if (!header) {
      return;
    }

    const match = header.match(getPattern(name));
    if (!match) {
      return;
    }

    const value = match[1];
    return value;
  }

  set(name: string, value: string, opts: Options) {
    const res = this.response;
    const req = this.request;
    let headers = res.getHeader('Set-Cookie') || [];
    // TODO: just make this always true
    const secure =
      this.secure !== undefined
        ? !!this.secure
        : (req as any).protocol === 'https' || (req.connection as any).encrypted;
    const cookie = new Cookie(name, value, opts);

    if (typeof headers === 'string') {
      headers = [headers];
    }

    if (!secure && opts && opts.secure) {
      throw new Error('Cannot send secure cookie over unencrypted connection');
    }

    cookie.secure = secure;
    if (opts && 'secure' in opts) {
      cookie.secure = !!opts.secure;
    }

    cookie.domain = req.headers.host && getTopLevelDomain(req.headers.host);

    pushCookie(headers, cookie);

    const setHeader = res.setHeader;
    setHeader.call(res, 'Set-Cookie', headers);
    return this;
  }
}

class Cookie {
  path = '/';
  expires?: Date;
  domain: string | undefined = undefined;
  httpOnly = true;
  sameSite?: boolean | string = false;
  secure = false;
  overwrite = false;
  name = '';
  value = '';
  maxAge?: number;

  constructor(name: string, value: string, attrs: Options) {
    if (!fieldContentRegExp.test(name)) {
      throw new TypeError('argument name is invalid');
    }

    if (value && !fieldContentRegExp.test(value)) {
      throw new TypeError('argument value is invalid');
    }

    if (!value) {
      this.expires = new Date(0);
    }

    this.name = name;
    this.value = value || '';

    if (attrs.expires) {
      this.expires = attrs.expires;
    }
    if (attrs.secure) {
      this.secure = attrs.secure;
    }
  }

  toString() {
    return `${this.name}=${this.value}`;
  }

  toHeader() {
    let header = this.toString();

    if (this.maxAge) {
      this.expires = new Date(Date.now() + this.maxAge);
    }
    if (this.path) {
      header += `; path=${this.path}`;
    }
    if (this.expires) {
      header += `; expires=${this.expires.toUTCString()}`;
    }
    if (this.domain) {
      header += `; domain=${this.domain}`;
    }

    // TODO: samesite=none by default (?)
    header += `; SameSite=${this.sameSite === true ? 'strict' : 'None'}`;

    // TODO: On by default
    if (this.secure) {
      header += '; secure';
    }
    if (this.httpOnly) {
      header += '; httponly';
    }

    return header;
  }
}

function getPattern(name: string) {
  return new RegExp(`(?:^|;) *${name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}=([^;]*)`);
}

function pushCookie(headers: any, cookie: Cookie) {
  if (cookie.overwrite) {
    for (let i = headers.length - 1; i >= 0; i--) {
      if (headers[i].indexOf(`${cookie.name}=`) === 0) {
        headers.splice(i, 1);
      }
    }
  }

  headers.push(cookie.toHeader());
}

export default Cookies;
