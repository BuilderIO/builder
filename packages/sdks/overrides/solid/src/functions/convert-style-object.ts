const camelCaseToDashCase = (str = '') =>
  str.replace(/[A-Z]/g, (match) => '-' + match.toLowerCase());

export const convertStyleObject = (obj: Partial<CSSStyleDeclaration>) => {
  if (!obj) {
    return obj;
  }
  const newObj = {};
  for (const key in obj) {
    newObj[camelCaseToDashCase(key)] = obj[key];
  }
  return newObj;
};
