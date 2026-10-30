import {atelier} from './atelierTokens';
import {clamp} from './journey';

export type TerminalCommand='build'|'test'|'deploy';
export const editorSource=[
 'import { useEffect, useState } from "react";',
 '',
 'type Project = { id: string; title: string };',
 '',
 'export default function Projects() {',
 '  const [projects, setProjects] = useState<Project[]>([]);',
 '',
 '  useEffect(() => {',
 '    const controller = new AbortController();',
 '    async function load() {',
 '      const response = await fetch("/api/projects", {',
 '        signal: controller.signal,',
 '      });',
 '      if (!response.ok) throw new Error("Request failed");',
 '      const data: Project[] = await response.json();',
 '      setProjects(data);',
 '    }',
 '    void load().catch(error => {',
 '      if (error.name !== "AbortError") console.error(error);',
 '    });',
 '    return () => controller.abort();',
 '  }, []);',
 '',
 '  return (',
 '    <main aria-label="Projects">',
 '      {projects.map(project => (',
 '        <article key={project.id}>{project.title}</article>',
 '      ))}',
 '    </main>',
 '  );',
 '}',
].join('\n');
const sequences:Record<TerminalCommand,string[]>={
 build:['$ npm run build','> tsc -b && vite build','✓ TypeScript compiled','✓ Production artifact ready'],
 test:['$ npm run test','> node --test / interface · API · auth','✓ Component contracts passed','✓ Data and access checks passed'],
 deploy:['$ deploy --production','> verify artifact / release','✓ Health checks passed','✓ Production release ready'],
};
const workflow=sequences.build.concat(sequences.test,sequences.deploy).join('\n');
export function editorState(typing:number,awakening:number,override:TerminalCommand|null=null){
 const characters=Math.floor(clamp(typing)*editorSource.length),terminalCharacters=Math.floor(clamp(awakening)*workflow.length);
 const terminalText=override?sequences[override].join('\n'):workflow.slice(0,terminalCharacters);
 return{characters,terminalCharacters,terminalText,code:editorSource.slice(0,characters),command:override??(awakening<1/3?'build':awakening<2/3?'test':'deploy')};
}
/** One reusable physical-screen atlas. Draw only when a discrete character/state changes. */
export function createMacbookEditor(){
 const canvas=document.createElement('canvas');canvas.width=1536;canvas.height=960;const c=canvas.getContext('2d')!;c.setTransform(1.5,0,0,1.5,0,0);let previous='',redraws=0;c.font='17px \"IBM Plex Mono\", monospace';const characterWidth=c.measureText('M').width;
 const token=/((?:\/\/.*)|(?:"[^"]*"|'[^']*')|\b(?:import|from|export|async|function|const|await|return|type|string|if|throw|new|default|void)\b|[{}<>/=;])/g;
 return{canvas,get redraws(){return redraws;},draw(typing:number,awakening:number,override:TerminalCommand|null){
  const state=editorState(typing,awakening,override),key=`${state.characters}/${state.terminalText}`;if(key===previous)return{...state,changed:false};previous=key;redraws++;
  c.fillStyle=atelier.obsidian;c.fillRect(0,0,1024,640);c.fillStyle=atelier.graphite;c.fillRect(0,0,1024,45);c.fillRect(0,45,172,571);c.fillRect(0,616,1024,24);
  c.font='15px "IBM Plex Mono", monospace';c.fillStyle=atelier.copper;c.fillText('●  ●  ●',18,29);c.fillStyle=atelier.porcelain;c.fillText('Projects.tsx',205,29);c.fillStyle=atelier.teal;c.fillText('PORTFOLIO / WORKSPACE',685,29);
  c.font='14px "IBM Plex Mono", monospace';['EXPLORER','portfolio/','  src/','    components/','    api/','      Projects.tsx','    lib/','  prisma/','  package.json'].forEach((line,i)=>{c.fillStyle=i===0?atelier.teal:atelier.porcelain;c.fillText(line,16,77+i*28);});
  c.fillStyle=atelier.copper;c.fillRect(172,44,212,2);const terminalOpen=awakening>.015||override!==null,codeBottom=terminalOpen?398:602;
  c.save();c.beginPath();c.rect(174,58,848,codeBottom-58);c.clip();c.font='17px "IBM Plex Mono", monospace';
  const lines=state.code.split('\n'),capacity=Math.floor((codeBottom-84)/26),offset=Math.max(0,lines.length-capacity);
  lines.slice(offset,offset+capacity+1).forEach((line,visible)=>{const i=visible+offset,y=84+visible*26;c.fillStyle=atelier.teal;c.fillText(String(i+1).padStart(2,' '),189,y);let x=232;token.lastIndex=0;const parts=line.split(token);for(const part of parts){if(!part)continue;c.fillStyle=part.startsWith('//')?atelier.teal:/^(import|from|export|async|function|const|await|return|type|string|if|throw|new|default|void)$/.test(part)?atelier.copper:/^["']/.test(part)?atelier.teal:atelier.porcelain;c.fillText(part,x,y);x+=part.length*characterWidth;}});if(state.characters>0){c.fillStyle=atelier.porcelain;c.fillRect(232+lines[lines.length-1].length*characterWidth,70+(lines.length-1-offset)*26,2,19);}c.restore();
  if(terminalOpen){c.fillStyle=atelier.graphite;c.fillRect(172,400,852,2);c.font='13px "IBM Plex Mono", monospace';c.fillStyle=atelier.copper;c.fillText('TERMINAL   /   DETERMINISTIC DEMONSTRATION',190,425);c.save();c.beginPath();c.rect(174,437,848,170);c.clip();c.font='16px "IBM Plex Mono", monospace';const lines=state.terminalText.split('\n').slice(-7);lines.forEach((line,i)=>{c.fillStyle=line.startsWith('$')?atelier.copper:line.startsWith('✓')?atelier.teal:atelier.porcelain;c.fillText(line,192,455+i*23);});c.restore();}
  c.font='13px "IBM Plex Mono", monospace';c.fillStyle=atelier.teal;c.fillText('main*    TypeScript / React                              UTF-8    ✓',18,633);
  return{...state,changed:true};
 }};
}
