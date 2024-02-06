import type http from 'http';
import { Socket } from 'net';
import type { NextApiRequest } from 'next';

const mockHttp = jest.createMockFromModule<typeof http>('http');

class NextApiRequestWithMocks extends mockHttp.IncomingMessage {
  query: NextApiRequest['query'];
  cookies: NextApiRequest['cookies'];
  body: NextApiRequest['body'];
  env: NextApiRequest['env'];

  initialiseSuperProperties(overrides?: Partial<NextApiRequestWithMocks>) {
    this.headers = overrides?.headers ?? this.headers;
    this.method = overrides?.method ?? this.method;
    this.statusCode = overrides?.statusCode ?? this.statusCode;
    this.statusMessage = overrides?.statusMessage ?? this.statusMessage;
    this.url = overrides?.url ?? this.url;
  }

  constructor(overrides?: Partial<NextApiRequestWithMocks>, socket?: Socket) {
    super(socket ?? new Socket());

    this.query = overrides?.query ?? {};
    this.cookies = overrides?.cookies ?? {};
    this.body = overrides?.body ?? '';
    this.env = overrides?.env ?? {};
    this.initialiseSuperProperties(overrides);
  }
}

export const createMockNextApiRequest = (
  overrides?: Partial<NextApiRequestWithMocks>,
  socket?: Socket
): NextApiRequest => {
  return new NextApiRequestWithMocks(overrides, socket ?? new Socket());
};
