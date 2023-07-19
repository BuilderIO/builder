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

/**
 * Svelte SDK: workaround to dynamically provide event handlers to components/elements.
 * https://svelte.dev/repl/1246699e266f41218a8eeb45b9b58b54?version=3.24.1
 */
export function setAttrs(
  node: HTMLElement,
  attrs: Record<string, (event: Event) => void> = {}
) {
  const attrKeys = Object.keys(attrs);

  /**
   *
   * @param {string} attr
   */
  const setup = (attr: string) =>
    node.addEventListener(attr.substr(3), attrs[attr]);

  /**
   *
   * @param {string} attr
   */
  const teardown = (attr: string) =>
    node.removeEventListener(attr.substr(3), attrs[attr]);

  attrKeys.map(setup);

  return {
    update(attrs = {}) {
      const attrKeys = Object.keys(attrs);
      attrKeys.map(teardown);
      attrKeys.map(setup);
    },
    destroy() {
      attrKeys.map(teardown);
    },
  };
}
