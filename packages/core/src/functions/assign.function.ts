export function assign(target: object, ...args: any[]) {
  const to = Object(target);

  for (let index = 1; index < arguments.length; index++) {
    const nextSource = arguments[index];

    if (nextSource != null) {
      // Skip over if undefined or null
      for (const nextKey in nextSource) {
        // Avoid bugs when hasOwnProperty is shadowed
        if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
          to[nextKey] = nextSource[nextKey];
        }
      }
    }
  }
  return to;
}
