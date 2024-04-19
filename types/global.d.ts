declare module '*.yml' {
  const value: import('openapi-types').OpenAPIV3.Document;
  export = value;
}

declare namespace React {
  interface HTMLAttributes<T> {
    inert?: '';
  }
}
