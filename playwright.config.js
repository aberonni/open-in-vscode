// @ts-check
/**
 * Playwright configuration for running extension integration tests.
 * The extension is loaded via the chromium flags:
 *   --disable-extensions-except <path>
 *   --load-extension <path>
 */
// eslint-disable-next-line import/no-extraneous-dependencies
const { defineConfig, devices } = require('@playwright/test');
const path = require('path');

const extensionPath = path.join(__dirname, 'src');

module.exports = defineConfig({
  testDir: 'tests-e2e',
  timeout: 60 * 1000,
  fullyParallel: false,
  reporter: [['list']],
  use: {
    headless: false, // Extension UI not available in headless currently for Chromium
    locale: 'en-US',
    viewport: { width: 1280, height: 800 },
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium-extension',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        // Launch persistent context with extension
        launchOptions: {
          args: [
            `--disable-extensions-except=${extensionPath}`,
            `--load-extension=${extensionPath}`,
          ],
        },
      },
    },
  ],
});
