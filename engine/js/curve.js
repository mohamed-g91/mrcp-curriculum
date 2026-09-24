/* ---------- curve: shapes of data ----------
   Steps: one graph and a circle per shape, on a real axis (cm, days, weeks).
   - Normal: a crowd of people stacked in columns by height, under a dashed bell. The circle shows the
     middle column, where the mode, median and mean all land; each tap on the graph then adds the next
     columns out and shades ±1, ±2, ±3 SD (68%, 95%, 99.7%).
   - Skewed: the curve piles against a grey brick wall (a floor or a ceiling) and runs out into a tail on
     the open side; the mode, median and mean drop in with their values, and the tail is named.
   Panels: side by side, each with chips that shade one spread (SD bands on a bell with the mean marked;
   IQR, range or mean ± 2 SD on the ward's stays). One open item per graph; a click anywhere else clears. */
const Dist = {
  // a density over real values, with its mode, median and mean worked out exactly
  make(st) {
    if (st.shape === "normal") {
      const { mean: m, sd } = st;
      return { lo: m - 3.4 * sd, hi: m + 3.4 * sd, f: x => Math.exp(-(((x - m) / sd) ** 2) / 2), mode: m, median: m, mean: m };
    }
    // a log-normal: the usual shape of a positive skew; a negative skew is one mirrored from a ceiling
    const s = st.sigma, [lo, hi] = st.range;
    const ln = (t, med) => t > 0 ? Math.exp(-((Math.log(t / med)) ** 2) / (2 * s * s)) / t : 0;
    if (st.shape === "positive") {
      const med = st.median;
      return { lo, hi, f: x => ln(x, med), mode: med * Math.exp(-s * s), median: med, mean: med * Math.exp(s * s / 2) };
    }
    const C = st.ceiling, d = C - st.median;
    return { lo, hi, f: x => ln(C - x, d), mode: C - d * Math.exp(-s * s), median: st.median, mean: C - d * Math.exp(s * s / 2) };
  }
};

