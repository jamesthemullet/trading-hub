import '@testing-library/jest-dom';
import failOnConsole from 'jest-fail-on-console';

const { TextDecoder, TextEncoder } = require('node:util');
const {
  ReadableStream,
  WritableStream,
  TransformStream,
} = require('node:stream/web');

Object.defineProperties(globalThis, {
  TextDecoder: { value: TextDecoder },
  TextEncoder: { value: TextEncoder },
  ReadableStream: { value: ReadableStream },
  WritableStream: { value: WritableStream },
  TransformStream: { value: TransformStream },
});

const { Blob, File } = require('node:buffer');

function channelMock() {}
channelMock.prototype.onmessage = function () {};
channelMock.prototype.postMessage = function (data: any) {
  this.onmessage({ data });
};

Object.defineProperties(globalThis, {
  Blob: { value: Blob },
  File: { value: File },
  BroadcastChannel: { value: channelMock },
});

failOnConsole({
  shouldFailOnWarn: false,
});
