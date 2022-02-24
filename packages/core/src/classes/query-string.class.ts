export type StringMap = Record<string, string>;

const PROPERTY_NAME_DENY_LIST = Object.freeze(['__proto__', 'prototype', 'constructor']);

// TODO: unit tests
export class QueryString {
  static parseDeep(queryString: string) {
    const obj = this.parse(queryString);
    return this.deepen(obj);
  }

  static stringifyDeep(obj: any) {
    const map = this.flatten(obj);
    return this.stringify(map);
  }

  static parse(queryString: string): StringMap {
    const query: StringMap = {};
    const pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i].split('=');
      // TODO: node support?
      try {
        query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
      } catch (error) {
        // Ignore malformed URI components
      }
    }
    return query;
  }

  static stringify(map: StringMap) {
    let str = '';
    for (const key in map) {
      if (map.hasOwnProperty(key)) {
        const value = map[key];
        if (str) {
          str += '&';
        }
        str += encodeURIComponent(key) + '=' + encodeURIComponent(value);
      }
    }
    return str;
  }

  static deepen(map: StringMap) {
    // FIXME; Should be type Tree = Record<string, string | Tree>
    // requires a typescript upgrade.
    const output: any = {};
    for (const k in map) {
      let t = output;
      const parts = k.split('.');
      const key = parts.pop()!;
      for (const part of parts) {
        assertAllowedPropertyName(part);
        t = t[part] = t[part] || {};
      }
      t[key] = map[k];
    }
    return output;
  }

  static flatten(obj: any, _current?: any, _res: any = {}): StringMap {
    for (const key in obj) {
      const value = obj[key];
      const newKey = _current ? _current + '.' + key : key;
      if (value && typeof value === 'object') {
        this.flatten(value, newKey, _res);
      } else {
        _res[newKey] = value;
      }
    }

    return _res;
  }
}

function assertAllowedPropertyName(name: string): asserts name {
  if (PROPERTY_NAME_DENY_LIST.indexOf(name) >= 0)
    throw new Error(`Property name "${name}" is not allowed`);
}
