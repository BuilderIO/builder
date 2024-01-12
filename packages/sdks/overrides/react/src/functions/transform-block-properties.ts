export function transformBlockProperties(properties: any, _context: any) {
  properties.className = properties.class;
  delete properties.class;
  return properties;
}
