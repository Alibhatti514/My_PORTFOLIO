import { clamp, samplePath } from './journey';

/** One reversible spatial coordinate, shared by the page and its material. */
export function spatialPose(progress: number, mobile = false) {
  const p = clamp(progress, 0, 7);
  const [fold, depth, lean] = samplePath(p, [
    [.24, 0, -.12], [.65, .35, .18], [.38, .65, -.2],
    [.8, .3, .16], [.5, .75, -.12], [.72, .45, .2],
    [.34, .2, -.08], [.12, 0, 0],
  ]);
  const intensity = mobile ? .38 : 1;
  return { progress: p, fold: fold * intensity, depth: depth * intensity,
    lean: lean * intensity, perspective: 1800 + depth * 360 * intensity };
}

export const credentialNumber = (index: number) => String(index + 1).padStart(2, '0');
