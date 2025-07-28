import { logger } from '@/libs/components/logger/logger';

import type { DocumentContext } from 'next/document';

import RootDocument from './_document.page';

jest.mock('@/libs/components/logger/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('<RootDocument />', () => {
  let mockedLogger: { info: jest.Mock; error: jest.Mock; warn: jest.Mock };

  beforeAll(() => {
    process.env.DYNATRACE_RUM_SCRIPT_URL_DEV = 'https://dev-dynatrace-url.com';
  });

  beforeEach(() => {
    mockedLogger = jest.mocked(logger);
    jest.clearAllMocks();
  });

  afterAll(() => {
    delete process.env.DYNATRACE_RUM_SCRIPT_URL_DEV;
  });

  it('should call getInitialProps without errors', async () => {
    const ctx = {
      renderPage: jest.fn(),
      pathname: '/test',
      defaultGetInitialProps: jest.fn().mockResolvedValue({
        html: '',
        head: [],
        styles: [],
      }),
    };

    const initialProps = await RootDocument.getInitialProps(
      ctx as unknown as DocumentContext
    );

    expect(initialProps).toStrictEqual({
      html: '',
      head: [],
      styles: [],
      dynatraceRumScriptUrl: 'https://dev-dynatrace-url.com',
    });

    expect(mockedLogger.info).toHaveBeenCalledWith(
      'Trading Hub Loaded',
      expect.objectContaining({
        application: 'Trading Hub',
        test: 'Testing logging with Winston',
        pathname: '/test',
      })
    );

    expect(mockedLogger.warn).not.toHaveBeenCalled();
  });
});
