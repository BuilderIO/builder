export function filterAttrs(attrs: {
  [index: string]: any;
} = {}, prefix: string, isEvent: boolean) {
  const result: typeof attrs = {};
  for (const attr in attrs) {
    if (!attrs[attr]) continue;
    if (isEvent && !attr.startsWith(prefix)) continue;
    const eventName = isEvent ? attr.replace(prefix, '') : attr;
    result[eventName] = attrs[attr];
  }
  return result;
}

/**
 * Svelte SDK: workaround to dynamically provide event handlers to components/elements.
 * https://svelte.dev/repl/1246699e266f41218a8eeb45b9b58b54?version=3.24.1
 */
export function setAttrs(node: HTMLElement, attrs: Record<string, (event: Event) => void> = {}) {
  const attrKeys = Object.keys(attrs);

  /**
   *
   * @param {string} attr
   */
  const setup = (attr: string) => node.addEventListener(attr, attrs[attr]);

  /**
   *
   * @param {string} attr
   */
  const teardown = (attr: string) => node.removeEventListener(attr, attrs[attr]);
  attrKeys.forEach(setup);
  return {
    update(attrs = {}) {
      const attrKeys = Object.keys(attrs);
      attrKeys.forEach(teardown);
      attrKeys.forEach(setup);
    },
    destroy() {
      attrKeys.forEach(teardown);
    }
  };
}