function curvePath(f, lo, hi, x, y, n = 160) {
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

// a value pill on a marker line: the concept's name and the value
function valuePill(parent, x, y, fam, text) {
  const g = svgEl("g", { class: `cv-pill ${fam}` }, parent);
  const w = 18 + text.length * 11;
  svgEl("rect", { x: x - w / 2, y: y - 17, width: w, height: 30, rx: 15 }, g);
  svgEl("text", { x, y: y + 4 }, g).textContent = text;
  return g;
}

function buildCurves() {
  const ORDERED = ["mode", "median", "mean"];

  /* ---- steps: one graph, a shape per circle ---- */
  $$(".cv-steps-mode").forEach(cv => {
    const steps = JSON.parse(cv.dataset.steps), stops = $$(".cv-s", cv);
    const chart = $(".cv-chart", cv), order = $(".cv-order", cv), exList = $(".cv-ex", cv);
    const W = 1000, H = 330, L = 70, R = 70, BASE = 262, PEAK = 34;
    const COLS = [-2.1, -1.4, -.67, 0, .67, 1.4, 2.1], COUNTS = [1, 2, 4, 6, 4, 2, 1], PCT = ["", "68%", "95%", "99.7%"];
    let open = null, stage = 0, crowd = null, marks = null;
    // the three middles of a step: worked out from its people when it has them, else from its curve
    const middles = st => st.values ? { mode: Stats.mode(st.values), median: Stats.median(st.values), mean: Stats.mean(st.values) } : Dist.make(st);
    const finish = st => {
      const D = middles(st);
      const byX = ORDERED.map(k => [k, D[k]]).sort((a, b) => a[1] - b[1]);
      const same = st.shape === "normal";
      order.innerHTML = byX.map(([k], i) => (i ? `<span class="cv-rel">${same ? "=" : "<"}</span>` : "") +
        `<span class="cv-tok f-${concept(k).family}">${esc(concept(k).label)}</span>`).join("") +
        // how such data are summed up, at the end of the same row
        (st.summary ? `<span class="cv-sum show f-${st.summary.family}"><b>${esc(st.summary.label)}</b><span>${esc(st.summary.note)}</span></span>` : "");
      order.className = "cv-order show";
      exList.innerHTML = (st.examples || []).map((x, i) => `<li style="--i:${i}">${esc(x)}</li>`).join("");
    };
    /* a skewed step drawn from its people: stacked on a broken axis, a wall on the steep side and a
       fitted curve over them that runs out into the tail; each tap on the graph then drops in the
       mean, the median and the mode, one at a time */
    const drawPeople = st => {
      const fam = concept(st.concept).family, v = st.values, side = st.shape === "positive" ? "left" : "right";
      const D = drawStays(chart, v, { unit: st.axis || "", W, H: H + 14, AX: BASE, wall: side, counts: false, breaks: st.breaks, scale: .8 });
      D.svg.setAttribute("class", `dp-svg cv-svg f-${fam}`);
      D.svg.setAttribute("aria-label", concept(st.concept).label);
      const lo = Math.min(...v), hi = Math.max(...v), med = Stats.median(v);
      const s = st.sigma, ln = (t, m) => t > 0 ? Math.exp(-((Math.log(t / m)) ** 2) / (2 * s * s)) / t : 0;
      const f = st.shape === "positive" ? t => ln(t, med) : t => ln(st.ceiling - t, st.ceiling - med);
      const a = st.shape === "positive" ? 0.05 : lo - .6, b = st.shape === "positive" ? hi + .6 : st.ceiling - .01;
      let top = 0; for (let i = 0; i <= 400; i++) top = Math.max(top, f(a + (b - a) * i / 400));
      const tall = Math.max(...[...new Set(v)].map(u => v.filter(w => w === u).length));
      const y = fv => BASE - fv / top * (tall * D.STEP + 24);
      const d = curvePath(f, a, b, D.x, y, 300);
      svgEl("path", { class: "cv-area", d: `${d} L${D.x(b)} ${BASE} L${D.x(a)} ${BASE} Z` }, D.back);
      svgEl("path", { class: "cv-line", d, pathLength: 1 }, D.back);
      // the wall stands where no value can go: 0 days, or the ceiling; its name sits over it, reading inwards
      const wx = D.x(side === "left" ? 0 : st.ceiling) - 14, wtop = BASE - tall * D.STEP - 40;
      drawWall(D.back, wx, 28, wtop, BASE);
      svgEl("text", { class: "cv-wlab", x: side === "left" ? wx : wx + 28, y: wtop - 12, style: `text-anchor:${side === "left" ? "start" : "end"}` }, D.back).textContent = st.wall_label || "";
      // the tail, named over the break where it runs out
      if (st.tail_label) {
        const far = side === "left" ? hi : lo, sorted = Stats.sorted(v), near = side === "left" ? sorted[sorted.length - 2] : sorted[1];
        const tx = D.x((far + near) / 2), g = svgEl("g", { class: "cv-tail" }, D.svg);
        svgEl("text", { x: tx, y: BASE - 96 }, g).textContent = st.tail_label;
        svgEl("path", { d: side === "left" ? `M${tx - 60} ${BASE - 76} h120 m-8 -6 l8 6 l-8 6` : `M${tx + 60} ${BASE - 76} h-120 m8 -6 l-8 6 l8 6` }, g);
      }
      // the markers stand behind the people, their pills stepping down above the curve
      const mk = svgEl("g", { class: "cv-marks" }, D.back), M = middles(st), SEQ = ["mean", "median", "mode"];
      return {
        n: 0,
        next() {
          const key = SEQ[this.n], cc = concept(key), px = D.x(M[key]), py = PEAK + 2 + this.n * 34;
          const g = svgEl("g", { class: `cv-mk f-${cc.family}` }, mk);
          svgEl("path", { d: `M${px} ${BASE} V${py + 13}` }, g);
          valuePill(g, px, py, `f-${cc.family}`, `${cc.label} ${num(M[key])}`);
          return ++this.n < SEQ.length;
        }
      };
    };
    const draw = st => {
      chart.innerHTML = ""; order.innerHTML = ""; order.className = "cv-order"; exList.innerHTML = "";
      if (st.values) { marks = drawPeople(st); return; }
      const fam = concept(st.concept).family;
      const svg = svgEl("svg", { class: `cv-svg f-${fam}`, viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": concept(st.concept).label }, chart);
      const D = Dist.make(st), wall = st.shape === "positive" ? "left" : st.shape === "negative" ? "right" : null;
      const x0 = wall === "left" ? L + 26 : L, x1 = wall === "right" ? W - R - 26 : W - R;
      const x = v => x0 + (v - D.lo) / (D.hi - D.lo) * (x1 - x0);
      let top = 0; for (let i = 0; i <= 400; i++) top = Math.max(top, D.f(D.lo + (D.hi - D.lo) * i / 400));
      const y = v => BASE - v / top * (BASE - PEAK);
      const bands = svgEl("g", {}, svg);
      if (wall) {
        drawWall(svg, wall === "left" ? L - 4 : W - R - 26, 30, PEAK + 50, BASE);
        // the wall's name sits on its outer side, clear of the curve
        svgEl("text", { class: `cv-wlab${wall === "right" ? " right" : ""}`, x: wall === "left" ? L + 26 : W - R - 26, y: PEAK + 38 }, svg).textContent = st.wall_label || "";
      }
      const d = curvePath(D.f, D.lo, D.hi, x, y);
      if (!st.crowd) svgEl("path", { class: "cv-area", d: `${d} L${x(D.hi)} ${BASE} L${x(D.lo)} ${BASE} Z` }, svg);
      if (st.crowd) {
        // the ±1, ±2 and ±3 SD bands, shown one by one as the crowd grows
        crowd = { bands: [1, 2, 3].map(k => svgEl("path", { class: "cv-band hold", d: `${curvePath(D.f, st.mean - k * st.sd, st.mean + k * st.sd, x, y, 80)} L${x(st.mean + k * st.sd)} ${BASE} L${x(st.mean - k * st.sd)} ${BASE} Z` }, bands)), cols: [] };
        let n = 0;
        COLS.forEach((c, i) => {
          const g = svgEl("g", { class: "cv-col hold" }, svg);
          for (let r = 0; r < COUNTS[i]; r++) drawPerson(g, x(st.mean + c * st.sd), BASE - 2 - r * 37, n++, REDUCED_MOTION ? 0 : r * 70, .85);
          crowd.cols.push([Math.abs(i - 3), g]);
        });
        crowd.pct = svgEl("text", { class: "cv-bigpct", x: L + 10, y: PEAK + 44 }, svg);
        crowd.sub = svgEl("text", { class: "cv-subpct", x: L + 12, y: PEAK + 74 }, svg);
      }
      svgEl("path", { class: `cv-line${st.crowd ? " cv-dash" : ""}`, d, pathLength: 1 }, svg);
      svgEl("path", { class: "cv-axis", d: `M${L - 20} ${BASE} H${W - R + 20}` }, svg);
      const ticks = st.crowd ? [-3, -2, -1, 0, 1, 2, 3].map(k => st.mean + k * st.sd) : st.ticks || [];
      ticks.forEach(t => {
        svgEl("path", { class: "dp-tick", d: `M${x(t)} ${BASE} v8` }, svg);
        svgEl("text", { class: "cv-tlab", x: x(t), y: BASE + 30 }, svg).textContent = t;
      });
      svgEl("text", { class: "cv-alab", x: (x0 + x1) / 2, y: BASE + 60 }, svg).textContent = st.axis || "";
      // the tail, named where it runs out
      if (st.tail_label) {
        const tx = wall === "left" ? x(D.lo + (D.hi - D.lo) * .72) : x(D.lo + (D.hi - D.lo) * .28);
        const g = svgEl("g", { class: "cv-tail" }, svg);
        svgEl("text", { x: tx, y: BASE - 46 }, g).textContent = st.tail_label;
        svgEl("path", { d: wall === "left" ? `M${tx - 60} ${BASE - 26} h120 m-8 -6 l8 6 l-8 6` : `M${tx + 60} ${BASE - 26} h-120 m8 -6 l-8 6 l8 6` }, g);
      }
      // where the three middles land: one pill naming all three for a bell, else a pill each with its value
      const mk = svgEl("g", { class: "cv-marks" }, svg), unit = st.unit ? ` ${st.unit}` : "";
      if (st.shape === "normal") {
        const g = svgEl("g", { class: "cv-mk f-par" }, mk);
        svgEl("path", { d: `M${x(st.mean)} ${BASE} V${PEAK + 4}` }, g);
        valuePill(g, x(st.mean), PEAK - 14, "f-par", `${["mean", "median", "mode"].map(k => concept(k).label).join(" = ")} = ${st.mean}${unit}`);
      } else {
        ORDERED.forEach((key, i) => {
          const cc = concept(key), v = D[key], px = x(v);
          const g = svgEl("g", { class: `cv-mk f-${cc.family}`, style: `animation-delay:${REDUCED_MOTION ? 0 : 700 + i * 160}ms` }, mk);
          const py = PEAK + 4 + i * 40;
          svgEl("path", { d: `M${px} ${BASE} V${py + 13}` }, g);
          valuePill(g, px, py, `f-${cc.family}`, `${cc.label} ${Math.round(v)}`);
        });
        finish(st);
      }
    };
    // the crowd grows by one ring of columns per tap: the middle, then ±1, ±2, ±3 SD
    const grow = () => {
      if (!crowd) return;
      crowd.cols.forEach(([ring, g]) => g.classList.toggle("hold", ring >= stage));
      crowd.bands.forEach((b, k) => b.classList.toggle("hold", k !== stage - 2));
      crowd.pct.textContent = PCT[stage - 1];
      crowd.sub.textContent = stage > 1 ? `within ±${stage - 1} SD` : "";
      chart.classList.toggle("stepper", stage < 4);
      if (stage === 4) finish(steps.find(s => s.concept === open));
    };
    const show = key => {
      open = key; crowd = null; marks = null; stage = 0;
      stops.forEach(s => { s.classList.toggle("on", s.dataset.key === key); $(".spec-dot", s).setAttribute("aria-expanded", String(s.dataset.key === key)); });
      cv.classList.toggle("drawn", !!key);
      chart.classList.remove("stepper");
      chart.removeAttribute("role"); chart.removeAttribute("tabindex"); chart.removeAttribute("aria-label");
      if (key) {
        const st = steps.find(s => s.concept === key);
        draw(st);
        if (st.crowd) { stage = 1; grow(); }
        if (st.crowd || marks) {
          if (marks) chart.classList.add("stepper");
          Object.entries({ role: "button", tabindex: "0", "aria-label": st.crowd ? "Show the next part of the crowd" : "Show the next middle" }).forEach(([k, v]) => chart.setAttribute(k, v));
        }
      } else {
        chart.innerHTML = ""; order.innerHTML = ""; order.className = "cv-order"; exList.innerHTML = "";
          const svg = svgEl("svg", { class: "cv-svg", viewBox: `0 0 ${W} ${H}`, "aria-hidden": "true" }, chart);
        svgEl("path", { class: "cv-axis", d: `M${L - 20} ${BASE} H${W - R + 20}` }, svg);
      }
    };
    const next = () => {
      if (crowd && stage < 4) { stage++; grow(); }
      if (marks && chart.classList.contains("stepper") && !marks.next()) {
        chart.classList.remove("stepper");
        finish(steps.find(s => s.concept === open));
      }
    };
    chart.addEventListener("click", next);
    chart.addEventListener("keydown", e => { if ((e.key === "Enter" || e.key === " ") && (crowd || marks)) { e.preventDefault(); next(); } });
    stops.forEach(s => $(".spec-dot", s).addEventListener("click", () => show(open === s.dataset.key ? null : s.dataset.key)));
    ClickAway.add(e => { if (open && !e.target.closest(".cv-s .spec-dot, .cv-chart")) show(null); });
    onEnter(cv, () => show(null));
    show(null);
  });

  /* ---- panels: spread, shaded by chips ---- */
  $$(".cv-panel").forEach(pn => {
    const P = JSON.parse(pn.dataset.panel), chart = $(".cv-chart", pn), read = $(".cv-read", pn), chips = $$(".cv-chip", pn);
    const W = 600, H = 270;
    let open = -1, layer, D, bell;
    if (P.kind === "sd") {
      const BASE = 196, L = 30, R = 30, x = t => L + (t + 3.5) / 7 * (W - L - R), y = v => BASE - v * 140;
      const f = t => Math.exp(-t * t / 2);
      const svg = svgEl("svg", { class: "cv-svg", viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": P.title }, chart);
      layer = svgEl("g", {}, svg);
      const d = curvePath(f, -3.5, 3.5, x, y);
      svgEl("path", { class: "cv-area", d: `${d} L${x(3.5)} ${BASE} L${x(-3.5)} ${BASE} Z` }, svg);
      svgEl("path", { class: "cv-line", d, pathLength: 1 }, svg);
      svgEl("path", { class: "cv-axis", d: `M${L - 10} ${BASE} H${W - R + 10}` }, svg);
      for (let k = -3; k <= 3; k++) {
        svgEl("path", { class: "dp-tick", d: `M${x(k)} ${BASE} v8` }, svg);
        svgEl("text", { class: "cv-tlab", x: x(k), y: BASE + 30 }, svg).textContent = P.mean + k * P.sd;
      }
      svgEl("text", { class: "cv-alab", x: W / 2, y: BASE + 62 }, svg).textContent = P.axis;
      // the mean, dotted, that every band is built out from
      const mg = svgEl("g", { class: "cv-mk cv-meanline f-par" }, svg);
      svgEl("path", { d: `M${x(0)} ${BASE} V${BASE - 150}` }, mg);
      valuePill(mg, x(0), BASE - 164, "f-par", `${concept("mean").label} ${P.mean} ${P.unit}`);
      bell = { x, y, f, BASE };
    } else {
      // the ward's stays shoulder to shoulder, in order, so the middle half can be boxed
      D = drawStays(chart, P.values, { unit: P.unit, W: 1000, H: 250, AX: 176, wall: "left", row: true });
      D.svg.classList.add("cv-svg");
      drawWall(D.back, D.x(0) - 14, 28, 176 - 84, 176);
      layer = svgEl("g", {}, D.back);
    }
    const shade = k => {
      layer.innerHTML = "";
      if (read) read.innerHTML = "";
      D && D.dots.forEach(d => d.classList.remove("out", "hit"));
      if (k < 0) return;
      if (P.kind === "sd") {
        const n = k + 1, { x, y, f, BASE } = bell, lo = P.mean - n * P.sd, hi = P.mean + n * P.sd;
        svgEl("path", { class: "cv-band", d: `${curvePath(f, -n, n, x, y, 60)} L${x(n)} ${BASE} L${x(-n)} ${BASE} Z` }, layer);
        svgEl("text", { class: "cv-pct", x: x(0) - 70, y: BASE - 30 }, layer).textContent = P.pct[k];
        read.innerHTML = `<b>${lo}–${hi} ${esc(P.unit)}</b> · ${esc(P.pct[k])}`;
      } else {
        // each spread is labelled on the figure: the middle half boxed, the range bracketed, mean ± 2 SD barred
        const v = P.values, [q1, q3] = Stats.quartiles(v), m = Stats.mean(v), sd = Stats.sd(v), x = D.x, AX = D.AX;
        const order = v.map((u, i) => [u, i]).sort((a, b) => a[0] - b[0] || a[1] - b[1]).map(p => p[1]);
        const px = i => +D.dots[order[i]].dataset.x, n = v.length, pad = D.PW / 2 + 8, yy = AX - 92;
        const label = (tx, text, cls = "cv-lab") => { svgEl("text", { class: cls, x: tx, y: yy - 14 }, layer).textContent = text; };
        const bracket = (a, b, cls) => svgEl("path", { class: cls, d: `M${a} ${yy + 12} V${yy} H${b} V${yy + 12}` }, layer);
        const key = ["iqr", "range", "msd"][k];
        if (key === "iqr") {
          // the quartiles are the middles of each half, so the box runs from the one to the other
          const i0 = Math.floor((Math.floor(n / 2) - 1) / 2), i1 = n - 1 - i0;
          D.dots.forEach((d, i) => d.classList.add(order.indexOf(i) >= i0 && order.indexOf(i) <= i1 ? "hit" : "out"));
          svgEl("rect", { class: "cv-box", x: px(i0) - pad, y: AX - 60, width: px(i1) - px(i0) + 2 * pad, height: 66, rx: 12 }, layer);
          bracket(px(i0), px(i1), "cv-brace");
          label((px(i0) + px(i1)) / 2, `IQR ${num(q1)} to ${num(q3)} ${P.unit}`);
        }
        if (key === "range") {
          bracket(px(0), px(n - 1), "cv-range");
          label((px(0) + px(n - 1)) / 2, `Range ${num(Math.min(...v))} to ${num(Math.max(...v))} ${P.unit}`, "cv-lab ink");
        }
        if (key === "msd") {
          const lo = m - 2 * sd, hi = m + 2 * sd, w0 = x(0);
          svgEl("path", { class: "cv-msd", d: `M${w0} ${yy} H${x(hi)}` }, layer);
          if (lo < 0) {
            // below zero: through the wall, where no stay can be
            svgEl("path", { class: "cv-msd bad", d: `M${w0} ${yy} H${w0 - 44}` }, layer);
            svgEl("path", { class: "cv-arrow bad", d: `M${w0 - 38} ${yy - 9} l-10 9 l10 9` }, layer);
            svgEl("text", { class: "cv-bad", x: 6, y: yy - 16 }, layer).textContent = `${num(Math.round(lo)).replace("-", "−")} ${P.unit}?`;
          }
          svgEl("path", { class: "cv-msdcap", d: `M${x(hi)} ${yy - 8} v16` }, layer);
          label((w0 + x(hi)) / 2 + 40, `${num(m)} ± 2 × ${num(sd)}`, "cv-lab par");
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
