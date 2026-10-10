import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

/**
 * Authored while browser access is blocked. Do not execute browser work until the
 * user's saved browser permission has actually been resolved. The environment
 * guard below prevents accidental execution; setting it is not permission.
 *
 * Plan only (never imports/launches Playwright):
 *   node scripts/performance-qa.mjs --plan
 * Later, only after browser access is permitted:
 *   QA_BROWSER_PERMISSION=resolved QA_PHASE=baseline QA_URL=http://127.0.0.1:4174 node scripts/performance-qa.mjs
 *   QA_BROWSER_PERMISSION=resolved QA_PHASE=after QA_BASELINE_REPORT=/absolute/baseline/report.json node scripts/performance-qa.mjs
 * Optional narrowing: QA_VIEWPORTS=1440x900,390x844 QA_SCENARIOS=A,D,J
 * Baseline and after artifacts always receive unique run directories.
 */
const projectRoot = process.cwd();
const phase = process.env.QA_PHASE || 'baseline';
if (!['baseline', 'after'].includes(phase)) throw new Error('QA_PHASE must be baseline or after.');
const baseURL = process.env.QA_URL || 'http://127.0.0.1:4174';
const profileURL = new URL(baseURL); profileURL.searchParams.set('profile', '1');
const bounded = (value, fallback, min, max) => Math.min(max, Math.max(min, Number(value) || fallback));
const config = {
  phase, baseURL: profileURL.href,
  repetitions: Math.floor(bounded(process.env.QA_REPEATS, 2, 1, 4)),
  warmupMs: 1200, restSampleMs: 650, midpointSampleMs: 450,
  settleWindowMs: 800, settleTolerance: 0.02, settleHoldMs: 100,
  scrollQuietMs: 100, scrollQuietTimeoutMs: 2000,
  longTaskThresholdMs: 50, scenarioTimeoutMs: 35_000,
  deviceScaleFactor: bounded(process.env.QA_DPR, 1, 1, 3),
  cpuThrottle: bounded(process.env.QA_CPU_THROTTLE, 1, 1, 6),
  headless: process.env.QA_HEADLESS !== '0',
  screenshots: process.env.QA_SCREENSHOTS === '1',
  chromePath: process.env.QA_CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
};
const viewportMatrix = [
  { width: 1440, height: 900, kind: 'desktop' },
  { width: 320, height: 568, kind: 'portrait' },
  { width: 360, height: 800, kind: 'portrait' },
  { width: 375, height: 812, kind: 'portrait' },
  { width: 390, height: 844, kind: 'portrait' },
  { width: 414, height: 896, kind: 'portrait' },
  { width: 430, height: 932, kind: 'portrait' },
  { width: 768, height: 1024, kind: 'tablet' },
  { width: 844, height: 390, kind: 'landscape' },
];
const scenarioPlan = [
  { id: 'A', name: 'Slow continuous top to bottom', action: '9-second continuous scroll; final settling observation.' },
  { id: 'B', name: 'Fast wheel', action: 'Eight large downward wheel ticks at 35 ms intervals.' },
  { id: 'C', name: 'Fast trackpad-style input', action: '64 small wheel events at approximately 16 ms intervals across the story.' },
  { id: 'D', name: 'Repeated rapid reversals', action: '24 alternating wheel events at 40 ms intervals around the middle chapters.' },
  { id: 'E', name: 'Hero to projects', action: 'Activate the actual Explore my work button, observe chapter 7 and settling.' },
  { id: 'F', name: 'Contact to hero', action: 'Activate the actual Return to the beginning control, observe chapter 0 and settling.' },
  { id: 'G', name: 'Refresh at a transition midpoint', action: 'Refresh one rotating midpoint per repetition; collect startup and hash recovery without assuming fractional restoration.' },
  { id: 'H', name: 'Resize within a chapter', action: 'Resize at raw chapter 3.4, then restore original viewport; record progress preservation.' },
  { id: 'I', name: 'Rapidly traverse all transitions', action: 'Visit all 12 transition midpoints sequentially, at 60 ms intervals.' },
  { id: 'J', name: 'Repeated journeys and memory', action: 'Three 2.4-second round trips, with heap and renderer-resource checkpoints; no forced GC.' },
];
const requestedViewports = process.env.QA_VIEWPORTS?.split(',').filter(Boolean);
const viewports = viewportMatrix.filter((viewport) => !requestedViewports || requestedViewports.includes(`${viewport.width}x${viewport.height}`));
const requestedScenarios = process.env.QA_SCENARIOS?.split(',').filter(Boolean);
const scenarios = scenarioPlan.filter((scenario) => !requestedScenarios || requestedScenarios.includes(scenario.id));
if (!viewports.length || !scenarios.length) throw new Error('Viewport/scenario filtering produced an empty plan.');
const plan = {
  status: 'plan-only; no performance measurements exist until an authorized run completes',
  config, viewports, scenarios,
  chapterCoverage: 'All 13 resting chapters and all 12 transition midpoints at every selected viewport.',
  sequence: 'Fresh context per viewport → warm-up traversal → all rests/midpoints → A–J in order, repeated sequentially.',
  signals: ['rAF mean/p95/worst', 'frames >33 ms and >50 ms', 'LongTask entries when supported', 'heap when exposed',
    'opt-in application update/render CPU timings', 'draw calls and renderer resources', 'camera displacement', 'post-input settling'],
  caveats: [
    'CPU render-call duration is not GPU execution time. GPU timing is unavailable unless separately measured by GPU timer queries.',
    'Synthetic wheel cadence is representative input, not a measurement of physical wheel/trackpad hardware.',
    'Mobile dimensions do not emulate a physical phone GPU, CPU, temperature, or browser.',
    'Short resting samples are descriptive; aggregate repeated stress scenarios before drawing conclusions.',
    'Heap growth without controlled GC is an observation, not proof of a memory leak.',
    'Application profiling and the browser sampler add diagnostic overhead. Both phases must use the same instrumentation.',
    'Full default coverage is bounded but may take several minutes; navigation and machine speed affect duration.',
  ],
};
if (process.argv.includes('--plan')) { console.log(JSON.stringify(plan, null, 2)); process.exit(0); }
if (process.env.QA_BROWSER_PERMISSION !== 'resolved') {
  console.error('Browser execution is disabled. Resolve the saved browser permission first. --plan is browser-free.');
  process.exit(2);
}

