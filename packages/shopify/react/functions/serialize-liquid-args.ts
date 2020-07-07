export function serializeLiquidArgs(data?: Record<string, any>) {
  const argStrings: string[] = [];
  if (data) {
    for (const key in data) {
      const value = data[key];
      // Key must be just letters, numbers, _
      if (/^[a-z_0-9]+$/i.test(key)) {
        // For now just support boolean, number, string
        if (['boolean', 'number', 'string'].includes(typeof value)) {
          argStrings.push(`${key}: ${JSON.stringify(value)}`);
        }
      }
    }
  }
  return argStrings.join(', ');
}
