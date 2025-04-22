declare module '*.yml' {
  const value: import('openapi-types').OpenAPIV3.Document;
  export = value;
}
