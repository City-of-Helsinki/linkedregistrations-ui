import { expect, test } from '@playwright/test';

test.describe('Frontpage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Hyväksy kaikki evästeet' }).click();
  });

  test('title', async ({ page }) => {
    const pageTitle = await page.title();
    expect(pageTitle).toContain('Valitettavasti etsimääsi sivua ei löydy');
    // expect(pageTitle).toContain("Linked Registrations");
  });
});
