import { clamp, smooth } from './journey';

/** One composed folio turns away as the next approaches through depth. */
export function projectPose(p: number, index: number, mobile = false) {
  const d = index - clamp(p - 3, 0, 2), a = Math.abs(d);
  // Keep one readable project in the editorial column. The old 100% fly-through
  // put two descriptions and logos on top of the workstation at half-way points.
  return { x: 0, y: d * (mobile ? 2 : 3),
    z: -a * 35, rotateY: d * -2, rotateX: d,
    opacity: (1 - smooth((a - .28) / .22)) * (1 - smooth((p-5.44)/.3)) };
}
