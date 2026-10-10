/**
 * Source-only geometry audit. No browser, DOM, canvas, screenshot, or GPU is used.
 * Run: node --import tsx scripts/audit-mobile-layout.ts
 *
 * Camera expressions are read from World.ts, evaluated against Three.js math
 * objects, and cross-referenced with CSS declarations. This is a mathematical
 * baseline, not rendered-layout validation or visual QA.
 */
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import * as THREE from 'three';
import ts from 'typescript';

const root = process.cwd();
const paths = ['src/engine/World.ts', 'src/engine/scroll.ts', 'src/scene/poses.ts',
  'src/scene/installations.ts', 'src/styles.css', 'src/App.tsx', 'index.html'];
const texts = Object.fromEntries(await Promise.all(paths.map(async file =>
  [file, await readFile(path.join(root, file), 'utf8')])));
const world = texts['src/engine/World.ts'];
const installations = texts['src/scene/installations.ts'];
const poseSource = ts.createSourceFile('poses.ts', texts['src/scene/poses.ts'], ts.ScriptTarget.Latest, true);
const worldSource = ts.createSourceFile('World.ts', world, ts.ScriptTarget.Latest, true);
const installationSource = ts.createSourceFile('installations.ts', installations, ts.ScriptTarget.Latest, true);
const scrollSource = ts.createSourceFile('scroll.ts', texts['src/engine/scroll.ts'], ts.ScriptTarget.Latest, true);

function nodes(rootNode: ts.Node, predicate: (node: ts.Node) => boolean): ts.Node[] {
  const found: ts.Node[] = [];
  const visit = (node: ts.Node) => { if (predicate(node)) found.push(node); node.forEachChild(visit); };
  visit(rootNode); return found;
}
function callArgs(source: ts.SourceFile, name: string): string[] {
  const result = nodes(source, node => ts.isCallExpression(node) && node.expression.getText(source) === name);
  if (result.length !== 1) throw new Error(`Expected exactly one ${name}; found ${result.length}. Update audit model.`);
  return (result[0] as ts.CallExpression).arguments.map(arg => arg.getText(source));
}
function assignment(source: ts.SourceFile, name: string): string {
  const result = nodes(source, node => ts.isBinaryExpression(node) && node.left.getText(source) === name && node.operatorToken.kind === ts.SyntaxKind.EqualsToken);
  if (result.length !== 1) throw new Error(`Expected exactly one assignment to ${name}; update audit model.`);
  return (result[0] as ts.BinaryExpression).right.getText(source);
}
function evaluate(expression: string, context: Record<string, unknown>, self: unknown = {}) {
  return new Function(...Object.keys(context), `return (${expression});`).call(self, ...Object.values(context));
}
const camerasDeclaration = nodes(poseSource, node => ts.isVariableDeclaration(node) && node.name.getText(poseSource) === 'cameras')[0] as ts.VariableDeclaration;
if (!camerasDeclaration?.initializer) throw new Error('Camera table unavailable.');
const cameras = evaluate(camerasDeclaration.initializer.getText(poseSource), {}) as number[][];
const cameraConstructor = nodes(worldSource, node => ts.isNewExpression(node) && node.expression.getText(worldSource) === 'THREE.PerspectiveCamera')[0] as ts.NewExpression;
const cameraArguments = cameraConstructor.arguments?.map(argument => Number(argument.getText(worldSource)));
if (!cameraArguments || cameraArguments.some(value => !Number.isFinite(value))) throw new Error('Nonconstant camera constructor; update audit model.');
const stageScale = callArgs(worldSource, 'this.stage.scale.set');
const stageY = assignment(worldSource, 'this.stage.position.y');
const tabletExpression = (nodes(worldSource, node => ts.isVariableDeclaration(node) && node.name.getText(worldSource) === 'tablet')[0] as ts.VariableDeclaration)?.initializer?.getText(worldSource);
if (!tabletExpression) throw new Error('Tablet predicate unavailable.');
const mobileAssignments = nodes(worldSource, node => ts.isBinaryExpression(node) && node.left.getText(worldSource) === 'this.mobile' && node.operatorToken.kind === ts.SyntaxKind.EqualsToken) as ts.BinaryExpression[];
const mobilePredicates = [...new Set(mobileAssignments.map(node => node.right.getText(worldSource)))];
if (mobilePredicates.length !== 1) throw new Error('Mobile classification differs between initialization and resizing; audit explicitly.');
const mobileExpression = mobilePredicates[0];
const cameraStartToken = 'this.camera.position.lerpVectors(this.cameraFrom,this.cameraTo,t);';
const cameraStart = world.indexOf(cameraStartToken);
const cameraEnd = world.indexOf('if(chapter===12)', cameraStart);
if (cameraStart < 0 || cameraEnd < 0) throw new Error('Camera composition boundaries changed; update audit model.');
const cameraAdjustment = world.slice(cameraStart + cameraStartToken.length, cameraEnd).trim();
// Only the existing camera and scalar arithmetic are evaluated, never World or
// its constructor. Reject obvious browser/rendering references in the slice.
if (/document|window|renderer|requestAnimationFrame|fetch|Texture|installations/.test(cameraAdjustment)) {
  throw new Error('Camera slice contains side effects outside this source-only model.');
}
const anchorPosition = callArgs(installationSource, 'fin.position.set');
const socialPoint = callArgs(worldSource, 'this.point.set');
const stepExpression = (nodes(scrollSource, node => ts.isVariableDeclaration(node) && node.name.getText(scrollSource) === 'chapterStep')[0] as ts.VariableDeclaration)?.initializer;
if (!stepExpression || !ts.isArrowFunction(stepExpression)) throw new Error('chapterStep must remain an expression function.');
const stepBody = stepExpression.body.getText(scrollSource);

