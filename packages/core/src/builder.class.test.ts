import { Builder } from './builder.class';

describe('Builder', () => {
  test('trustedHosts', () => {
    expect(Builder.isTrustedHost('localhost')).toBe(true);
    expect(Builder.isTrustedHost('builder.io')).toBe(true);
    expect(Builder.isTrustedHost('beta.builder.io')).toBe(true);
    expect(Builder.isTrustedHost('qa.builder.io')).toBe(true);
    expect(Builder.isTrustedHost('123-review-build.beta.builder.io')).toBe(true);
  });

  test('arbitrary builder.io subdomains', () => {
    expect(Builder.isTrustedHost('cdn.builder.io')).toBe(false);
    expect(Builder.isTrustedHost('foo.builder.io')).toBe(false);
    expect(Builder.isTrustedHost('evildomainbeta.builder.io')).toBe(false);
  });

  test('add trusted host', () => {
    expect(Builder.isTrustedHost('example.com')).toBe(false);
    Builder.registerTrustedHost('example.com');
    expect(Builder.isTrustedHost('example.com')).toBe(true);
  });
});
