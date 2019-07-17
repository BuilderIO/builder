// Modified from @webcomponentsjs but fixed so uglifyjs can run (remove `const` keyword)
// Original source: https://github.com/webcomponents/custom-elements/blob/master/src/native-shim.js
// Issue: https://github.com/webcomponents/webcomponentsjs/issues/749
if (typeof window !== 'undefined') {
  const anyWindow = window as any;
  if (
    !(
      undefined === anyWindow.Reflect ||
      undefined === anyWindow.customElements ||
      anyWindow.customElements.hasOwnProperty('polyfillWrapFlushCallback')
    )
  ) {
    const ModifiedHTMLElement = HTMLElement;
    anyWindow.HTMLElement = function() {
      return Reflect.construct(ModifiedHTMLElement, [], this.constructor);
    };
    HTMLElement.prototype = ModifiedHTMLElement.prototype;
    HTMLElement.prototype.constructor = HTMLElement;
    Object.setPrototypeOf(HTMLElement, ModifiedHTMLElement);
  }
}
