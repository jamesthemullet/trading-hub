import NextAuth from 'next-auth';
import AzureADProvider from 'next-auth/providers/azure-ad';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { AuthOptions } from 'next-auth';
import { JWT } from 'next-auth/jwt';

export type AuthEnvironment = {
  clientId: string;
  clientSecret: string;
  tenantId: string;
  nextAuthSecret: string;
  dateNow: number;
};

async function refreshAccessToken(token: JWT, envSettings: AuthEnvironment) {
  const url = `https://login.microsoftonline.com/${envSettings.tenantId}/oauth2/v2.0/token`;
  const req = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body:
      `grant_type=refresh_token` +
      `&client_secret=${envSettings.clientSecret}` +
      `&refresh_token=${token.refreshToken}` +
      `&client_id=${envSettings.clientId}` +
      '&response_type=code',
  });
  const refreshedTokens = await req.json();
  return {
    ...token,
    accessToken: refreshedTokens.access_token,
    accessTokenExpires:
      envSettings.dateNow + refreshedTokens.ext_expires_in * 1000,
    refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Fall back to old refresh token
  };
}
/* eslint no-unused-vars: "off" */
export const jwtCallback: (
  envSettings: AuthEnvironment
) => Required<Required<AuthOptions>['callbacks']>['jwt'] =
  (envSettings) =>
  async ({ token, account, user }) => {
    if (account && user && account.access_token) {
      return {
        accessToken: account.access_token,
        accessTokenExpires: envSettings.dateNow + account.ext_expires_in * 1000,
        refreshToken: account.refresh_token,
        user,
      };
    }
    if (envSettings.dateNow < token.accessTokenExpires) {
      return token;
    }
    return refreshAccessToken(token, envSettings);
  };

export const sessionCallback: Required<
  Required<AuthOptions>['callbacks']
>['session'] = ({ session, token }) => {
  if (token) {
    session.user = token.user;
    session.accessTokenExpires = token.accessTokenExpires;
  }

  return session;
};

export const authOptions = (envSettings: AuthEnvironment): AuthOptions => ({
  providers: [
    AzureADProvider({
      clientId: envSettings.clientId,
      clientSecret: envSettings.clientSecret,
      tenantId: envSettings.tenantId,
      authorization: {
        params: {
          scope: `offline_access openid profile email`,
          audience: envSettings.clientId,
        },
      },
    }),
  ],
  callbacks: {
    jwt: jwtCallback(envSettings),
    session: sessionCallback,
  },
  secret: envSettings.nextAuthSecret,
});

const auth = (req: NextApiRequest, res: NextApiResponse) => {
  if (
    process.env.AZURE_AD_CLIENT_ID &&
    process.env.AZURE_AD_CLIENT_SECRET &&
    process.env.AZURE_AD_TENANT_ID &&
    process.env.NEXTAUTH_SECRET
  ) {
    const verifiedConfig: AuthEnvironment = {
      clientId: process.env.AZURE_AD_CLIENT_ID,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
      tenantId: process.env.AZURE_AD_TENANT_ID,
      nextAuthSecret: process.env.NEXTAUTH_SECRET,
      dateNow: Date.now(),
    };
    return NextAuth(req, res, authOptions(verifiedConfig));
  }

  throw new Error('Azure AD environment variables not set.');
};

export default auth;
