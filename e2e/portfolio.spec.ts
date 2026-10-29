import { test, expect } from '@playwright/test';

test('portfolio loads successfully', async ({ page }) => {
  const response = await page.goto('/');

  expect(response?.status()).toBe(200);

  await expect(page.locator('body')).toBeVisible();
});

test('portfolio has a visible main heading', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('h1').first()).toBeVisible();
});

test('portfolio includes key content', async ({ page }) => {
  await page.goto('/');

  const body = page.locator('body');

  await expect(body).toContainText(/full.stack/i);
  await expect(body).toContainText(/projects/i);
  await expect(body).toContainText(/certificat|credential/i);
  await expect(body).toContainText(/your next idea/i);
});

test('portfolio does not overflow horizontally', async ({ page }) => {
  await page.goto('/');

  const dimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));

  expect(dimensions.documentWidth).toBeLessThanOrEqual(
    dimensions.viewportWidth + 2
  );
});

test('navigation links have valid destinations', async ({ page }) => {
  await page.goto('/');

  const links = page.locator('nav a[href]');

  const count = await links.count();

  expect(count).toBeGreaterThan(0);

  for (let index = 0; index < count; index++) {
    const href = await links.nth(index).getAttribute('href');

    expect(href).toBeTruthy();
    expect(href).not.toBe('#');
  }
});

test('certificate section is present', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByText(/professional certifications/i).first()
  ).toBeAttached();
});

test('contact section is present', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByText(/your next idea/i).first()
  ).toBeAttached();
});

test('no uncaught page errors during initial load', async ({ page }) => {
  const errors: string[] = [];

  page.on('pageerror', error => {
    errors.push(error.message);
  });

  await page.goto('/');

  await page.waitForTimeout(1000);

  expect(errors).toEqual([]);
});
