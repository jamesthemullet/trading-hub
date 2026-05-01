import { createMockNextApiRequest } from '@/test/create-mock-next-api-request';
import { createMockNextApiResponse } from '@/test/create-mock-next-api-response';

import healthcheckEndpoint from './healthcheck.page';

describe('Healthcheck endpoint', () => {
  const originalSmokeTestToken = process.env.SMOKE_TEST_TOKEN;

  afterEach(() => {
    if (originalSmokeTestToken === undefined) {
      delete process.env.SMOKE_TEST_TOKEN;
      return;
    }
    process.env.SMOKE_TEST_TOKEN = originalSmokeTestToken;
  });

  it('should return 200 OK response with hasSmokeTestToken false when not set', () => {
    delete process.env.SMOKE_TEST_TOKEN;
    const req = createMockNextApiRequest();
    const res = createMockNextApiResponse(req);

    healthcheckEndpoint(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'ok',
      hasSmokeTestToken: false,
    });
  });

  it('should return hasSmokeTestToken true when SMOKE_TEST_TOKEN is set', () => {
    process.env.SMOKE_TEST_TOKEN = 'Basic c2VhcmNoOnBhc3N3b3Jk';
    const req = createMockNextApiRequest();
    const res = createMockNextApiResponse(req);

    healthcheckEndpoint(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'ok',
      hasSmokeTestToken: true,
    });
  });
});
