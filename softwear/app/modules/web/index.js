// `<zoom-image>` on the web: a product photo that pinches, scrolls and double-clicks to zoom, and pans while zoomed.
//
//   props   source   the photo, a path under the app (`assets/p/<file>`)
//   events  load     once the photo is up
//           message  "dismiss" when the person drags the photo down at its resting size
//
// Pointer events carry both fingers and the mouse: two pointers pinch about their midpoint, one drags a zoomed
// photo, and the wheel zooms about the cursor (a trackpad pinch arrives as a Control-held wheel). The photo is
// fitted into the element by CSS and moved by one transform, so the layout never changes while it zooms.
export const abi = 1;
export const roster = { 'zoom-image': { snapshot: false } };

const MIN = 1, MAX = 4, STEP = 2.5;

export function create(tag, element, json, event) {
  const root = element.shadowRoot ?? element.attachShadow({ mode: 'open' });
  root.innerHTML = `<style>
    :host { display: block; }
    .stage { position: relative; width: 100%; height: 100%; overflow: hidden; touch-action: none; user-select: none; -webkit-user-select: none; cursor: zoom-in; display: flex; align-items: center; justify-content: center; }
    .stage.zoomed { cursor: grab; }
    .stage.dragging { cursor: grabbing; }
    img { max-width: 100%; max-height: 100%; object-fit: contain; transform-origin: 0 0; will-change: transform; -webkit-user-drag: none; }
    img.settling { transition: transform 240ms cubic-bezier(.2,.8,.2,1); }
  </style><div class="stage"><img alt="" draggable="false"></div>`;
  const stage = root.querySelector('.stage'), img = root.querySelector('img');
  const h = { stage, img, event, scale: 1, x: 0, y: 0, pointers: new Map(), pinch: null, drag: null, source: '' };
  img.addEventListener('load', () => event(7));
  stage.addEventListener('pointerdown', (e) => down(h, e));
  stage.addEventListener('pointermove', (e) => move(h, e));
  stage.addEventListener('pointerup', (e) => up(h, e, false));
  for (const type of ['pointercancel', 'lostpointercapture']) stage.addEventListener(type, (e) => up(h, e, true));
  stage.addEventListener('wheel', (e) => { e.preventDefault(); zoomBy(h, Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.002)), at(h, e), false); }, { passive: false });
  stage.addEventListener('dblclick', (e) => { e.preventDefault(); zoomBy(h, h.scale > 1.001 ? 1 / h.scale : STEP, at(h, e), true); });
  setProps(h, json);
  return h;
}

export function setProps(h, json) {
  const props = JSON.parse(json);
  const next = props.source ?? '';
  if (next === h.source) return;
  h.source = next;
  h.pointers.clear(); rebase(h);
  h.scale = 1; h.x = 0; h.y = 0; apply(h, false);
  h.img.src = new URL(next, document.baseURI).href;
}

export function snapshot() {}

export function destroy(h) { h.pointers.clear(); }

/** A point of the event in the photo's resting frame: unzoomed pixels from its top-left corner. */
function at(h, e) {
  const s = h.stage.getBoundingClientRect();
  return { x: (e.clientX - s.left - h.img.offsetLeft - h.x) / h.scale, y: (e.clientY - s.top - h.img.offsetTop - h.y) / h.scale };
}

/** Zooms by `factor` keeping the photo point `p` under the cursor, then keeps the photo covering the stage. */
function zoomBy(h, factor, p, settle) {
  const next = Math.min(MAX, Math.max(MIN, h.scale * factor));
  h.x -= p.x * (next - h.scale);
  h.y -= p.y * (next - h.scale);
  h.scale = next;
  apply(h, settle);
}

/** Writes the transform, holding the photo inside the stage: centred while smaller than it, edge to edge while
 * larger. `x` and `y` move the photo's top-left corner from its resting place (its layout offsets, which the
 * transform never changes). */
function apply(h, settle) {
  const W = h.stage.clientWidth, H = h.stage.clientHeight, img = h.img;
  const zw = img.offsetWidth * h.scale, zh = img.offsetHeight * h.scale;
  const hold = (v, zoomed, size, offset) => zoomed <= size ? (size - zoomed) / 2 - offset : Math.min(-offset, Math.max(size - zoomed - offset, v));
  h.x = hold(h.x, zw, W, img.offsetLeft);
  h.y = hold(h.y, zh, H, img.offsetTop);
  img.classList.toggle('settling', settle);
  img.style.transform = `translate(${h.x}px, ${h.y}px) scale(${h.scale})`;
  h.stage.classList.toggle('zoomed', h.scale > 1.001);
}

function down(h, e) {
  try { h.stage.setPointerCapture(e.pointerId); } catch {} // a synthetic pointer (a test's) has nothing to capture
  h.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  apply(h, false);
  rebase(h);
}

// Each change in contact count starts from the current transform. In particular,
// the finger left after a pinch can immediately continue panning.
function rebase(h) {
  h.pinch = null;
  h.drag = null;
  h.stage.classList.toggle('dragging', h.pointers.size > 0);
  if (h.pointers.size >= 2) {
    const [a, b] = [...h.pointers.values()];
    h.pinch = { distance: Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)), scale: h.scale };
  } else if (h.pointers.size === 1) {
    const [p] = h.pointers.values();
    h.drag = { x: p.x, y: p.y, ox: h.x, oy: h.y, pull: 0 };
  }
}

function move(h, e) {
  if (!h.pointers.has(e.pointerId)) return;
  h.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (h.pinch && h.pointers.size >= 2) {
    const [a, b] = [...h.pointers.values()];
    const mid = { clientX: (a.x + b.x) / 2, clientY: (a.y + b.y) / 2 };
    const target = Math.min(MAX, Math.max(MIN, h.pinch.scale * Math.hypot(a.x - b.x, a.y - b.y) / h.pinch.distance));
    zoomBy(h, target / h.scale, at(h, mid), false);
  } else if (h.drag && h.pointers.size === 1) {
    if (h.scale > 1.001) {
      h.x = h.drag.ox + e.clientX - h.drag.x;
      h.y = h.drag.oy + e.clientY - h.drag.y;
      apply(h, false);
    } else {
      h.drag.pull = e.clientY - h.drag.y; // at rest, a drag down is the way out
      h.img.style.transform = `translate(${h.x}px, ${h.y + Math.max(0, h.drag.pull) * 0.6}px)`;
    }
  }
}

function up(h, e, cancelled) {
  if (!h.pointers.delete(e.pointerId)) return;
  const dismiss = !cancelled && h.pointers.size === 0 && h.scale <= 1.001 && (h.drag?.pull ?? 0) > 90;
  rebase(h);
  if (dismiss) h.event(8, 'dismiss');
  else apply(h, h.pointers.size === 0);
}
