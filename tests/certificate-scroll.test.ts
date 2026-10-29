import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {certificateScrollPlan,certificateScrollPhase,certificateScrollProgress,londonCertificateIndex,FULL_TURN} from '../src/scene/certificateScroll.ts';
const credentials=JSON.parse(readFileSync('src/data/featuredCertificates.json','utf8'));
test('scroll target resolves the verified London certificate regardless of ordering',()=>{
  for(let n=0;n<credentials.length;n++){
    const reordered=[...credentials.slice(n),...credentials.slice(0,n)].reverse();
    assert.equal(reordered[londonCertificateIndex(reordered)].id,'credential-32');
  }
});
test('scroll mapping makes a full revolution and aligns the target without time-based playback',()=>{
  for(let target=0;target<9;target++)for(const start of [-9,0,.51,6,23]){
    const plan=certificateScrollPlan(start,target,9);
    assert.ok(plan.end-start>=FULL_TURN-1e-8&&plan.end-start<2*FULL_TURN+1e-8);
    assert.ok(Math.abs(Math.sin((plan.end-target*FULL_TURN/9)/2))<1e-8);
    assert.equal(certificateScrollPhase(0,plan),start);
    assert.equal(certificateScrollPhase(1,plan),plan.end);
  }
});
test('absolute forward/reverse positions agree and preserve a deliberate manual offset',()=>{
  const plan=certificateScrollPlan(0,0,9),offset=.7;
  const at=(y:number)=>certificateScrollPhase(certificateScrollProgress(y,720,750),plan)+offset;
  const forward=Array.from({length:31},(_,i)=>at(720+i));
  for(let i=30;i>=0;i--)assert.equal(at(720+i),forward[i]);
  assert.equal(at(700),offset);assert.equal(at(800),FULL_TURN+offset);
  assert.equal(at(735),Math.PI+offset);
});
test('approved wheel geometry and original paper styling remain unchanged',()=>{
  for(const [current,before] of [['src/scene/certificateStack.ts','baseline-certificateStack.ts'],['src/components/certificate-stack.css','baseline-certificate-stack.css']])
    assert.equal(readFileSync(current,'utf8'),readFileSync(`docs/certificate-finale-v10/${before}`,'utf8'));
});
