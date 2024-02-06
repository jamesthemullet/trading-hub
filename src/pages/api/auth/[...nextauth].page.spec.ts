import { createMockNextApiRequest } from '../../../test/create-mock-next-api-request';
import { createMockNextApiResponse } from '../../../test/create-mock-next-api-response';
import NextAuth from 'next-auth';

import auth, { authOptions, jwtCallback } from './[...nextauth].page';
import mocked = jest.mocked;

jest.mock('next-auth', () => jest.fn());

describe('...NextAuth', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should have empty providers if missing config', async () => {
    delete process.env.AZURE_AD_CLIENT_ID;
    delete process.env.AZURE_AD_CLIENT_SECRET;
    delete process.env.AZURE_AD_TENANT_ID;
    const req = createMockNextApiRequest();
    const res = createMockNextApiResponse(req);
    mocked(NextAuth).mockResolvedValue('nextAuthSuccess');
    const authResult = await auth(req, res);

    expect(authResult).toEqual('nextAuthSuccess');
    const [usedReq, usedRes, config] = mocked(NextAuth).mock.calls[0];

    expect(usedReq).toBe(req);
    expect(usedRes).toBe(res);
    expect(config.providers.length).toBe(0);
  });

  describe('when env vars are set', () => {
    beforeEach(() => {
      process.env.AZURE_AD_CLIENT_ID = 'clientId';
      process.env.AZURE_AD_CLIENT_SECRET = 'clientSecret';
      process.env.AZURE_AD_TENANT_ID = 'tenantId';
    });

    afterEach(() => {
      delete process.env.AZURE_AD_CLIENT_ID;
      delete process.env.AZURE_AD_CLIENT_SECRET;
      delete process.env.AZURE_AD_TENANT_ID;
    });

    it('should call NextAuth with Environnment variables when not passed', async () => {
      const req = createMockNextApiRequest();
      const res = createMockNextApiResponse(req);
      mocked(NextAuth).mockResolvedValue('nextAuthSuccess');
      await auth(req, res);

      const [usedReq, usedRes, config] = mocked(NextAuth).mock.calls[0];

      expect(usedReq).toBe(req);
      expect(usedRes).toBe(res);
      const azureConfig = config.providers[0];
      expect(azureConfig?.options?.clientId).toEqual('clientId');
      expect(azureConfig?.options?.clientSecret).toEqual('clientSecret');
      expect(azureConfig?.options?.tenantId).toEqual('tenantId');
    });

    it('config should provide default env vars', () => {
      const config = authOptions();
      expect(config.providers.length).toEqual(0);
    });
  });

  it('JWT callback should persist Azure AD Token', async () => {
    expect(
      await jwtCallback({
        token: {},
        // eslint-disable-next-line camelcase
        account: { access_token: 'test' },
      } as any)
    ).toEqual({ accessToken: 'test' });

    expect(
      await jwtCallback({
        token: {},
      } as any)
    ).toEqual({});
  });
});
