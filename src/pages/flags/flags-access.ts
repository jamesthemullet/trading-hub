import type { GetServerSideProps } from 'next';
import { getToken } from 'next-auth/jwt';

const getFlagsAllowedEmails = (): string[] => {
  return (process.env.FLAGS_ALLOWED_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter((email) => email.length > 0);
};

const getTokenEmail = (token: Awaited<ReturnType<typeof getToken>>): string => {
  if (!token || typeof token !== 'object') {
    return '';
  }

  if ('email' in token && typeof token.email === 'string') {
    return token.email.toLowerCase();
  }

  if (
    'user' in token &&
    token.user &&
    typeof token.user === 'object' &&
    'email' in token.user &&
    typeof token.user.email === 'string'
  ) {
    return token.user.email.toLowerCase();
  }

  return '';
};

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const token = await getToken({ req });
  const tokenEmail = getTokenEmail(token);
  const allowedEmails = getFlagsAllowedEmails();
  const hasFlagsAccess = allowedEmails.includes(tokenEmail);

  if (!hasFlagsAccess) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};
