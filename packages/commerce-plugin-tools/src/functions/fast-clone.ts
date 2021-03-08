export const fastClone = <T extends object>(obj: T) => JSON.parse(JSON.stringify(obj));
