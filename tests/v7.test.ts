import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { projectPose } from '../src/scene/atrium.ts';

test('each project is centred at its waypoint; forward and reverse states are deterministic', () => {
  for (let i = 0; i < 3; i++) for (const mobile of [false, true]) {
    assert.deepEqual(projectPose(i + 3, i, mobile), { x:0, y:0, z:-0, rotateY:-0, rotateX:0, opacity:1 });
    assert.equal(projectPose(i + 3, (i + 1) % 3, mobile).opacity, 0);
  }
});

test('portrait pose, markup, update code and original stylesheet remain intact', () => {
  assert.equal(readFileSync('src/scene/journey.ts','utf8'), readFileSync('docs/architectural-v7/baseline/journey.ts','utf8'));
  const before=readFileSync('docs/architectural-v7/baseline/App.tsx','utf8'), after=readFileSync('src/App.tsx','utf8');
  for (const [start,end] of [['      if (portrait.current) {','    };\n'], ['          <div className="shared-portrait"','        </>']]) {
    assert.equal(after.slice(after.indexOf(start),after.indexOf(end,after.indexOf(start))),before.slice(before.indexOf(start),before.indexOf(end,before.indexOf(start))));
  }
  assert.equal(readFileSync('src/styles.css','utf8').trimEnd(),readFileSync('docs/architectural-v7/baseline/styles.css','utf8').trimEnd());
  assert.doesNotMatch(readFileSync('src/architectural.css','utf8'), /shared-portrait|portrait-caption/);
});
