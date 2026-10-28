/** Native scroll defines the one shared world timeline. No scene swaps. */
export const waypoints = [
  { id: "home", name: "Origin" },
  { id: "about", name: "The human" },
  { id: "skills", name: "The constellation" },
  { id: "work", name: "RCS Cargo" },
  { id: "goldadan", name: "Goldadan" },
  { id: "bhabhi-thulla", name: "Bhabhi Thulla" },
  { id: "credentials", name: "The collection" },
  { id: "contact", name: "The next chapter" },
] as const;
export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const smooth = (x: number) => {
  x = clamp(x);
  return x * x * (3 - 2 * x);
};
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export function samplePath(p: number, values: number[][]): number[] {
  const i = Math.min(
    values.length - 2,
    Math.floor(clamp(p, 0, values.length - 1)),
  );
  const t = smooth(p - i);
  return values[i].map((v, k) => mix(v, values[i + 1][k], t));
}
export const cameraPath = [
  [0, 0.3, 12.5],
  [1.7, 0.5, 10.7],
  [-0.7, 1, 13.8],
  [1.2, 0.7, 11.7],
  [-1, 0.4, 11.3],
  [0.8, 0.8, 11.8],
  [0, 2, 13],
  [0, 0.3, 12.5],
];
export const targetPath = [
  [0, 0, 0],
  [0.3, 0.1, 0],
  [0, 0, -0.4],
  [0.4, 0, 0],
  [0.3, 0, 0],
  [0.4, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
];
