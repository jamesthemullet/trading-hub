import OpenAPIResponseValidator from 'openapi-response-validator';

import rawApi from '@/libs/api/api.yml';
import { OpenAPIV3 } from 'openapi-types';
import { getMockMapping } from './mocks';
import { NextApiRequest } from 'next';

export const matchPaths = (path1: string) => {
  const path1Segments = path1
    .split('/')
    .filter((segment) => segment.trim() !== '');
  return (path2: string) => {
    const path2Segments = path2
      .split('/')
      .filter((segment) => segment.trim() !== '');
    return (
      path1Segments.length === path2Segments.length &&
      path1Segments.every((segment, index) => {
        if (
          path2Segments[index] === segment ||
          path2Segments[index].startsWith('{')
        ) {
          return true;
        }
        return false;
      })
    );
  };
};

export const printValidationError = (result: {
  message: string;
  errors?: { path: string; message: string }[];
}) => {
  console.error(`ERROR: Following errors found ${result.message}`);
  result.errors?.forEach(
    ({ path, message }: { path: string; message: string }) => {
      console.error(`in ${path}: ${message}`);
    }
  );
};

export const validateAndMockResponse = (
  req: NextApiRequest,
  status: number,
  jsonBody: object
): { error: string } | { updatedJsonBody: object; updatedStatus: number } => {
  const mockMapping = getMockMapping();
  if (!req.url || !req.method) {
    return { error: 'No url or method found in request' };
  }
  const methodToMatch = req.method.toLocaleLowerCase() as
    | 'get'
    | 'post'
    | 'delete';

  const targetURl = req.url.replace('/api', '');
  const url = new URL(targetURl, process.env.MERCHANDISING_API_BASEURL);
  const pathMatcher = matchPaths(url.pathname);

  const responseStatusCodeToMatch = status.toString();

  const resultSchema = Object.entries(rawApi.paths).find(
    ([path]) => pathMatcher(path) === true && rawApi.paths[path] !== undefined
  );

  if (resultSchema !== undefined) {
    const [, schema] = resultSchema;
    const schemaToMatch = schema![methodToMatch]!;

    const responseValidator = new OpenAPIResponseValidator({
      responses: schemaToMatch.responses as unknown as Record<
        string,
        {
          schema: OpenAPIV3.SchemaObject;
        }
      >,
      components: rawApi.components,
    });
    const result = responseValidator.validateResponse(
      responseStatusCodeToMatch,
      jsonBody
    );
    const mockFound = Object.entries(mockMapping).find(
      ([path]) =>
        pathMatcher(path) && mockMapping[path][methodToMatch] !== undefined
    );

    if (result !== undefined) {
      console.warn(
        `WARNING: Response for ${req.method} ${req.url}  was`,
        JSON.stringify(jsonBody, null, 2)
      );
      printValidationError(result);
      if (!mockFound) {
        console.error(
          `ERROR: No mock found for ${req.method} ${req.url}. Terminating...`
        );
        return { error: 'Server API non compatible and no mock found.' };
      } else {
        const [path] = mockFound;
        console.warn(
          `WARNING: Replying with mock for ${req.method} ${req.url}, this should not be used in production`
        );
        const { body: newJsonBody, status: newStatus } = mockMapping[path][
          methodToMatch
        ]!(req, status, jsonBody);
        const newResult = responseValidator.validateResponse(
          responseStatusCodeToMatch,
          newJsonBody
        );
        if (newResult !== undefined) {
          console.warn(
            `WARNING: Mocked response for ${req.method} ${req.url} was`,
            JSON.stringify(newJsonBody, null, 2)
          );
          printValidationError(newResult);
          console.error(
            `ERROR: After applying mock for ${req.method} ${req.url} response is still invalid. Terminating...`
          );
          return { error: 'Mock for server API is invalid.' };
        }
        return { updatedJsonBody: newJsonBody, updatedStatus: newStatus };
      }
    } else if (mockFound) {
      console.warn(
        `WARNING: Mock for ${req.method} ${req.url} found but server response is valid. Please remove mock for ${req.url}`
      );
      const [path] = mockFound;
      const { body: newJsonBody, status: newStatus } = mockMapping[path][
        methodToMatch
      ]!(req, status, jsonBody);
      return { updatedJsonBody: newJsonBody, updatedStatus: newStatus };
    } else {
      return { updatedJsonBody: jsonBody, updatedStatus: status };
    }
  }
  console.error(`ERROR: No path found for ${req.method} ${req.url} in api.yml`);
  return { error: 'Server API non compatible and no mock found.' };
};
