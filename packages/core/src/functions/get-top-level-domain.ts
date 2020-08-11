/**
 * Only gets one level up from hostname
 * wwww.example.com -> example.com
 * www.example.co.uk -> example.co.uk
 */
export function getTopLevelDomain(host: string) {
  const parts = host.split('.');
  if (parts.length > 2) {
    return parts.slice(1).join('.');
  }
  return host;
}
