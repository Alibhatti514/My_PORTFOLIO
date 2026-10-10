import { chromium, request as apiRequest } from 'playwright';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

// Run against a running Vite preview: QA_URL=http://127.0.0.1:4173 npm run test:browser
// Results are measurements and functional assertions. Screenshots still require human review.
const root = process.cwd();
const baseURL = process.env.QA_URL || 'http://127.0.0.1:4173';
const output = path.join(root, 'docs/qa');
const shotDir = path.join(output, 'screenshots');
const reportName = process.env.QA_PROJECT_TRANSITIONS_ONLY === '1' ? 'project-transitions-report.json' :
  process.env.QA_FOCUS_ONLY === '1' ? 'focus-report.json' :
  process.env.QA_PRODUCTION_ONLY === '1' ? 'production-report.json' :
  process.env.QA_DESKTOP_ONLY === '1' ? 'desktop-report.json' :
  process.env.QA_RESPONSIVE_ONLY === '1' ? 'responsive-report.json' : 'browser-report.json';
const chaptersSource = await readFile(path.join(root, 'src/data/chapters.ts'), 'utf8');
const chapters = [...chaptersSource.matchAll(/^\s+id: '([^']+)'/gm)].map((match) => match[1]);
const assetManifest = JSON.parse(await readFile(path.join(root, 'docs/asset-manifest.json'), 'utf8'));
const expectedSocials = [
  ['LinkedIn', 'linkedin', 'https://www.linkedin.com/in/muhammad-ali-ejaz-bhatti-629676442/'],
  ['Freelancer', 'freelancer', 'https://www.freelancer.com/u/Devalibhatti?sb=t@Devalibhatti%27s'],
  ['GitHub', 'github', 'https://github.com/Alibhatti514'],
  ['Fiverr', 'fiverr', 'https://www.fiverr.com/dev_alibhatti?public_mode=true'],
  ['Upwork', 'upwork', 'https://www.upwork.com/freelancers/~01d8521e683ca03553?companyReference=1966580391923811613&mp_source=share'],
];
const viewports = [
  { width: 1920, height: 1080 }, { width: 1440, height: 900 },
  { width: 1366, height: 768 }, { width: 768, height: 1024 },
  { width: 390, height: 844 }, { width: 375, height: 812 },
];
const report = {
  timestamp: new Date().toISOString(), baseURL,
  browser: 'Local Google Chrome, Playwright, headless',
  environment: { platform: process.platform, arch: process.arch, node: process.version },
  assertions: [], screenshots: [], chapterMeasurements: [], responsiveMeasurements: [], mobileChapterMeasurements: [],
  consoleErrors: [], consoleWarnings: [], pageErrors: [], requestFailures: [],
  assets: {}, performance: {}, video: null,
  limitations: [
    'Performance describes this local headless Chrome session; it is not a universal frame-rate claim.',
    'Social destinations are verified by DOM mapping and intercepted popup navigation, without logging into third-party profiles.',
    'Automated layout checks do not replace visual review of every resting scene and transition screenshot.',
  ],
};
const seenAssets = new Map();
let browser;

function check(name, pass, detail = null) {
  const result = { name, pass: Boolean(pass), detail };
  report.assertions.push(result);
  console.log(`${pass ? 'PASS' : 'FAIL'} ${name}${pass || detail === null ? '' : ` — ${JSON.stringify(detail)}`}`);
  return Boolean(pass);
}
async function attempt(name, work) {
  try { return await work(); }
  catch (error) { check(name, false, error.message); return null; }
}
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const label = (index) => `${String(index).padStart(2, '0')}-${chapters[index]}`;
const urlFor = (suffix = '') => `${baseURL.replace(/\/$/, '')}/${suffix}`;

