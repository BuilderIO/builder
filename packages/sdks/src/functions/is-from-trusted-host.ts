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
  const url = new URL(e.origin),
    hostname = url.hostname;

  return (
    (trustedHosts || DEFAULT_TRUSTED_HOSTS).findIndex((trustedHost) =>
      trustedHost.startsWith('*.')
        ? hostname.endsWith(trustedHost.slice(1))
        : trustedHost === hostname
    ) > -1
  );
}
