const { TextEncoder, TextDecoder } = require('node:util');

if (!globalThis.TextEncoder) {
  Object.defineProperties(globalThis, {
    TextDecoder: { value: TextDecoder },
    TextEncoder: { value: TextEncoder },
  });
}

const { Blob, File } = require('node:buffer');
const { fetch, Headers, FormData, Request, Response } = require('undici');

if (!globalThis.fetch) {
  Object.defineProperties(globalThis, {
    fetch: { value: fetch, writable: true },
    Blob: { value: Blob },
    File: { value: File },
    Headers: { value: Headers },
    FormData: { value: FormData },
    Request: { value: Request },
    Response: { value: Response },
    setImmediate: { value: window.setTimeout },
  });
}

if (!globalThis.window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}
