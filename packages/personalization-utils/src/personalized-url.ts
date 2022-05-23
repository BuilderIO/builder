import stringify from 'json-stringify-deterministic';

export interface PersonalizedURLOptions {
  pathname: string;
  prefix?: string;
  attributes: Record<string, string>;
  encode?: (str: string) => string;
}

const defaultOptions = {
  decode: (str: string) => {
    return Buffer.from(str, 'base64').toString('utf-8');
  },
  encode: (str: string) => {
    return Buffer.from(str).toString('base64');
  },
  prefix: 'builder',
  attributes: {},
};

export class PersonalizedURL {
  options = defaultOptions;

  constructor(options: PersonalizedURLOptions) {
    this.options = {
      ...defaultOptions,
      ...options,
      attributes: {
        urlPath: options.pathname,
        ...options.attributes,
      },
    };
  }

  rewritePath() {
    const stringified = stringify(this.options.attributes);
    const encoded = this.options.encode(stringified);
    return `/${this.options.prefix}/${encoded}`;
  }

  static fromRewrite(rewrite: string, prefix = 'builder', decode = defaultOptions.decode) {
    const stringified = decode(rewrite);
    const attributes = JSON.parse(stringified);
    return new PersonalizedURL({
      prefix,
      pathname: attributes.urlPath,
      attributes,
    });
  }
}
