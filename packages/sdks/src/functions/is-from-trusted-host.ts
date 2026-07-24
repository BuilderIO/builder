const DEFAULT_TRUSTED_HOSTS = [
  '*.beta.builder.io',
  'beta.builder.io',
  'builder.io',
  'localhost',
  'qa.builder.io',
];

export function isFromTrustedHost(
  trustedHosts: string[] | undefined,
  e: { origin: string }
): boolean {
  let url: URL;
  try {
    url = new URL(e.origin);
  } catch {
    return false;
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return false;
  }

  return (
    (trustedHosts || DEFAULT_TRUSTED_HOSTS).findIndex((trustedHost) =>
      trustedHost.startsWith('*.')
        ? url.hostname.endsWith(trustedHost.slice(1))
        : trustedHost === url.hostname
    ) > -1
  );
}
