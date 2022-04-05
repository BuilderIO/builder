/**
 * Determines if the `s` param can be used as a Liquid variable identifier
 * It must be just letters, numbers, and underscores (`_`)
 */
export function isValidLiquidIdentifier(s: string): boolean {
  // TODO: Reject strings that start with digits
  return /^[a-z_0-9]+$/i.test(s);
}

/**
 * Determines if the `v` param can be used as a Liquid variable value in a variable assignment
 * Currently booleans, numbers and strings are supported
 */
export function canSerializeLiquidValue(v: unknown): boolean {
  return ['boolean', 'number', 'string'].includes(typeof v);
}

export function serializeLiquidArgs(data?: Record<string, any>) {
  const argStrings: string[] = [];
  if (data) {
    for (const key in data) {
      const value = data[key];
      if (isValidLiquidIdentifier(key)) {
        // For now just support boolean, number, string
        if (canSerializeLiquidValue(value)) {
          const json = JSON.stringify(
            typeof value === 'string' ? value.replace(/"/g, '&quot;') : value
          );
          argStrings.push(`${key}: ${json}`);
        }
      }
    }
  }
  return argStrings.join(', ');
}

/**
 * From a mapping of `keys` -> `scalars`, generates a series of `assign`/`capture`
 * Liquid tags to be used later with a `render/include` tag. For example:
 *
 * ```
 * {% assign boolean_arg = true %}
 * {% assign number_arg = 5 %}
 * {% capture string_arg %}
 * Some text here, maybe with HTML code
 * {% endcapture %}
 * ```
 *
 * This code will be available in the `assignments` field of the return value.
 * The other field, `renderArgs`, will contain a parameter list of these `keys`,
 * ready to be used as part of a `{% render %}`/`{% include %}` invocation.
 *
 * Capture is arguably better for strings to properly handle multiline strings, HTML quotes, etc.
 */
export function generateLiquidAssignCaptureTags(
  data?: Record<string, any>,
  scopePrefix: string = ''
): {
  renderArgs: string;
  assignments: string;
} {
  const args = Object.entries(data || {}).filter(
    ([argName, value]) => isValidLiquidIdentifier(argName) && canSerializeLiquidValue(value)
  );

  function withPrefix(argName: string): string {
    return `${scopePrefix}_${argName}`;
  }

  return {
    assignments: args.length
      ? args
          .map(([argName, value]) => {
            if (typeof value === 'string' && value) {
              return `{% capture ${withPrefix(argName)} %}${value}{% endcapture %}`;
            }

            return `{% assign ${withPrefix(argName)} = ${JSON.stringify(value)} %}`;
          })
          .join('\n')
      : '',
    renderArgs: args.length
      ? args.map(([argName]) => `${argName}: ${withPrefix(argName)}`).join(', ')
      : '',
  };
}
