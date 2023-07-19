export function filterAttrs(
  attrs: { [index: string]: any } = {},
  prefix: string,
  isEvent: boolean
) {
  return Object.keys(attrs)
    .filter((attr) => {
      if (!attrs[attr]) {
        return false;
      }

      const isEventVal = attr.startsWith(prefix);
      return isEvent ? isEventVal : !isEventVal;
    })
    .reduce(
      (acc, attr) => ({
        ...acc,
        [attr.replace(prefix, '')]: attrs[attr],
      }),
      {}
    );
}
