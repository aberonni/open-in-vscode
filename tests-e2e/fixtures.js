import { test as base, chromium } from '@playwright/test';
import path from 'path';

export const test = base.extend({
  // eslint-disable-next-line no-empty-pattern
  context: async ({ }, use) => {
    const pathToExtension = path.join(process.cwd(), 'src');
    const context = await chromium.launchPersistentContext('', {
      channel: 'chromium',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
        '--allowlisted-extension-id=alfblnhfpeijnmifkfhaejkaagpopbfi',
      ],
    });
    await use(context);
    await context.close();
  },
  extensionId: async ({ context }, use) => {
    // for manifest v3:
    let [serviceWorker] = context.serviceWorkers();
    if (!serviceWorker) serviceWorker = await context.waitForEvent('serviceworker');

    const extensionId = serviceWorker.url().split('/')[2];
    await use(extensionId);
  },
});
export const { expect } = test;
