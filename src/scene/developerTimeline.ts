import { clamp, smooth, samplePath } from './journey';

export const developerStages = ['development-workstation', 'code-awakening', 'code-universe', 'software-assembly', 'production-ready'] as const;
/** Absolute scroll samples: no clocks, accumulated rotations or direction-dependent state. */
export function developerTimeline(p: number, mobile = false) {
  const t = clamp((p - 1.94) / 3.62) * 5;
  const presence = smooth((p - 1.84) / .30) * (1 - smooth((p - 5.30) / .25));
  const camera = samplePath(t, [
    [0, 3.4, 9.5], [0, 3, 10.8], [0, 1.65, 5.6],
    [0, 1.6, -6], [0, 3.2, -9], [0, 4, -6],
  ]);
  const target = samplePath(t, [[0,.8,0],[0,1,0],[0,1,-8],[0,0,-27],[0,.3,-27],[0,.6,-27]]);
  if (mobile) { camera[2] += .5 * (1-smooth((t-1.7)/.6)); camera[1] += .25; }
  return { t, presence, stage: developerStages[Math.min(4, Math.floor(t))], camera, target,
    lid: smooth(t / .7), boot: smooth((t - .35) / .45),
    typing: smooth((t - .65) / .75), awakening: smooth((t - .85) / .8),
    portal: smooth((t - 1.7) / .8), assembly: smooth((t - 2.8) / 1.2),
    tests: smooth((t - 3.9) / .45), deploy: smooth((t - 4.1) / .35),
  };
}