// Everything below this line is runtime-only. Authoring and node --check do not execute it.
const { chromium } = await import('playwright');
const timestamp = new Date().toISOString();
const runId = `${timestamp.replace(/[:.]/g, '-')}-${randomUUID().slice(0, 8)}`;
const output = path.join(projectRoot, 'docs/performance', phase, runId);
const chaptersText = await readFile(path.join(projectRoot, 'src/data/chapters.ts'), 'utf8');
const chapters = [...chaptersText.matchAll(/^\s+id: '([^']+)'/gm)].map((match) => match[1]);
if (chapters.length !== 13) throw new Error(`Expected 13 chapters; found ${chapters.length}. Update the explicit test plan first.`);
const report = {
  schemaVersion: 1, status: 'running', timestamp, runId, ...plan,
  environment: { platform: process.platform, arch: process.arch, node: process.version },
  chapters, results: [], checks: [], availability: [], consoleErrors: [], pageErrors: [], requestFailures: [], bundles: [],
  gpuTiming: { status: 'unavailable', reason: 'No measured GPU timer-query signal is part of the supplied telemetry contract.' },
};
report.status = 'running';
let browser;
let interrupted = false;
const stamp = () => new Date().toISOString();
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function check(name, pass, detail = null) { report.checks.push({ name, pass: Boolean(pass), detail }); }
function stats(values) {
  const finite = values.filter(Number.isFinite);
  if (!finite.length) return { status: 'unavailable', count: 0 };
  const sorted = [...finite].sort((a, b) => a - b);
  const count = finite.length; const mean = finite.reduce((a, b) => a + b, 0) / count;
  return { status: 'measured', count, mean, p95: sorted[Math.max(0, Math.ceil(count * 0.95) - 1)], worst: sorted.at(-1), min: sorted[0] };
}
function frameStats(values) {
  const summary = stats(values);
  if (!summary.count) return summary;
  const over33ms = values.filter((value) => value > 33).length;
  const over50ms = values.filter((value) => value > 50).length;
  return { ...summary, estimatedRAFps: 1000 / summary.mean, over33ms, over50ms,
    over33Percent: over33ms / summary.count * 100, over50Percent: over50ms / summary.count * 100 };
}
function series(values) {
  const finite = values.filter(Number.isFinite);
  return finite.length ? { first: finite[0], last: finite.at(-1), min: Math.min(...finite), max: Math.max(...finite), delta: finite.at(-1) - finite[0] }
    : { status: 'unavailable' };
}
function summarize(raw) {
  const samples = raw.profile?.samples || [];
  const cameraSteps = [];
  for (let index = 1; index < samples.length; index += 1) {
    const a = ['cameraX', 'cameraY', 'cameraZ'].map((key) => samples[index - 1][key]);
    const b = ['cameraX', 'cameraY', 'cameraZ'].map((key) => samples[index][key]);
    if (a.every(Number.isFinite) && b.every(Number.isFinite)) cameraSteps.push(Math.hypot(...a.map((value, axis) => b[axis] - value)));
  }
  const rafDeltas = raw.raf.map((sample) => sample.deltaMs);
  const telemetryAge = samples.map((sample) => sample.scrollInputAgeMs).filter(Number.isFinite);
  return {
    raf: frameStats(rafDeltas), applicationFrames: frameStats(samples.map((sample) => sample.frameMs)),
    updateCPUms: stats(samples.map((sample) => sample.cpuUpdateMs)), renderCallCPUms: stats(samples.map((sample) => sample.cpuRenderMs)),
    longTasks: raw.longTaskSupported ? { count: raw.longTasks.length, totalMs: raw.longTasks.reduce((sum, entry) => sum + entry.duration, 0), durations: stats(raw.longTasks.map((entry) => entry.duration)) }
      : { status: 'unavailable', reason: 'LongTask PerformanceObserver is not supported in this browser.' },
    heap: { browser: series(raw.heap.map((sample) => sample.bytes)), application: series(samples.map((sample) => sample.heapBytes)), unit: 'bytes', caveat: 'No forced GC; values may be unavailable or approximate.' },
    renderer: Object.fromEntries(['drawCalls', 'triangles', 'points', 'textures', 'geometries', 'programs', 'dpr'].map((key) => [key, series(samples.map((sample) => sample[key]))])),
    cameraStepDistance: stats(cameraSteps), scrollInputAgeMs: stats(telemetryAge),
    settling: settling(raw), telemetrySampleCount: samples.length,
    telemetryStatus: raw.profile?.status || 'unavailable',
    applicationEvents: raw.profile?.events || [],
    applicationLongTasks: raw.profile?.longTasks || [],
    applicationLimitations: raw.profile?.limitations || [],
    observationMs: raw.end - raw.start, droppedRAF: raw.droppedRAF,
    cameraDistanceUnit: 'World-space units per sampled frame; this is not camera velocity or input latency.',
  };
}
function settling(raw) {
  const final = [...raw.events].reverse().find((event) => event.type === 'final-input');
  if (!final) return { status: 'unavailable', reason: 'No final input marker was recorded in this document.' };
  const samples = (raw.profile?.samples || []).filter((sample) => sample.time >= final.time && Number.isFinite(sample.progress));
  if (!samples.length) return { status: 'unavailable', reason: 'Application progress samples after final input are unavailable.' };
  const rawDrift = Math.max(...samples.filter((sample) => Number.isFinite(sample.raw)).map((sample) => Math.abs(sample.raw - final.targetRaw)), 0);
  if (rawDrift > config.settleTolerance) return { status: 'unavailable', reason: 'Scroll position continued changing after the final-input marker.', maxRawDrift: rawDrift };
  let began = null; let settledAt = null;
  for (const sample of samples) {
    const error = Math.abs(sample.progress - final.targetProgress);
    if (error <= config.settleTolerance) {
      if (began === null) began = sample.time;
      if (sample.time - began >= config.settleHoldMs) { settledAt = began; break; }
    } else began = null;
  }
  const last = samples.at(-1);
  return { status: settledAt === null ? 'not-settled-within-observation' : 'measured',
    targetRaw: final.targetRaw, targetProgress: final.targetProgress, toleranceChapters: config.settleTolerance,
    holdMs: config.settleHoldMs, timeAfterFinalInputMs: settledAt === null ? null : Math.max(0, settledAt - final.time),
    observedAfterInputMs: last.time - final.time, finalProgressError: Math.abs(last.progress - final.targetProgress),
    scrollQuiescence: final.scrollQuiescence ?? null,
    note: 'Progress convergence only, measured after the scroll quiet window; not interaction latency, camera settling, or GPU latency.' };
}

