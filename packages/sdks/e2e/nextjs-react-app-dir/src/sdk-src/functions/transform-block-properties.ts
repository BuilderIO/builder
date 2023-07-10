export function transformBlockProperties<T>(properties: T) {
  properties.className = properties.class;
  delete properties.class;
  return properties;
}
