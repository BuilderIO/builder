export const getUserAttributes = (
  attributes: Record<string, string>,
  cookiePrefix = 'builder.userAttributes'
) => {
  return Object.keys(attributes)
    .filter(key => key.startsWith(cookiePrefix))
    .reduce((acc, key) => {
      const value = attributes[key];
      const sanitizedKey = key.split(`${cookiePrefix}.`)[1];
      return {
        ...acc,
        ...(typeof value === 'string' && { [sanitizedKey]: value }),
      };
    }, {});
};
