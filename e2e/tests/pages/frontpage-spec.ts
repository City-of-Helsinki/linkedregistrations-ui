import { expect, Page, test } from '@playwright/test';

test.describe('Frontpage', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto('/');
  });

  test('title', async () => {
    const pageTitle = await page.title();
    expect(pageTitle).toContain('Valitettavasti etsimääsi sivua ei löydy');
    // expect(pageTitle).toContain("Linked Registrations");
  });
});
