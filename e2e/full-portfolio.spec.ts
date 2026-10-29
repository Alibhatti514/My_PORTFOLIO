import { test, expect } from '@playwright/test';

test.describe('Full portfolio E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('hero contains the approved introduction', async ({ page }) => {
    await expect(page.locator('body')).toContainText(
      /Building Digital Experiences/i
    );

    await expect(page.locator('body')).toContainText(
      /Engineering Reliable Solutions/i
    );
  });

  test('About section contains the approved heading', async ({ page }) => {
    await expect(page.locator('body')).toContainText(
      /From Concept to Deployment/i
    );
  });

  test('toolkit includes all six categories', async ({ page }) => {
    const toolkit = page.locator('#content-skills');

    const categories = [
      'All',
      'Languages',
      'Frontend',
      'Backend',
      'Data',
      'Tools',
    ];

    for (const category of categories) {
      await expect(
        toolkit.locator('button').filter({
          hasText: new RegExp(`^${category}$`),
        })
      ).toHaveCount(1);
    }
  });

  test('toolkit filters are interactive', async ({ page }) => {
    const toolkit = page.locator('#content-skills');

    const toolkitLink = page.locator('a[href="#skills"]:visible').first();

    if (await toolkitLink.count() === 0) {
      const menuButton = page.getByRole('button', {
        name: /menu/i,
      });

      await expect(menuButton).toBeVisible();
      await menuButton.click();
    }

    await expect(toolkitLink).toBeVisible();
    await toolkitLink.click();

    const categories = [
      'Languages',
      'Frontend',
      'Backend',
      'Data',
      'Tools',
      'All',
    ];

    for (const category of categories) {
      const button = toolkit.locator('button').filter({
        hasText: new RegExp(`^${category}$`),
      });

      await expect(button).toHaveCount(1);

      await button.click();

      await expect(button).toHaveAttribute(
        'aria-pressed',
        'true'
      );

      for (const other of categories) {
        if (other === category) continue;

        await expect(
          toolkit.locator('button').filter({
            hasText: new RegExp(`^${other}$`),
          })
        ).toHaveAttribute('aria-pressed', 'false');
      }
    }
  });

  test('all three featured projects are present', async ({ page }) => {
    const projects = [
      'RCS CARGO',
      'GOLDADAN',
      'BHABHI THULLA',
    ];

    for (const project of projects) {
      await expect(page.locator('body')).toContainText(
        new RegExp(project, 'i')
      );
    }
  });

  test('credentials heading is present', async ({ page }) => {
    await expect(page.locator('body')).toContainText(
      /Professional Certifications/i
    );
  });

  test('certificate wheel has nine numbered controls', async ({ page }) => {
    const buttons = page.locator('button');

    for (let index = 1; index <= 9; index++) {
      const number = String(index).padStart(2, '0');

      const matches = buttons.filter({
        hasText: new RegExp(`^${number}$`),
      });

      expect(await matches.count()).toBeGreaterThan(0);
    }
  });

  test('certificate inspection control exists', async ({ page }) => {
    await expect(
      page.getByText(/Inspect/i).first()
    ).toBeAttached();
  });

  test('certificate download control exists', async ({ page }) => {
    await expect(
      page.getByText(/Download/i).first()
    ).toBeAttached();
  });

  test('certificate verification control exists', async ({ page }) => {
    await expect(
      page.getByText(/Verify/i).first()
    ).toBeAttached();
  });

  test('certificate library contains the archive link', async ({ page }) => {
    await expect(page.locator('body')).toContainText(
      /Explore all 40 credentials/i
    );
  });

  test('contact heading is present', async ({ page }) => {
    await expect(page.locator('body')).toContainText(
      /Your next idea/i
    );

    await expect(page.locator('body')).toContainText(
      /Built to work/i
    );
  });

  test('both résumé download controls exist', async ({ page }) => {
    await expect(
      page.getByText(/Premium résumé/i).first()
    ).toBeAttached();

    await expect(
      page.getByText(/ATS résumé/i).first()
    ).toBeAttached();
  });

  test('all local PDF links resolve successfully', async ({ page, request }) => {
    const links = await page.locator('a[href]').evaluateAll(elements =>
      elements
        .map(element => element.getAttribute('href'))
        .filter((href): href is string =>
          Boolean(href && href.toLowerCase().includes('.pdf'))
        )
    );

    for (const href of new Set(links)) {
      const response = await request.get(href);
      expect(response.ok(), `PDF failed: ${href}`).toBeTruthy();
    }
  });

  test('internal hash navigation targets exist', async ({ page }) => {
    const hashes = await page.locator('a[href^="#"]').evaluateAll(elements =>
      elements
        .map(element => element.getAttribute('href'))
        .filter((href): href is string =>
          Boolean(href && href.length > 1)
        )
    );

    for (const hash of new Set(hashes)) {
      const exists = await page.evaluate(value => {
        return document.getElementById(
          decodeURIComponent(value.slice(1))
        ) !== null;
      }, hash);

      expect(exists, `Missing hash target: ${hash}`).toBeTruthy();
    }
  });

  test('page has no horizontal overflow', async ({ page }) => {
    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth
    );

    expect(overflow).toBeLessThanOrEqual(2);
  });

  test('all images have alternative text', async ({ page }) => {
    const missing = await page.locator('img').evaluateAll(images =>
      images
        .filter(image => !image.hasAttribute('alt'))
        .map(image => image.outerHTML.slice(0, 200))
    );

    expect(missing).toEqual([]);
  });

  test('no uncaught JavaScript errors during navigation', async ({ page }) => {
    const errors: string[] = [];

    page.on('pageerror', error => errors.push(error.message));

    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });

    await page.waitForTimeout(700);

    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });

    await page.waitForTimeout(700);

    expect(errors).toEqual([]);
  });

  test('reduced motion does not break the page', async ({ page }) => {
    await page.emulateMedia({
      reducedMotion: 'reduce',
    });

    await page.reload();

    await expect(page.locator('h1').first()).toBeVisible();

    await expect(page.locator('body')).toContainText(
      /Professional Certifications/i
    );
  });
});
