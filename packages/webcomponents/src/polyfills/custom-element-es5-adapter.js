// Borrowed from @webcomponentsjs but fixed so uglifyjs can run (remove `const` keyword)
// Original source: https://github.com/webcomponents/custom-elements/blob/master/src/native-shim.js
// Issue: https://github.com/webcomponents/webcomponentsjs/issues/749
(function () {
  'use strict';
  (function () {
    if (typeof window === 'undefined') {
      return;
    }
    if (
      void 0 === window.Reflect ||
      void 0 === window.customElements ||
      window.customElements.hasOwnProperty('polyfillWrapFlushCallback')
    )
      return;
    var a = HTMLElement;
    (window.HTMLElement = function () {
      return Reflect.construct(a, [], this.constructor);
    }),
      (HTMLElement.prototype = a.prototype),
      (HTMLElement.prototype.constructor = HTMLElement),
      Object.setPrototypeOf(HTMLElement, a);
  })();
})();
