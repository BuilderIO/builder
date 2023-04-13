declare module '*.json';

declare module 'preact/debug' {}

declare module '@builder.io/react/dist/preact' {
  const react = require('@builder.io/react');
  export = react;
}
declare module '@builder.io/widgets/dist/preact' {
  const react = require('@builder.io/widgets');
  export = react;
}
