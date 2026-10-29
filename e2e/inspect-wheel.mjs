import { chromium, devices } from '@playwright/test';

const browser = await chromium.launch();

const page = await browser.newPage({
  ...devices['Desktop Chrome'],
  viewport: { width: 1440, height: 900 },
});

try {
  await page.goto('http://127.0.0.1:5173/');

  // Reading view allows us to inspect controls without 3D movement.
  await page.getByRole('button', {
    name: /reading view/i,
  }).click();

  const result = await page.evaluate(() => {
    const matches = [...document.querySelectorAll('*')]
      .filter(element => {
        const text = element.textContent?.trim() || '';

        return (
          /Professional Certifications/i.test(text) &&
          element.querySelectorAll('button').length >= 9
        );
      })
      .sort(
        (a, b) =>
          a.querySelectorAll('*').length -
          b.querySelectorAll('*').length
      );

    const root = matches[0];

    if (!root) {
      return { error: 'Certificate wheel container not found' };
    }

    const describe = element => ({
      tag: element.tagName.toLowerCase(),
      id: element.id || null,
      className:
        typeof element.className === 'string'
          ? element.className
          : null,
      text: element.textContent?.trim().slice(0, 120),
      ariaLabel: element.getAttribute('aria-label'),
      ariaPressed: element.getAttribute('aria-pressed'),
      href: element.getAttribute('href'),
      title: element.getAttribute('title'),
    });

    return {
      container: describe(root),
      buttons: [...root.querySelectorAll('button')].map(describe),
      links: [...root.querySelectorAll('a')].map(describe),
      headings: [...root.querySelectorAll('h2,h3')].map(describe),
      dialogs: [
        ...document.querySelectorAll('dialog,[role="dialog"]'),
      ].map(describe),
    };
  });

  console.log(JSON.stringify(result, null, 2));
} finally {
  await browser.close();
}
