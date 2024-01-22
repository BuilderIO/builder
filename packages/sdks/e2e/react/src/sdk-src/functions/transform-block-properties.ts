export function transformBlockProperties({
  properties,
}: {
  properties: any;
  block: any;
  context: any;
}) {
  properties.className = properties.class;
  delete properties.class;
  return properties;
}
