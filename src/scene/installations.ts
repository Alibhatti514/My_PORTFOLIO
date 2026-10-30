import * as THREE from 'three';
import { box, imagePlane, line, materials as m, station, textPlane } from './primitives';

export interface Installation { group: THREE.Group; anchors: Map<string, THREE.Object3D>; update: (local: number, hover: string | null, reduced: boolean, action:number,time:number) => void }
export function createInstallations(): Installation[] {
  return Array.from({length:13},(_,chapter)=>{
    const group=new THREE.Group(), anchors=new Map<string,THREE.Object3D>();
    const movers: ((t:number,h:string|null,r:boolean,action:number,time:number)=>void)[]=[];
    const addAnchor=(id:string,object:THREE.Object3D)=>anchors.set(id,object);
    switch(chapter){
      case 0: {
        box(group,[5.6,.17,2.3],[0,-3.25,-.4],m.chrome);
        box(group,[.035,5.8,.10],[-2.27,-.35,-1.45],m.chrome);
        box(group,[.035,5.8,.10],[2.27,-.35,-1.45],m.chrome);
        box(group,[4.55,.035,.10],[0,2.54,-1.45],m.chrome);
        break;
      }
      case 1: {
        textPlane(group,'<',[ -4,-.15,-.6],1.15,'#9298c2',{font:'300 170px monospace'});
        textPlane(group,'/>',[4,-.15,-.6],1.4,'#9298c2',{font:'300 140px monospace'});
        textPlane(group,'01 / A HUMAN IDEA, EXPRESSED IN CODE',[0,-2.6,.2],4,'#626b8d',{font:'400 36px monospace'});
        break;
      }
      case 2: {
        const js=station(group,-3.15,'JavaScript / ES6+','javascript',m.porcelain,-.15);
        const ts=station(group,0,'TypeScript','typescript',m.lavender,.2);
        const py=station(group,3.15,'Python','python',m.cyan,-.15);
        box(js,[.18,1.25,.9],[-.75,-.25,-.35],m.chrome,[0,0,-.18]);
        box(ts,[.18,2.1,.7],[.85,-.1,-.35],m.chrome,[0,.25,.07]);
        box(py,[1.2,.16,.7],[0,1.05,-.22],m.chrome,[.1,.2,0]);
        movers.push(t=>{js.rotation.y=-.14+t*.10;ts.rotation.y=.10-t*.10;py.rotation.y=.15+t*.12;});
        break;
      }
      case 3: {
        const browser=new THREE.Group();browser.position.set(0,-.2,-.2);group.add(browser);
        box(browser,[5.5,2.9,.18],[0,0,-.35],m.chrome);
        box(browser,[5.25,2.65,.12],[0,-.02,-.2]);
        box(browser,[5.24,.35,.10],[0,1.10,-.1],m.lavender);
        for(let i=0;i<3;i++)box(browser,[.09,.09,.02],[-2.4+i*.18,1.10,-.04],m.ink);
        box(browser,[1.6,1.85,.12],[-1.55,-.3,.1],m.lavender);
        textPlane(browser,'Hello, world.',[.64,.5,.32],2.3,'#20243b',{font:'600 90px "Space Grotesk"'});
        for(let i=0;i<3;i++)box(browser,[2.6-i*.35,.07,.05],[.58,.03-i*.20,.25],m.chrome);
        box(browser,[1.25,.35,.12],[.01,-.85,.22],m.ink);
        textPlane(browser,'Let’s build',[.01,-.85,.30],1,'#ffffff',{font:'500 64px sans-serif'});
        const tech=[['HTML5','html5'],['CSS3','css3'],['JavaScript','javascript'],['TypeScript','typescript'],['React.js','react'],['Next.js','nextdotjs']];
        tech.forEach(([name,icon],i)=>{
          const x=(i-2.5)*1.27;box(group,[.94,.14,.62],[x,-2.15,.6],i%2?m.lavender:m.chrome);
          imagePlane(group,`/assets/brands/${icon}.svg`,[x,-1.88,.96],.32);textPlane(group,name,[x,-2.43,1],1.2);
        });
        const depths=browser.children.map(o=>o.position.z);
        movers.push(t=>{browser.rotation.y=-.08+t*.33;browser.children.forEach((o,i)=>{o.position.z=depths[i]+Math.abs(t)*(i>2?1.7+(i%3)*.35:0);});});
        break;
      }
      case 4: {
        const names=[['REST API','rest'],['Node.js','nodedotjs'],['JWT AUTH','jwt'],['NestJS','nestjs']];
        names.forEach(([name,icon],i)=>{
          const x=(i-1.5)*2.3;
          if(icon==='nodedotjs'||icon==='nestjs')station(group,x,name,icon,i===3?m.lavender:m.porcelain,-.25);
          else{box(group,[1.5,1.5,.4],[x,-.25,-.1],i===0?m.cyan:m.lavender);textPlane(group,i===0?'{ ↔ }':'H · P · S',[x,.05,.14],1.1,'#303853',{font:'500 130px monospace'});textPlane(group,name,[x,-.66,.14],1.6);}
          textPlane(group,['01 REQUEST','02 ROUTE','03 VERIFY','04 SERVICE'][i],[x,-1.95,.55],1.7,'#586587',{font:'500 42px monospace'});
        });
        const path=line(group,[[-4.4,-1.35,.7],[-2.3,-1.35,.7],[0,-1.35,.7],[2.3,-1.35,.7],[4.4,-1.35,.7]],'#88bdd5',.03);
        const signal=box(group,[.18,.18,.18],[0,0,0],m.ink);movers.push(t=>signal.position.copy(path.getPoint(THREE.MathUtils.clamp(.5+t*.49,0,1))));
        textPlane(group,'CLIENT → ROUTER → AUTH → SERVICE',[0,-2.65,1],5,'#626b8d',{font:'400 40px monospace'});
        break;
      }
      case 5: {
        const tables=[['User','id · name · email'],['Project','id · userId · title'],['Record','id · projectId · state']];
        tables.forEach(([name,fields],i)=>{const x=(i-1)*2.85;box(group,[2.15,1.8,.3],[x,-.4,0]);box(group,[2.15,.43,.12],[x,.28,.2],m.lavender);textPlane(group,name,[x,.28,.29],1.7);fields.split(' · ').forEach((field,j)=>textPlane(group,field,[x,-.22-j*.3,.2],1.4,'#68708c',{font:'400 58px monospace'}));});
        line(group,[[-1.75,-.35,.6],[-1.43,-.35,.6],[-1.43,-.8,.6],[-1.1,-.8,.6]]);
        line(group,[[1.1,-.35,.6],[1.42,-.35,.6],[1.42,-.8,.6],[1.78,-.8,.6]]);
        imagePlane(group,'/assets/brands/postgresql.svg',[-2,-2.05,.4],.48);textPlane(group,'PostgreSQL',[-.96,-2.04,.42],1.7);
        imagePlane(group,'/assets/brands/prisma.svg',[1.04,-2.05,.4],.46);textPlane(group,'Prisma ORM',[2.1,-2.04,.42],1.7);
        textPlane(group,'User.id → Project.userId   /   Project.id → Record.projectId',[0,-2.7,1],6.7,'#626b8d',{font:'400 32px monospace'});
        break;
      }
      case 6: {
        station(group,-3,'Git','git',m.porcelain,-.1);station(group,0,'GitHub','github',m.lavender,.2);station(group,3,'Postman','postman',m.cyan,-.1);
        line(group,[[-3.8,-1.45,.9],[-2,-1.45,.9],[-1,-.8,.9],[0,-.8,.9],[1,-1.45,.9],[3.8,-1.45,.9]],'#878bd2',.033);
        line(group,[[-3.8,-1.45,.9],[3.8,-1.45,.9]],'#92c5d7',.022);
        for(let i=0;i<7;i++)box(group,[.13,.13,.13],[-3.6+i*1.2,-1.45,.91],m.ink);
        textPlane(group,'BRANCH / COLLABORATE / TEST / DELIVER',[0,-2.6,1],5.7,'#626b8d',{font:'400 38px monospace'});
        break;
      }
      case 7: {
        box(group,[8,.14,3.2],[0,-1.7,-.3],m.porcelain);
        for(let i=0;i<5;i++){
          const x=(i-2)*1.4,z=i%2?-.95:.5;
          box(group,[1,.68,.72],[x,-1.30,z],i%2?m.lavender:m.chrome);
          for(let j=0;j<6;j++)box(group,[.028,.54,.01],[x-.4+j*.16,-1.30,z+.368],m.porcelain);
        }
        const route=line(group,[[-3.7,-1.58,1.15],[-1.9,-1.58,1.15],[-1.9,-1.58,-1.3],[1.6,-1.58,-1.3],[1.6,-1.58,1.15],[3.7,-1.58,1.15]],'#7188ca',.028);
        const shipment=box(group,[.19,.20,.19],[-3.7,-1.45,1.15],m.ink);
        let lastAction=0,actionStarted=0;
        movers.push((t,_h,reduced,action,time)=>{if(lastAction!==action){lastAction=action;actionStarted=time;}const travel=action?(reduced?1:Math.min(1,(time-actionStarted)/2200)):Math.min(1,Math.max(0,t+.18));shipment.position.copy(route.getPoint(travel));shipment.position.y+=.12;});
        box(group,[2.2,1.7,.12],[0,.35,-.55],m.porcelain);imagePlane(group,'/assets/RCS-Logo.png',[0,.37,-.47],1.48);
        textPlane(group,'CONNECTED LOGISTICS',[0,-2.55,1.5],4,'#626b8d',{font:'400 40px monospace'});
        break;
      }
      case 8: {
        box(group,[4.2,.23,2.4],[0,-1.83,-.1],m.chrome);
        box(group,[3,2.8,.2],[0,-.1,.1],m.porcelain);imagePlane(group,'/assets/GOLDADAN_LOGO.jpg',[0,-.1,.215],2.55);
        box(group,[.35,2.6,.65],[-2.12,-.4,-.25],m.lavender,[0,0,-.12]);box(group,[.35,2.6,.65],[2.12,-.4,-.25],m.lavender,[0,0,.12]);
        textPlane(group,'SECURITY / SOFTWARE / HARDWARE',[0,-2.62,1],5.6,'#626b8d',{font:'400 39px monospace'});
        let angle=0;movers.push((_t,_h,reduced,action)=>{const target=action%2?.38:0;angle=reduced?target:THREE.MathUtils.lerp(angle,target,.09);group.rotation.y+=angle;});
        break;
      }
      case 9: {
        const ranks=['A','K','Q','J','10'],suits=['♠','♥','♣','♦','♠'];
        for(let i=0;i<5;i++){
          const card=new THREE.Group();group.add(card);card.position.set((i-2)*1.16,-.36,-Math.abs(i-2)*.22);card.rotation.z=(2-i)*.14;
          box(card,[1.44,2.1,.05],[0,0,0],m.porcelain);
          textPlane(card,ranks[i],[-.46,.75,.035],.31,i%2?'#a64968':'#29334f',{height:.32,font:'600 840px serif'});
          textPlane(card,suits[i],[-.46,.46,.036],.23,i%2?'#a64968':'#29334f',{height:.25,font:'600 850px serif'});
          textPlane(card,suits[i],[0,-.06,.037],.90,i%2?'#a64968':'#29334f',{height:1.1,font:'500 920px serif'});
          textPlane(card,`${ranks[i]}${suits[i]}`,[.37,-.83,.039],.42,i%2?'#a64968':'#29334f',{height:.21,font:'600 410px serif'});
          box(card,[1.33,1.98,.015],[0,0,-.039],m.lavender);
          let lift=0;
          movers.push((t,_h,reduced,action)=>{const target=action>0&&i===(action-1)%5?.48:0;lift=reduced?target:THREE.MathUtils.lerp(lift,target,.10);card.rotation.y=t*(i-2)*.18+lift*.32;card.position.z=-Math.abs(i-2)*.22+lift;card.position.y=-.36+lift;});
        }
        imagePlane(group,'/assets/BHABHI THULLA.png',[0,-2.33,1.2],1.05);
        break;
      }
      case 10: {
        station(group,-2.2,'Upwork','upwork',m.cyan,-.12);station(group,2.2,'Fiverr','fiverr',m.lavender,.12);
        line(group,[[-4,-1.9,.8],[-2.2,-1.9,.8],[2.2,-1.45,.8],[4,-1.45,.8]],'#9b9ec7',.038);
        textPlane(group,'SEP 2025 — JUN 2026',[-2.2,.72,.3],2.8,'#5b6583',{font:'500 40px monospace'});textPlane(group,'SEP 2025 — JUN 2026',[2.2,.96,.3],2.8,'#5b6583',{font:'500 40px monospace'});
        textPlane(group,'FREELANCE FULL STACK WEB DEVELOPER',[0,-2.72,1],6,'#626b8d',{font:'400 38px monospace'}).userData.hideOnMobile=true;
        break;
      }
      case 11: {
        for(let i=0;i<2;i++){
          const x=i?2:-2,y=i?.15:-.4;
          box(group,[.22,2.7,.6],[x-1.15,y,-.4],m.chrome);box(group,[.22,2.7,.6],[x+1.15,y,-.4],m.chrome);box(group,[2.5,.22,.6],[x,y+1.35,-.4],m.lavender);
          textPlane(group,i?'Punjab University':'Hawk College',[x,y+.43,0],2.6,'#29334f',{font:'500 72px "Space Grotesk"'});
          textPlane(group,i?'Bachelor in\nComputer Science':'Intermediate in\nComputer Science',[x,y-.15,0],2.35,'#616a87',{height:.7,font:'400 54px sans-serif'});
          textPlane(group,i?'2021–2025':'2018–2020',[x,y-.85,0],1.8,'#5e6390',{font:'400 60px monospace'});
        }
        break;
      }
      case 12: {
        ['linkedin','freelancer','github','fiverr','upwork'].forEach((id,i)=>{
          const fin=new THREE.Group();fin.position.set((i-2)*1.80,-.42,0);group.add(fin);addAnchor(id,fin);
          box(fin,[1.13,1.75,.40],[0,-.55,0],i%2?m.lavender:m.chrome,[0,(i-2)*-.055,0]);
          box(fin,[1.4,.16,1.2],[0,-1.47,0],m.porcelain);
          // The interactive HTML logo is projected onto the upper front of this fin.
          movers.push((_t,h)=>{fin.position.y=-.42+(h===id?.16:0);});
        });
        break;
      }
    }
    return {group,anchors,update:(local,hover,reduced,action,time)=>movers.forEach(fn=>fn(local,hover,reduced,action,time))};
  });
}
