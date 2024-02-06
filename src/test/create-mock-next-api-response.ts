import type { IncomingMessage } from 'http';
import type http from 'http';
import type { NextApiResponse } from 'next';

const mockHttp = jest.createMockFromModule<typeof http>('http');

class NextApiResponseWithMocks extends mockHttp.ServerResponse {
  send = jest.fn().mockReturnThis();
  json = jest.fn().mockReturnThis();
  status = jest.fn().mockReturnThis();
  redirect = jest.fn().mockReturnThis();
  setPreviewData = jest.fn().mockReturnThis();
  clearPreviewData = jest.fn().mockReturnThis();
  unstable_revalidate = jest.fn().mockReturnThis();
  revalidate = jest.fn().mockReturnThis();
  setDraftMode = jest.fn().mockReturnThis();
}

export const createMockNextApiResponse = (
  res: IncomingMessage
): NextApiResponse => {
  return new NextApiResponseWithMocks(res);
};
