import { test, expect } from '@playwright/test';

test.describe('V11 Certificate Wheel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', {
      name: /reading view/i,
    }).click();
  });

  test('all nine numbered certificates can be selected', async ({ page }) => {
    const numbers = Array.from(
      { length: 9 },
      (_, index) => String(index + 1).padStart(2, '0')
    );

    const controls = page.locator('button[aria-pressed]');

    for (const number of numbers) {
      const button = controls.filter({
        hasText: new RegExp(`^${number}$`),
      });

      await expect(button).toHaveCount(1);

      await button.click();

      await expect(button).toHaveAttribute(
        'aria-pressed',
        'true'
      );

      for (const other of numbers) {
        if (other === number) continue;

        const otherButton = controls.filter({
          hasText: new RegExp(`^${other}$`),
        });

        await expect(otherButton).toHaveAttribute(
          'aria-pressed',
          'false'
        );
      }
    }
  });
});
