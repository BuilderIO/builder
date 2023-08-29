// TODO: pull from builder internal utils
export const fastClone = <T extends object>(obj: T): T => JSON.parse(JSON.stringify(obj));

export const omit = <T extends object>(obj: T, ...values: (keyof T)[]): Partial<T> => {
  const newObject = Object.assign({}, obj);
  for (const key of values) {
    delete (newObject as any)[key];
  }
  return newObject;
};
