import NextAuth from 'next-auth';
import AzureADProvider from 'next-auth/providers/azure-ad';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { AuthOptions } from 'next-auth';

export type AuthEnvironment = {
  clientId: string;
  clientSecret: string;
  tenantId: string;
  nextAuthSecret: string;
};

export const jwtCallback: Required<
  Required<AuthOptions>['callbacks']
>['jwt'] = ({ token, account }) => {
  if (account) {
    return Promise.resolve({ ...token, accessToken: account.access_token });
  }
  return Promise.resolve(token);
};

export const authOptions = (
  envSettings: Partial<AuthEnvironment> = {}
): AuthOptions => ({
  providers: [
    ...(envSettings.clientId && envSettings.clientSecret && envSettings.tenantId
      ? [
          AzureADProvider({
            clientId: envSettings.clientId,
            clientSecret: envSettings.clientSecret,
            tenantId: envSettings.tenantId,
          }),
        ]
      : []),
  ],
  callbacks: {
    jwt: jwtCallback,
  },
  secret: envSettings.nextAuthSecret,
});

const auth = (req: NextApiRequest, res: NextApiResponse) => {
  const config = {
    ...(process.env.AZURE_AD_CLIENT_ID &&
    process.env.AZURE_AD_CLIENT_SECRET &&
    process.env.AZURE_AD_TENANT_ID
      ? {
          clientId: process.env.AZURE_AD_CLIENT_ID,
          clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
          tenantId: process.env.AZURE_AD_TENANT_ID,
        }
      : {}),
  };

  return NextAuth(req, res, authOptions(config));
};

export default auth;
