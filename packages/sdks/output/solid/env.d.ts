declare global {
  interface ImportMeta {
    env: {
      NODE_ENV: 'production' | 'development';
      PROD: boolean;
      DEV: boolean;
    };
  }
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'production' | 'development';
      PROD: boolean;
      DEV: boolean;
    }
  }
}

declare module 'solid-js' {
  namespace JSX {
    interface IntrinsicAttributes {
      key?: any;
    }
    interface HTMLAttributes {
      key?: any;
    }
  }
}

export {};
