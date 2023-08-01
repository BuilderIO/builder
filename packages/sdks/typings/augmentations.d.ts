import type { JSX as JSXType } from '@builder.io/mitosis/jsx-runtime';

declare module '@builder.io/mitosis/jsx-runtime' {
  declare namespace JSX {
    declare interface CustomAttributes extends JSXType.CustomAttributes {
      /**
       * Needed to provide data attributes to React Native components
       */
      dataSet?: Record<string, string>;
    }

    declare interface IntrinsicElements {
      template: HTMLAttributes;
    }

    declare interface IntrinsicAttributes {
      id?: string;
      innerHTML?: string;
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-imports
import { ComponentMetadata } from '@builder.io/mitosis';

export module '@builder.io/mitosis' {
  export interface ComponentMetadata {
    plugins?: {
      reactNative?: {
        useScrollView?: boolean;
      };
    };
  }
}
