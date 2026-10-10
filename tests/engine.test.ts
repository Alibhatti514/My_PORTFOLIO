import assert from 'node:assert/strict';
import test from 'node:test';
import { chapters } from '../src/data/chapters.ts';
import { chapterStep, CHAPTER_COUNT, getScrollState } from '../src/engine/scroll.ts';
import { BEAM_COUNT, beamPoses, cameras } from '../src/scene/poses.ts';

function withViewport<T>(height: number, run: (scrollTo: (chapterPosition: number) => void) => T): T {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const viewport = { innerHeight: height, scrollY: 0 };
  Object.defineProperty(globalThis, 'window', { configurable: true, writable: true, value: viewport });
  try {
    return run((position) => { viewport.scrollY = position * chapterStep(); });
  } finally {
    if (previous) Object.defineProperty(globalThis, 'window', previous);
    else Reflect.deleteProperty(globalThis, 'window');
  }
}

test('direct chapter landings and browser overscroll resolve to valid stable story poses', () => {
  assert.equal(CHAPTER_COUNT, chapters.length);
  withViewport(900, (scrollTo) => {
    for (let chapter = 0; chapter < chapters.length; chapter++) {
      scrollTo(chapter);
      const state = getScrollState();
      assert.equal(state.chapter, chapter);
      assert.equal(state.progress, chapter);
    }
    scrollTo(-1);
    assert.equal(getScrollState().progress, 0);
    scrollTo(100);
    assert.equal(getScrollState().progress, 12);
    assert.equal(getScrollState().chapter, 12);
  });
});

test('reverse scrolling and fast chapter jumps reproduce identical poses without accumulated animation state', () => {
  withViewport(900, (scrollTo) => {
    const positions = [0, 0.3, 0.55, 0.89, 1, 2.4, 4.82, 7.56, 9.23, 11.9, 12];
    const expected = new Map(positions.map((position) => {
      scrollTo(position);
      return [position, getScrollState()] as const;
    }));
    for (const position of [...positions].reverse().concat([12, 0, 9.23, 0.55, 11.9, 4.82])) {
      scrollTo(position);
      assert.deepEqual(getScrollState(), expected.get(position), `absolute scroll position ${position} is deterministic`);
    }
  });
});

test('all chapter boundaries are continuous and the complete forward path is monotonic', () => {
  withViewport(768, (scrollTo) => {
    let previous = -1;
    for (let step = 0; step <= 2400; step++) {
      scrollTo(step / 200);
      const { progress, chapter } = getScrollState();
      assert.ok(Number.isFinite(progress));
      assert.ok(progress >= previous - 1e-10, `progress cannot reverse at ${step / 200}`);
      assert.ok(progress - previous < 0.05 || previous === -1, 'no abrupt story cuts');
      assert.ok(Number.isInteger(chapter) && chapter >= 0 && chapter < chapters.length);
      previous = progress;
    }
    for (let chapter = 1; chapter < chapters.length; chapter++) {
      scrollTo(chapter - 1e-6);
      const before = getScrollState().progress;
      scrollTo(chapter + 1e-6);
      const after = getScrollState().progress;
      assert.ok(Math.abs(after - before) < 1e-4, `continuous crossing of chapter ${chapter}`);
    }
  });
});

test('the same normalized scroll position has the same story state across requested viewport heights', () => {
  const positions = [0, 1, 2.56, 5.72, 8.31, 11.88, 12];
  const sample = (height: number) => withViewport(height, (scrollTo) => positions.map((position) => {
    scrollTo(position);
    return getScrollState();
  }));
  const expected = sample(900);
  for (const height of [1080, 768, 1024, 844, 812, 420]) {
    sample(height).forEach((state, index) => {
      assert.equal(state.chapter, expected[index].chapter);
      assert.ok(Math.abs(state.progress - expected[index].progress) < 1e-10);
    });
  }
});

test('reduced motion provides stable chapter poses without interpolated camera destinations', () => {
  withViewport(844, (scrollTo) => {
    for (let step = 0; step <= 120; step++) {
      scrollTo(step / 10);
      const state = getScrollState(true);
      assert.ok(Number.isInteger(state.progress));
      assert.equal(state.chapter, state.progress);
      assert.ok(state.progress >= 0 && state.progress <= 12);
    }
  });
});

test('every chapter has a complete persistent beam set with finite, nondegenerate transforms', () => {
  assert.equal(beamPoses.length, chapters.length);
  assert.equal(cameras.length, chapters.length);
  for (let chapter = 0; chapter < chapters.length; chapter++) {
    assert.equal(beamPoses[chapter].length, BEAM_COUNT, `persistent beam identities in ${chapters[chapter].id}`);
    for (const pose of beamPoses[chapter]) {
      const numbers = [
        ...pose.position.toArray(), ...pose.scale.toArray(),
        ...pose.quaternion.toArray(), ...pose.color.toArray(),
      ];
      assert.ok(numbers.every(Number.isFinite), `finite GPU transforms in ${chapters[chapter].id}`);
      assert.ok(pose.scale.toArray().every((axis) => axis > 0), 'beams never collapse to singular transforms');
      assert.ok(Math.abs(pose.quaternion.length() - 1) < 1e-10, 'rotation is normalized');
    }
    assert.ok(cameras[chapter].every(Number.isFinite));
    assert.ok(cameras[chapter][2] > 0, 'camera remains in front of the stage');
    if (chapter > 0) {
      assert.ok(beamPoses[chapter].some((pose, index) => (
        pose.position.distanceTo(beamPoses[chapter - 1][index].position) > 0.1
      )), `chapter ${chapters[chapter].id} physically transforms the persistent architecture`);
    }
  }
});
