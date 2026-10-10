export const CHAPTER_COUNT = 13;
export const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value));
export const smooth = (value: number) => { const t = clamp(value); return t * t * (3 - 2 * t); };
export const chapterStep = () => Math.max(window.innerHeight, 560) * 1.25;
export function scrollToChapter(index: number, reduced: boolean, id?: string) {
  if (id && location.hash !== `#${id}`) history.pushState(null, '', `#${id}`);
  window.scrollTo({ top: index * chapterStep(), behavior: reduced ? 'instant' : 'smooth' });
}
export function getScrollState(reduced = false) {
  const raw = clamp(window.scrollY / chapterStep(), 0, CHAPTER_COUNT - 1);
  const base = Math.floor(raw);
  const mix = smooth((raw - base - 0.22) / 0.68);
  const progress = reduced ? Math.round(raw) : base + mix;
  return { raw, progress, chapter: Math.min(CHAPTER_COUNT - 1, Math.round(progress)), mix };
}
