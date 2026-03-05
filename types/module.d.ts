/* eslint-disable @typescript-eslint/consistent-type-imports */
declare module '*.yml' {
  const value: import('openapi-types').OpenAPIV3.Document;
  export = value;
}

declare module 'xss' {
  type XssOptions = Record<string, unknown>;

  const sanitize: (input: string, options?: XssOptions) => string;

  export default sanitize;
}
