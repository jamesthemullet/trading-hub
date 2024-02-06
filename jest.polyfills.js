const { TextEncoder, TextDecoder, ReadableStream } = require('node:util');

if (!globalThis.TextEncoder) {
  Object.defineProperties(globalThis, {
    ReadableStream: { value: ReadableStream },
  });
}

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
  });
}
