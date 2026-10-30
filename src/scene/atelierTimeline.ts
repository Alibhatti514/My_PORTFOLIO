import {smooth,clamp} from './journey';
export const atelierScenes=['engineering-portal','development-workstation','code-universe','software-foundry','deployment-engine','production-observatory'] as const;
export function atelierTimeline(p:number) {
  const stage=p<1.84?0:p<3.2?1:p<4?2:p<4.6?3:p<5.05?4:5;
  return {stage:atelierScenes[stage],presence:smooth((p-1.84)/.3)*(1-smooth((p-5.3)/.25)),
    awaken:smooth((p-2.5)/.65),portal:smooth((p-3.2)/.7),foundry:smooth((p-4)/.58),
    deployment:clamp((p-4.6)/.6),observatory:smooth((p-5.02)/.25)};
}
