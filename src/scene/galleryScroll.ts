import { clamp, samplePath } from './journey';

/** A continuous route through the courts. Values are world units, never screen offsets. */
export function galleryState(progress: number, mobile = false) {
  const p = clamp(progress, 0, 7);
  const [x, y, ahead, yaw, roll, aperture] = samplePath(p, [
    [0, 7, 0, -.08, 0, 48], [-6, 5, 1, .2, -.025, 52],
    [4, 9, -2, -.16, .018, 48], [7, 6, 0, -.25, .025, 53],
    [-4, 5, 2, .18, -.022, 49], [3, 8, -1, -.12, .018, 52],
    [-5, 6, 0, .16, -.018, 49], [0, 11, -3, 0, 0, 55],
  ]);
  return {
    camera: [x * (mobile ? .65 : 1), y, 24 - p * 28 + ahead] as [number, number, number],
    yaw, roll: roll * (mobile ? .5 : 1), fov: mobile ? aperture + 9 : aperture,
    light: 2.7 + Math.sin(p * .65) * .45,
    courts: Array.from({ length: 7 }, (_, i) => {
      const t = clamp(p - i + .5);
      return { rotation: (t - .5) * .38 * (i % 2 ? -1 : 1),
        rise: Math.sin(t * Math.PI) * 2, scale: 1 + Math.sin(t * Math.PI) * .13 };
    }),
  };
}
