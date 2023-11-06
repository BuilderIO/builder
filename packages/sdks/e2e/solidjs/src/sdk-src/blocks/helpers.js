function filterAttrs(attrs = {}, prefix, isEvent) {
  const result = {};

  for (const attr in attrs) {
    if (!attrs[attr]) continue;
    if (isEvent && !attr.startsWith(prefix)) continue;
    const eventName = isEvent ? attr.replace(prefix, "") : attr;
    result[eventName] = attrs[attr];
  }

  return result;
}

function setAttrs(node, attrs = {}) {
  const attrKeys = Object.keys(attrs);

  const setup = attr => node.addEventListener(attr, attrs[attr]);

  const teardown = attr => node.removeEventListener(attr, attrs[attr]);

  attrKeys.forEach(setup);
  return {
    update(attrs2 = {}) {
      const attrKeys2 = Object.keys(attrs2);
      attrKeys2.forEach(teardown);
      attrKeys2.forEach(setup);
    },

    destroy() {
      attrKeys.forEach(teardown);
    }

  };
}

export { filterAttrs, setAttrs }