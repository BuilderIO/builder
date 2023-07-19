export function filterAttrs(
  attrs: { [index: string]: any } = {},
  prefix: string,
  isEvent: boolean
) {
  const eventPrefix = 'v-on:';
  return Object.keys(attrs)
    .filter((attr) => {
      if (!attrs[attr]) {
        return false;
      }

      const isEventVal = attr.startsWith(eventPrefix);
      return isEvent ? isEventVal : !isEventVal;
    })
    .reduce(
      (acc, attr) => ({
        ...acc,
        [attr.replace(eventPrefix, '')]: attrs[attr],
      }),
      {}
    );
}
