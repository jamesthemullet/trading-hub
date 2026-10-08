import { expect, test as base } from '@playwright/test';
import { encode } from 'next-auth/jwt';

const roles = ['Cat.W', 'Search.W', 'Glob.W'];
const sessionMaxAge = 60 * 60;

export const test = base.extend({
  context: async ({ context }, run, testInfo) => {
    if (testInfo.project.name === 'smoke') {
      const secret = process.env.NEXTAUTH_SECRET;
      if (!secret) {
        throw new Error('NEXTAUTH_SECRET is required for smoke tests.');
      }

      const baseUrl = process.env.E2E_TARGET_URL ?? 'http://localhost:3000';
      const url = new URL(baseUrl);
      const expires = new Date(Date.now() + sessionMaxAge * 1000);
      const sessionToken = await encode({
        secret,
        maxAge: sessionMaxAge,
        token: {
          user: { id: 'playwright', name: 'Playwright test user' },
          roles,
          accessToken: '',
          accessTokenExpires: expires.getTime(),
          refreshToken: '',
        },
      });

      await context.addCookies([
        {
          name:
            url.protocol === 'https:'
              ? '__Secure-next-auth.session-token'
              : 'next-auth.session-token',
          value: sessionToken,
          url: url.origin,
          httpOnly: true,
          secure: url.protocol === 'https:',
          sameSite: 'Lax',
        },
      ]);
    }

    await run(context);
  },
  page: async ({ page }, run, testInfo) => {
    if (!['smoke', 'production'].includes(testInfo.project.name)) {
      await page.route('**/api/auth/session**', (route) =>
        route.fulfill({
          status: 200,
          json: {
            user: { id: 'playwright', name: 'Playwright test user' },
            roles,
            expires: new Date(Date.now() + sessionMaxAge * 1000).toISOString(),
          },
        })
      );
    }

    await run(page);
  },
});

export { expect };