async function saveReport(filename = reportName) {
  const destination = path.join(output, filename);
  try {
    const previous = await readFile(destination, 'utf8');
    const stamp = JSON.parse(previous).timestamp.replace(/[^0-9T]/g, '-');
    await mkdir(path.join(output, 'history'), { recursive: true });
    await writeFile(path.join(output, 'history', `${filename.replace('.json', '')}-${stamp}.json`), previous);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  await writeFile(destination, `${JSON.stringify(report, null, 2)}\n`);
}

function observe(page) {
  page.on('pageerror', (error) => report.pageErrors.push({ page: page.url(), message: error.message }));
  page.on('console', (message) => {
    if (message.type() === 'error') report.consoleErrors.push({ page: page.url(), message: message.text() });
    if (message.type() === 'warning') report.consoleWarnings.push({ page: page.url(), message: message.text() });
  });
  page.on('requestfailed', (request) => {
    if (request.failure()?.errorText !== 'net::ERR_ABORTED') {
      report.requestFailures.push({ url: request.url(), error: request.failure()?.errorText });
    }
  });
  page.on('response', (response) => {
    const url = new URL(response.url());
    if (url.pathname.startsWith('/assets/')) {
      seenAssets.set(decodeURIComponent(url.pathname), { status: response.status(), url: response.url() });
    }
  });
}

async function waitReady(page) {
  await page.waitForFunction(() => window.__portfolio?.ready === true, undefined, { timeout: 25_000 });
  await page.locator('canvas[data-world]').waitFor({ state: 'visible' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
}

async function move(page, raw, settle = 500) {
  await page.evaluate((value) => {
    window.scrollTo({ top: Math.max(window.innerHeight, 560) * 1.25 * value, behavior: 'instant' });
  }, raw);
  await page.waitForTimeout(settle);
}

async function state(page) {
  return page.evaluate(() => {
    const visible = (element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0.05 &&
        rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < innerHeight;
    };
    const articles = [...document.querySelectorAll('article[data-chapter]')];
    const active = articles.filter((element) => element.getAttribute('aria-hidden') !== 'true' && visible(element));
    const canvas = document.querySelector('canvas[data-world]');
    const bounds = canvas?.getBoundingClientRect();
    return {
      debug: window.__portfolio ? { ...window.__portfolio } : null,
      viewport: { width: innerWidth, height: innerHeight, dpr: devicePixelRatio },
      scrollY, documentWidth: document.documentElement.scrollWidth,
      horizontalOverflow: document.documentElement.scrollWidth > innerWidth + 1,
      activeArticles: active.map((element) => ({
        chapter: element.getAttribute('data-chapter'),
        text: element.textContent.replace(/\s+/g, ' ').trim().slice(0, 200),
        bounds: element.getBoundingClientRect().toJSON(),
      })),
      canvas: bounds ? { width: bounds.width, height: bounds.height, top: bounds.top, left: bounds.left } : null,
      hash: location.hash,
    };
  });
}

async function screenshot(page, filename) {
  await page.screenshot({ path: path.join(shotDir, filename), animations: 'disabled' });
  report.screenshots.push(`screenshots/${filename}`);
}

async function assertRest(page, index, prefix) {
  const result = await state(page);
  check(`${prefix}: chapter ${index} synchronized`, result.debug?.chapter === index, result.debug);
  check(`${prefix}: no horizontal overflow`, !result.horizontalOverflow, result.documentWidth);
  check(`${prefix}: active semantic chapter ${index}`,
    result.activeArticles.some((article) => article.chapter === String(index)), result.activeArticles);
  return result;
}

async function navigate(page, index) {
  let target = page.locator(`button[data-goto="${index}"]:visible`).first();
  if (!await target.count()) {
    await page.getByRole('button', { name: 'Open chapters', exact: true }).click();
    target = page.locator(`button[data-goto="${index}"]:visible`).first();
  }
  await target.click();
  await page.waitForFunction((chapter) => window.__portfolio?.chapter === chapter, index);
  await page.waitForTimeout(550);
}

async function verifySocials(page, context) {
  const links = await page.locator('a:visible').evaluateAll((elements, socialURLs) => elements
    .filter((link) => socialURLs.includes(link.getAttribute('href')))
    .map((link) => ({
      href: link.getAttribute('href'), text: link.textContent.trim(),
      label: link.getAttribute('aria-label'), target: link.target, rel: link.rel,
      images: [...link.querySelectorAll('img')].map((image) => image.getAttribute('src')),
    })), expectedSocials.map((entry) => entry[2]));
  check('Social profiles visible in requested order',
    JSON.stringify(links.map((link) => link.href)) === JSON.stringify(expectedSocials.map((entry) => entry[2])), links);
  for (const [name, id, href] of expectedSocials) {
    const link = links.find((item) => item.href === href);
    check(`${name}: authentic accessible logo and exact URL`, Boolean(link) &&
      `${link.text} ${link.label}`.includes(name) && link.images.some((src) => src.endsWith(`/brands/${id}.svg`)), link);
    check(`${name}: safe external target`, link?.target === '_blank' &&
      link.rel.split(/\s+/).includes('noopener') && link.rel.split(/\s+/).includes('noreferrer'), link);
    await attempt(`${name}: clickable profile opens popup`, async () => {
      const pending = context.waitForEvent('page', { timeout: 5000 });
      await page.locator(`a[href=${JSON.stringify(href)}]:visible`).first().click();
      const popup = await pending;
      await popup.waitForLoadState('domcontentloaded');
      check(`${name}: clickable profile opens correct popup`, popup.url() === new URL(href).href, popup.url());
      await popup.close();
    });
  }
}

async function verifyResume(page) {
  const source = assetManifest.find((asset) => asset.path === '/assets/Resume_Ali_ejaz.pdf');
  const local = await readFile(path.join(root, 'public/assets/Resume_Ali_ejaz.pdf'));
  const original = await readFile(source.verifiedUpstreamPath);
  check('Original résumé asset content preserved', sha256(local) === sha256(original) && sha256(local) === source.sha256,
    { bytes: local.length, sha256: sha256(local), source: source.verifiedUpstreamPath });
  const anchor = page.locator('a[download][href="/assets/Resume_Ali_ejaz.pdf"]:visible').first();
  check('Visible résumé download link', await anchor.count() === 1);
  const pending = page.waitForEvent('download', { timeout: 5000 });
  await anchor.click();
  const download = await pending;
  const downloaded = await readFile(await download.path());
  check('Downloaded résumé bytes match original PDF', sha256(downloaded) === sha256(original),
    { bytes: downloaded.length, sha256: sha256(downloaded), suggestedFilename: download.suggestedFilename() });
  // Chrome download requests do not necessarily emit a page response event.
  seenAssets.set('/assets/Resume_Ali_ejaz.pdf', { downloaded: true, bytes: downloaded.length, sha256: sha256(downloaded) });
  check('Working email link', await page.locator('a[href="mailto:dev._.ali@icloud.com"]:visible').count() > 0);
  check('Working telephone link', await page.locator('a[href="tel:+923172003786"]:visible').count() > 0);
}

async function fallbackPage(browser, query, name, reducedMotion = 'no-preference') {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion });
  const page = await context.newPage(); observe(page);
  await page.goto(urlFor(query), { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const text = await page.locator('body').innerText();
  const checks = ['JavaScript', 'PostgreSQL', 'RCS CARGO', 'GOLDADAN', 'BHABHI THULLA', 'Punjab University', 'Hawk College'];
  check(`${name}: essential portfolio content available`, checks.every((term) => text.includes(term)), checks.filter((term) => !text.includes(term)));
  check(`${name}: all social destinations present`, await page.locator('a').evaluateAll((elements, destinations) =>
    destinations.every((destination) => elements.some((element) => element.getAttribute('href') === destination)),
  expectedSocials.map((entry) => entry[2])));
  check(`${name}: no horizontal overflow`, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  await page.screenshot({ path: path.join(shotDir, `${name}.png`), fullPage: true, animations: 'disabled' });
  report.screenshots.push(`screenshots/${name}.png`);
  await context.close();
}

async function captureResponsive(page) {
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    // The application intentionally preserves its chapter during the resize frame.
    // Let that resize handler finish before directing a new chapter scroll.
    await page.waitForTimeout(250);
    await move(page, 0, 650);
    const prefix = `${viewport.width}x${viewport.height}`;
    const hero = await assertRest(page, 0, `${prefix} hero`);
    await screenshot(page, `responsive-${prefix}-hero.png`);
    await move(page, 12, 650);
    const connect = await assertRest(page, 12, `${prefix} connect`);
    check(`${prefix}: all 5 social controls visible`, await page.locator('a:visible').evaluateAll((elements, urls) =>
      urls.every((url) => elements.some((element) => element.getAttribute('href') === url)), expectedSocials.map((entry) => entry[2])));
    await screenshot(page, `responsive-${prefix}-connect.png`);
    report.responsiveMeasurements.push({ viewport, hero, connect });
  }
}

async function verifySkipFocus(page) {
  await move(page, 0);
  const skip = page.getByRole('link', { name: 'Skip to portfolio content', exact: true });
  await skip.focus(); await page.keyboard.press('Enter');
  await page.waitForFunction(() => window.__portfolio?.chapter === 1);
  await page.waitForTimeout(400);
  check('Skip link uses stable code hash', new URL(page.url()).hash === '#code');
  const focusState = await page.evaluate(() => {
    const target = document.querySelector('article[data-chapter="1"]');
    return { active: document.activeElement?.outerHTML.slice(0, 220), targetInert: target?.inert,
      targetVisibility: target ? getComputedStyle(target).visibility : null,
      focusedChapter: document.activeElement?.getAttribute('data-chapter') };
  });
  check('Skip link transfers focus into accessible content', focusState.focusedChapter === '1', focusState);
  await skip.focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(200);
  check('Skip link also focuses an already active code chapter', await page.evaluate(() => document.activeElement?.getAttribute('data-chapter') === '1'));
}

async function recordWalkthrough(browser) {
    const videoContext = await browser.newContext({ viewport: { width: 1440, height: 900 },
      recordVideo: { dir: path.join(output, 'video'), size: { width: 1440, height: 900 } } });
    const videoPage = await videoContext.newPage(); observe(videoPage);
    await videoPage.goto(urlFor(), { waitUntil: 'networkidle' }); await waitReady(videoPage);
    await videoPage.waitForTimeout(900);
    // Each segment is eased in real time, with a brief pause at every resting chapter.
    for (let index = 1; index < chapters.length; index += 1) {
      await videoPage.evaluate(async (destination) => {
        const start = scrollY; const end = Math.max(innerHeight, 560) * 1.25 * destination;
        const began = performance.now();
        await new Promise((resolve) => {
          function tick(now) {
            const t = Math.min(1, (now - began) / 1050); const ease = t * t * (3 - 2 * t);
            scrollTo({ top: start + (end - start) * ease, behavior: 'instant' });
            if (t < 1) requestAnimationFrame(tick); else resolve();
          }
          requestAnimationFrame(tick);
        });
      }, index);
      await videoPage.waitForTimeout(400);
    }
    await videoPage.waitForTimeout(1000);
    const video = videoPage.video();
    await videoContext.close();
    const filename = path.join(output, 'walkthrough.webm'); await video.saveAs(filename); await video.delete();
    report.video = path.relative(output, filename);
    check('Full-scroll walkthrough recorded', true, report.video);
}

await mkdir(shotDir, { recursive: true });
try {
  browser = await chromium.launch({
    channel: 'chrome', executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true, args: ['--autoplay-policy=no-user-gesture-required'],
  });
  report.environment.browserVersion = browser.version();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, acceptDownloads: true });
  // Preserve exact destinations while keeping social-click verification deterministic and private.
  await context.route((url) => expectedSocials.some((entry) => new URL(entry[2]).origin === url.origin),
    (route) => route.fulfill({ status: 200, contentType: 'text/html', body: '<title>Verified social destination</title><p>Navigation verified.</p>' }));
  const page = await context.newPage(); observe(page);
  page.setDefaultTimeout(10_000);
  await page.goto(urlFor(), { waitUntil: 'networkidle' });
  await waitReady(page);
  if (process.env.QA_PROJECT_TRANSITIONS_ONLY === '1') {
    for (const index of [7, 8]) {
      await move(page, index + 0.56);
      const current = await state(page);
      check(`Project transition ${index}: continuous midpoint`, current.debug.progress > index + 0.35 && current.debug.progress < index + 0.65, current.debug);
      await screenshot(page, `transition-${String(index).padStart(2, '0')}-${chapters[index]}-to-${chapters[index + 1]}.png`);
    }
    check('Project transition recapture has no JavaScript exceptions', report.pageErrors.length === 0, report.pageErrors);
    await browser.close(); browser = null;
    report.summary = { passed: report.assertions.filter((item) => item.pass).length,
      failed: report.assertions.filter((item) => !item.pass).length, screenshots: report.screenshots.length };
    await saveReport();
    console.log(JSON.stringify(report.summary));
    process.exit(report.summary.failed ? 1 : 0);
  }
  if (process.env.QA_FOCUS_ONLY === '1') {
    await attempt('Keyboard skip-link focus regression', () => verifySkipFocus(page));
    check('Focus regression has no JavaScript exceptions', report.pageErrors.length === 0, report.pageErrors);
    check('Focus regression has no console errors', report.consoleErrors.length === 0, report.consoleErrors);
    await browser.close(); browser = null;
    report.summary = { passed: report.assertions.filter((item) => item.pass).length,
      failed: report.assertions.filter((item) => !item.pass).length, screenshots: report.screenshots.length };
    await saveReport();
    console.log(JSON.stringify(report.summary));
    process.exit(report.summary.failed ? 1 : 0);
  }
  if (process.env.QA_PRODUCTION_ONLY === '1') {
    for (const index of [0, 1, 3, 7, 8, 9, 12]) {
      await move(page, index);
      await assertRest(page, index, `Production ${chapters[index]}`);
      await screenshot(page, `production-${label(index)}.png`);
    }
    await fallbackPage(browser, '?webgl=off', 'production-fallback');
    check('Production smoke has no JavaScript exceptions', report.pageErrors.length === 0, report.pageErrors);
    check('Production smoke has no console errors', report.consoleErrors.length === 0, report.consoleErrors);
    check('Production smoke has no failed resource requests', report.requestFailures.length === 0, report.requestFailures);
    await browser.close(); browser = null;
    report.summary = { passed: report.assertions.filter((item) => item.pass).length,
      failed: report.assertions.filter((item) => !item.pass).length, screenshots: report.screenshots.length };
    await saveReport();
    console.log(JSON.stringify(report.summary));
    process.exit(report.summary.failed ? 1 : 0);
  }
  if (process.env.QA_RESPONSIVE_ONLY === '1') {
    await captureResponsive(page);
    await browser.close(); browser = null;
    report.summary = { passed: report.assertions.filter((item) => item.pass).length,
      failed: report.assertions.filter((item) => !item.pass).length, screenshots: report.screenshots.length };
    await saveReport();
    console.log(JSON.stringify(report.summary));
    process.exit(report.summary.failed ? 1 : 0);
  }
  if (process.env.QA_DESKTOP_ONLY === '1') {
    await attempt('Keyboard skip-link focus regression', () => verifySkipFocus(page));
  }
  check('13 chapters defined in source', chapters.length === 13, chapters);

  for (let index = 0; index < chapters.length; index += 1) {
    await move(page, index);
    const result = await assertRest(page, index, `1440×900 ${chapters[index]}`);
    report.chapterMeasurements.push({ index, id: chapters[index], ...result });
    check(`${chapters[index]}: canvas spans viewport`, result.canvas?.width === 1440 && result.canvas?.height === 900 && result.canvas?.top === 0, result.canvas);
    await screenshot(page, `desktop-${label(index)}.png`);
    if (index < chapters.length - 1) {
      await move(page, index + 0.56);
      const midpoint = await state(page);
      check(`${chapters[index]} → ${chapters[index + 1]}: continuous midpoint`,
        midpoint.debug?.progress > index + 0.35 && midpoint.debug?.progress < index + 0.65, midpoint.debug);
      await screenshot(page, `transition-${String(index).padStart(2, '0')}-${chapters[index]}-to-${chapters[index + 1]}.png`);
    }
  }
  if (process.env.QA_DESKTOP_ONLY === '1') {
    await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(300);
    for (const index of [1, 9, 10]) {
      await move(page, index);
      await assertRest(page, index, `390×844 ${chapters[index]} visual refinement`);
      await screenshot(page, `mobile-${label(index)}.png`);
    }
    await context.close();
    await attempt('Updated full-scroll walkthrough video', () => recordWalkthrough(browser));
    check('Final recapture has no JavaScript exceptions', report.pageErrors.length === 0, report.pageErrors);
    check('Final recapture has no console errors', report.consoleErrors.length === 0, report.consoleErrors);
    await browser.close(); browser = null;
    report.summary = { passed: report.assertions.filter((item) => item.pass).length,
      failed: report.assertions.filter((item) => !item.pass).length, screenshots: report.screenshots.length };
    await saveReport();
    console.log(JSON.stringify(report.summary));
    process.exit(report.summary.failed ? 1 : 0);
  }

  await attempt('Social interaction checks', () => verifySocials(page, context));
  await attempt('Résumé and contact checks', () => verifyResume(page));

  await attempt('Chapter navigation and history', async () => {
    await navigate(page, 3);
    check('Chapter menu navigates to frontend hash', new URL(page.url()).hash === '#frontend');
    await navigate(page, 8);
    check('Chapter menu navigates to project hash', new URL(page.url()).hash === '#goldadan');
    await page.goBack();
    await page.waitForFunction(() => window.__portfolio?.chapter === 3);
    check('Browser back restores previous chapter', new URL(page.url()).hash === '#frontend' && (await state(page)).debug.chapter === 3);
    await page.reload({ waitUntil: 'networkidle' }); await waitReady(page);
    check('Refreshing hash restores chapter', (await state(page)).debug.chapter === 3);
    await page.goto(urlFor('#education'), { waitUntil: 'networkidle' });
    await page.waitForFunction(() => window.__portfolio?.chapter === 11);
    check('Direct chapter hash is reachable', (await state(page)).debug.chapter === 11);
  });

  await attempt('Manual scrolling updates refresh destination', async () => {
    await page.goto(urlFor('#frontend'), { waitUntil: 'networkidle' }); await waitReady(page);
    await move(page, 8);
    check('Manual scroll updates current chapter hash', new URL(page.url()).hash === '#goldadan');
    await page.reload({ waitUntil: 'networkidle' }); await waitReady(page);
    await assertRest(page, 8, 'Reload after manual scroll');
  });

  await attempt('Reading and cinematic view round trip', async () => {
    await move(page, 9);
    await page.getByRole('button', { name: 'Open chapters', exact: true }).click();
    await page.getByRole('button', { name: 'Read the complete portfolio' }).click();
    await page.locator('.reading-view').waitFor({ state: 'visible' });
    await page.getByRole('button', { name: 'Enter the 3D experience' }).click();
    await waitReady(page);
    const result = await state(page);
    check('Returning from reading view synchronizes HTML and WebGL',
      result.activeArticles.length === 1 && result.activeArticles[0].chapter === String(result.debug?.chapter), result);
    check('Returning from reading view restores a valid chapter hash', new URL(page.url()).hash === `#${chapters[result.debug?.chapter]}`, result.hash);
  });

  await attempt('Fractional transition position survives resizing', async () => {
    await move(page, 4.56);
    const before = await state(page);
    await page.setViewportSize({ width: 1366, height: 768 }); await page.waitForTimeout(500);
    const after = await state(page);
    check('Resize preserves fractional cinematic progress', Math.abs(before.debug.progress - after.debug.progress) < 0.03,
      { before: before.debug.progress, after: after.debug.progress });
    await page.setViewportSize({ width: 1440, height: 900 }); await page.waitForTimeout(300);
  });

  await attempt('Keyboard skip link reaches content', () => verifySkipFocus(page));

  for (const [index, name] of [[7, 'Trace the route'], [8, 'Turn the pavilion'], [9, 'Deal a card']]) {
    await attempt(`Interactive project control: ${name}`, async () => {
      await move(page, index);
      const button = page.locator(`article[data-chapter="${index}"]`).getByRole('button', { name });
      const errorsBefore = report.pageErrors.length + report.consoleErrors.length;
      await button.click(); await page.waitForTimeout(500);
      check(`${name}: clickable without browser errors`, report.pageErrors.length + report.consoleErrors.length === errorsBefore);
      await screenshot(page, `interaction-${chapters[index]}.png`);
    });
  }

  for (const raw of [10, 2, 6, 5, 4, 4.25, 4.55, 4.8, 5]) await move(page, raw, 180);
  check('Fast, reverse, and incremental scrolling remain synchronized', (await state(page)).debug.chapter === 5, (await state(page)).debug);

  await move(page, 5);
  report.performance = await page.evaluate(async () => {
    const deltas = []; let previous = performance.now(); const start = previous;
    await new Promise((resolve) => {
      function frame(now) { deltas.push(now - previous); previous = now; if (now - start < 2200) requestAnimationFrame(frame); else resolve(); }
      requestAnimationFrame(frame);
    });
    const samples = deltas.slice(2).sort((a, b) => a - b);
    const mean = samples.reduce((sum, value) => sum + value, 0) / samples.length;
    const canvas = document.querySelector('canvas[data-world]');
    const gl = canvas?.getContext('webgl2'); const info = gl?.getExtension('WEBGL_debug_renderer_info');
    return { sampledAt: 'data chapter, 1440×900, device scale factor 1', sampleDurationMs: previous - start,
      frames: samples.length, meanFrameMs: mean, estimatedRAFps: 1000 / mean,
      p50FrameMs: samples[Math.floor(samples.length * 0.5)], p95FrameMs: samples[Math.floor(samples.length * 0.95)],
      gpu: info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : 'unavailable',
      renderer: { ...window.__portfolio },
    };
  });

  await captureResponsive(page);

  await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(300);
  for (let index = 0; index < chapters.length; index += 1) {
    await move(page, index, 500);
    const result = await assertRest(page, index, `390×844 ${chapters[index]}`);
    const textBounds = await page.locator(`article[data-chapter="${index}"]`).evaluate((article) =>
      [...article.querySelectorAll('.chapter-heading,.chapter-caption,.chapter-aside,.contact-bottom,.hero-name,.hero-profession')].map((element) => {
        const bounds = element.getBoundingClientRect();
        return { className: element.className, bounds: bounds.toJSON(), display: getComputedStyle(element).display };
      }));
    report.mobileChapterMeasurements.push({ index, id: chapters[index], ...result, textBounds });
    await screenshot(page, `mobile-${label(index)}.png`);
  }

  await attempt('Mobile chapter menu interaction', async () => {
    await page.getByRole('button', { name: 'Open chapters', exact: true }).click();
    const button = page.locator('dialog[open] button[data-goto="7"]').first();
    await button.focus();
    check('Chapter navigation supports keyboard focus', await button.evaluate((element) => element === document.activeElement));
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => window.__portfolio?.chapter === 7);
    check('Mobile keyboard navigation opens selected chapter', new URL(page.url()).hash === '#rcs-cargo');
    await screenshot(page, 'mobile-keyboard-navigation.png');
  });
  await context.close();

  await attempt('Loading state excludes hidden cinematic controls from keyboard focus', async () => {
    const loadingContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await loadingContext.route(/(?:\/assets\/World-[^/]+\.js|\/src\/engine\/World\.ts)(?:\?.*)?$/, async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2400)); await route.continue();
    });
    const loadingPage = await loadingContext.newPage(); observe(loadingPage);
    await loadingPage.goto(urlFor(), { waitUntil: 'domcontentloaded' });
    await loadingPage.locator('.loading-state').waitFor({ state: 'visible' });
    const focusTargets = [];
    for (let index = 0; index < 12; index += 1) {
      await loadingPage.keyboard.press('Tab');
      focusTargets.push(await loadingPage.evaluate(() => ({
        tag: document.activeElement?.tagName, name: document.activeElement?.textContent?.trim().slice(0, 90),
        hiddenCinematicControl: Boolean(document.activeElement?.closest('.experience[aria-hidden="true"]')),
      })));
    }
    check('Loading Tab sequence avoids hidden hero actions', focusTargets.every((item) => !item.hiddenCinematicControl), focusTargets);
    await waitReady(loadingPage);
    await loadingContext.close();
  });

  await attempt('Reading fallback', () => fallbackPage(browser, '?view=reading', 'fallback-reading'));
  await attempt('WebGL fallback', () => fallbackPage(browser, '?webgl=off', 'fallback-webgl-off'));
  await attempt('Actual WebGL initialization failure falls back to readable content', async () => {
    const failedContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await failedContext.addInitScript(() => {
      const native = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function(type, ...args) {
        if (/webgl/i.test(type)) return null;
        return native.call(this, type, ...args);
      };
    });
    const failedPage = await failedContext.newPage();
    const intentionalConsole = []; const pageErrors = [];
    failedPage.on('console', (message) => { if (message.type() === 'error') intentionalConsole.push(message.text()); });
    failedPage.on('pageerror', (error) => pageErrors.push(error.message));
    await failedPage.goto(urlFor(), { waitUntil: 'networkidle' });
    await failedPage.locator('.reading-view').waitFor({ state: 'visible' });
    const text = await failedPage.locator('body').innerText();
    check('Real WebGL creation failure exposes essential portfolio content',
      ['JavaScript', 'PostgreSQL', 'Punjab University', 'Hawk College', 'GOLDADAN'].every((term) => text.includes(term)));
    check('Real WebGL creation failure does not leave an unusable canvas', await failedPage.locator('canvas[data-world]:visible').count() === 0);
    check('Real WebGL creation failure is caught without uncaught exception', pageErrors.length === 0, pageErrors);
    report.actualWebglFailure = { method: 'Canvas WebGL context creation returns null', expectedRendererConsole: intentionalConsole, pageErrors };
    await failedPage.screenshot({ path: path.join(shotDir, 'fallback-real-webgl-failure.png'), fullPage: true });
    report.screenshots.push('screenshots/fallback-real-webgl-failure.png');
    await failedContext.close();
  });
  await attempt('Reduced-motion support', async () => {
    const reduced = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    const reducedPage = await reduced.newPage(); observe(reducedPage);
    await reducedPage.goto(urlFor(), { waitUntil: 'networkidle' });
    check('Reduced-motion media preference applied', await reducedPage.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches));
    const cinematic = await reducedPage.locator('canvas[data-world]:visible').count();
    if (cinematic) {
      await waitReady(reducedPage); await move(reducedPage, 3.56);
      const result = await state(reducedPage);
      check('Reduced motion settles to a chapter pose', Number.isInteger(result.debug?.progress), result.debug);
    } else {
      const text = await reducedPage.locator('body').innerText();
      check('Reduced motion provides readable essential information', text.includes('Punjab University') && text.includes('PostgreSQL'));
    }
    await screenshot(reducedPage, 'reduced-motion.png');
    await reduced.close();
  });

  await attempt('Full-scroll walkthrough video', () => recordWalkthrough(browser));

  // Capture the observed application loads before independent HTTP checks below.
  report.assets.observedInApplication = Object.fromEntries(seenAssets);
  for (const asset of assetManifest) {
    const observed = seenAssets.get(asset.path);
    check(`Application loaded required asset: ${asset.path}`, observed?.status === 200 || observed?.downloaded === true, observed || 'not observed');
    const response = await apiRequest.newContext().then(async (request) => {
      try {
        const response = await request.get(new URL(asset.path, baseURL).href);
        return { status: response.status(), bytes: await response.body() };
      } finally { await request.dispose(); }
    });
    check(`Served asset matches source: ${asset.path}`, response.status === 200 && sha256(response.bytes) === asset.sha256,
      { status: response.status, bytes: response.bytes.length, sha256: sha256(response.bytes) });
  }
  check('No browser JavaScript exceptions', report.pageErrors.length === 0, report.pageErrors);
  check('No browser console errors', report.consoleErrors.length === 0, report.consoleErrors);
  check('No failed browser resource requests', report.requestFailures.length === 0, report.requestFailures);
} catch (error) {
  check('QA runner completed', false, error.stack || error.message);
} finally {
  if (browser) await browser.close();
  report.summary = { passed: report.assertions.filter((item) => item.pass).length,
    failed: report.assertions.filter((item) => !item.pass).length, screenshots: report.screenshots.length };
  await saveReport();
  console.log(`QA report: ${path.join(output, reportName)}`);
  console.log(JSON.stringify(report.summary));
  process.exitCode = report.summary.failed ? 1 : 0;
}
