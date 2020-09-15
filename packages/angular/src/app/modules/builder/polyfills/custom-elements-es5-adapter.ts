// Modified from @webcomponentsjs but fixed so uglifyjs can run (remove `const` keyword)
// Original source: https://github.com/webcomponents/custom-elements/blob/master/src/native-shim.js
// Issue: https://github.com/webcomponents/webcomponentsjs/issues/749
if (typeof window !== 'undefined') {
  const anyWindow = window as any;
  if (
    !(
      undefined === anyWindow.Reflect ||
      undefined === anyWindow.customElements ||
      anyWindow.customElements.polyfillWrapFlushCallback
    )
  ) {
    try {
      const ModifiedHTMLElement = HTMLElement;
      // https://github.com/webcomponents/custom-elements/blame/c078ea4201c82551462ccace1ae91e22b576beb8/src/native-shim.js#L37
      const wrapperForTheName = {
        HTMLElement: function HTMLElement() {
          return Reflect.construct(ModifiedHTMLElement, [], this.constructor);
        },
      };
      anyWindow.HTMLElement = wrapperForTheName['HTMLElement'];
      HTMLElement.prototype = ModifiedHTMLElement.prototype;
      HTMLElement.prototype.constructor = HTMLElement;
      Object.setPrototypeOf(HTMLElement, ModifiedHTMLElement);
    } catch (e) {}
  }
}
