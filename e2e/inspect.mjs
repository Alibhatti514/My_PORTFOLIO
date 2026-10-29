import { chromium } from '@playwright/test';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
});

await page.goto('http://127.0.0.1:5173/', {
  waitUntil: 'domcontentloaded',
});

const result = await page.evaluate(() => {
  const describe = (element) => ({
    tag: element.tagName.toLowerCase(),
    id: element.id || null,
    className:
      typeof element.className === 'string'
        ? element.className.slice(0, 120)
        : null,
    role: element.getAttribute('role'),
    ariaLabel: element.getAttribute('aria-label'),
    text: element.textContent?.trim().slice(0, 100),
    href: element.getAttribute('href'),
  });

  return {
    sections: [...document.querySelectorAll('section')].map(describe),
    headings: [...document.querySelectorAll('h1,h2,h3')].map(describe),
    buttons: [...document.querySelectorAll('button')].map(describe),
    navigation: [...document.querySelectorAll('nav a')].map(describe),
    downloads: [
      ...document.querySelectorAll('a[download],a[href$=".pdf"]'),
    ].map(describe),
    dialogs: [...document.querySelectorAll('[role="dialog"],dialog')].map(
      describe
    ),
  };
});

console.log(JSON.stringify(result, null, 2));

await browser.close();
