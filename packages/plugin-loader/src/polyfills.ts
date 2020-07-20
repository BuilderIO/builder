if (!window.getComputedStyle) {
  (window as any).getComputedStyle = () => ({});
}
if (!document.referrer) {
  (document as any).referrer = '';
}

if (!window.parent) {
  (window as any).parent = window;
}

const originalPostMessage = window.postMessage;
(window as any).postMessage = function (payload: any, targetOrigin: string, transfer: any) {
  if (!targetOrigin || typeof targetOrigin === 'string') {
    return originalPostMessage.call(this, payload, transfer);
  } else {
    return originalPostMessage.apply(this, arguments as any);
  }
};

if (!document.styleSheets) {
  (document as any).styleSheets = [];
}

if (!document.head) {
  (document as any).head = document.body;
}
