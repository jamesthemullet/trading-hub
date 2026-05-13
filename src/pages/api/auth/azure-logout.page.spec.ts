import { createMockNextApiRequest } from '@/test/create-mock-next-api-request';
import { createMockNextApiResponse } from '@/test/create-mock-next-api-response';

import handler from './azure-logout.page';

describe('azure-logout', () => {
  afterEach(() => {
    delete process.env.AZURE_AD_TENANT_ID;
    delete process.env.NEXTAUTH_URL;
  });

  it('should redirect to / when AZURE_AD_TENANT_ID is not set', () => {
    process.env.NEXTAUTH_URL = 'https://example.com/api/auth';

    const req = createMockNextApiRequest();
    const res = createMockNextApiResponse(req);

    handler(req, res);

    expect(res.redirect).toHaveBeenCalledWith('/');
  });

  it('should redirect to / when NEXTAUTH_URL is not set', () => {
    process.env.AZURE_AD_TENANT_ID = 'test-tenant-id';

    const req = createMockNextApiRequest();
    const res = createMockNextApiResponse(req);

    handler(req, res);

    expect(res.redirect).toHaveBeenCalledWith('/');
  });

  it('should redirect to Azure end-session URL using NEXTAUTH_URL origin', () => {
    process.env.AZURE_AD_TENANT_ID = 'test-tenant-id';
    process.env.NEXTAUTH_URL = 'https://example.com/api/auth';

    const req = createMockNextApiRequest();
    const res = createMockNextApiResponse(req);

    handler(req, res);

    expect(res.redirect).toHaveBeenCalledWith(
      'https://login.microsoftonline.com/test-tenant-id/oauth2/v2.0/logout?post_logout_redirect_uri=https%3A%2F%2Fexample.com'
    );
  });
});
