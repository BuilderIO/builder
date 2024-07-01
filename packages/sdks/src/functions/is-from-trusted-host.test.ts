import { isFromTrustedHost } from './is-from-trusted-host';

describe('isFromTrustedHost', () => {
  test('trustedHosts', () => {
    expect(isFromTrustedHost(undefined, { origin: 'https://localhost' })).toBe(
      true
    );
    expect(isFromTrustedHost(undefined, { origin: 'https://builder.io' })).toBe(
      true
    );
    expect(
      isFromTrustedHost(undefined, { origin: 'https://beta.builder.io' })
    ).toBe(true);
    expect(
      isFromTrustedHost(undefined, { origin: 'https://qa.builder.io' })
    ).toBe(true);
    expect(
      isFromTrustedHost(undefined, {
        origin: 'https://123-review-build.beta.builder.io',
      })
    ).toBe(true);
  });

  test('arbitrary builder.io subdomains', () => {
    expect(
      isFromTrustedHost(undefined, { origin: 'https://cdn.builder.io' })
    ).toBe(false);
    expect(
      isFromTrustedHost(undefined, { origin: 'https://foo.builder.io' })
    ).toBe(false);
    expect(
      isFromTrustedHost(undefined, {
        origin: 'https://evildomainbeta.builder.io',
      })
    ).toBe(false);
  });

  test('add trusted host', () => {
    expect(
      isFromTrustedHost(undefined, { origin: 'https://example.com' })
    ).toBe(false);
    expect(
      isFromTrustedHost(['example.com'], { origin: 'https://example.com' })
    ).toBe(true);
  });

  test('when origin is not a URL', () => {
    expect(isFromTrustedHost(undefined, { origin: 'foo' })).toBe(false);
  });
});
