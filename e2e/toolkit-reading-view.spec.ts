import { test, expect } from '@playwright/test';

test('Toolkit filters work in Reading view', async ({ page }) => {
  await page.goto('/');

  const readingView = page.getByRole('button', {
    name: /reading view/i,
  });

  await readingView.click();

  const toolkit = page.locator('#content-skills');

  await expect(toolkit).toBeVisible();

  const categories = [
    'Languages',
    'Frontend',
    'Backend',
    'Data',
    'Tools',
    'All',
  ];

  for (const category of categories) {
    const button = toolkit.getByRole('button', {
      name: category,
      exact: true,
    });

    await button.click();

    await expect(button).toHaveAttribute(
      'aria-pressed',
      'true'
    );

    for (const other of categories) {
      if (other === category) continue;

      await expect(
        toolkit.getByRole('button', {
          name: other,
          exact: true,
        })
      ).toHaveAttribute('aria-pressed', 'false');
    }
  }
});
