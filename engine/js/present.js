/* ---------- recording view: the presenter's pen, highlighter and zoom ----------
   The slide sits at the top of the screen as a clean 16:9 frame and the tray fills the strip
   below it. The pen (a stylus, such as the S Pen) only ever writes; fingers and the mouse work
   the slide as usual, and two fingers pinch to zoom. Ink belongs to its slide: it goes when the
   slide changes and comes back when the slide does. Touches while the pen is near are a palm
   resting on the glass, and are ignored. */
const PALM_MS = 600;      // a touch this soon after the pen was seen is the hand, not a tap
const PEN_W = [2, 4, 7, 11];  // fine, medium (the default), thick, very thick
const HOLD_MS = 450;
const BARREL_MS = 400;        // a "finger" this soon after the pen hovered with its side button held is the pen itself          // a press on the pen this long opens its sizes
const MARKER_W = 24;
// the distance from (x, y) to the line segment from a to b
const segDist = (x, y, [ax, ay], [bx, by]) => {
  const dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy;
  const t = L ? Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / L)) : 0;
  return Math.hypot(x - ax - t * dx, y - ay - t * dy);
};
const Present = {
  on: false, tool: "pen", colour: 0, size: 1,
  ink: new WeakMap(),     // slide -> { strokes, history }
  slide: null, stroke: null, erasing: false,
  rubbed: null,          // what the eraser has cut so far in this rub: one undo puts it all back
  lastPen: 0, swallowUntil: 0,
  barrelAt: 0, barrel: false,  // the S Pen hovering with its side button held, and touching the glass with it
  touches: new Map(), pinch: null,
  drag: null,            // one finger scrolling the slide (the page scrolls it: the browser may not pan, or it would cut the pen off)
  pinched: new Set(),    // touches whose lifting the slide must not see: a pinch's fingers, a palm
  z: 1, tx: 0, ty: 0,
  note() {},             // the pen readout's own lines: what the page made of the pen

  enter(full) {
    if (this.on) return;
    this.on = true;
    document.documentElement.classList.add("present");
    $("#tray").hidden = false;
    if (full && document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {});
    Stage.fit();
    this.show(Deck.slides[Deck.i]);
  },
  leave() {
    if (!this.on) return;
    this.on = false;
    this.resetZoom();
    document.documentElement.classList.remove("present");
    $("#tray").hidden = true;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    Stage.fit();
  },
  // this slide's ink, and whether busy hands should keep swipes and taps off the slide
  page(s = this.slide) { if (!this.ink.has(s)) this.ink.set(s, { strokes: [], history: [] }); return this.ink.get(s); },
  busy() { return this.on && (!!this.stroke || this.erasing || !!this.pinch || !!(this.drag && this.drag.moved) || performance.now() - this.lastPen < PALM_MS); },

  // a new slide: its own ink, the full slide, and the tray's count and arrows
  show(s) {
    this.slide = s; this.rubbed = null;
    this.resetZoom();
    this.paint();
    this.tray();
  },
  paint() {
    const hl = $("#inkMarker"), pen = $("#inkPen");
    hl.replaceChildren(); pen.replaceChildren();
    if (this.slide) this.page().strokes.forEach(k => (k.tool === "marker" ? hl : pen).appendChild(k.el));
  },
  tray() {
    $("#trayCount").textContent = $("#navCount").textContent;
    $("#trayPrev").disabled = $("#prevBtn").hidden;
    $("#trayNext").disabled = $("#nextBtn").hidden && Deck.i !== 0;
    $("#zoomReset").disabled = this.z === 1;
    $$("[data-tool]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.tool === this.tool)));
    $$("[data-colour]").forEach(b => b.setAttribute("aria-pressed", String(+b.dataset.colour === this.colour && this.tool === "pen")));
    $$("[data-size]").forEach(b => b.setAttribute("aria-checked", String(+b.dataset.size === this.size)));
  },

  // a point in the frame's own pixels (1280 x 720), whatever the zoom and the screen's scale
  at(e) {
    const f = $(".frame"), r = f.getBoundingClientRect();
    return [(e.clientX - r.left) / r.width * f.offsetWidth, (e.clientY - r.top) / r.height * f.offsetHeight];
  },
  // a point in the stage's pixels, before the zoom
  onStage(x, y) {
    const a = $("#app"), r = a.getBoundingClientRect();
    return [(x - r.left) / r.width * a.offsetWidth, (y - r.top) / r.height * a.offsetHeight];
  },

  /* ---- strokes ---- */
  // the pen's side button (or its eraser end) rubs out while it is held
  // (browsers report it either in buttons, as held, or in button, as the one that changed: 2 side, 5 eraser end)
  toolFor(e) { return (e.buttons & 34) || e.button === 2 || e.button === 5 ? "eraser" : this.tool; },
  begin(e) {
    const tool = this.toolFor(e);
    if (tool === "eraser") { this.erasing = true; this.rub(this.at(e)); return; }
    const el = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const k = { tool, el, pts: [this.at(e)] };
    el.setAttribute("class", tool === "marker" ? "" : "c" + this.colour);
    el.setAttribute("stroke-width", String((tool === "marker" ? MARKER_W : PEN_W[this.size]) / this.z));
    (tool === "marker" ? $("#inkMarker") : $("#inkPen")).appendChild(el);
    this.stroke = k;
    this.draw(k);
  },
  extend(e) {
    // the side button pressed or let go mid-stroke: the stroke so far stays, and the pen changes over
    if ((this.toolFor(e) === "eraser") !== this.erasing) { this.end(); this.begin(e); return; }
    if (this.erasing) { (e.getCoalescedEvents ? e.getCoalescedEvents() : [e]).forEach(c => this.rub(this.at(c))); return; }
    const k = this.stroke;
    (e.getCoalescedEvents ? e.getCoalescedEvents() : [e]).forEach(c => k.pts.push(this.at(c)));
    this.draw(k);
  },
  end() {
    if (this.stroke) { const p = this.page(); p.strokes.push(this.stroke); p.history.push({ add: this.stroke }); }
    this.stroke = null; this.erasing = false; this.rubbed = null;
  },
  // a new stroke like k (same tool, colour and width) through the points pts
  like(k, pts) {
    const el = k.el.cloneNode(false), c = { tool: k.tool, el, pts };
    this.draw(c);
    return c;
  },
  // a smooth line through the points: curves from midpoint to midpoint; a single tap is a dot
  draw(k) {
    const p = k.pts;
    let d = `M${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)}`;
    if (p.length === 1) d += "l.01 0";
    for (let i = 1; i < p.length - 1; i++) {
      const mx = (p[i][0] + p[i + 1][0]) / 2, my = (p[i][1] + p[i + 1][1]) / 2;
      d += `Q${p[i][0].toFixed(1)} ${p[i][1].toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
    }
    if (p.length > 1) d += `L${p[p.length - 1][0].toFixed(1)} ${p[p.length - 1][1].toFixed(1)}`;
    k.el.setAttribute("d", d);
  },
  // the eraser rubs out only the ink under it, like a real one: a stroke it crosses is cut in two
  rub([x, y]) {
    const p = this.page(), R = 12 / this.z;
    p.strokes.slice().forEach(k => {
      const w = +k.el.getAttribute("stroke-width") / 2 + R, pts = k.pts;
      const near = ([a, b]) => Math.hypot(a - x, b - y) < w;
      // does any part of the line come within reach (not just its points)?
      let hit = pts.length === 1 && near(pts[0]);
      for (let i = 1; i < pts.length && !hit; i++) hit = segDist(x, y, pts[i - 1], pts[i]) < w;
      if (!hit) return;
      // points at most 2 px apart, so the cut follows the eraser's edge; then keep the runs outside it
      const dense = [pts[0]];
      for (let i = 1; i < pts.length; i++) {
        const [a0, b0] = pts[i - 1], [a1, b1] = pts[i], n = Math.ceil(Math.hypot(a1 - a0, b1 - b0) / 2);
        for (let j = 1; j <= n; j++) dense.push([a0 + (a1 - a0) * j / n, b0 + (b1 - b0) * j / n]);
      }
      const runs = [];
      let run = [];
      dense.forEach(q => { if (near(q)) { if (run.length) runs.push(run); run = []; } else run.push(q); });
      if (run.length) runs.push(run);
      const parts = runs.filter(r => r.length > 1 || pts.length === 1).map(r => this.like(k, r));
      const at = p.strokes.indexOf(k);
      p.strokes.splice(at, 1, ...parts);
      k.el.after(...parts.map(c => c.el)); k.el.remove();
      if (!this.rubbed) { this.rubbed = []; p.history.push({ rub: this.rubbed }); }
      this.rubbed.push({ was: k, parts, at });
      this.note(`→ cut a line (${this.rubbed.length} this rub)`);
    });
  },
  undo() {
    const p = this.page(), h = p.history.pop();
    if (!h) return;
    if (h.add) { p.strokes.splice(p.strokes.indexOf(h.add), 1); h.add.el.remove(); }
    if (h.rub) h.rub.slice().reverse().forEach(r => p.strokes.splice(r.at, r.parts.length, r.was));
    if (h.clear) p.strokes.push(...h.clear);
    if (!h.add) this.paint();
  },
  clear() {
    const p = this.page();
    if (!p.strokes.length) return;
    p.history.push({ clear: p.strokes.slice() });
    p.strokes.forEach(k => k.el.remove());
    p.strokes = [];
  },

  /* ---- scroll: one finger drags the slide up and down ---- */
  // the nearest part under the finger that can scroll, else the deck
  scroller(t) {
    for (let el = t; el && el !== document.body; el = el.parentElement) {
      if (el.scrollHeight > el.clientHeight + 1 && /auto|scroll/.test(getComputedStyle(el).overflowY)) return el;
    }
    return $("#deck");
  },
  dragStart(e) {
    const el = this.scroller(e.target);
    this.drag = { id: e.pointerId, x: e.clientX, y: e.clientY, el, top: el.scrollTop, moved: false };
  },
  dragMove(e) {
    const D = this.drag, dy = e.clientY - D.y;
    if (!D.moved) {
      if (Math.abs(dy) < 10 || Math.abs(dy) < Math.abs(e.clientX - D.x)) return false;
      D.moved = true; this.pinched.add(D.id);  // a scroll is not a tap: its lifting opens nothing
    }
    // screen pixels to the scroller's own, whatever the stage's scale and the zoom
    const k = D.el.getBoundingClientRect().height / D.el.offsetHeight || 1;
    D.el.scrollTop = D.top - dy / k;
    return true;
  },

  /* ---- zoom: two fingers pinch in and out and move the slide about ---- */
  pinchStart() {
    const [a, b] = [...this.touches.values()];
    this.pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]) || 1, m: this.onStage((a[0] + b[0]) / 2, (a[1] + b[1]) / 2), z: this.z, tx: this.tx, ty: this.ty };
    this.touches.forEach((_, id) => this.pinched.add(id));
  },
  pinchMove() {
    const [a, b] = [...this.touches.values()], P = this.pinch;
    const z = Math.min(4, Math.max(1, P.z * Math.hypot(a[0] - b[0], a[1] - b[1]) / P.d));
    const m = this.onStage((a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
    // the point that was under the fingers stays under them
    const fx = (P.m[0] - P.tx) / P.z, fy = (P.m[1] - P.ty) / P.z;
    this.zoom(z, m[0] - fx * z, m[1] - fy * z);
  },
  zoom(z, tx, ty) {
    const a = $("#app"), W = a.offsetWidth, H = a.offsetHeight;
    this.z = z;
    this.tx = Math.min(0, Math.max(W - W * z, tx));
    this.ty = Math.min(0, Math.max(H - H * z, ty));
    $(".frame").style.transform = z === 1 ? "" : `translate(${this.tx}px,${this.ty}px) scale(${z})`;
    $("#zoomReset").disabled = z === 1;
  },
  resetZoom() { this.zoom(1, 0, 0); }
};

document.addEventListener("DOMContentLoaded", () => {
  // the pen readout: what the pen, fingers and mouse report, to set up a new stylus. It opens with
  // "pendebug" anywhere in the link, or three quick taps on the tray's slide count, which also close it
  let box = null, last = "", taps = [];
  const lines = [];
  const log = e => {
    if (!box) return;
    const l = `${e.type.replace("pointer", "")} ${e.pointerType || ""} id=${e.pointerId} b=${e.button} bs=${e.buttons}` + (e.pressure !== undefined ? ` p=${e.pressure.toFixed(2)} ${Math.round(e.width)}x${Math.round(e.height)}` : "");
    if (e.type === "pointermove" && l === last) return;  // a move is logged only when something changed
    last = l; lines.push(l); if (lines.length > 14) lines.shift();
    box.textContent = lines.join("\n");
  };
  const note = l => { if (!box || l === last) return; last = l; lines.push(l); if (lines.length > 14) lines.shift(); box.textContent = lines.join("\n"); };
  const readout = on => {
    if (!on) { if (box) box.remove(); box = null; Present.note = () => {}; return; }
    Present.note = note;
    box = document.createElement("pre");
    box.style.cssText = "position:fixed;left:8px;top:8px;z-index:99;margin:0;padding:6px 8px;font:13px/1.35 monospace;background:rgba(0,0,0,.8);color:#fff;border-radius:6px;pointer-events:none;white-space:pre";
    box.textContent = "pen readout: draw, then draw holding the side button";
    document.body.appendChild(box);
  };
  ["pointerdown", "pointermove", "pointerup", "pointercancel", "contextmenu", "auxclick"].forEach(t => window.addEventListener(t, log, true));
  if (/pendebug/i.test(location.href)) readout(true);
  $("#trayCount").addEventListener("pointerdown", () => {
    const now = performance.now();
    taps = taps.filter(t => now - t < 700); taps.push(now);
    if (taps.length >= 3) { taps = []; readout(!box); }
  });
  const P = Present, stop = e => { e.preventDefault(); e.stopImmediatePropagation(); };
  const onSlide = e => !!e.target.closest && !!e.target.closest("#app");

  // capture on the window, before any slide sees the event
  window.addEventListener("pointerdown", e => {
    if (!P.on) return;
    if (e.pointerType === "pen") P.lastPen = performance.now();
    if (!onSlide(e)) return;
    if (e.pointerType === "pen") {
      stop(e);
      try { $(".frame").setPointerCapture(e.pointerId); } catch (x) {}
      P.begin(e);
    } else if (e.pointerType === "touch") {
      // the S Pen touching with its side button held: Chrome for Android reports it as a finger with
      // no contact size (a real finger or palm has one), while the pen hovers, or just after it hovered
      // with the button held. It rubs out, and is no finger or palm.
      const now = performance.now(), penTip = e.width === 0 && e.height === 0 && now - P.lastPen < PALM_MS;
      if (P.barrel || penTip || now - P.barrelAt < BARREL_MS) { stop(e); P.barrel = true; P.note(`→ eraser (touch ${e.pointerId})`); P.rub(P.at(e)); return; }
      if (P.busy()) { stop(e); P.pinched.add(e.pointerId); P.swallowUntil = Infinity; return; }
      P.touches.set(e.pointerId, [e.clientX, e.clientY]);
      // a sort chip keeps its own drag
      if (P.touches.size === 1 && !e.target.closest(".chip")) P.dragStart(e);
      if (P.touches.size === 2) { stop(e); P.drag = null; P.pinchStart(); P.swallowUntil = Infinity; }
    }
  }, true);
  window.addEventListener("pointermove", e => {
    if (!P.on) return;
    if (e.pointerType === "pen") {
      P.lastPen = performance.now();
      if (P.stroke || P.erasing) { stop(e); P.extend(e); }
      // the S Pen hovering with its side button held: Chrome for Android sends moves marked pressed
      // with no pressure. They rub out nothing (the pen is not on the glass) but mark the touch that follows
      else if ((e.buttons & 1) && e.pressure === 0) P.barrelAt = performance.now();
    } else if (P.barrel && e.pointerType === "touch") {
      stop(e);
      (e.getCoalescedEvents ? e.getCoalescedEvents() : [e]).forEach(c => P.rub(P.at(c)));
    } else if (P.touches.has(e.pointerId)) {
      P.touches.set(e.pointerId, [e.clientX, e.clientY]);
      if (P.pinch) { stop(e); P.pinchMove(); }
      else if (P.drag && P.drag.id === e.pointerId && P.dragMove(e)) stop(e);
    }
  }, true);
  const up = e => {
    if (!P.on) return;
    if (e.pointerType === "pen") {
      P.lastPen = performance.now();
      if (P.stroke || P.erasing) { stop(e); P.end(); }
      P.swallowUntil = performance.now() + 350;
      return;
    }
    // the side-button pen lifted (a cancel is Android's long press: the touch events below carry on)
    if (P.barrel && e.pointerType === "touch") { stop(e); if (e.type === "pointerup") { P.barrel = false; P.rubbed = null; P.swallowUntil = performance.now() + 350; } return; }
    P.touches.delete(e.pointerId);
    if (P.drag && P.drag.id === e.pointerId) { if (P.drag.moved) P.swallowUntil = performance.now() + 350; P.drag = null; }
    if (P.pinched.delete(e.pointerId)) stop(e);
    if (P.touches.size < 2 && P.pinch) P.pinch = null;
    if (!P.touches.size && P.swallowUntil === Infinity) P.swallowUntil = performance.now() + 350;
  };
  window.addEventListener("pointerup", up, true);
  window.addEventListener("pointercancel", up, true);
  // the tap that ends a pen stroke, a pinch or a resting palm opens nothing on the slide
  window.addEventListener("click", e => {
    if (P.on && onSlide(e) && (e.pointerType === "pen" || performance.now() < P.swallowUntil)) stop(e);
  }, true);
  // belt and braces: the browser never turns a stylus touch into a scroll or a gesture, which
  // would cancel the stroke partway (the pen's own pointer events still arrive)
  $("#app").addEventListener("touchstart", e => {
    if (P.on && [...e.changedTouches].some(t => t.touchType === "stylus") && e.cancelable) e.preventDefault();
  }, { passive: false });
  // the side-button pen on the glass: no long press, menu or scroll starts, and should Android cancel
  // its pointer, its touch events carry on rubbing out until it lifts
  window.addEventListener("touchstart", e => { if (P.on && P.barrel && e.cancelable) e.preventDefault(); }, { capture: true, passive: false });
  window.addEventListener("touchmove", e => {
    if (!P.on || !P.barrel) return;
    if (e.cancelable) e.preventDefault();
    [...e.changedTouches].forEach(t => P.rub(P.at(t)));
  }, { capture: true, passive: false });
  const barrelOff = () => { if (P.barrel) { P.barrel = false; P.rubbed = null; P.swallowUntil = performance.now() + 350; } };
  window.addEventListener("touchend", e => { if (!e.touches.length) barrelOff(); }, true);
  window.addEventListener("touchcancel", e => { if (!e.touches.length) barrelOff(); }, true);
  // the pen's side button would open the browser's menu
  window.addEventListener("contextmenu", e => { if (P.on && onSlide(e)) e.preventDefault(); }, true);

  // the tray
  $("#presentBtn").addEventListener("click", () => P.enter(true));
  $("#presentExit").addEventListener("click", () => P.leave());
  $("#trayPrev").addEventListener("click", () => Deck.prev());
  $("#trayNext").addEventListener("click", () => Deck.next());
  $("#zoomReset").addEventListener("click", () => P.resetZoom());
  $("#inkUndo").addEventListener("click", () => P.undo());
  $("#inkClear").addEventListener("click", () => P.clear());
  $$("[data-tool]").forEach(b => b.addEventListener("click", () => { if (b.held) { b.held = false; return; } P.tool = b.dataset.tool; P.tray(); }));
  // a long press on the pen opens its sizes above it; a size, or a press anywhere else, closes them
  const penBtn = $("[data-tool=pen]"), panel = $("#sizePanel");
  const openSizes = () => {
    const b = penBtn.getBoundingClientRect(), t = $("#tray").getBoundingClientRect();
    panel.style.setProperty("--at", (b.left + b.width / 2 - t.left) + "px");
    panel.hidden = false; P.tool = "pen"; P.tray();
  };
  let hold = null;
  penBtn.addEventListener("pointerdown", () => { clearTimeout(hold); hold = setTimeout(() => { penBtn.held = true; openSizes(); }, HOLD_MS); });
  ["pointerup", "pointerleave", "pointercancel"].forEach(t => penBtn.addEventListener(t, () => clearTimeout(hold)));
  penBtn.addEventListener("contextmenu", e => e.preventDefault());  // a long touch would open the browser's menu
  window.addEventListener("pointerdown", e => { if (!panel.hidden && !panel.contains(e.target) && e.target.closest("[data-tool=pen]") !== penBtn) panel.hidden = true; }, true);
  $$("[data-colour]").forEach(b => b.addEventListener("click", () => { P.colour = +b.dataset.colour; P.tool = "pen"; P.tray(); }));
  $$("[data-size]").forEach(b => b.addEventListener("click", () => { P.size = +b.dataset.size; P.tool = "pen"; panel.hidden = true; P.tray(); }));
  document.addEventListener("keydown", e => {
    if (e.altKey || e.ctrlKey || e.metaKey || e.key.toLowerCase() !== "p") return;
    P.on ? P.leave() : P.enter(true);
  });
});
