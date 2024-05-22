import NextAuth from 'next-auth';

import { createMockNextApiRequest } from '../../../test/create-mock-next-api-request';
import { createMockNextApiResponse } from '../../../test/create-mock-next-api-response';
import auth, { jwtCallback, sessionCallback } from './[...nextauth].page';
import mocked = jest.mocked;
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

jest.mock('next-auth', () => jest.fn());

const refreshToken = jest.fn();

const handlers = [
  http.post('https://login.microsoftonline.com/*', () => {
    return HttpResponse.json({
      access_token: 'access_token',
      ext_expires_in: 123,
      refresh_token: refreshToken(),
    });
  }),
];

const server = setupServer(...handlers);

describe('...NextAuth', () => {
  beforeAll(() => {
    server.listen();
  });

  afterEach(() => {
    server.resetHandlers();
    jest.resetAllMocks();
  });

  afterAll(() => {
    server.close();
  });

  it('should have empty providers if missing config', async () => {
    delete process.env.AZURE_AD_CLIENT_ID;
    delete process.env.AZURE_AD_CLIENT_SECRET;
    delete process.env.AZURE_AD_TENANT_ID;
    const req = createMockNextApiRequest();
    const res = createMockNextApiResponse(req);
    mocked(NextAuth).mockResolvedValue('nextAuthSuccess');

    expect(() => {
      auth(req, res);
    }).toThrow('Azure AD environment variables not set.');
  });

  describe('when env vars are set', () => {
    beforeEach(() => {
      process.env.AZURE_AD_CLIENT_ID = 'clientId';
      process.env.AZURE_AD_CLIENT_SECRET = 'clientSecret';
      process.env.AZURE_AD_TENANT_ID = 'tenantId';
      process.env.NEXTAUTH_SECRET = 'secret';
    });

    afterEach(() => {
      delete process.env.AZURE_AD_CLIENT_ID;
      delete process.env.AZURE_AD_CLIENT_SECRET;
      delete process.env.AZURE_AD_TENANT_ID;
      delete process.env.NEXTAUTH_SECRET;
    });

    it('should call NextAuth with environment variables when not passed', async () => {
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
      expect(azureConfig?.options?.authorization.params.audience).toEqual(
        'clientId'
      );
      expect(azureConfig?.options?.authorization.params.scope).toEqual(
        'offline_access openid profile email clientId/.default'
      );
    });
  });

  describe('jwtCallback', () => {
    it('JWT callback should persist Azure AD Token when initial user and account is provided', async () => {
      const mockAuthEnv = {
        clientId: 'clientId',
        clientSecret: 'client',
        tenantId: 'tenantId',
        nextAuthSecret: 'secret',
        dateNow: 100000,
      };
      expect(
        await jwtCallback(mockAuthEnv)({
          token: undefined as any,
          user: {
            id: 'id',
            email: 'email',
            name: 'name',
          },
          account: {
            access_token: 'access_token',
            refresh_token: 'refresh_token',
            ext_expires_in: 123,
          } as any,
        })
      ).toEqual({
        accessToken: 'access_token',
        accessTokenExpires: 223000,
        refreshToken: 'refresh_token',
        user: {
          email: 'email',
          id: 'id',
          name: 'name',
        },
      });
    });

    it('JWT callback should persist Azure AD Token when just token is provided but not expired', async () => {
      const mockAuthEnv = {
        clientId: 'clientId',
        clientSecret: 'client',
        tenantId: 'tenantId',
        nextAuthSecret: 'secret',
        dateNow: 100000,
      };
      expect(
        await jwtCallback(mockAuthEnv)({
          token: {
            accessTokenExpires: 100001,
          },
        } as any)
      ).toEqual({
        accessTokenExpires: 100001,
      });
    });

    it('JWT callback should persist Azure AD Token when just token is provided and expired, calling refresh', async () => {
      const mockAuthEnv = {
        clientId: 'clientId',
        clientSecret: 'client',
        tenantId: 'tenantId',
        nextAuthSecret: 'secret',
        dateNow: 100000,
      };
      refreshToken.mockReturnValue('refresh_token_value');
      expect(
        await jwtCallback(mockAuthEnv)({
          token: {
            accessTokenExpires: 99999,
          },
        } as any)
      ).toEqual({
        accessToken: 'access_token',
        accessTokenExpires: 223000,
        refreshToken: 'refresh_token_value',
      });
    });

    it('JWT callback should handle fallback case when missing refresh token', async () => {
      const mockAuthEnv = {
        clientId: 'clientId',
        clientSecret: 'client',
        tenantId: 'tenantId',
        nextAuthSecret: 'secret',
        dateNow: 100000,
      };
      refreshToken.mockReturnValue(undefined);
      expect(
        await jwtCallback(mockAuthEnv)({
          token: {
            accessTokenExpires: 99999,
            refreshToken: 'refresh_token_old_value',
          },
        } as any)
      ).toEqual({
        accessToken: 'access_token',
        accessTokenExpires: 223000,
        refreshToken: 'refresh_token_old_value',
      });
    });
  });
});

describe('sessionCallback', () => {
  it('should return session if no token', () => {
    expect(
      sessionCallback({
        session: {} as any,
        token: undefined as any,
      } as any)
    ).toEqual({});
  });

  it('should add expected fields to session but not other', () => {
    const session = {};
    const token = {
      user: {
        id: 'id',
        email: 'email',
        name: 'name',
      },
      accessTokenExpires: 123,
    };
    expect(
      sessionCallback({
        session,
        token,
      } as any)
    ).toEqual({
      user: {
        id: 'id',
        email: 'email',
        name: 'name',
      },
      accessTokenExpires: 123,
    });
  });
});
