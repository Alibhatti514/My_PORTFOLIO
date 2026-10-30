import { Color, Euler, Quaternion, Vector3 } from 'three';
export const BEAM_COUNT = 72;
export type Pose = { position: Vector3; scale: Vector3; quaternion: Quaternion; color: Color };
const colors = ['#c6c5eb', '#dbe4ef', '#b1bcee', '#e5e7f5', '#9ed4df', '#b7a5e9'];
function pose(x: number, y: number, z: number, sx: number, sy: number, sz: number, rx = 0, ry = 0, rz = 0, c = 0): Pose {
  return { position: new Vector3(x,y,z), scale: new Vector3(sx,sy,sz), quaternion: new Quaternion().setFromEuler(new Euler(rx,ry,rz)), color: new Color(colors[c % colors.length]) };
}
export function beamPose(chapter: number, i: number): Pose {
  const lane = i % 12, level = Math.floor(i / 12), side = i % 2 ? 1 : -1;
  switch(chapter) {
    case 0: { // The architectural wings around the human.
      const col = i % 18, row = Math.floor(i / 18);
      return pose(side * (2.9 + col * .18), -2.7 + col * .092, -1.9 - row * .55,
        .105, 1.25 + col * .13, .38, 0, side * -.14, side * -.2, row === 0 ? 5 : 1);
    }
    case 1: return pose((lane-5.5)*.52, (level-2.5)*.43-.55, -1.4+level*.11, .35 + ((i*7)%4)*.04, .06, .16, 0, 0, 0, i%3===0 ? 5 : 2);
    case 2: { const station = Math.floor(i/24); const k=i%24; return pose((station-1)*3.15 + Math.cos(k*.262)*.65, -2.4+(k%8)*.20, Math.sin(k*.262)*.65-.7, .15, .85, .23, 0, station*.25, (station-1)*.05, station+1); }
    case 3: return pose((lane-5.5)*.57, -2.0+level*.5, -1.5+level*.14, .50, .12, .17, 0, 0, 0, level%2 ? 1 : 2);
    case 4: { const rack=Math.floor(i/18); const k=i%18; return pose((rack-1.5)*2.30, -2.3 + (k%6)*.32, -1.25+Math.floor(k/6)*.48, 1.45, .08, .30, 0, -.18, 0, rack===2 ? 4 : 1); }
    case 5: return pose((i%3-1)*2.9 + (Math.floor(i/3)%4-.5)*.15, -2.2+Math.floor(i/12)*.34, -1.25 + (i%4)*.22, 1.7, .16, .21, 0, 0, 0, i%3+1);
    case 6: return pose((lane-5.5)*.61, -1.5 + Math.sin(lane*.6+level)*.3, (level-2.5)*.27, .42,.08,.16, 0, 0, 0, level%3+1);
    case 7: return pose((lane-5.5)*.64, -2.2+(level%3)*.31, (Math.floor(level/3)-.5)*1.6, .58,.25,.6, 0, 0, 0, level%3===0 ? 5 : 1);
    case 8: { const k=i%24; return pose((k-11.5)*.28, -.9+Math.floor(i/24)*.46, -1.6 + Math.floor(i/24)*.6, .09, 2.8-Math.abs(k-11.5)*.13,.14, 0, -.12, 0, Math.floor(i/24)===0 ? 5 : 1); }
    case 9: return pose((lane-5.5)*.50, -2.4+level*.055, -1.0+level*.16, .45,.035,.8, 0, (lane-5.5)*.018, 0, level===5 ? 2 : 1);
    case 10: return pose((lane-5.5)*.64,-2.25+lane*.085,-1.0+level*.22,.55,.15,.15,0,0,0,level%2?1:2);
    case 11: return pose((lane-5.5)*.47, -2.6+lane*.17, -1.6+level*.3, .40,.2,.28,0,0,0,level%3);
    default: {const station=i%5,k=Math.floor(i/5); return pose((station-2)*1.8 + (k%3-1)*.22, -2.5+Math.floor(k/3)*.27, -.45+(k%2)*.21, .14, .45,.32,0,0,0, station%3+1);}
  }
}
export const beamPoses = Array.from({length:13},(_,c)=>Array.from({length:BEAM_COUNT},(_,i)=>beamPose(c,i)));
export const cameras = [
  [0,.65,12.4], [-.55,.65,11.5], [1,1.45,12.5], [-.8,1.25,12.9], [1.2,1.9,13.1],
  [.55,2.5,13.3], [-.7,1.8,12.4], [1.5,3.6,13.9], [.2,1.1,12.7], [1.3,2.2,12.3],
  [-.6,1.65,13.1], [.7,2.45,13.4], [0,1.25,13.3],
];
