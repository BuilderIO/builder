export const camelToKebabCase = (str?: string) =>
  str ? str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase() : '';