function installSampler() {
  const CAP = 12000;
  const state = { start: performance.now(), previous: null, raf: [], heap: [], events: [], longTasks: [], lastHeap: 0,
    longTaskSupported: PerformanceObserver.supportedEntryTypes?.includes('longtask') || false, droppedRAF: 0 };
  if (state.longTaskSupported) {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.startTime >= state.start) state.longTasks.push({ startTime: entry.startTime, duration: entry.duration, name: entry.name });
      }
    }).observe({ type: 'longtask', buffered: true });
  }
  function tick(time) {
    if (state.previous !== null) state.raf.push({ time, deltaMs: time - state.previous });
    state.previous = time;
    if (state.raf.length > CAP) { state.raf.shift(); state.droppedRAF += 1; }
    if (time - state.lastHeap > 250) {
      state.lastHeap = time;
      state.heap.push({ time, bytes: performance.memory?.usedJSHeapSize ?? null });
      if (state.heap.length > 1000) state.heap.shift();
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
  const target = () => {
    const raw = Math.max(0, Math.min(12, scrollY / (Math.max(innerHeight, 560) * 1.25)));
    const base = Math.floor(raw); const t = Math.max(0, Math.min(1, (raw - base - 0.22) / 0.68));
    return { targetRaw: raw, targetProgress: document.querySelector('.reduced-motion') ? Math.round(raw) : base + t * t * (3 - 2 * t) };
  };
  const profileSnapshot = () => {
    const profile = window.__portfolioProfile;
    if (!profile) return { status: 'unavailable', reason: 'window.__portfolioProfile is absent.', samples: [] };
    try {
      if (typeof profile.snapshot !== 'function') return { status: 'unavailable', reason: 'Profile snapshot() API is absent.', samples: [] };
      const snapshot = profile.snapshot();
      return { status: Array.isArray(snapshot?.samples) ? 'available' : 'unavailable',
        samples: Array.isArray(snapshot?.samples) ? snapshot.samples : [],
        events: snapshot?.events || [], longTasks: snapshot?.longTasks || [], limitations: snapshot?.limitations || [] };
    } catch (error) { return { status: 'unavailable', reason: String(error), samples: [] }; }
  };
  window.__performanceQA = {
    begin() {
      state.start = performance.now(); state.previous = null; state.raf = []; state.heap = []; state.events = [];
      state.longTasks = []; state.lastHeap = 0; state.droppedRAF = 0;
      if (typeof window.__portfolioProfile?.reset === 'function') window.__portfolioProfile.reset();
    },
    mark(type, data = {}) { const event = { time: performance.now(), type, ...data }; state.events.push(event); return event; },
    finalInput(data = {}) { const event = { time: performance.now(), type: 'final-input', ...target(), ...data }; state.events.push(event); return event; },
    snapshot() {
      return { ...state, end: performance.now(), profile: profileSnapshot(), metrics: window.__portfolio ? { ...window.__portfolio } : null,
        normalizedScroll: target(), viewport: { width: innerWidth, height: innerHeight, dpr: devicePixelRatio },
        navigation: performance.getEntriesByType('navigation').map((entry) => entry.toJSON()),
        hash: location.hash, heapSupported: Boolean(performance.memory), documentVisibility: document.visibilityState };
    },
  };
}

async function mark(page, type, data = {}) { return page.evaluate(({ type, data }) => window.__performanceQA.mark(type, data), { type, data }); }
async function finalInput(page) { return page.evaluate(() => window.__performanceQA.finalInput()); }
async function markAfterScrollQuiet(page) {
  return page.evaluate(async ({ quietMs, timeoutMs }) => {
    const start = performance.now(); let lastChange = start; let previous = scrollY;
    const result = await new Promise((resolve) => {
      const tick = (time) => {
        if (Math.abs(scrollY - previous) > 0.1) { lastChange = time; previous = scrollY; }
        const quietFor = time - lastChange;
        if (quietFor >= quietMs || time - start >= timeoutMs) resolve({ elapsedMs: time - start, quietForMs: quietFor, timedOut: quietFor < quietMs });
        else requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    return window.__performanceQA.finalInput({ scrollQuiescence: result });
  }, { quietMs: config.scrollQuietMs, timeoutMs: config.scrollQuietTimeoutMs });
}
async function snapshot(page) { return page.evaluate(() => window.__performanceQA.snapshot()); }
async function begin(page) { await page.evaluate(() => window.__performanceQA.begin()); }
async function rawScroll(page, raw) {
  await page.evaluate((value) => scrollTo({ top: Math.max(innerHeight, 560) * 1.25 * value, behavior: 'instant' }), raw);
}
async function prepare(page, raw) { await rawScroll(page, raw); await page.waitForTimeout(300); }
async function ready(page) {
  await page.waitForFunction(() => window.__portfolio?.ready === true, undefined, { timeout: 25_000 });
  await page.locator('canvas[data-world]').waitFor({ state: 'visible' });
  await page.evaluate(() => document.fonts.ready);
}
async function continuous(page, destination, durationMs) {
  await page.evaluate(async ({ destination, durationMs }) => {
    const initial = scrollY; const target = Math.max(innerHeight, 560) * 1.25 * destination; const started = performance.now();
    await new Promise((resolve) => {
      function tick(time) {
        const mix = Math.min(1, (time - started) / durationMs);
        scrollTo({ top: initial + (target - initial) * mix, behavior: 'instant' });
        if (mix < 1) requestAnimationFrame(tick); else resolve();
      }
      requestAnimationFrame(tick);
    });
  }, { destination, durationMs });
}
async function boundedRun(work, label) {
  let timer;
  try {
    return await Promise.race([work(), new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(`${label} exceeded ${config.scenarioTimeoutMs} ms`)), config.scenarioTimeoutMs); })]);
  } finally { clearTimeout(timer); }
}
async function writeResult(viewportName, id, repetition, raw, extra = {}) {
  const result = { viewport: viewportName, id, repetition, status: 'measured', ...extra, summary: summarize(raw) };
  const file = `${viewportName}-${id}-${String(repetition).padStart(2, '0')}.json`;
  await writeFile(path.join(output, 'samples', file), `${JSON.stringify({ ...result, raw }, null, 2)}\n`, { flag: 'wx' });
  result.artifact = `samples/${file}`;
  report.results.push(result);
  if (!raw.profile?.samples?.length) report.availability.push({ viewport: viewportName, id, repetition, signal: 'application-profile', status: 'unavailable', reason: raw.profile?.reason || 'No samples returned.' });
  return result;
}
async function restMatrix(page, viewportName) {
  for (let chapter = 0; chapter < chapters.length; chapter += 1) {
    await prepare(page, chapter); await begin(page);
    await mark(page, 'rest', { chapter, id: chapters[chapter] }); await finalInput(page);
    await page.waitForTimeout(config.restSampleMs);
    const rest = await snapshot(page);
    check(`${viewportName}: rest ${chapter} reaches chapter`, rest.metrics?.chapter === chapter, rest.metrics);
    await writeResult(viewportName, `rest-${String(chapter).padStart(2, '0')}-${chapters[chapter]}`, 0, rest);
    if (config.screenshots) await page.screenshot({ path: path.join(output, 'screenshots', `${viewportName}-rest-${chapter}.png`) });
    if (chapter < chapters.length - 1) {
      await prepare(page, chapter + 0.56); await begin(page); await finalInput(page);
      await page.waitForTimeout(config.midpointSampleMs);
      const middle = await snapshot(page);
      check(`${viewportName}: midpoint ${chapter} is fractional`, middle.metrics?.progress > chapter + 0.35 && middle.metrics?.progress < chapter + 0.65, middle.metrics);
      await writeResult(viewportName, `midpoint-${String(chapter).padStart(2, '0')}`, 0, middle);
      if (config.screenshots) await page.screenshot({ path: path.join(output, 'screenshots', `${viewportName}-midpoint-${chapter}.png`) });
    }
  }
}

