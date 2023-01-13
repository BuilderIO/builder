/**
 * Only gets one level up from hostname
 * wwww.example.com -> example.com
 * www.example.co.uk -> example.co.uk
 */
export const getTopLevelDomain = (host: string) => {
  if (host === 'localhost' || host === '127.0.0.1') {
    return host;
  }

  const parts = host.split('.');
  if (parts.length > 2) {
    return parts.slice(1).join('.');
  }
  return host;
};
