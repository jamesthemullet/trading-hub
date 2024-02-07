import { createMockNextApiRequest } from '@/test/create-mock-next-api-request';
import { createMockNextApiResponse } from '@/test/create-mock-next-api-response';
import healthcheckEndpoint from './healthcheck.page';

describe('Healthcheck endpoint', () => {
  it('should return 200 OK response', () => {
    const req = createMockNextApiRequest();
    const res = createMockNextApiResponse(req);

    healthcheckEndpoint(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ status: 'ok' });
  });
});
