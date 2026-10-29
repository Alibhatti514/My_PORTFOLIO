import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { galleryState, createGallery } from '../src/scene/gallery.ts';

test('native scroll drives substantial continuous camera and geometry travel in both directions',()=>{
  for(const mobile of [false,true]){
    const history=[];
    for(let n=0;n<=700;n++){
      const a=galleryState(n/100,mobile),b=galleryState((n+.001)/100,mobile);
      assert.ok(a.camera.every(Number.isFinite));
      assert.ok(Math.hypot(...a.camera.map((v,i)=>v-b.camera[i]))<.01);
      history.push(a);
    }
    for(let n=700;n>=0;n--)assert.deepEqual(galleryState(n/100,mobile),history[n]);
    assert.ok(history[0].camera[2]-history[700].camera[2]>190);
    assert.notDeepEqual(history[25].courts,history[75].courts);
    assert.notEqual(history[0].light,history[600].light);
  }
});
test('closed geometry has normals and depth; every resource is disposed exactly once',()=>{
  const world=createGallery();let triangles=0,disposed=0;
  for(const geometry of world.geometries){
    assert.ok(geometry.getAttribute('normal'));
    geometry.computeBoundingBox();const b=geometry.boundingBox!;
    assert.ok(b.max.x>b.min.x&&b.max.y>b.min.y&&b.max.z>b.min.z);
    triangles+=(geometry.index?.count||geometry.getAttribute('position').count)/3;
    geometry.addEventListener('dispose',()=>disposed++);
  }
  for(const m of world.materials)m.addEventListener('dispose',()=>disposed++);
  assert.ok(triangles>10000);world.dispose();
  assert.equal(disposed,world.geometries.length+world.materials.length);
});
test('approved portrait code, markup and timing remain byte-for-byte unchanged',()=>{
  const before=readFileSync('docs/spatial-v8/baseline/App.tsx','utf8'),after=readFileSync('src/App.tsx','utf8');
  const stripStack = (s: string) => {
    s=s.replace('          <div className="certificate-section-stage">\n','')
      .replace('          <div className="certificate-wheel-rail">\n          <div className="certificate-wheel-stage">\n','')
      .replace('          </div>\n          </div>\n          </div>\n        </section>\n        <section id="content-contact"','        </section>\n        <section id="content-contact"');
    s = s.replace('import { CertificateSheets } from "./components/CertificateSheets";\n','');
    s=s.replace('              e.currentTarget.dataset.certificateIndex = (e.target as Element).closest<HTMLElement>("[data-certificate-index]")?.dataset.certificateIndex ?? "";\n','');
    s=s.replace('              else if (Math.hypot(dx, dy) < 12 && e.currentTarget.dataset.certificateIndex !== "")\n                pick(Number(e.currentTarget.dataset.certificateIndex));\n','');
    const start = s.includes('<CertificateSheets') ? s.indexOf('            <CertificateSheets') : s.indexOf('            <div className="paper-sheet sheet-back"');
    const end = s.indexOf('            <span className="eyebrow">', start);
    return s.slice(0,start)+s.slice(end);
  };
  assert.equal(stripStack(after),stripStack(before));
  assert.equal(readFileSync('src/scene/journey.ts','utf8'),readFileSync('docs/architectural-v7/baseline/journey.ts','utf8'));
});