type Rule = { selectors: string[]; media: string[]; declarations: Record<string, string>; order: number };
const rules: Rule[] = [];
function parseCSS(input: string, media: string[] = []) {
  let cursor = 0;
  while (cursor < input.length) {
    const opening = input.indexOf('{', cursor); if (opening < 0) break;
    const prelude = input.slice(cursor, opening).trim();
    let depth = 1, end = opening + 1;
    while (end < input.length && depth) { if (input[end] === '{') depth++; if (input[end] === '}') depth--; end++; }
    if (depth) throw new Error('Unbalanced stylesheet.');
    const body = input.slice(opening + 1, end - 1); cursor = end;
    if (prelude.startsWith('@media')) parseCSS(body, [...media, prelude.slice(6).trim()]);
    else if (!prelude.startsWith('@')) {
      const declarations: Record<string, string> = {};
      for (const item of body.split(';')) { const colon = item.indexOf(':'); if (colon > 0) declarations[item.slice(0, colon).trim()] = item.slice(colon + 1).trim(); }
      rules.push({ selectors: prelude.split(',').map(value => value.trim()), media, declarations, order: rules.length });
    }
  }
}
parseCSS(texts['src/styles.css'].replace(/\/\*[\s\S]*?\*\//g, ''));
function mediaMatches(query: string, width: number, height: number): boolean {
  if (query.includes(',')) return query.split(',').some(part => mediaMatches(part, width, height));
  for (const match of query.matchAll(/\((min|max)-(width|height):\s*([\d.]+)px\)/g)) {
    const measured = match[2] === 'width' ? width : height;
    if (match[1] === 'min' ? measured < Number(match[3]) : measured > Number(match[3])) return false;
  }
  for (const match of query.matchAll(/\((min|max)-aspect-ratio:\s*([\d.]+)\/([\d.]+)\)/g)) {
    const limit = Number(match[2]) / Number(match[3]);
    if (match[1] === 'min' ? width / height < limit : width / height > limit) return false;
  }
  const unsupported = query.replace(/\((min|max)-(width|height):\s*[\d.]+px\)/g, '')
    .replace(/\((min|max)-aspect-ratio:\s*[\d.]+\/[\d.]+\)/g, '').replace(/\band\b/g, '').trim();
  if (unsupported) throw new Error(`Unsupported media condition: ${query}. Extend the audit instead of assuming.`);
  return true;
}
function style(selectors: string[], width: number, height: number) {
  const applicable = rules.flatMap(rule => rule.selectors.filter(selector => selectors.includes(selector))
    .map(selector => ({ ...rule, specificity: (selector.match(/[.#]/g) || []).length })))
    .filter(rule => rule.media.every(query => mediaMatches(query, width, height)))
    .sort((a, b) => a.specificity - b.specificity || a.order - b.order);
  return Object.assign({}, ...applicable.map(rule => rule.declarations)) as Record<string, string>;
}
function px(value: string | undefined, width: number, height: number): number {
  if (value === undefined) throw new Error('Expected explicit CSS length.');
  if (value === '0') return 0;
  const match = value.match(/^(-?[\d.]+)(px|vw|vh|dvh|svh)$/);
  if (!match) throw new Error(`Unsupported CSS length: ${value}; do not infer browser resolution.`);
  const amount = Number(match[1]); return amount * (match[2] === 'px' ? 1 : match[2] === 'vw' ? width / 100 : height / 100);
}
const rounded = (number: number) => Math.round(number * 100) / 100;
const viewportSizes = [
  [320,568], [360,800], [375,812], [390,844], [414,896], [430,932], [768,1024],
  [568,320], [800,360], [812,375], [844,390], [896,414], [932,430], [1024,768],
  [1920,1080], [1440,900], [1366,768], [360,640], [375,667], [820,1180],
];
const requestedPortrait = new Set(['320x568','360x800','375x812','390x844','414x896','430x932','768x1024']);
const requestedLandscape = new Set(['568x320','800x360','812x375','844x390','896x414','932x430','1024x768']);
const measurements = viewportSizes.map(([width, height]) => {
  const context: Record<string, unknown> = { innerWidth: width, innerHeight: height, a: 12, b: 12, t: 0, chapter: 12, progress: 12, time: 0 };
  const mobile = Boolean(evaluate(mobileExpression, context));
  const camera = new THREE.PerspectiveCamera(cameraArguments[0], width / height, cameraArguments[2], cameraArguments[3]);
  camera.position.fromArray(cameras[12]);
  const self = { mobile, reduced: false, pointer: new THREE.Vector2(), camera };
  const tablet = Boolean(evaluate(tabletExpression, context, self)); context.tablet = tablet;
  const stage = new THREE.Group();
  stage.scale.fromArray(stageScale.map(expression => evaluate(expression, context, self)));
  stage.position.y = evaluate(stageY, context, self);
  new Function(...Object.keys(context), cameraAdjustment).call(self, ...Object.values(context));
  camera.updateMatrixWorld(); stage.updateMatrixWorld(true);
  const centers = Array.from({ length: 5 }, (_, i) => {
    const anchor = new THREE.Object3D();
    anchor.position.fromArray(anchorPosition.map(expression => evaluate(expression, { ...context, i })));
    stage.add(anchor); anchor.updateMatrixWorld(true);
    const point = new THREE.Vector3().fromArray(socialPoint.map(expression => evaluate(expression, context, self)));
    anchor.localToWorld(point); point.project(camera);
    return { x: rounded((point.x * .5 + .5) * width), y: rounded((-point.y * .5 + .5) * height) };
  });
  const socialCSS = style(['.social-link'], width, height);
  const socialWidth = px(socialCSS.width, width, height);
  const socialSeparation = centers.slice(1).map((center, index) => rounded(center.x - centers[index].x));
  const footerCSS = style(['.story-footer'], width, height);
  const footerWidth = width - px(footerCSS.left, width, height) - px(footerCSS.right, width, height);
  const currentCSS = style(['.chapter-current'], width, height);
  const actionCSS = style(['.chapter-actions'], width, height);
  const previousCSS = style(['.icon-control', '.chapter-control.previous-chapter'], width, height);
  const nextCSS = style(['.icon-control', '.next-chapter', '.chapter-control.next-chapter'], width, height);
  const actionWidth = px(previousCSS.width, width, height) + px(nextCSS.width ?? nextCSS['min-width'], width, height) + px(actionCSS.gap, width, height);
  const trackCSS = style(['.chapter-track'], width, height);
  const trackUpperBound = footerWidth - px(currentCSS['min-width'], width, height) - actionWidth - px(footerCSS.gap, width, height) * 2;
  const trackGaps = px(trackCSS.gap, width, height) * 12;
  const headerHeight = px(style(['.site-header'], width, height).height, width, height);
  const headingTop = px(style(['.chapter-heading'], width, height).top, width, height);
  const heroEyebrowTop = px(style(['.hero-eyebrow'], width, height).top, width, height);
  const projectAsideBottom = px(style(['.chapter-aside', '.chapter--rcs-cargo .chapter-aside'], width, height).bottom, width, height);
  const footerHeight = px(footerCSS.height, width, height);
  return {
    viewport: `${width}x${height}`, width, height,
    matrixGroup: requestedPortrait.has(`${width}x${height}`) ? 'requested portrait' : requestedLandscape.has(`${width}x${height}`) ? 'rotated requested viewport' : 'additional coverage',
    selectedSceneProfile: mobile ? 'mobile' : tablet ? 'tablet' : 'desktop',
    social: { chapter: 'connect', pointer: 'neutral', motion: 'full', centers, cssHitWidthPx: socialWidth,
      centerSeparationPx: socialSeparation, adjacentHitGapPx: socialSeparation.map(value => rounded(value - socialWidth)),
      hasOverlappingHitRectangles: socialSeparation.some(value => value < socialWidth),
      outerBoundsX: [rounded(centers[0].x - socialWidth / 2), rounded(centers[4].x + socialWidth / 2)],
      stageScale: stage.scale.toArray(), brandPlaneWidthToHeightScaleRatio: rounded(stage.scale.x / stage.scale.y),
      note: 'Projected from actual rest-pose camera expressions and fin anchors; CSS rectangle width is source-derived. Font shaping, hover, DOM layout, and actual rendering are not measured.' },
    footer: { availableWidthPx: rounded(footerWidth), currentControlMinWidthPx: px(currentCSS['min-width'], width, height),
      previousAndNextMinimumWidthPx: rounded(actionWidth), trackAvailableWidthUpperBoundPx: rounded(trackUpperBound),
      trackInternalGapsPx: trackGaps, eachOf13TrackButtonsWidthUpperBoundPx: rounded(Math.max(0, (trackUpperBound - trackGaps) / 13)),
      fixedGapsAloneExceedTrackSpace: trackGaps > trackUpperBound,
      note: 'Conservative upper bound: text intrinsic sizing can only reduce track room. A desktop next-label intrinsic width is not measured.' },
    verticalReservations: { headerHeightPx: headerHeight, chapterHeadingTopPx: rounded(headingTop),
      chapterHeadingStartsInsideHeader: headingTop < headerHeight, heroEyebrowTopPx: rounded(heroEyebrowTop),
      heroEyebrowStartsInsideHeader: heroEyebrowTop < headerHeight, footerHeightPx: footerHeight,
      projectAsideBottomPx: rounded(projectAsideBottom), projectAsideFooterIntrusionPx: rounded(Math.max(0, footerHeight - projectAsideBottom)),
      note: 'Compares declared containing-block coordinates only; no rendered ink rectangles or browser toolbar dimensions are inferred.' },
  };
});
function scrollStep(height: number) { return Number(evaluate(stepBody, { window: { innerHeight: height } })); }
function storyState(raw: number) {
  const bounded = Math.max(0, Math.min(12, raw)), base = Math.floor(bounded);
  const t = Math.max(0, Math.min(1, (bounded - base - .22) / .68));
  const progress = base + t * t * (3 - 2 * t);
  return { raw: rounded(bounded), progress: rounded(progress), activeChapter: Math.round(progress) };
}
const resizeExamples = [[844,744],[744,844]].map(([fromHeight,toHeight]) => {
  const oldStep = scrollStep(fromHeight), newStep = scrollStep(toHeight), raw = 10, scrollY = raw * oldStep;
  return { fromHeight, toHeight, before: storyState(raw), oldStep, newStep, scrollY,
    beforeDelayedCompensation: storyState(scrollY / newStep), intendedAfterCompensation: storyState(raw),
    sourceDebounceMs: 80, note: 'Arithmetic for the resize gap before App.tsx delayed scroll compensation, not an observed browser trace.' };
});
const report = {
  kind: 'source-only mathematical mobile layout audit', generatedAt: new Date().toISOString(),
  command: 'node --import tsx scripts/audit-mobile-layout.ts',
  evidenceBoundary: { browserLaunched: false, domMeasured: false, screenshotsReviewed: false,
    gpuMeasured: false, fpsMeasured: false, realDeviceMeasured: false,
    statement: 'These results are numerical source measurements. They do not constitute browser visual QA, accessible-name auditing, actual safe-area behavior, real-device testing, or GPU performance measurements.' },
  sources: paths.map(file => ({ path: file, sha256: createHash('sha256').update(texts[file]).digest('hex') })),
  model: { cameraFovDegrees: cameraArguments[0], cameraRestPose: cameras[12], mobileExpression, tabletExpression,
    stageScaleExpressions: stageScale, stageYExpression: stageY, cameraAdjustmentSource: cameraAdjustment,
    finPositionExpressions: anchorPosition, projectedPointExpressions: socialPoint, scrollStepExpression: stepBody,
    knownLimits: ['CSS parser supports the current width/height/aspect-ratio queries and rejects unsupported conditions.',
      'Pure Three.js projection uses the stable Connect pose, neutral pointer, and no hover.',
      'CSS font metrics and line wrapping require a browser and are not simulated.',
      'Source files may change after this baseline; hashes identify exactly which contents were modeled.'] },
  measurements, resizeExamples,
  sourceFindings: [
    { id: 'safe-area', evidence: { cssHasSafeAreaInsets: /safe-area-inset/.test(texts['src/styles.css']), viewportFitCover: /viewport-fit\s*=\s*cover/.test(texts['index.html']), visualViewportListener: /visualViewport/.test(texts['src/App.tsx'] + world) },
      conclusion: 'No explicit safe-area reservation or visual-viewport handling exists in the audited sources. Actual notch/home-indicator occlusion has not been observed.' },
    { id: 'resize-progress', source: 'src/App.tsx resize handler; src/engine/scroll.ts chapterStep/getScrollState',
      conclusion: 'Scroll progress reads the new innerHeight immediately, while position compensation is delayed 80 ms. Examples above demonstrate the possible intermediate chapter change. Scroll events during that delay also update lastRaw against the new step.' },
    { id: 'reading-anchor', source: 'src/App.tsx go(); src/styles.css .reading-view section and .site-header',
      conclusion: 'Reading navigation uses scrollIntoView without scroll-margin-top. Section top padding is 35 px mobile / 55 px desktop, less than the 77 px / 110 px fixed header; the aligned section overline can start beneath the header.' },
    { id: 'remaining-hit-targets', source: 'src/styles.css .project-action, .hero-profession .text-link, .contact-meta a, .reading-socials a, .menu-bottom button',
      conclusion: 'These controls have no 44 px minimum hit height; their declared font/padding/icon sizes are smaller. Existing AnimatedControls already preserve 44 px résumé/previous/next hit boxes. Exact font-dependent rectangles are not measured.' },
    { id: 'landscape-profile', source: 'src/engine/World.ts mobile width predicate; src/styles.css media rules',
      conclusion: 'A phone rotated wider than 699 px selects desktop geometry/CSS even when height is360–430px. The numerical header and social overlap results quantify consequences.' },
  ],
  suggestedMinimalStrategy: [
    'Separate stable logical chapter-step height from current visual-stage height. Resize the canvas immediately; preserve narrative progress on committed width/orientation changes rather than every toolbar resize.',
    'Add shared header/footer/safe-area reservations and one compact landscape profile; use them for overlay and camera fitting.',
    'Keep existing animated icons and 44 px controls. On narrow screens make the 13-segment track a noninteractive progress indicator, with chapter access through the existing Index and previous/next controls.',
    'Fit social centers to viewport width and enforce nonoverlapping 44 px minimum targets; use a separate wide, shallow landscape spread while keeping the five platform order unchanged.',
    'Use per-chapter compact positions: centered hero; three closer language/workflow stations; two rows for six frontend anchors; 2×2 backend stations; compact data tables; centered project logos; staggered career/education markers. Preserve assets and the shared continuous beam architecture.',
    'Use uniform scale for logo planes or inverse compensation so mobile fitting does not deform authentic marks. Keep small 3D secondary labels supported by readable semantic tags.',
    'Set reading-section scroll margin to header plus safe-top and spacing. Add hit-area padding to remaining compact links without replacing artwork.',
  ],
};
const output = path.join(root, 'docs/performance-baseline/mobile-source-audit.json');
await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ output: path.relative(root, output), evidence: report.kind,
  viewports: measurements.length,
  socialOverlapViewports: measurements.filter(item => item.social.hasOverlappingHitRectangles).map(item => item.viewport),
  collapsedTrackViewports: measurements.filter(item => item.footer.fixedGapsAloneExceedTrackSpace).map(item => item.viewport),
  headerConflictViewports: measurements.filter(item => item.verticalReservations.chapterHeadingStartsInsideHeader).map(item => item.viewport),
  resizeExamples }, null, 2));
