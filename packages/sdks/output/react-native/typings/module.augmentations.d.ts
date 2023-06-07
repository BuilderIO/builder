declare global {
  interface CSSStyleDeclaration {}

  import X from 'react';
  declare namespace React {
    interface Attributes extends X.Attributes {
      dataSet?: { [key: string]: string };
    }
  }
}

/*~ If your module exports nothing, you'll need this line. Otherwise, delete it */
export {};
