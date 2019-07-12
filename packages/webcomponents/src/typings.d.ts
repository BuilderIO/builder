declare module '*.json'
declare module '@builder.io/react/dist/preact' {
  var react = require('@builder.io/react')
  export = react
}
declare module '@builder.io/widgets/dist/preact' {
  var react = require('@builder.io/widgets')
  export = react
}