async function scenario(page, definition, viewport, viewportIndex, repetition) {
  const extra = { scenario: definition.name, input: definition.action };
  const scrollSpan = Math.max(viewport.height, 560) * 1.25 * 12;
  const initial = ['F'].includes(definition.id) ? 12 : ['D'].includes(definition.id) ? 6 : definition.id === 'H' ? 3.4 : 0;
  if (definition.id === 'G') {
    const midpoint = (viewportIndex * config.repetitions + repetition - 1) % 12 + 0.56;
    await begin(page); await prepare(page, midpoint);
    extra.beforeRefresh = await snapshot(page);
    const started = Date.now();
    await page.reload({ waitUntil: 'domcontentloaded' }); await ready(page);
    extra.readyAfterReloadMs = Date.now() - started;
    await mark(page, 'reload-ready', { requestedMidpoint: midpoint }); await markAfterScrollQuiet(page);
    await page.waitForTimeout(config.settleWindowMs);
    const raw = await snapshot(page);
    extra.refreshRecovery = { beforeRaw: extra.beforeRefresh.normalizedScroll.targetRaw, afterRaw: raw.normalizedScroll.targetRaw,
      beforeHash: extra.beforeRefresh.hash, afterHash: raw.hash,
      note: 'Records actual hash/chapter recovery. Fractional position restoration is not assumed.' };
    return { raw, extra };
  }
  await prepare(page, initial); await begin(page); await mark(page, 'scenario-start', { id: definition.id, repetition });
  if (definition.id === 'A') await continuous(page, 12, 9000);
  if (definition.id === 'B') {
    for (let event = 0; event < 8; event += 1) { await mark(page, 'wheel', { event, deltaY: scrollSpan / 6 }); await page.mouse.wheel(0, scrollSpan / 6); await sleep(35); }
  }
  if (definition.id === 'C') {
    for (let event = 0; event < 64; event += 1) { const delta = scrollSpan / 60 * (1 + 0.12 * Math.sin(event)); await mark(page, 'trackpad-style-wheel', { event, deltaY: delta }); await page.mouse.wheel(0, delta); await sleep(16); }
  }
  if (definition.id === 'D') {
    for (let event = 0; event < 24; event += 1) { const delta = scrollSpan * 0.24 * (event % 2 ? -1 : 1); await mark(page, 'reversal-wheel', { event, deltaY: delta }); await page.mouse.wheel(0, delta); await sleep(40); }
  }
  if (definition.id === 'E') {
    await mark(page, 'control-activation', { control: 'Explore my work' });
    await page.locator('article[data-chapter="0"] button[data-goto="7"]').click();
    await page.waitForFunction(() => window.__portfolio?.chapter === 7);
  }
  if (definition.id === 'F') {
    await mark(page, 'control-activation', { control: 'Return to the beginning' });
    await page.getByRole('button', { name: 'Return to the beginning', exact: true }).click();
    await page.waitForFunction(() => window.__portfolio?.chapter === 0);
  }
  if (definition.id === 'H') {
    extra.beforeResize = await snapshot(page);
    const alternate = { width: Math.max(280, viewport.width - 30), height: viewport.height + 90 };
    await mark(page, 'resize', { to: alternate }); await page.setViewportSize(alternate); await page.waitForTimeout(300);
    await mark(page, 'resize', { to: viewport }); await page.setViewportSize({ width: viewport.width, height: viewport.height }); await page.waitForTimeout(300);
    extra.afterResize = await snapshot(page);
    extra.rawPreservationError = Math.abs(extra.afterResize.normalizedScroll.targetRaw - extra.beforeResize.normalizedScroll.targetRaw);
  }
  if (definition.id === 'I') {
    for (let chapter = 0; chapter < 12; chapter += 1) { await mark(page, 'transition-jump', { raw: chapter + 0.56 }); await rawScroll(page, chapter + 0.56); await sleep(60); }
    await rawScroll(page, 12);
  }
  if (definition.id === 'J') {
    extra.memoryCheckpoints = [];
    const recordMemory = (checkpoint, journey) => {
      const latest = checkpoint.profile?.samples?.at(-1);
      extra.memoryCheckpoints.push({ journey, time: checkpoint.end, heapBytes: checkpoint.heap.at(-1)?.bytes ?? null,
        textures: latest?.textures ?? null, geometries: latest?.geometries ?? null, programs: latest?.programs ?? null });
    };
    await page.waitForTimeout(50); recordMemory(await snapshot(page), 0);
    for (let journey = 0; journey < 3; journey += 1) {
      await continuous(page, 12, 1200); await continuous(page, 0, 1200);
      recordMemory(await snapshot(page), journey + 1);
      await mark(page, 'journey-complete', { journey: journey + 1 });
    }
  }
  // Capture the delivered scroll target after a bounded quiet window. This measures
  // progress convergence after scrolling, not total interaction or camera latency.
  await markAfterScrollQuiet(page); await page.waitForTimeout(config.settleWindowMs);
  return { raw: await snapshot(page), extra };
}

