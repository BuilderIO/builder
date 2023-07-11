export const camelToKebabCase = (string: string) =>
  string.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();

export const kebabCaseToCamelCase = (string: string) =>
  string.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
