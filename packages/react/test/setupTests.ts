import { TextDecoder, TextEncoder } from 'util';

// jsdom 19 ships without TextEncoder/TextDecoder, which react-dom/server needs on modern Node.
if (typeof globalThis.TextEncoder === 'undefined') {
  globalThis.TextEncoder = TextEncoder as typeof globalThis.TextEncoder;
  globalThis.TextDecoder = TextDecoder as typeof globalThis.TextDecoder;
}

beforeEach(() => {
  jest.spyOn(global.Math, 'random').mockReturnValue(0.123456789);
});
afterEach(() => {
  jest.spyOn(global.Math, 'random').mockRestore();
});
