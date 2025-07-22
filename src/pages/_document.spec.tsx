import { logger } from '@/libs/components/logger/logger';

import newrelic from 'newrelic';
import type { DocumentContext } from 'next/document';

import RootDocument from './_document.page';

jest.mock('newrelic', () => ({
  agent: {
    collector: {
      isConnected: jest.fn().mockReturnValue(false),
    },
    on: jest.fn((_, callback) => callback()),
  },
  getBrowserTimingHeader: jest.fn().mockReturnValue('newRelicHeader'),
}));

jest.mock('@/libs/components/logger/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('<RootDocument />', () => {
  let mockedLogger: { info: jest.Mock; error: jest.Mock; warn: jest.Mock };
  let mockedNewrelic: jest.Mocked<typeof newrelic>;

  beforeAll(() => {
    process.env.DYNATRACE_RUM_SCRIPT_URL_DEV = 'https://dev-dynatrace-url.com';
  });

  beforeEach(() => {
    mockedLogger = jest.mocked(logger);
    mockedNewrelic = jest.mocked(newrelic);
    jest.clearAllMocks();
    process.env.NEW_RELIC_APP_NAME = 'app-name';
    process.env.NEW_RELIC_LICENSE_KEY = 'license-key';
    process.env.NEW_RELIC_ENABLED = 'true';
  });

  afterAll(() => {
    delete process.env.DYNATRACE_RUM_SCRIPT_URL_DEV;
  });

  it('should call getInitialProps without errors', async () => {
    // @ts-expect-error for newrelic
    mockedNewrelic.agent.on.mockImplementationOnce((_, callback) => callback());
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
      browserTimingHeader: 'newRelicHeader',
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

  it('should handle newrelic license key secret not being available', async () => {
    delete process.env.NEW_RELIC_APP_NAME;

    const ctx = {
      renderPage: jest.fn(),
      pathname: '/error-test',
      defaultGetInitialProps: jest.fn().mockResolvedValue({
        html: '',
        head: [],
        styles: [],
      }),
    };

    await RootDocument.getInitialProps(ctx as unknown as DocumentContext);

    expect(mockedLogger.warn).toHaveBeenCalledWith(
      'missing new relic env vars'
    );
  });

  it('should handle newrelic app name secret not being available', async () => {
    delete process.env.NEW_RELIC_LICENSE_KEY;

    const ctx = {
      renderPage: jest.fn(),
      pathname: '/error-test',
      defaultGetInitialProps: jest.fn().mockResolvedValue({
        html: '',
        head: [],
        styles: [],
      }),
    };

    await RootDocument.getInitialProps(ctx as unknown as DocumentContext);

    expect(mockedLogger.warn).toHaveBeenCalledWith(
      'missing new relic env vars'
    );
  });

  it('should not initialise new relic if NEW_RELIC_ENABLED is false', async () => {
    process.env.NEW_RELIC_ENABLED = 'false';

    const ctx = {
      renderPage: jest.fn(),
      pathname: '/test',
      defaultGetInitialProps: jest.fn().mockResolvedValue({
        html: '',
        head: [],
        styles: [],
      }),
    };

    await RootDocument.getInitialProps(ctx as unknown as DocumentContext);

    expect(mockedNewrelic.getBrowserTimingHeader).not.toHaveBeenCalled();
  });
});
