/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
  id: string;
}

declare module '*.png' {
  const value: string;
  export = value;
}

declare module '@builder.io/react/dist/preact' {
  var react = require('@builder.io/react')
  export = react
}

declare module 'cookies';
