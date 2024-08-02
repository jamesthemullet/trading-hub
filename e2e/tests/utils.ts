import { Page } from '@playwright/test';

export const create500ErrorsCollector = (page: Page) => {
  const badResponses: string[] = [];
  page.on('response', async (response) => {
    if (response.status() === 500) {
      badResponses.push(
        `${response.url()} ${response.status()} ${response.statusText()}`
      );
    }
  });
  return () => {
    return badResponses;
  };
};