async function compareBaseline() {
  if (phase !== 'after') return;
  if (!process.env.QA_BASELINE_REPORT) {
    report.comparison = { status: 'unavailable', reason: 'QA_BASELINE_REPORT was not supplied; no baseline is guessed.' }; return;
  }
  try {
    const baselinePath = path.resolve(process.env.QA_BASELINE_REPORT);
    const baseline = JSON.parse(await readFile(baselinePath, 'utf8'));
    const comparable = ['deviceScaleFactor', 'cpuThrottle', 'headless', 'repetitions', 'warmupMs', 'restSampleMs', 'midpointSampleMs', 'settleWindowMs'].every((key) => baseline.config?.[key] === config[key])
      && baseline.environment?.browserVersion === report.environment.browserVersion;
    report.comparison = { status: comparable ? 'computed' : 'conditions-differ', baselinePath,
      caution: 'Descriptive deltas only; machine load, caches, browser version, thermal state, and short sample size affect comparability.',
      rows: report.results.filter((result) => result.status === 'measured').map((current) => {
        const previous = baseline.results?.find((result) => result.viewport === current.viewport && result.id === current.id && result.repetition === current.repetition);
        if (!previous) return { viewport: current.viewport, id: current.id, repetition: current.repetition, status: 'no-matching-baseline' };
        return { viewport: current.viewport, id: current.id, repetition: current.repetition,
          baselineMeanMs: previous.summary?.raf?.mean ?? null, afterMeanMs: current.summary?.raf?.mean ?? null,
          meanDeltaMs: Number.isFinite(previous.summary?.raf?.mean) && Number.isFinite(current.summary?.raf?.mean) ? current.summary.raf.mean - previous.summary.raf.mean : null,
          baselineP95Ms: previous.summary?.raf?.p95 ?? null, afterP95Ms: current.summary?.raf?.p95 ?? null,
          baselineOver33: previous.summary?.raf?.over33ms ?? null, afterOver33: current.summary?.raf?.over33ms ?? null,
          baselineOver50: previous.summary?.raf?.over50ms ?? null, afterOver50: current.summary?.raf?.over50ms ?? null };
      }) };
  } catch (error) { report.comparison = { status: 'unavailable', reason: error.message }; }
}

