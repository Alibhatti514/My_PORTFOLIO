import type { PerspectiveCamera, WebGLRenderer } from 'three';

const fields = ['time','frameMs','cpuUpdateMs','cpuRenderMs','raw','progress','chapter','cameraX','cameraY','cameraZ','drawCalls','triangles','points','textures','geometries','programs','dpr','heapBytes','scrollInputAgeMs','scrollY','viewportWidth','viewportHeight'] as const;
const capacity = 12000;
type EventSample = { time: number; type: string; detail: string };
export interface ProfileSnapshot {
  samples: Record<typeof fields[number], number | null>[];
  events: EventSample[];
  longTasks: { startTime: number; duration: number }[];
  limitations: string[];
}
declare global {
  interface Window {
    __portfolioProfile?: { reset: () => void; snapshot: () => ProfileSnapshot };
  }
}

/** Opt-in diagnostics only (?profile=1). Does not drive animation or quality. */
export class FrameProfiler {
  private buffer = new Float64Array(capacity * fields.length);
  private cursor = 0;
  private count = 0;
  private previousTime = -1;
  private lastScroll = -1;
  private events: EventSample[] = [];
  private tasks: { startTime: number; duration: number }[] = [];
  private observer?: PerformanceObserver;
  private api: NonNullable<Window['__portfolioProfile']>;
  private onScroll = () => { this.lastScroll = performance.now(); };
  private onResize = () => this.event('resize', `${innerWidth}x${innerHeight}`);
  private onVisibility = () => { this.event('visibility', document.visibilityState); this.previousTime = -1; };

  constructor() {
    this.api = { reset: () => this.reset(), snapshot: () => this.snapshot() };
    window.__portfolioProfile = this.api;
    window.addEventListener('scroll', this.onScroll, { passive: true });
    window.addEventListener('resize', this.onResize);
    document.addEventListener('visibilitychange', this.onVisibility);
    if (PerformanceObserver.supportedEntryTypes.includes('longtask')) {
      this.observer = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          if (this.tasks.length >= 1000) this.tasks.shift();
          this.tasks.push({ startTime: entry.startTime, duration: entry.duration });
        }
      });
      this.observer.observe({ type: 'longtask', buffered: false });
    }
    this.event('profile', 'Opt-in bounded recorder; CPU render submission is not GPU timing.');
  }

  event(type: string, detail: string) {
    if (this.events.length >= 1000) this.events.shift();
    this.events.push({ time: performance.now(), type, detail });
  }

  record(time: number, updateMs: number, renderMs: number, raw: number, progress: number,
    chapter: number, camera: PerspectiveCamera, renderer: WebGLRenderer) {
    const offset = this.cursor * fields.length;
    const memory = (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory;
    const values = this.buffer;
    values[offset] = time;
    values[offset + 1] = this.previousTime < 0 ? NaN : time - this.previousTime;
    values[offset + 2] = updateMs;
    values[offset + 3] = renderMs;
    values[offset + 4] = raw;
    values[offset + 5] = progress;
    values[offset + 6] = chapter;
    values[offset + 7] = camera.position.x;
    values[offset + 8] = camera.position.y;
    values[offset + 9] = camera.position.z;
    values[offset + 10] = renderer.info.render.calls;
    values[offset + 11] = renderer.info.render.triangles;
    values[offset + 12] = renderer.info.render.points;
    values[offset + 13] = renderer.info.memory.textures;
    values[offset + 14] = renderer.info.memory.geometries;
    values[offset + 15] = renderer.info.programs?.length ?? NaN;
    values[offset + 16] = renderer.getPixelRatio();
    values[offset + 17] = memory?.usedJSHeapSize ?? NaN;
    values[offset + 18] = this.lastScroll < 0 ? NaN : performance.now() - this.lastScroll;
    values[offset + 19] = scrollY;
    values[offset + 20] = innerWidth;
    values[offset + 21] = innerHeight;
    this.previousTime = time;
    this.cursor = (this.cursor + 1) % capacity;
    this.count = Math.min(capacity, this.count + 1);
  }

  private reset() {
    this.cursor = this.count = 0;
    this.previousTime = this.lastScroll = -1;
    this.events.length = this.tasks.length = 0;
    this.observer?.takeRecords();
  }

  private snapshot(): ProfileSnapshot {
    const samples: ProfileSnapshot['samples'] = [];
    const start = (this.cursor - this.count + capacity) % capacity;
    for (let i = 0; i < this.count; i++) {
      const offset = ((start + i) % capacity) * fields.length;
      const sample = {} as ProfileSnapshot['samples'][number];
      fields.forEach((field, j) => { const value = this.buffer[offset + j]; sample[field] = Number.isFinite(value) ? value : null; });
      samples.push(sample);
    }
    return { samples, events: this.events.slice(), longTasks: this.tasks.slice(), limitations: [
      'CPU render submission time is not GPU execution time. GPU timing is not collected.',
      'Texture and geometry counts are renderer resource counts, not memory in bytes.',
      'Heap is Chromium-specific and includes diagnostic overhead; null means unavailable.',
      'Scroll input age measures time since a JS scroll event, not hardware-input-to-photon latency.',
      'Bounded storage retains the most recent 12000 frames. Diagnostics add some overhead.',
    ] };
  }

  dispose() {
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onResize);
    document.removeEventListener('visibilitychange', this.onVisibility);
    this.observer?.disconnect();
    if (window.__portfolioProfile === this.api) delete window.__portfolioProfile;
  }
}
