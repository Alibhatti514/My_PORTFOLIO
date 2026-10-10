import { chromium } from 'playwright';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

// QA_URL=http://127.0.0.1:4173 node scripts/icon-controls-qa.mjs
// This focused suite writes only docs/qa-icons; the original gallery/report is untouched.
const baseURL = process.env.QA_URL || 'http://127.0.0.1:4173';
const output = path.join(process.cwd(), 'docs/qa-icons');
const screenshotDir = path.join(output, 'screenshots');
const report = {
  timestamp: new Date().toISOString(), baseURL,
  environment: { platform: process.platform, arch: process.arch, node: process.version },
  assertions: [], screenshots: [], motionSamples: [], pageErrors: [], consoleErrors: [], requestFailures: [],
  limitations: [
    'Local headless Google Chrome with desktop and mobile viewport sizes; physical touch devices are not covered.',
    'Animation is verified from sampled SVG geometry and computed transforms, not inferred solely from event handlers.',
  ],
};
const hash = (data) => createHash('sha256').update(data).digest('hex');
let browser;

function check(name, pass, detail = null) {
  report.assertions.push({ name, pass: Boolean(pass), detail });
  console.log(`${pass ? 'PASS' : 'FAIL'} ${name}${!pass && detail !== null ? ` — ${JSON.stringify(detail)}` : ''}`);
}
async function attempt(name, work) {
  try { await work(); } catch (error) { check(name, false, error.message); }
}
function observe(page) {
  page.on('pageerror', (error) => report.pageErrors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') report.consoleErrors.push(message.text()); });
  page.on('requestfailed', (request) => {
    if (request.failure()?.errorText !== 'net::ERR_ABORTED') report.requestFailures.push({ url: request.url(), error: request.failure()?.errorText });
  });
}
async function ready(page) {
  await page.waitForFunction(() => window.__portfolio?.ready === true, undefined, { timeout: 25_000 });
  await page.evaluate(() => document.fonts.ready);
  await page.locator('.icon-control .animated-icon svg').first().waitFor({ state: 'attached' });
  await page.waitForTimeout(400);
}
async function openPage(context) {
  const page = await context.newPage(); observe(page); page.setDefaultTimeout(10_000);
  await page.goto(baseURL, { waitUntil: 'networkidle' }); await ready(page); return page;
}
async function move(page, index) {
  await page.evaluate((chapter) => window.scrollTo({ top: Math.max(innerHeight, 560) * 1.25 * chapter, behavior: 'instant' }), index);
  await page.waitForFunction((chapter) => window.__portfolio?.chapter === chapter, index);
  await page.waitForTimeout(350);
}
async function waitChapter(page, index) {
  await page.waitForFunction((chapter) => window.__portfolio?.chapter === chapter, index);
  await page.waitForTimeout(500);
}
async function shot(page, name) {
  await page.screenshot({ path: path.join(screenshotDir, name), animations: 'disabled' });
  report.screenshots.push(`screenshots/${name}`);
}
async function keyboardFocus(page, control) {
  await page.keyboard.press('Tab');
  await control.focus();
  return control.evaluate((element) => {
    const css = getComputedStyle(element);
    return { focused: document.activeElement === element, visible: element.matches(':focus-visible'),
      outline: css.outlineStyle, outlineWidth: css.outlineWidth, outlineColor: css.outlineColor };
  });
}
async function layout(page, name) {
  const measurements = await page.evaluate(() => {
    const controls = [...document.querySelectorAll('.icon-control')].filter((element) => {
      const css = getComputedStyle(element); const rect = element.getBoundingClientRect();
      return css.visibility !== 'hidden' && css.display !== 'none' && rect.width && rect.height && !element.closest('[inert]');
    });
    return { viewport: { width: innerWidth, height: innerHeight }, scrollWidth: document.documentElement.scrollWidth,
      controls: controls.map((element) => ({ text: element.textContent.trim(), label: element.getAttribute('aria-label'),
        rect: element.getBoundingClientRect().toJSON(), icon: element.querySelector('.animated-icon')?.getAttribute('data-icon') })) };
  });
  check(`${name}: no horizontal overflow`, measurements.scrollWidth <= measurements.viewport.width + 1, measurements);
  check(`${name}: visible icon controls stay inside viewport`, measurements.controls.every(({ rect }) =>
    rect.left >= -1 && rect.right <= measurements.viewport.width + 1 && rect.top >= -1 && rect.bottom <= measurements.viewport.height + 1), measurements.controls);
  return measurements;
}

async function animatedSample(page, selector, iconName, trigger, reduced, name) {
  const control = page.locator(selector).first();
  const icon = control.locator(`.animated-icon[data-icon="${iconName}"]`);
  check(`${name}: expected ${iconName} SVG installed`, await icon.locator('svg').count() === 1);
  await page.mouse.move(2, 2);
  await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
  await page.waitForTimeout(950);
  const controls = await control.boundingBox(); const iconBounds = await icon.boundingBox();
  const pending = icon.evaluate(async (element) => {
    const states = []; const started = performance.now();
    const snapshot = () => [element, ...element.querySelectorAll('svg,g,path,polyline,line,circle,rect')].map((node) => {
      const css = getComputedStyle(node);
      return { tag: node.tagName, transform: css.transform, translate: css.translate, scale: css.scale,
        rotate: css.rotate, opacity: css.opacity, dash: css.strokeDasharray, offset: css.strokeDashoffset,
        geometry: ['transform', 'd', 'x', 'y', 'x1', 'x2', 'y1', 'y2', 'points', 'pathLength'].map((attribute) => node.getAttribute(attribute)) };
    });
    await new Promise((resolve) => {
      function sample(time) {
        const control = element.closest('.icon-control'); const css = control ? getComputedStyle(control) : null;
        states.push({ elapsedMs: time - started, state: snapshot(), controlTransform: css ?
          { transform: css.transform, translate: css.translate, scale: css.scale, rotate: css.rotate } : null });
        if (time - started < 1000) requestAnimationFrame(sample); else resolve();
      }
      requestAnimationFrame(sample);
    });
    return states;
  });
  await page.waitForTimeout(65);
  let triggerDetails;
  if (trigger === 'hover') {
    const candidates = [{ x: 3, y: controls.height / 2 }, { x: controls.width - 3, y: controls.height / 2 }];
    const point = candidates.find(({ x, y }) => {
      const globalX = controls.x + x; const globalY = controls.y + y;
      return globalX < iconBounds.x || globalX > iconBounds.x + iconBounds.width || globalY < iconBounds.y || globalY > iconBounds.y + iconBounds.height;
    }) || candidates[0];
    await control.hover({ position: point });
    triggerDetails = { point, control: controls, icon: iconBounds,
      outsideSVG: controls.x + point.x < iconBounds.x || controls.x + point.x > iconBounds.x + iconBounds.width };
    if (controls.width > iconBounds.width + 8) check(`${name}: hover targets the whole control outside icon`, triggerDetails.outsideSVG, triggerDetails);
  } else {
    triggerDetails = await keyboardFocus(page, control);
    check(`${name}: keyboard focus reaches control`, triggerDetails.focused && triggerDetails.visible, triggerDetails);
  }
  const frames = await pending;
  const unique = new Set(frames.map((frame) => JSON.stringify(frame.state))).size;
  const uniqueControl = new Set(frames.map((frame) => JSON.stringify(frame.controlTransform))).size;
  const result = { name, trigger, reduced, frames: frames.length, uniqueSVGStates: unique, uniqueControlTransforms: uniqueControl, triggerDetails,
    first: frames[0], differing: frames.find((frame) => JSON.stringify(frame.state) !== JSON.stringify(frames[0].state)), last: frames.at(-1) };
  report.motionSamples.push(result);
  check(`${name}: ${reduced ? 'reduced motion keeps SVG static' : 'SVG actually animates'}`, reduced ? unique === 1 : unique > 1,
    { frames: frames.length, uniqueSVGStates: unique });
  if (reduced) check(`${name}: reduced motion also suppresses control CSS movement`, uniqueControl === 1, { uniqueControlTransforms: uniqueControl });
}

async function motionSet(page, reduced, prefix) {
  await move(page, 1);
  for (const [selector, iconName] of [['.header-resume', 'download'], ['.next-chapter', 'down'], ['.previous-chapter', 'up']]) {
    for (const trigger of ['hover', 'focus']) {
      await animatedSample(page, selector, iconName, trigger, reduced, `${prefix} ${iconName} ${trigger}`);
    }
  }
  await move(page, 0);
  await animatedSample(page, '.scroll-cue', 'down', 'hover', reduced, `${prefix} hero scroll hover`);
  await animatedSample(page, '.scroll-cue', 'down', 'focus', reduced, `${prefix} hero scroll focus`);
}

async function resumeDownload(page, selector, name) {
  const manifest = JSON.parse(await readFile(path.join(process.cwd(), 'docs/asset-manifest.json'), 'utf8'));
  const source = manifest.find((asset) => asset.path === '/assets/Resume_Ali_ejaz.pdf');
  const original = await readFile(source.verifiedUpstreamPath);
  const control = page.locator(selector).first();
  check(`${name}: exact download label`, (await control.textContent()).trim().replace(/\s+/g, ' ') === 'DOWNLOAD RÉSUMÉ');
  check(`${name}: original resume href and download attribute`, await control.getAttribute('href') === '/assets/Resume_Ali_ejaz.pdf' && await control.getAttribute('download') !== null);
  const focus = await keyboardFocus(page, control);
  check(`${name}: visible keyboard focus`, focus.focused && focus.visible && focus.outline !== 'none' && parseFloat(focus.outlineWidth) > 0, focus);
  const pending = page.waitForEvent('download'); await page.keyboard.press('Enter');
  const download = await pending; const actual = await readFile(await download.path());
  check(`${name}: Enter downloads unchanged original PDF`, hash(actual) === hash(original) && hash(actual) === source.sha256,
    { bytes: actual.length, sha256: hash(actual), filename: download.suggestedFilename() });
}

async function navigation(page, prefix) {
  await move(page, 0);
  const previous = page.getByRole('button', { name: 'Previous chapter', exact: true });
  const next = page.getByRole('button', { name: 'Next chapter', exact: true });
  check(`${prefix}: Previous disabled on hero`, await previous.isDisabled());
  const focus = await keyboardFocus(page, next);
  check(`${prefix}: Next receives visible keyboard focus`, focus.focused && focus.visible && focus.outline !== 'none', focus);
  await page.keyboard.press('Enter'); await waitChapter(page, 1);
  check(`${prefix}: Next Enter advances one chapter`, await page.evaluate(() => window.__portfolio.chapter === 1 && location.hash === '#code'));
  await previous.focus(); await page.keyboard.press('Space'); await waitChapter(page, 0);
  check(`${prefix}: Previous Space returns one chapter`, await page.evaluate(() => window.__portfolio.chapter === 0 && location.hash === '#human'));
  await page.locator('.scroll-cue').focus(); await page.keyboard.press('Space'); await waitChapter(page, 1);
  check(`${prefix}: Hero scroll cue Space enters code`, await page.evaluate(() => window.__portfolio.chapter === 1 && location.hash === '#code'));
  await move(page, 12);
  await previous.focus(); await page.keyboard.press('Enter'); await waitChapter(page, 11);
  check(`${prefix}: Previous Enter moves from contact to education`, await page.evaluate(() => location.hash === '#education'));
  await move(page, 12);
  const start = page.getByRole('button', { name: 'Return to the beginning', exact: true });
  await start.focus(); await page.keyboard.press('Space'); await waitChapter(page, 0);
  check(`${prefix}: End control Space returns to beginning`, await page.evaluate(() => location.hash === '#human'));
}

await mkdir(screenshotDir, { recursive: true });
try {
  browser = await chromium.launch({ channel: 'chrome', executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
  report.environment.browserVersion = browser.version();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, acceptDownloads: true, reducedMotion: 'no-preference' });
  const page = await openPage(context);
  await layout(page, 'Desktop hero'); await shot(page, 'desktop-hero.png');
  await attempt('Desktop keyboard navigation', () => navigation(page, 'Desktop'));
  await move(page, 0);
  await keyboardFocus(page, page.locator('.header-resume')); await shot(page, 'desktop-resume-focus.png');
  await attempt('Header resume download', () => resumeDownload(page, '.header-resume', 'Desktop header résumé'));
  await move(page, 12);
  await layout(page, 'Desktop contact'); await shot(page, 'desktop-connect.png');
  await attempt('Contact resume download', () => resumeDownload(page, '.contact-bottom .resume-link', 'Desktop contact résumé'));
  await attempt('Full-motion SVG interactions', () => motionSet(page, false, 'Full motion'));

  await attempt('Manual reduced-motion interactions', async () => {
    await page.getByRole('button', { name: 'Open chapters', exact: true }).click();
    const dialog = page.locator('dialog[open]');
    await dialog.getByRole('button', { name: /^Motion: full/ }).click();
    await dialog.getByRole('button', { name: 'Close chapters', exact: true }).click();
    await page.waitForTimeout(500);
    check('Manual reduced-motion state enabled', await page.locator('.reduced-motion').count() > 0);
    await motionSet(page, true, 'Manual reduced motion');
    await shot(page, 'desktop-manual-reduced-motion.png');
  });
  await context.close();

  const reduced = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const reducedPage = await openPage(reduced);
  check('System reduced-motion media preference enabled', await reducedPage.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches));
  await attempt('System reduced-motion SVG interactions', () => motionSet(reducedPage, true, 'System reduced motion'));
  await shot(reducedPage, 'desktop-system-reduced-motion.png');
  await reduced.close();

  for (const viewport of [{ width: 390, height: 844 }, { width: 375, height: 812 }]) {
    const mobile = await browser.newContext({ viewport, deviceScaleFactor: 1, acceptDownloads: true });
    const mobilePage = await openPage(mobile); const prefix = `${viewport.width}x${viewport.height}`;
    await layout(mobilePage, `${prefix} hero`); await shot(mobilePage, `mobile-${prefix}-hero.png`);
    await attempt(`${prefix} keyboard navigation`, () => navigation(mobilePage, prefix));
    await move(mobilePage, 1);
    await keyboardFocus(mobilePage, mobilePage.locator('.previous-chapter')); await shot(mobilePage, `mobile-${prefix}-focus.png`);
    await move(mobilePage, 12);
    await layout(mobilePage, `${prefix} contact`); await shot(mobilePage, `mobile-${prefix}-connect.png`);
    await attempt(`${prefix} resume download`, () => resumeDownload(mobilePage, '.contact-bottom .resume-link', `${prefix} contact résumé`));
    await mobile.close();
  }
  check('No browser JavaScript exceptions', report.pageErrors.length === 0, report.pageErrors);
  check('No browser console errors', report.consoleErrors.length === 0, report.consoleErrors);
  check('No failed browser requests', report.requestFailures.length === 0, report.requestFailures);
} catch (error) {
  check('Focused icon QA completed', false, error.stack || error.message);
} finally {
  if (browser) await browser.close();
  report.summary = { passed: report.assertions.filter((item) => item.pass).length,
    failed: report.assertions.filter((item) => !item.pass).length, screenshots: report.screenshots.length };
  const destination = path.join(output, 'icon-controls-report.json');
  try {
    const previous = await readFile(destination, 'utf8'); const timestamp = JSON.parse(previous).timestamp.replace(/[^0-9T]/g, '-');
    await mkdir(path.join(output, 'history'), { recursive: true });
    await writeFile(path.join(output, 'history', `icon-controls-report-${timestamp}.json`), previous);
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
  await writeFile(destination, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`Report: ${destination}`); console.log(JSON.stringify(report.summary));
  process.exitCode = report.summary.failed ? 1 : 0;
}
