declare namespace React {
  interface HTMLAttributes {
    innerHTML?: string;
    dataSet?: {
      [key: string]: string;
    };
    css?: Partial<CSSStyleDeclaration> & {
      [index: string]: Partial<CSSStyleDeclaration>;
    };
    class?: string;
  }
}
