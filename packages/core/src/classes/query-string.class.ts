export type StringMap = { [key: string]: string };

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
    const output: any = {};
    const temporaryOutput: any = output;
    for (const k in map) {
      let t = output;
      const parts = k.split('.');
      const key = parts.pop()!;
      while (parts.length) {
        const part = parts.shift()!;
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
