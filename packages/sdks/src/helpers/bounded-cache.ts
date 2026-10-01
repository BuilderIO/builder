export const createBoundedCache = <V>(max: number) => {
  const map = new Map<string, V>();
  return {
    get: (key: string): V | undefined => map.get(key),
    set: (key: string, value: V) => {
      if (!map.has(key) && map.size >= max) {
        map.delete(map.keys().next().value as string);
      }
      map.set(key, value);
    },
  };
};
