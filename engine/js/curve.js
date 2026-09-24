/* ---------- curve: shapes of data ----------
   Steps: one graph and a circle per shape. Tapping a circle draws its shape on the graph (the normal
   bell over a crowd of people stacked by height; a skewed curve piled against a brick wall), then marks
   where the mode, median and mean land and their order. Its examples follow beneath.
   Panels: side by side, each with chips that shade one spread (SD bands on a bell; IQR, range or
   mean ± 2 SD on a handful of values). One open item per graph; a click anywhere else clears them. */
const Shape = {
  // each shape as a density over its own domain; skewed shapes are a gamma curve (k = 2) and its mirror
  normal: { lo: -3.4, hi: 3.4, f: t => Math.exp(-t * t / 2) },
  positive: { lo: 0, hi: 11, f: t => t * Math.exp(-t / 1.5) },
  negative: { lo: 0, hi: 11, f: t => t * Math.exp(-t / 1.5), mirror: true },
  // mode, median and mean of a density, found numerically on a fine grid
  centres(sh) {
    const n = 2000, dt = (sh.hi - sh.lo) / n, ts = [], ys = [];
    for (let i = 0; i <= n; i++) { ts.push(sh.lo + i * dt); ys.push(sh.f(sh.lo + i * dt)); }
    const tot = Stats.sum(ys), mode = ts[ys.indexOf(Math.max(...ys))];
    let acc = 0, median = ts[0];
    for (let i = 0; i <= n; i++) { acc += ys[i]; if (acc >= tot / 2) { median = ts[i]; break; } }
    const mean = Stats.sum(ts.map((t, i) => t * ys[i])) / tot;
    return { mode, median, mean };
  }
};

function curvePath(f, lo, hi, x, y, n = 120) {
  let d = "";
  for (let i = 0; i <= n; i++) { const t = lo + (hi - lo) * i / n; d += (i ? " L" : "M") + x(t).toFixed(1) + " " + y(f(t)).toFixed(1); }
  return d;
}

// a short brick wall standing on the axis, bricks offset on alternate rows
function drawWall(parent, x0, w, top, base) {
  const g = svgEl("g", { class: "cv-wall" }, parent), BH = 14, BW = w / 2;
  for (let r = 0, y = base - BH; y >= top - 1; r++, y -= BH) {
    for (let bx = x0 - (r % 2 ? BW / 2 : 0); bx < x0 + w; bx += BW) {
      const a = Math.max(bx, x0), b = Math.min(bx + BW, x0 + w);
      if (b - a > 2) svgEl("rect", { x: a + .8, y: y + .8, width: b - a - 1.6, height: BH - 1.6, rx: 1.5 }, g);
    }
  }
  return g;
}

// one person, standing with their feet at (x, y): a head and a rounded body, in a fixed skin tone
const SKIN = ["#B97A50", "#E3B58E", "#8A5A3B", "#F1CBA7"];
function drawPerson(parent, x, y, k, delay) {
  const at = svgEl("g", { transform: `translate(${x} ${y})` }, parent);
  const g = svgEl("g", { class: "cv-person", style: `animation-delay:${delay}ms` }, at);
  svgEl("path", { class: "cv-body", d: "M-13 -2 V-14 A13 11 0 0 1 13 -14 V-2 Z" }, g);
  svgEl("circle", { class: "cv-head", cx: 0, cy: -31, r: 9, fill: SKIN[k % SKIN.length] }, g);
}

