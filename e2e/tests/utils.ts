import type { Page } from '@playwright/test';

export const create500ErrorsCollector = (page: Page) => {
  let badResponses: string[] = [];
  page.on('response', async (response) => {
    if (response.status() === 500) {
      badResponses = [
        ...badResponses,
        `${response.url()} ${response.status()} ${response.statusText()}`,
      ];
    }
  });
  return () => {
    return badResponses;
  };
};
