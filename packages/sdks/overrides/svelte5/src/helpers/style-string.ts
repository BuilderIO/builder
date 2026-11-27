/** A style object as an inline `style` string (`{ maxWidth: 10 }` → `max-width:10px;`). */
const UNITLESS = new Set(['flexGrow', 'flexShrink', 'opacity', 'zIndex', 'order', 'lineHeight', 'fontWeight']);

export function styleString(styles: Record<string, unknown> | undefined | null): string {
  let out = '';
  for (const key in styles) {
    const value = styles[key];
    if (value === undefined || value === null || value === '') continue;
    const cssValue = typeof value === 'number' && !UNITLESS.has(key) ? `${value}px` : value;
    const cssKey = key.startsWith('--') ? key : key.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());
    out += `${cssKey}:${cssValue};`;
  }
  return out;
}
