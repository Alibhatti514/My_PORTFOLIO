import { test, expect, type Page } from '@playwright/test';

const sectionSelector = '#content-credentials';

async function openReadingView(page: Page) {
  await page.goto('/');

  await page.getByRole('button', {
    name: /reading view/i,
  }).click();

  await expect(page.locator(sectionSelector)).toBeVisible();
}

function selectedNumber(page: Page) {
  return page
    .locator(`${sectionSelector} .featured-index button[aria-pressed="true"]`)
    .innerText();
}

async function expectSelected(page: Page, number: number) {
  const expected = String(number).padStart(2, '0');

  await expect(
    page.locator(
      `${sectionSelector} .featured-index button[aria-pressed="true"]`
    )
  ).toHaveText(expected);
}

test.describe('V11 Certificate Wheel Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await openReadingView(page);
  });

  test('Next and Previous navigate exactly one certificate', async ({
    page,
  }) => {
    await expectSelected(page, 1);

    await page.getByRole('button', {
      name: 'Next credential',
    }).click();

    await expectSelected(page, 2);

    await page.getByRole('button', {
      name: 'Previous credential',
    }).click();

    await expectSelected(page, 1);
  });

  test('Next and Previous wrap around the nine certificates', async ({
    page,
  }) => {
    await expectSelected(page, 1);

    await page.getByRole('button', {
      name: 'Previous credential',
    }).click();

    await expectSelected(page, 9);

    await page.getByRole('button', {
      name: 'Next credential',
    }).click();

    await expectSelected(page, 1);
  });

  test('keyboard arrows navigate certificate selection', async ({
    page,
  }) => {
    const stack = page.locator(
      `${sectionSelector} .certificate-stack`
    );

    await stack.focus();

    await page.keyboard.press('ArrowRight');
    await expectSelected(page, 2);

    await page.keyboard.press('ArrowLeft');
    await expectSelected(page, 1);
  });

  test('Inspect opens the selected certificate preview', async ({
    page,
  }) => {
    await page.getByRole('button', {
      name: 'Inspect ↗',
    }).click();

    const dialog = page.locator('dialog.preview-dialog');

    await expect(dialog).toBeVisible();

    await expect(
      dialog.locator('#preview-title')
    ).not.toBeEmpty();

    await page.getByRole('button', {
      name: 'Close certificate preview',
    }).click();

    await expect(dialog).not.toBeVisible();
  });

  test('Download and Verify match the preview destinations', async ({
    page,
  }) => {
    const section = page.locator(sectionSelector);

    const download = section.locator(
      '.credential-actions a[download]'
    );

    const verify = section.locator(
      '.credential-actions a[target="_blank"]'
    );

    const downloadPath = await download.getAttribute('href');
    const verifyUrl = await verify.getAttribute('href');

    expect(downloadPath).toBeTruthy();
    expect(verifyUrl).toBeTruthy();

    await section
      .locator('.credential-actions button')
      .click();

    const dialog = page.locator('dialog.preview-dialog');

    await expect(dialog).toBeVisible();

    await expect(
      dialog.locator('a[download]')
    ).toHaveAttribute('href', downloadPath!);

    await expect(
      dialog.locator('a[target="_blank"]')
    ).toHaveAttribute('href', verifyUrl!);
  });

  test('wheel exposes valid scroll state', async ({ page }) => {
    const wheel = page.locator(
      `${sectionSelector} .radial-certificates`
    );

    await expect(wheel).toHaveAttribute(
      'data-rotation-mode',
      'reduced'
    );

    const phase = await wheel.getAttribute(
      'data-scroll-phase'
    );

    expect(phase).not.toBeNull();
    expect(Number.isFinite(Number(phase))).toBe(true);
  });
});

