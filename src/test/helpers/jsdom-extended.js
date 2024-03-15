/* istanbul ignore file */
const JSDOMEnvironment = require('jest-environment-jsdom').default;

class MyJSDOMEnvironment extends JSDOMEnvironment {
  constructor(...args) {
    super(...args);

    this.global.ReadableStream = ReadableStream;
    this.global.TextDecoder = TextDecoder;
    this.global.TextEncoder = TextEncoder;

    this.global.Request = Request;
    this.global.Response = Response;
    this.global.TextEncoder = TextEncoder;
    this.global.TextDecoder = TextDecoder;
    this.global.fetch = fetch;
    this.global.structuredClone = structuredClone;
  }
}

module.exports = MyJSDOMEnvironment;
