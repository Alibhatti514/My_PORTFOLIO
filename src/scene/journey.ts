/** Every property is sampled from the same reversible native-scroll coordinate. */
export const waypoints = [
  { id: "home", name: "Origin" },
  { id: "about", name: "The human" },
  { id: "skills", name: "The toolkit" },
  { id: "work", name: "RCS Cargo" },
  { id: "goldadan", name: "Goldadan" },
  { id: "bhabhi-thulla", name: "Bhabhi Thulla" },
  { id: "credentials", name: "The collection" },
  { id: "contact", name: "A new beginning" },
] as const;
export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const smooth = (x: number) => {
  x = clamp(x);
  return x * x * (3 - 2 * x);
};
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export function samplePath(p: number, values: number[][]): number[] {
  p = clamp(p, 0, values.length - 1);
  const i = Math.min(values.length - 2, Math.floor(p)),
    t = smooth(p - i);
  return values[i].map((v, k) => mix(v, values[i + 1][k], t));
}
// Monotonic vertical travel. The camera never returns to the origin or orbits it.
export const cameraPath = Array.from({ length: 8 }, (_, i) => [
  0,
  -i * 9,
  15 + [0, 0.4, 1, 0, 0.6, 0.2, 1, 0][i],
]);
export const targetPath = Array.from({ length: 8 }, (_, i) => [0, -i * 9, -1]);
export function portraitPose(p: number, mobile = false) {
  const depart = smooth((p - 0.92) / 0.9),
    drift = smooth(p / 0.95);
  return {
    x: mix(0, mobile ? -12 : -27, drift),
    y: mix(0, mobile ? -19 : -3, drift) - depart * 10,
    scale: mix(1, 0.74, drift) - depart * 0.12,
    opacity: 1 - depart,
    mask: mix(91, -12, depart),
    blur: depart * 3,
  };
}
export function panelPose(p: number, index: number) {
  const d = index - p;
  return { y: d * 90, z: -Math.abs(d) * 150, rotate: clamp(d, -1, 1) * 2 };
}