function buildCurves() {
  const ORDERED = ["mode", "median", "mean"];

  /* ---- steps: one graph, a shape per circle ---- */
  $$(".cv-steps-mode").forEach(cv => {
    const steps = JSON.parse(cv.dataset.steps), stops = $$(".cv-s", cv);
    const chart = $(".cv-chart", cv), order = $(".cv-order", cv), exList = $(".cv-ex", cv);
    const W = 1000, H = 330, L = 70, R = 70, BASE = 270, PEAK = 38;
    let open = null;
    const draw = st => {
      chart.innerHTML = "";
      const svg = svgEl("svg", { class: `cv-svg f-${concept(st.concept).family}`, viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": concept(st.concept).label }, chart);
      const sh = Shape[st.shape], wall = st.shape === "positive" ? "left" : st.shape === "negative" ? "right" : null;
      // the plot runs from the wall (if any) to the far side
      const x0 = wall === "left" ? L + 30 : L, x1 = wall === "right" ? W - R - 30 : W - R;
      const pos = t => sh.mirror ? x1 - (t - sh.lo) / (sh.hi - sh.lo) * (x1 - x0) : x0 + (t - sh.lo) / (sh.hi - sh.lo) * (x1 - x0);
      const top = Math.max(...Array.from({ length: 200 }, (_, i) => sh.f(sh.lo + (sh.hi - sh.lo) * i / 199)));
      const y = v => BASE - v / top * (BASE - PEAK);
      if (st.people) {
        // a crowd stacked in columns by height: the bell traces the tops of their heads
        const bins = [-1.85, -1.25, -.62, 0, .62, 1.25, 1.85], counts = [1, 2, 4, 5, 4, 2, 1];
        let k = 0;
        bins.forEach((b, c) => { for (let r = 0; r < counts[c]; r++) drawPerson(svg, pos(b), BASE - 3 - r * 44, k++, REDUCED_MOTION ? 0 : 60 + c * 60 + r * 45); });
      }
      if (wall) {
        drawWall(svg, wall === "left" ? L - 4 : W - R - 26, 30, PEAK + 40, BASE);
        const t = svgEl("text", { class: "cv-wlab", x: wall === "left" ? L + 11 : W - R - 11, y: BASE + 30 }, svg);
        t.textContent = st.wall_label || "";
      }
      const d = curvePath(sh.f, sh.lo, sh.hi, pos, y);
      if (!st.people) svgEl("path", { class: "cv-area", d: `${d} L${pos(sh.hi)} ${BASE} L${pos(sh.lo)} ${BASE} Z` }, svg);
      svgEl("path", { class: `cv-line${st.people ? " cv-dash" : ""}`, d, pathLength: 1 }, svg);
      svgEl("path", { class: "cv-axis", d: `M${L - 20} ${BASE} H${W - R + 20}` }, svg);
      svgEl("text", { class: "cv-alab", x: W / 2, y: BASE + 50 }, svg).textContent = st.axis || "";
      // where the three middles land, drawn after the curve
      const c = Shape.centres(sh), same = Math.abs(c.mean - c.mode) < 1e-6 * (sh.hi - sh.lo) + .02;
      const mk = svgEl("g", { class: "cv-marks" }, svg);
      ORDERED.forEach((key, i) => {
        const cc = concept(key), px = pos(c[key]), py = y(sh.f(c[key]));
        const g = svgEl("g", { class: `cv-mk f-${cc.family}`, style: `animation-delay:${REDUCED_MOTION ? 0 : 700 + i * 160}ms` }, mk);
        svgEl("path", { d: `M${px} ${BASE} V${py}` }, g);
        // the letters sit side by side above one line when they coincide, else each above its own line
        const bx = same ? px + (i - 1) * 40 : px, by = same ? PEAK - 14 : py - 24;
        svgEl("circle", { class: "cv-badge", cx: bx, cy: by, r: 17 }, g);
        svgEl("text", { class: "cv-blab", x: bx, y: by + 6 }, g).textContent = cc.letter;
      });
      // their order, left to right along the axis
      const byX = ORDERED.map(k => [k, pos(c[k])]).sort((a, b) => a[1] - b[1]);
      order.innerHTML = byX.map(([k], i) => (i ? `<span class="cv-rel">${same ? "=" : "<"}</span>` : "") +
        `<span class="cv-tok f-${concept(k).family}">${esc(concept(k).label)}</span>`).join("");
      order.className = "cv-order show";
      exList.innerHTML = (st.examples || []).map((x, i) => `<li style="--i:${i}">${esc(x)}</li>`).join("");
    };
    const show = key => {
      open = key;
      stops.forEach(s => { s.classList.toggle("on", s.dataset.key === key); $(".spec-dot", s).setAttribute("aria-expanded", String(s.dataset.key === key)); });
      cv.classList.toggle("drawn", !!key);
      if (key) draw(steps.find(s => s.concept === key));
      else { chart.innerHTML = ""; order.innerHTML = ""; order.className = "cv-order"; exList.innerHTML = ""; drawEmpty(); }
    };
    const drawEmpty = () => {
      const svg = svgEl("svg", { class: "cv-svg", viewBox: `0 0 ${W} ${H}`, "aria-hidden": "true" }, chart);
      svgEl("path", { class: "cv-axis", d: `M${L - 20} ${BASE} H${W - R + 20}` }, svg);
    };
    stops.forEach(s => $(".spec-dot", s).addEventListener("click", () => show(open === s.dataset.key ? null : s.dataset.key)));
    ClickAway.add(e => { if (open && !e.target.closest(".cv-s .spec-dot")) show(null); });
    onEnter(cv, () => show(null));
    show(null);
  });

  /* ---- panels: spread, shaded by chips ---- */
  $$(".cv-panel").forEach(pn => {
    const P = JSON.parse(pn.dataset.panel), chart = $(".cv-chart", pn), read = $(".cv-read", pn), chips = $$(".cv-chip", pn);
    const W = 600, H = 270, BASE = 196;
    let open = -1, layer, D, bell;
    if (P.kind === "sd") {
      const L = 30, R = 30, x = t => L + (t + 3.5) / 7 * (W - L - R), y = v => BASE - v * 150;
      const svg = svgEl("svg", { class: "cv-svg", viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": P.title }, chart);
      layer = svgEl("g", {}, svg);
      const d = curvePath(Shape.normal.f, -3.5, 3.5, x, y);
      svgEl("path", { class: "cv-area", d: `${d} L${x(3.5)} ${BASE} L${x(-3.5)} ${BASE} Z` }, svg);
      svgEl("path", { class: "cv-line", d, pathLength: 1 }, svg);
      svgEl("path", { class: "cv-axis", d: `M${L - 10} ${BASE} H${W - R + 10}` }, svg);
      for (let k = -3; k <= 3; k++) {
        svgEl("path", { class: "dp-tick", d: `M${x(k)} ${BASE} v8` }, svg);
        svgEl("text", { class: "cv-tlab", x: x(k), y: BASE + 34 }, svg).textContent = P.mean + k * P.sd;
      }
      svgEl("text", { class: "cv-alab", x: W / 2, y: BASE + 72 }, svg).textContent = P.axis;
      bell = { x, y };
    } else {
      D = drawDots(chart, P.values, { min: P.min, max: P.max, unit: P.unit, W, H, r: 8, gap: 18, AX: BASE, tick: 10, rows: 6 });
      D.svg.classList.add("cv-svg");
      drawWall(D.back, D.x(P.wall) - 22, 20, BASE - 110, BASE);
      layer = svgEl("g", {}, D.back);
    }
    const shade = k => {
      layer.innerHTML = "";
      read.innerHTML = "";
      if (k < 0) return;
      if (P.kind === "sd") {
        const n = k + 1, { x, y } = bell, lo = P.mean - n * P.sd, hi = P.mean + n * P.sd;
        const d = curvePath(Shape.normal.f, -n, n, x, y, 60);
        svgEl("path", { class: "cv-band", d: `${d} L${x(n)} ${BASE} L${x(-n)} ${BASE} Z` }, layer);
        svgEl("text", { class: "cv-pct", x: x(0), y: BASE - 34 }, layer).textContent = P.pct[k];
        read.innerHTML = `<b>${lo}–${hi} ${esc(P.unit)}</b> · ${esc(P.pct[k])}`;
      } else {
        const v = P.values, [q1, q3] = Stats.quartiles(v), m = Stats.mean(v), sd = Stats.sd(v), x = D.x;
        const key = ["iqr", "range", "msd"][k];
        if (key === "iqr") {
          svgEl("rect", { class: "cv-box", x: x(q1), y: BASE - 86, width: x(q3) - x(q1), height: 80, rx: 6 }, layer);
          svgEl("path", { class: "cv-boxmid", d: `M${x(Stats.median(v))} ${BASE - 86} v80` }, layer);
          read.innerHTML = `<b>${num(q1)}–${num(q3)} ${esc(P.unit)}</b> · the middle half`;
        }
        if (key === "range") {
          const a = Math.min(...v), b = Math.max(...v);
          svgEl("path", { class: "cv-range", d: `M${x(a)} ${BASE - 96} H${x(b)} M${x(a)} ${BASE - 104} v16 M${x(b)} ${BASE - 104} v16` }, layer);
          read.innerHTML = `<b>${num(a)}–${num(b)} ${esc(P.unit)}</b> · one patient stretches it`;
        }
        if (key === "msd") {
          const lo = m - 2 * sd, hi = m + 2 * sd, yy = BASE - 118;
          svgEl("path", { class: "cv-msd", d: `M${x(Math.max(lo, P.wall))} ${yy} H${x(hi)}` }, layer);
          if (lo < P.wall) {
            svgEl("path", { class: "cv-msd bad", d: `M${x(lo)} ${yy} H${x(P.wall)}` }, layer);
            svgEl("text", { class: "cv-bad", x: x(lo), y: yy - 16 }, layer).textContent = `${num(Math.round(lo)).replace("-", "−")} ${P.unit}?`;
          }
          svgEl("path", { class: "cv-msdcap", d: `M${x(lo)} ${yy - 8} v16 M${x(hi)} ${yy - 8} v16` }, layer);
          read.innerHTML = `${num(m)} ± 2 × ${num(sd)} = <b>${num(Math.round(lo)).replace("-", "−")} to ${num(Math.round(hi))} ${esc(P.unit)}</b>`;
        }
      }
    };
    const set = k => {
      open = k;
      chips.forEach((c, i) => { c.classList.toggle("on", i === k); c.setAttribute("aria-pressed", String(i === k)); });
      pn.classList.toggle("open", k >= 0);
      shade(k);
    };
    chips.forEach((c, i) => c.addEventListener("click", () => set(open === i ? -1 : i)));
    ClickAway.add(e => { if (open >= 0 && !e.target.closest(".cv-chip")) set(-1); });
    onEnter(pn, () => set(-1));
    set(-1);
  });
}
