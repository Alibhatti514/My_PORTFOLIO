import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spatialPose, credentialNumber } from '../src/scene/spatial.ts';

test('V6 spatial field has continuous joins and reproduces state in reverse', () => {
  for (const mobile of [false, true]) {
    const forward = Array.from({length:701}, (_,i) => spatialPose(i / 100, mobile));
    for (let i = 700; i >= 0; i--) assert.deepEqual(spatialPose(i / 100, mobile), forward[i]);
    for (let i = 1; i < 7; i++) {
      const a = spatialPose(i - .00001, mobile), b = spatialPose(i + .00001, mobile);
      for (const key of ['fold','depth','lean','perspective'] as const)
        assert.ok(Math.abs(a[key] - b[key]) < .001, `${key} at ${i}`);
    }
    assert.deepEqual(spatialPose(-1,mobile), spatialPose(0,mobile));
    assert.deepEqual(spatialPose(8,mobile), spatialPose(7,mobile));
  }
  assert.ok(spatialPose(3,true).fold < spatialPose(3,false).fold);
});

test('credential numbering follows position for changing collection sizes', () => {
  for (const count of [1,9,12,100]) {
    const labels = Array.from({length:count},(_,i)=>credentialNumber(i));
    assert.equal(labels[0], '01');
    assert.equal(labels[count-1], String(count).padStart(2,'0'));
    assert.ok(labels.every(label=>/^\d{2,}$/.test(label)));
  }
});

test('approved portrait animation and split hero typography remain locked', () => {
  const before = readFileSync('docs/ultimate-4d-v6/baseline/App.tsx','utf8');
  const after = readFileSync('src/App.tsx','utf8');
  for (const [start,end] of [
    ['      if (portrait.current) {','    };\n'],
    ['          <div className="shared-portrait"','        </>'],
    ['      {!mode && <div className="hero-profession"','      <main'],
  ]) {
    assert.equal(after.slice(after.indexOf(start),after.indexOf(end,after.indexOf(start))),
      before.slice(before.indexOf(start),before.indexOf(end,before.indexOf(start))), start);
  }
});

test('V6 preserves exact palette tokens and removes legacy decorative counters', () => {
  const before = readFileSync('docs/ultimate-4d-v6/baseline/styles.css','utf8');
  const after = readFileSync('src/styles.css','utf8');
  assert.equal(after.slice(0,after.indexOf('\n}')),before.slice(0,before.indexOf('\n}')));
  const story = readFileSync('src/components/Story.tsx','utf8');
  assert.ok(!story.includes('chapter-kicker'));
  assert.ok(!story.includes("String(i).padStart(2,'0')"));
  for (const file of ['src/App.tsx','src/components/Credentials.tsx','src/components/SystemScene.tsx'])
    assert.doesNotMatch(readFileSync(file,'utf8'), />0[1-9] \/ [A-Z]/);
});
