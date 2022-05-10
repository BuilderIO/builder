import stringify from 'json-stringify-deterministic';
import { getUserAttributes } from './utils';

export class PerosonalizedURL {
  prefix = 'builder';
  attributes: Record<string, string>;

  constructor(config: { pathname: string; prefix?: string; attributes: Record<string, string> }) {
    this.prefix = config.prefix || this.prefix;
    this.attributes = {
      urlPath: config.pathname,
      ...getUserAttributes(config.attributes),
    };
  }

  toHash() {
    const stringified = stringify(this.attributes);
    return Buffer.from(stringified).toString('base64');
  }

  rewritePath() {
    return `/${this.prefix}/${this.toHash()}`;
  }

  static fromHash(hash: string, prefix = 'builder') {
    const stringified = Buffer.from(hash, 'base64').toString('utf-8');
    const attributes = JSON.parse(stringified);
    return new PerosonalizedURL({
      prefix,
      pathname: attributes.urlPath,
      attributes,
    });
  }
}
