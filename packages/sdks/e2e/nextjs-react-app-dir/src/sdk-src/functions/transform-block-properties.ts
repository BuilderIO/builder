export function transformBlockProperties(properties: any) {
  properties.className = properties.class;
  delete properties.class;
  return properties;
}
