import type { GetServerSidePropsContext } from 'next';
import { getToken } from 'next-auth/jwt';

import { getServerSideProps } from './flags-access';

jest.mock('next-auth/jwt', () => ({
  getToken: jest.fn(),
}));

type TokenResult = Awaited<ReturnType<typeof getToken>>;

describe('flags page getServerSideProps', () => {
  const originalFlagsAllowedEmails = process.env.FLAGS_ALLOWED_EMAILS;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (originalFlagsAllowedEmails === undefined) {
      delete process.env.FLAGS_ALLOWED_EMAILS;
      return;
    }

    process.env.FLAGS_ALLOWED_EMAILS = originalFlagsAllowedEmails;
  });

  it('returns props when token email is in allowlist', async () => {
    process.env.FLAGS_ALLOWED_EMAILS =
      'test.user@marks-and-spencer.com,test.otheruser@marks-and-spencer.com';

    jest.mocked(getToken).mockResolvedValueOnce({
      email: 'test.user@marks-and-spencer.com',
    } as TokenResult);

    const context = {
      req: {},
    } as GetServerSidePropsContext;

    const result = await getServerSideProps(context);

    expect(result).toEqual({ props: {} });
  });

  it('returns props when nested user.email is in allowlist', async () => {
    process.env.FLAGS_ALLOWED_EMAILS = 'test.user@marks-and-spencer.com';

    jest.mocked(getToken).mockResolvedValueOnce({
      user: {
        email: 'test.user@marks-and-spencer.com',
      },
    } as TokenResult);

    const context = {
      req: {},
    } as GetServerSidePropsContext;

    const result = await getServerSideProps(context);

    expect(result).toEqual({ props: {} });
  });

  it('redirects when token email is missing from allowlist', async () => {
    process.env.FLAGS_ALLOWED_EMAILS = 'test.user@marks-and-spencer.com';

    jest.mocked(getToken).mockResolvedValueOnce({
      email: 'someone.else@marks-and-spencer.com',
    } as TokenResult);

    const context = {
      req: {},
    } as GetServerSidePropsContext;

    const result = await getServerSideProps(context);

    expect(result).toEqual({
      redirect: {
        destination: '/',
        permanent: false,
      },
    });
  });

  it('redirects when token is null', async () => {
    process.env.FLAGS_ALLOWED_EMAILS = 'test.user@marks-and-spencer.com';

    jest.mocked(getToken).mockResolvedValueOnce(null);

    const result = await getServerSideProps({
      req: {},
    } as GetServerSidePropsContext);

    expect(result).toEqual({
      redirect: { destination: '/', permanent: false },
    });
  });

  it('redirects when FLAGS_ALLOWED_EMAILS is not set', async () => {
    delete process.env.FLAGS_ALLOWED_EMAILS;

    jest.mocked(getToken).mockResolvedValueOnce({
      email: 'test.user@marks-and-spencer.com',
    } as TokenResult);

    const result = await getServerSideProps({
      req: {},
    } as GetServerSidePropsContext);

    expect(result).toEqual({
      redirect: { destination: '/', permanent: false },
    });
  });

  it('redirects when token has no email or user.email', async () => {
    process.env.FLAGS_ALLOWED_EMAILS = 'test.user@marks-and-spencer.com';

    jest.mocked(getToken).mockResolvedValueOnce({
      sub: 'some-sub',
    } as TokenResult);

    const result = await getServerSideProps({
      req: {},
    } as GetServerSidePropsContext);

    expect(result).toEqual({
      redirect: { destination: '/', permanent: false },
    });
  });
});
