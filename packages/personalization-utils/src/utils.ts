export const getUserAttributes = (attributes: Record<string, string>) => {
  return Object.keys(attributes)
    .filter(key => key.startsWith('builder.userAttributes'))
    .reduce((acc, key) => {
      const value = attributes[key];
      const sanitizedKey = key.split('builder.userAttributes.')[1];
      return {
        ...acc,
        ...(typeof value === 'string' && { [sanitizedKey]: value }),
      };
    }, {});
};
