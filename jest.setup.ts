import '@testing-library/jest-dom';
import { createSerializer, matchers } from '@emotion/jest';

expect.addSnapshotSerializer(createSerializer());

expect.extend(matchers);

const { TextDecoder, TextEncoder } = require('node:util');

Object.defineProperties(globalThis, {
  TextDecoder: { value: TextDecoder },
  TextEncoder: { value: TextEncoder },
});

const { Blob, File } = require('node:buffer');

Object.defineProperties(globalThis, {
  Blob: { value: Blob },
  File: { value: File },
});
