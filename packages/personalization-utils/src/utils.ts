export const getUserAttributes = (
  attributes: Record<string, string>,
  cookiePrefix?: string
) => {
  const prefix = cookiePrefix || 'builder.userAttributes';
  return Object.keys(attributes)
    .filter(key => key.startsWith(prefix))
    .reduce((acc, key) => {
      const value = attributes[key];
      const sanitizedKey = key.split(`${prefix}.`)[1];
      return {
        ...acc,
        ...(typeof value === 'string' && { [sanitizedKey]: value }),
      };
    }, {});
};
