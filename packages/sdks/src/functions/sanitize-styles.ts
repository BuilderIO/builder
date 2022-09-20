/**
 * No-op function, sanitize on a per-framework basis by overriding.
 */
export const sanitizeBlockStyles = (
  styles: Partial<CSSStyleDeclaration>
): Partial<CSSStyleDeclaration> => styles;
