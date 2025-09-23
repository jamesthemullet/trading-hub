import type { DocumentContext } from 'next/document';

import RootDocument from './_document.page';

describe('<RootDocument />', () => {
  beforeAll(() => {
    process.env.DYNATRACE_RUM_SCRIPT_URL = 'https://dev-dynatrace-url.com';
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    delete process.env.DYNATRACE_RUM_SCRIPT_URL;
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
  });
});
