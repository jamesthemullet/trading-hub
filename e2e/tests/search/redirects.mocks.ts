import { ReturnedKeywordRedirect, ReturnedKeywordRedirects } from '@/libs/api';

export const mockRedirectsList: ReturnedKeywordRedirects = {
  redirects: [
    {
      id: '2cf46391-1780-4016-9d20-5fd28b571579',
      type: 'redirectTerm',
      isEnabled: true,
      destinationUrl: '/test/keyword',
      lastChanged: {
        date: '2024-09-27T17:54:08Z',
        user: '',
      },
      keywords: ['word 1', 'word 2'],
    },
  ],
  pagination: {
    totalItems: 6,
  },
};

export const mockRedirect: ReturnedKeywordRedirect = {
  id: '2cf46391-1780-4016-9d20-5fd28b571579',
  type: 'redirectTerm',
  isEnabled: true,
  destinationUrl: '/test/keyword',
  lastChanged: {
    date: '2024-09-27T17:54:08Z',
    user: '',
  },
  keywords: ['word 1', 'word 2'],
};
