// https://github.com/node-fetch/node-fetch/tree/7b86e946b02dfdd28f4f8fca3d73a022cbb5ca1e#providing-global-access

import fetch, { Headers, Request, Response } from 'node-fetch';

if (typeof globalThis !== 'undefined' && !globalThis.fetch) {
  globalThis.fetch = fetch;
  globalThis.Headers = Headers;
  globalThis.Request = Request;
  globalThis.Response = Response;
}
if (typeof window !== 'undefined' && !window.fetch) {
  window.fetch = fetch;
  window.Headers = Headers;
  window.Request = Request;
  window.Response = Response;
}
if (typeof global !== 'undefined' && !global.fetch) {
  global.fetch = fetch;
  global.Headers = Headers;
  global.Request = Request;
  global.Response = Response;
}
if (typeof self !== 'undefined' && !self.fetch) {
  self.fetch = fetch;
  self.Headers = Headers;
  self.Request = Request;
  self.Response = Response;
}
