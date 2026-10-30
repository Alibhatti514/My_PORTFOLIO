import {useEffect} from 'react';
import './signature-motion.css';

type Reveal = {
  words: HTMLElement[];
  inView: boolean;
  done: boolean;
  restores: {original: Text; nodes: Node[]}[];
  label: string | null;
};

/** Editorial enhancement. The protected scroll coordinate and scene transforms are never written. */
export function SignatureMotion() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('.portfolio');
    if (!root || !Element.prototype.animate || !('IntersectionObserver' in window)) return;
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const disabled = new URLSearchParams(location.search).get('motion') === 'off';
    const records = new Map<HTMLElement, Reveal>();
    const animations = new Set<Animation>();
    let frame = 0, selectionFrame = 0, stopped = false, searching = false, pointerHeld = false;

    // Restore the very same Text objects React originally mounted. At rest there are no split words.
    const restore = (el: HTMLElement, row: Reveal) => {
      if (pointerHeld || (!row.restores.length && !row.words.length && el.dataset.signatureState === 'settled')) return;
      const selection = getSelection();
      const point = (node: Node | null, offset: number) => {
        if (!node || !el.contains(node) || !row.restores.length) return {node, offset, character: null};
        const range = document.createRange(); range.selectNodeContents(el); range.setEnd(node, offset);
        return {node, offset, character: range.toString().length};
      };
      const anchor = point(selection?.anchorNode ?? null, selection?.anchorOffset ?? 0);
      const focus = point(selection?.focusNode ?? null, selection?.focusOffset ?? 0);
      row.restores.forEach(({original, nodes}) => {
        const first = nodes[0];
        if (first?.parentNode) {
          first.parentNode.insertBefore(original, first);
          nodes.forEach(node => node.parentNode?.removeChild(node));
        }
      });
      if (el.matches('.hero-name')) {
        if (row.label === null) el.removeAttribute('aria-label');
        else el.setAttribute('aria-label', row.label);
      }
      const resolvePoint = (point: typeof anchor) => {
        if (point.character === null) return point;
        let remaining = point.character;
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let node: Node | null;
        while ((node = walker.nextNode())) {
          if (remaining <= (node.textContent?.length ?? 0)) return {node, offset: remaining};
          remaining -= node.textContent?.length ?? 0;
        }
        return {node: el as Node, offset: el.childNodes.length};
      };
      if (selection && (anchor.character !== null || focus.character !== null)) {
        const a = resolvePoint(anchor), f = resolvePoint(focus);
        if (a.node?.isConnected && f.node?.isConnected) selection.setBaseAndExtent(a.node, a.offset, f.node, f.offset);
      }
      row.restores = [];
      row.words = [];
      el.dataset.signatureState = 'settled';
    };
    const finish = () => {
      animations.forEach(a => a.finish());
      animations.clear();
      records.forEach((row, el) => { if (row.done) restore(el, row); });
    };
    const pointerDown = () => { pointerHeld = true; animations.forEach(a => a.finish()); animations.clear(); };
    const pointerUp = () => {
      pointerHeld = false; cancelAnimationFrame(selectionFrame);
      selectionFrame = requestAnimationFrame(() => { if (!stopped) { finish(); schedule(); } });
    };
    const hover = (event: PointerEvent) => {
      // Settle text before a mouse press can begin a native drag selection.
      if (!pointerHeld && event.pointerType === 'mouse' && (event.target as Element)?.closest('.signature-mask')) finish();
    };
    const readingIntent = () => {
      searching = true;
      finish();
      records.forEach((row, el) => { row.done = true; restore(el, row); });
    };
    const key = (event: KeyboardEvent) => {
      if (((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'f') || event.key === 'F3') readingIntent();
    };
    const split = (el: HTMLElement, row: Reveal) => {
      const hero = el.matches('.hero-name');
      row.label = el.getAttribute('aria-label');
      if (hero) el.setAttribute('aria-label', (el.textContent ?? '').replace(/\s+/g, ' ').trim());
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), nodes: Text[] = [];
      let node: Node | null;
      while ((node = walker.nextNode())) {
        if (node.textContent?.trim() && !node.parentElement?.closest('button,a,summary')) nodes.push(node as Text);
      }
      for (const original of nodes) {
        const fragment = document.createDocumentFragment();
        for (const part of original.data.split(/(\s+)/)) {
          if (!part) continue;
          if (/^\s+$/.test(part)) { fragment.append(document.createTextNode(part)); continue; }
          const mask = document.createElement('span'), word = document.createElement('span');
          mask.className = 'signature-mask'; word.className = 'signature-word'; word.textContent = part;
          if (hero) {
            mask.setAttribute('aria-hidden', 'true');
            word.replaceChildren(...Array.from(part).map(char => {
              const letter = document.createElement('span'); letter.className = 'signature-letter'; letter.textContent = char; return letter;
            }));
          }
          mask.append(word); fragment.append(mask); row.words.push(word);
        }
        row.restores.push({original, nodes: [...fragment.childNodes]});
        original.replaceWith(fragment);
      }
    };
    const reveal = (el: HTMLElement) => {
      const row = records.get(el);
      if (!row || row.done || !row.inView || pointerHeld || el.closest('[inert],[aria-hidden="true"]')) return;
      row.done = true;
      const selection = getSelection(), selected = selection && !selection.isCollapsed && (el.contains(selection.anchorNode) || el.contains(selection.focusNode));
      if (media.matches || disabled || searching || selected) { restore(el, row); return; }
      const paragraph = el.matches('p'), hero = el.matches('.hero-name'), card = el.matches('.technology');
      if (card) row.words = [el]; else split(el, row);
      el.dataset.signatureState = 'revealed';
      // Layout offsets, not projected screen rectangles: each real line shares one delay even in perspective.
      const tops = row.words.map(word => word.offsetTop), lines = [...new Set(tops)], group: Animation[] = [];
      const track = (animation: Animation) => {
        group.push(animation); animations.add(animation);
        animation.finished.then(() => animations.delete(animation)).catch(() => animations.delete(animation));
      };
      row.words.forEach((word, i) => {
        const delay = card ? Number(el.dataset.signatureOrder) % 6 * 28 : paragraph ? lines.indexOf(tops[i]) * 58 : Math.min(i * 38, 220);
        track(word.animate([
          {transform: `translateY(${card ? '8%' : paragraph ? '24%' : '82%'})`, opacity: 0, filter: 'blur(1.1px)'},
          {transform: 'translateY(0)', opacity: 1, filter: 'blur(0px)'},
        ], {id: 'signature-reveal', duration: hero ? 720 : paragraph ? 440 : 560, delay, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards'}));
        if (hero) word.querySelectorAll('.signature-letter').forEach((letter, j) => {
          track(letter.animate([{opacity: 0}, {opacity: 1}], {id: 'signature-letter', duration: 300, delay: delay + j * 12, easing: 'ease-out', fill: 'backwards'}));
        });
      });
      Promise.allSettled(group.map(a => a.finished)).then(() => { if (!stopped) restore(el, row); });
    };
    const check = () => {
      frame = 0;
      if (stopped) return;
      records.forEach((_row, el) => reveal(el));
      const p = Number(root.dataset.progress || 0);
      let id = ['home', 'about', 'skills', 'work', 'work', 'work', 'credentials', 'contact'][Math.min(7, Math.round(p))];
      if (root.classList.contains('reading-mode')) {
        const heading = [...records].filter(([el, row]) => row.inView && el.matches('h1,h2'))
          .sort((a, b) => a[0].getBoundingClientRect().top - b[0].getBoundingClientRect().top)[0]?.[0];
        if (heading) id = heading.closest('[id^="content-"]')?.id.replace('content-', '') || id;
      }
      root.querySelectorAll<HTMLAnchorElement>('.site-header nav a').forEach(link => {
        if (link.hash === `#${id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(check); };
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { const row = records.get(entry.target as HTMLElement); if (row) row.inView = entry.isIntersecting; });
      schedule();
    }, {rootMargin: '-9% 0px -12%', threshold: 0});
    const selectors = '.hero-name,.hero-left h2,.hero-left p,.hero-right p,.about-copy h2,.about-copy>p,.skills-heading h2,.project-identity h2,.project-identity>p:not(.project-evidence),.credential-copy h2,.credential-copy>p,.finale-heading';
    const prepare = () => {
      if (stopped) return;
      records.forEach((_row, el) => { if (!el.isConnected) { observer.unobserve(el); records.delete(el); } });
      root.querySelectorAll<HTMLElement>(`${selectors},.technology`).forEach((el, i) => {
        if (records.has(el)) return;
        if (el.matches('.technology')) el.dataset.signatureOrder = String(i);
        records.set(el, {words: [], inView: false, done: false, restores: [], label: el.getAttribute('aria-label')});
        el.dataset.signatureState = 'ready'; observer.observe(el);
      });
      schedule();
    };
    const cards = new MutationObserver(prepare), field = root.querySelector('.technology-field');
    if (field) cards.observe(field, {childList: true});
    // Never observe the protected per-frame style/data-progress attributes.
    const changes = new MutationObserver(schedule); changes.observe(root, {attributes: true, subtree: true, attributeFilter: ['inert', 'aria-hidden']});
    const mode = new MutationObserver(prepare); mode.observe(root, {attributes: true, attributeFilter: ['class']});
    const reduce = () => { if (media.matches) finish(); else prepare(); };
    media.addEventListener('change', reduce);
    root.addEventListener('pointerover', hover, {passive: true}); root.addEventListener('focusin', finish); root.addEventListener('pointerdown', pointerDown, {passive: true});
    window.addEventListener('pointerup', pointerUp, {passive: true}); window.addEventListener('pointercancel', pointerUp, {passive: true}); window.addEventListener('blur', pointerUp);
    document.addEventListener('keydown', key, true); window.addEventListener('beforeprint', readingIntent);
    document.fonts.ready.then(prepare);
    return () => {
      stopped = true; pointerHeld = false; cancelAnimationFrame(frame); cancelAnimationFrame(selectionFrame); finish(); observer.disconnect(); changes.disconnect(); mode.disconnect(); cards.disconnect();
      media.removeEventListener('change', reduce); root.removeEventListener('pointerover', hover); root.removeEventListener('focusin', finish); root.removeEventListener('pointerdown', pointerDown);
      window.removeEventListener('pointerup', pointerUp); window.removeEventListener('pointercancel', pointerUp); window.removeEventListener('blur', pointerUp);
      document.removeEventListener('keydown', key, true); window.removeEventListener('beforeprint', readingIntent);
      records.forEach((_row, el) => { delete el.dataset.signatureState; delete el.dataset.signatureOrder; });
    };
  }, []);
  return null;
}
