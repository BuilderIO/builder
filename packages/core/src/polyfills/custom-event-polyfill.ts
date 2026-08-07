// The generated declaration imports this module, so compile it alongside the SDK.
(function () {
  if (typeof window === 'undefined' || typeof window.CustomEvent === 'function') return false;

  function CustomEvent(event: string, params?: CustomEventInit) {
    params = params || { bubbles: false, cancelable: false, detail: null };
    const evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
    return evt;
  }

  window.CustomEvent = CustomEvent as unknown as typeof window.CustomEvent;
})();
