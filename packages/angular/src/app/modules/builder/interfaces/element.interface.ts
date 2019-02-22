export interface Element {
  style: Partial<CSSStyleDeclaration>;
  children: Element[];
  text?: string;
  tagName?: string;
}