test.describe('V11 Certificate Wheel Pointer Gestures', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    await page.locator('#content-credentials').scrollIntoViewIfNeeded();

    await expect(
      page.locator('#content-credentials .certificate-stack')
    ).toBeVisible();

    const first = page.locator(
      '#content-credentials .featured-index button'
    ).first();

    await first.evaluate((button) => {
      (button as HTMLButtonElement).click();
    });

    await expect(first).toHaveAttribute('aria-pressed', 'true');

    await page.waitForTimeout(900);
  });

  test('horizontal pointer gesture advances exactly one certificate', async ({
    page,
  }) => {
    const stack = page.locator(
      '#content-credentials .certificate-stack'
    );

    const selected = page.locator(
      '#content-credentials .featured-index button[aria-pressed="true"]'
    );

    const before = await selected.innerText();

    const box = await stack.boundingBox();
    expect(box).not.toBeNull();

    const x = box!.x + box!.width / 2;
    const y = box!.y + box!.height / 2;

    await page.mouse.move(x + 45, y);
    await page.mouse.down();
    await page.mouse.move(x - 45, y, { steps: 8 });
    await page.mouse.up();

    await expect.poll(async () => selected.innerText()).not.toBe(before);

    const after = await selected.innerText();

    const expected = String(
      (Number(before) % 9) + 1
    ).padStart(2, '0');

    expect(after).toBe(expected);
  });

  test('reverse pointer gesture selects the previous certificate', async ({
    page,
  }) => {
    const stack = page.locator(
      '#content-credentials .certificate-stack'
    );

    const selected = page.locator(
      '#content-credentials .featured-index button[aria-pressed="true"]'
    );

    const before = await selected.innerText();

    const box = await stack.boundingBox();
    expect(box).not.toBeNull();

    const x = box!.x + box!.width / 2;
    const y = box!.y + box!.height / 2;

    await page.mouse.move(x - 45, y);
    await page.mouse.down();
    await page.mouse.move(x + 45, y, { steps: 8 });
    await page.mouse.up();

    await expect.poll(async () => selected.innerText()).not.toBe(before);

    const after = await selected.innerText();

    const expected = String(
      ((Number(before) + 7) % 9) + 1
    ).padStart(2, '0');

    expect(after).toBe(expected);
  });
});


test.describe('V11 Certificate Wheel Mobile Touch', () => {
  test.skip(({ isMobile }) => !isMobile, 'Mobile touch only');

  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    await page.locator('#content-credentials').scrollIntoViewIfNeeded();

    await expect(
      page.locator('#content-credentials .certificate-stack')
    ).toBeVisible();

    const first = page.locator(
      '#content-credentials .featured-index button'
    ).first();

    await first.evaluate((button) => {
      (button as HTMLButtonElement).click();
    });

    await expect(first).toHaveAttribute('aria-pressed', 'true');

    await expect.poll(async () => {
      const offset = await page.locator(
        '#content-credentials .radial-certificates'
      ).getAttribute('data-manual-offset');

      return Number.isFinite(Number(offset));
    }).toBe(true);

    await page.waitForTimeout(1000);
  });

  async function swipe(
    page: import('@playwright/test').Page,
    direction: 'left' | 'right'
  ) {
    const stack = page.locator('#content-credentials .certificate-stack');
    const box = await stack.boundingBox();

    expect(box).not.toBeNull();

    const centerX = box!.x + box!.width / 2;
    const centerY = box!.y + box!.height / 2;

    const distance = Math.min(90, box!.width * 0.3);

    const startX =
      centerX + (direction === 'left' ? distance / 2 : -distance / 2);

    const endX =
      centerX + (direction === 'left' ? -distance / 2 : distance / 2);

    const session = await page.context().newCDPSession(page);

    try {
      await session.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [{ x: startX, y: centerY }],
      });

      for (let step = 1; step <= 8; step++) {
        const x = startX + ((endX - startX) * step) / 8;

        await session.send('Input.dispatchTouchEvent', {
          type: 'touchMove',
          touchPoints: [{ x, y: centerY }],
        });

        await page.waitForTimeout(20);
      }

      await session.send('Input.dispatchTouchEvent', {
        type: 'touchEnd',
        touchPoints: [],
      });
    } finally {
      await session.detach();
    }
  }

  for (const direction of ['left', 'right'] as const) {
    test(`mobile swipe ${direction} changes exactly one certificate`, async ({
      page,
    }) => {
      const selected = page.locator(
        '#content-credentials .featured-index button[aria-pressed="true"]'
      );

      const before = Number(await selected.innerText());

      await swipe(page, direction);

      const expected =
        direction === 'left'
          ? (before % 9) + 1
          : ((before + 7) % 9) + 1;

      await expect(selected).toHaveText(
        String(expected).padStart(2, '0')
      );
    });
  }
});
