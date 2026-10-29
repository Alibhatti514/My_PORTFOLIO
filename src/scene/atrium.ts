import { clamp } from './journey';

/** One composed folio turns away as the next approaches through depth. */
export function projectPose(p: number, index: number, mobile = false) {
  const d = index - clamp(p - 3, 0, 2), a = Math.abs(d);
  return { x: d * (mobile ? 75 : 100), y: d * (mobile ? 25 : 12),
    z: -a * (mobile ? 250 : 420), rotateY: d * (mobile ? -10 : -24),
    rotateX: d * 7, opacity: clamp((1 - a) * 1.8) };
}
