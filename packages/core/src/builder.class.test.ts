import { Builder } from './builder.class';

describe('Builder', () => {
  test('trustedHosts', () => {
    expect(Builder.isTrustedHost('example.com')).toBe(false);
    expect(Builder.isTrustedHost('localhost')).toBe(true);
    expect(Builder.isTrustedHost('builder.io')).toBe(true);
    expect(Builder.isTrustedHost('123-review-build.beta.builder.io')).toBe(true);
  });
});
