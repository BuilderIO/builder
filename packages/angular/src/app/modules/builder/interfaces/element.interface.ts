export interface Element {
  style: Record<keyof CSSStyleDeclaration, string>;
  children: Element[];
  text?: string;
  tagName?: string;
}
