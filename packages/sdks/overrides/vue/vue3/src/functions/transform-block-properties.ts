function classStringToObject(str: string) {
  const obj = {};
  if (typeof str !== 'string') {
    return obj;
  }
  const classNames = str.trim().split(/\\s+/);
  for (const name of classNames) {
    obj[name] = true;
  }
  return obj;
}

export function transformBlockProperties({
  properties,
}: {
  properties: any;
  block: any;
  context: any;
}) {
  properties.class = classStringToObject(properties.class);
  return properties;
}
