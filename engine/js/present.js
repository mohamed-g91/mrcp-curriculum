/* ---------- recording view: the presenter's pen, highlighter and zoom ----------
   The slide sits at the top of the screen as a clean 16:9 frame and the tray fills the strip
   below it. The pen (a stylus, such as the S Pen) only ever writes; fingers and the mouse work
   the slide as usual, and two fingers pinch to zoom. Ink belongs to its slide: it goes when the
   slide changes and comes back when the slide does. Touches while the pen is near are a palm
   resting on the glass, and are ignored. */
const PALM_MS = 600;      // a touch this soon after the pen was seen is the hand, not a tap
const PEN_W = [2, 4, 7, 11];  // fine, medium (the default), thick, very thick
// the colour rings: the pen's (the first follows the theme's ink) and the highlighter's, soft enough to read through
const PEN_COLOURS = [["var(--ink)", "Black"], ["#e03131", "Red"], ["#f76707", "Orange"], ["#2f9e44", "Green"], ["#1c7ed6", "Blue"], ["#7048e8", "Purple"], ["#d6336c", "Pink"], ["#8d5524", "Brown"]];
const MARKER_COLOURS = [["var(--hl)", "Yellow"], ["#8ce99a", "Green"], ["#74c0fc", "Blue"], ["#faa2c1", "Pink"], ["#ffc078", "Orange"], ["#b197fc", "Purple"]];
const SIDE_UP_MS = 150;       // the side button must be seen up this long before a press counts again
const MARKER_W = 24;
// every point a pointer move carries (a synthetic event carries none but its own)
const each = e => { const c = e.getCoalescedEvents ? e.getCoalescedEvents() : []; return c.length ? c : [e]; };
// the distance from (x, y) to the line segment from a to b
const segDist = (x, y, [ax, ay], [bx, by]) => {
  const dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy;
  const t = L ? Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / L)) : 0;
  return Math.hypot(x - ax - t * dx, y - ay - t * dy);
};
const Present = {
  on: false, tool: "pen", size: 1,
  colours: { pen: 1, marker: 0 },  // each tool keeps its own colour: red for the pen, yellow for the highlighter
  ink: new WeakMap(),     // slide -> { strokes, history }
  slide: null, stroke: null, erasing: false,
  rubbed: null,          // what the eraser has cut so far in this rub: one undo puts it all back
  lastPen: 0, swallowUntil: 0,
  sideUpSince: 0,        // since when the S Pen's side button has been up (null while it is held)
  touches: new Map(), pinch: null,
  drag: null,            // one finger scrolling the slide (the page scrolls it: the browser may not pan, or it would cut the pen off)
  pinched: new Set(),    // touches whose lifting the slide must not see: a pinch's fingers, a palm
  z: 1, tx: 0, ty: 0,

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

  // a press of the S Pen's side button: the eraser, and the next press the pen
  side() {
    this.tool = this.tool === "eraser" ? "pen" : "eraser";
    this.tray();
  },
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
    $("#colourBtn").style.setProperty("--c", this.colourOf(this.inkTool()));
    $$("[data-size]").forEach(b => b.setAttribute("aria-checked", String(+b.dataset.size === this.size)));
  },

  // the tool the colour belongs to: the highlighter's own, else the pen's (the eraser has none)
  inkTool() { return this.tool === "marker" ? "marker" : "pen"; },
  colourOf(tool) { return (tool === "marker" ? MARKER_COLOURS : PEN_COLOURS)[this.colours[tool]][0]; },

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
  begin(e) {
    const tool = this.tool;
    if (tool === "eraser") { this.erasing = true; this.rub(this.at(e)); return; }
    const el = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const k = { tool, el, pts: [this.at(e)] };
    el.style.stroke = this.colourOf(tool);
    el.setAttribute("stroke-width", String((tool === "marker" ? MARKER_W : PEN_W[this.size]) / this.z));
    (tool === "marker" ? $("#inkMarker") : $("#inkPen")).appendChild(el);
    this.stroke = k;
    this.draw(k);
  },
  extend(e) {
    if (this.erasing) { each(e).forEach(c => this.rub(this.at(c))); return; }
    const k = this.stroke;
    each(e).forEach(c => k.pts.push(this.at(c)));
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
  const P = Present, stop = e => { e.preventDefault(); e.stopImmediatePropagation(); };
  const onSlide = e => !!e.target.closest && !!e.target.closest("#app");

  // the pop-ups close on a tap anywhere else; registered first, so a pen stroke (which stops the event from going further) still closes them
  window.addEventListener("pointerdown", e => { if (!pops.some(([p, a]) => p.contains(e.target) || a.contains(e.target))) shut(); }, true);
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
      // the side button pressed while the pen hovers: Chrome for Android reports moves marked pressed
      // with no pressure. A press counts only once the button was seen up for a moment, since what the
      // pen reports can flicker while the button is held.
      else if ((e.buttons & 1) && e.pressure === 0) {
        if (P.sideUpSince !== null && performance.now() - P.sideUpSince >= SIDE_UP_MS) P.side();
        P.sideUpSince = null;
      } else if (!e.buttons && P.sideUpSince === null) P.sideUpSince = performance.now();
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
  // the pop-ups: a tap on the pen when it is already in hand opens its sizes, a tap on the colour its ring;
  // the same tap again, a choice, or a tap anywhere else (the slide, the pen on the glass) closes them
  const penBtn = $("[data-tool=pen]"), sizes = $("#sizePanel"), ring = $("#colourPanel"), colourBtn = $("#colourBtn");
  const pops = [[sizes, penBtn], [ring, colourBtn]];
  const shut = () => pops.forEach(([p]) => { p.hidden = true; });
  const pop = (panel, anchor) => {
    const open = !panel.hidden;
    shut();
    if (open) return;
    const b = anchor.getBoundingClientRect(), t = $("#tray").getBoundingClientRect();
    panel.style.setProperty("--at", (b.left + b.width / 2 - t.left) + "px");
    panel.hidden = false;
  };
  $$("[data-tool]").forEach(b => b.addEventListener("click", () => {
    if (b === penBtn && P.tool === "pen") { pop(sizes, penBtn); return; }
    shut(); P.tool = b.dataset.tool; P.tray();
  }));
  $$("[data-size]").forEach(b => b.addEventListener("click", () => { P.size = +b.dataset.size; P.tool = "pen"; shut(); P.tray(); }));
  // the ring holds the colours of the tool in hand (the pen's while the eraser is)
  colourBtn.addEventListener("click", () => {
    const tool = P.inkTool(), list = tool === "marker" ? MARKER_COLOURS : PEN_COLOURS;
    ring.replaceChildren(...list.map(([c, name], k) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "swatch"; b.setAttribute("role", "menuitemradio");
      b.setAttribute("aria-label", `${name} ${tool === "marker" ? "highlighter" : "pen"}`);
      b.setAttribute("aria-checked", String(k === P.colours[tool]));
      b.style.setProperty("--c", c); b.style.setProperty("--a", (360 * k / list.length) + "deg");
      b.addEventListener("click", () => { P.colours[tool] = k; P.tool = tool; shut(); P.tray(); });
      return b;
    }));
    pop(ring, colourBtn);
  });
  document.addEventListener("keydown", e => {
    if (!PRESENTER || e.altKey || e.ctrlKey || e.metaKey || e.key.toLowerCase() !== "p") return;
    P.on ? P.leave() : P.enter(true);
  });
});
