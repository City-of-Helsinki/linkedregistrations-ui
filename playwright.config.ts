import path from 'path';

import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

export const E2E_TESTS_ENV_URL =
  process.env.E2E_TESTS_ENV_URL ?? 'https://linkedregistrations.dev.hel.ninja/';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e/tests',
  timeout: 180 * 1000,
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['junit', { outputFile: 'report/e2e-junit-results.xml' }],
    ['html', { open: 'never', outputFolder: 'report/html' }],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    actionTimeout: 30 * 1000,
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: E2E_TESTS_ENV_URL,
    ignoreHTTPSErrors: true,
    screenshot: {
      fullPage: true,
      mode: 'only-on-failure',
    },
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    // https://playwright.dev/docs/videos
    video: 'on-first-retry',
    contextOptions: { recordVideo: { dir: './report/videos/' } },
  },

  projects: [
    {
      name: 'logged-out',
      testMatch: [/pages/],
    },
  ],
});
