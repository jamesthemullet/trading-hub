import type { NextApiRequest, NextApiResponse } from 'next';

const handler = (_req: NextApiRequest, res: NextApiResponse): void => {
  const tenantId = process.env.AZURE_AD_TENANT_ID;
  const nextAuthUrl = process.env.NEXTAUTH_URL;

  if (!tenantId || !nextAuthUrl) {
    res.redirect('/');
    return;
  }

  const postLogoutRedirectUri = encodeURIComponent(new URL(nextAuthUrl).origin);
  const azureLogoutUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/logout?post_logout_redirect_uri=${postLogoutRedirectUri}`;

  res.redirect(azureLogoutUrl);
};

export default handler;