await mkdir(path.join(output, 'samples'), { recursive: true });
if (config.screenshots) await mkdir(path.join(output, 'screenshots'), { recursive: true });
await writeFile(path.join(output, 'plan.json'), `${JSON.stringify(plan, null, 2)}\n`, { flag: 'wx' });
const stop = async () => { interrupted = true; if (browser) await browser.close().catch(() => {}); };
process.once('SIGINT', stop); process.once('SIGTERM', stop);
try {
  browser = await chromium.launch({ channel: 'chrome', executablePath: config.chromePath, headless: config.headless });
  report.environment.browserVersion = browser.version();
  report.sourceHashes = {};
  for (const filename of ['src/engine/World.ts', 'src/engine/Profile.ts', 'src/engine/scroll.ts', 'src/App.tsx', 'package-lock.json']) {
    report.sourceHashes[filename] = createHash('sha256').update(await readFile(path.join(projectRoot, filename))).digest('hex');
  }
  for (const [viewportIndex, viewport] of viewports.entries()) {
    if (interrupted) break;
    const viewportName = `${viewport.width}x${viewport.height}`;
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, deviceScaleFactor: config.deviceScaleFactor, reducedMotion: 'no-preference' });
    await context.addInitScript(installSampler);
    const page = await context.newPage(); page.setDefaultTimeout(12_000);
    page.on('pageerror', (error) => report.pageErrors.push({ viewport: viewportName, message: error.message }));
    page.on('console', (message) => { if (message.type() === 'error') report.consoleErrors.push({ viewport: viewportName, message: message.text() }); });
    page.on('requestfailed', (request) => { if (request.failure()?.errorText !== 'net::ERR_ABORTED') report.requestFailures.push({ viewport: viewportName, url: request.url(), error: request.failure()?.errorText }); });
    page.on('response', (response) => { if (/\/assets\/.*\.js(?:\?|$)/.test(response.url()) && !report.bundles.includes(response.url())) report.bundles.push(response.url()); });
    try {
      if (config.cpuThrottle !== 1) {
        const session = await context.newCDPSession(page); await session.send('Emulation.setCPUThrottlingRate', { rate: config.cpuThrottle });
      }
      await page.goto(profileURL.href, { waitUntil: 'domcontentloaded' }); await ready(page);
      await continuous(page, 12, 1200); await continuous(page, 0, 1200); await page.waitForTimeout(config.warmupMs);
      const availability = await snapshot(page);
      report.availability.push({ viewport: viewportName, applicationProfile: availability.profile.status,
        longTasks: availability.longTaskSupported, browserHeap: availability.heapSupported, gpuTiming: 'unavailable' });
      await restMatrix(page, viewportName);
      for (let repetition = 1; repetition <= config.repetitions; repetition += 1) {
        for (const definition of scenarios) {
          if (interrupted) break;
          console.log(`${phase} ${viewportName} ${definition.id} repeat ${repetition}/${config.repetitions}`);
          const { raw, extra } = await boundedRun(() => scenario(page, definition, viewport, viewportIndex, repetition), `${viewportName} ${definition.id}`);
          await writeResult(viewportName, definition.id, repetition, raw, extra);
        }
      }
    } catch (error) {
      report.results.push({ viewport: viewportName, status: interrupted ? 'interrupted' : 'failed', reason: error.message, timestamp: stamp() });
      report.availability.push({ viewport: viewportName, status: 'remaining-scenarios-skipped', reason: 'Viewport run stopped after failure; no uncollected measurements are inferred.' });
    } finally { await context.close().catch(() => {}); }
  }
  check('No browser JavaScript exceptions', report.pageErrors.length === 0, report.pageErrors);
  check('No browser console errors', report.consoleErrors.length === 0, report.consoleErrors);
  check('No failed browser resource requests', report.requestFailures.length === 0, report.requestFailures);
  await compareBaseline();
} catch (error) {
  report.results.push({ status: interrupted ? 'interrupted' : 'failed', reason: error.stack || error.message });
} finally {
  if (browser) await browser.close().catch(() => {});
  report.finishedAt = stamp();
  report.status = interrupted ? 'interrupted' : report.results.some((result) => result.status === 'failed') || report.checks.some((item) => !item.pass) ? 'completed-with-failures' : 'completed';
  report.summary = { measuredSegments: report.results.filter((result) => result.status === 'measured').length,
    failedSegments: report.results.filter((result) => result.status === 'failed').length,
    checksPassed: report.checks.filter((item) => item.pass).length, checksFailed: report.checks.filter((item) => !item.pass).length,
    note: 'No universal FPS, GPU cost, or leak conclusion is implied by these samples.' };
  await writeFile(path.join(output, 'report.json'), `${JSON.stringify(report, null, 2)}\n`, { flag: 'wx' });
  console.log(`Performance report: ${path.join(output, 'report.json')}`); console.log(JSON.stringify(report.summary));
  process.exitCode = report.status === 'completed' ? 0 : interrupted ? 130 : 1;
}
