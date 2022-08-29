export const getUserAttributes = (attributes: Record<string, string>, cookiePrefix?: string) => {
  let prefix = cookiePrefix || 'builder.userAttributes';
  if (prefix.endsWith('.')) {
    prefix = prefix.slice(0, -1);
  }
  return Object.keys(attributes)
    .filter(key => key.startsWith(prefix))
    .reduce((acc, key) => {
      const value = attributes[key];
      const sanitizedKey = key.split(`${prefix}.`)[1];
      return {
        ...acc,
        ...(typeof value !== 'undefined' && { [sanitizedKey]: value }),
      };
    }, {});
};
