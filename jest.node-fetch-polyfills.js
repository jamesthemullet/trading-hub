const { TextEncoder, TextDecoder } = require('node:util');

if (!globalThis.TextEncoder) {
  Object.defineProperties(globalThis, {
    TextDecoder: { value: TextDecoder },
    TextEncoder: { value: TextEncoder },
  });
}

const { Blob, File } = require('node:buffer');
const nodeFetch = require('node-fetch');

if (!globalThis.fetch) {
  Object.defineProperties(globalThis, {
    fetch: { value: nodeFetch, writable: true },
    Blob: { value: Blob },
    File: { value: File },
    Headers: { value: nodeFetch.Headers },
    Request: { value: nodeFetch.Request },
    Response: { value: nodeFetch.Response },
  });
}
