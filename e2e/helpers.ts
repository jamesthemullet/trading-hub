export const cookies = [
  {
    name: 'next-auth.session-token.0',
    value: process.env.E2E_SESSION_TOKEN0 || '',
    path: '/',
    domain: 'localhost',
  },
  {
    name: 'next-auth.session-token.1',
    value: process.env.E2E_SESSION_TOKEN1 || '',
    path: '/',
    domain: 'localhost',
  },
  {
    name: 'next-auth.callback-url',
    value: process.env.E2E_CALLBACK_URL || '',
    path: '/',
    domain: 'localhost',
  },
  {
    name: 'next-auth.csrf-token',
    value: process.env.E2E_CSRF_TOKEN || '',
    path: '/',
    domain: 'localhost',
  },
];

export async function setCookieVals() {
  return cookies;
}
