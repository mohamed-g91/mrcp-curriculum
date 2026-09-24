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

// a value pill on a marker line: the concept's letter and the value
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
    let open = null, stage = 0, crowd = null;
    const finish = st => {
      const D = Dist.make(st);
      const byX = ORDERED.map(k => [k, D[k]]).sort((a, b) => a[1] - b[1]);
      const same = st.shape === "normal";
      order.innerHTML = byX.map(([k], i) => (i ? `<span class="cv-rel">${same ? "=" : "<"}</span>` : "") +
        `<span class="cv-tok f-${concept(k).family}">${esc(concept(k).label)}</span>`).join("");
      order.className = "cv-order show";
      exList.innerHTML = (st.examples || []).map((x, i) => `<li style="--i:${i}">${esc(x)}</li>`).join("");
    };
    const draw = st => {
      chart.innerHTML = ""; order.innerHTML = ""; order.className = "cv-order"; exList.innerHTML = "";
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
      // where the three middles land: the letters side by side on one line for a bell, else a pill each with its value
      const mk = svgEl("g", { class: "cv-marks" }, svg), unit = st.unit ? ` ${st.unit}` : "";
      if (st.shape === "normal") {
        const g = svgEl("g", { class: "cv-mk f-par" }, mk);
        svgEl("path", { d: `M${x(st.mean)} ${BASE} V${PEAK + 4}` }, g);
        ORDERED.forEach((key, i) => {
          const cc = concept(key), gg = svgEl("g", { class: `f-${cc.family}` }, g), bx = x(st.mean) + (i - 1) * 40;
          svgEl("circle", { class: "cv-badge", cx: bx, cy: PEAK - 14, r: 17 }, gg);
          svgEl("text", { class: "cv-blab", x: bx, y: PEAK - 8 }, gg).textContent = cc.letter;
        });
        valuePill(g, x(st.mean) + 118, PEAK - 14, "f-par", `${st.mean}${unit}`);
      } else {
        ORDERED.forEach((key, i) => {
          const cc = concept(key), v = D[key], px = x(v);
          const g = svgEl("g", { class: `cv-mk f-${cc.family}`, style: `animation-delay:${REDUCED_MOTION ? 0 : 700 + i * 160}ms` }, mk);
          const py = PEAK + 4 + i * 40;
          svgEl("path", { d: `M${px} ${BASE} V${py + 13}` }, g);
          valuePill(g, px, py, `f-${cc.family}`, `${cc.letter} ${Math.round(v)}`);
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
      open = key; crowd = null; stage = 0;
      stops.forEach(s => { s.classList.toggle("on", s.dataset.key === key); $(".spec-dot", s).setAttribute("aria-expanded", String(s.dataset.key === key)); });
      cv.classList.toggle("drawn", !!key);
      chart.classList.remove("stepper");
      chart.removeAttribute("role"); chart.removeAttribute("tabindex"); chart.removeAttribute("aria-label");
      if (key) {
        const st = steps.find(s => s.concept === key);
        draw(st);
        if (st.crowd) {
          stage = 1; grow();
          Object.entries({ role: "button", tabindex: "0", "aria-label": "Show the next part of the crowd" }).forEach(([k, v]) => chart.setAttribute(k, v));
        }
      } else {
        chart.innerHTML = ""; order.innerHTML = ""; order.className = "cv-order"; exList.innerHTML = "";
        const svg = svgEl("svg", { class: "cv-svg", viewBox: `0 0 ${W} ${H}`, "aria-hidden": "true" }, chart);
        svgEl("path", { class: "cv-axis", d: `M${L - 20} ${BASE} H${W - R + 20}` }, svg);
      }
    };
    const next = () => { if (crowd && stage < 4) { stage++; grow(); } };
    chart.addEventListener("click", next);
    chart.addEventListener("keydown", e => { if ((e.key === "Enter" || e.key === " ") && crowd) { e.preventDefault(); next(); } });
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
      valuePill(mg, x(0), BASE - 164, "f-par", `${concept("mean").letter} ${P.mean} ${P.unit}`);
      bell = { x, y, f, BASE };
    } else {
      D = drawStays(chart, P.values, { unit: P.unit, W, H, AX: 200, scale: .8, wall: true });
      D.svg.classList.add("cv-svg");
      drawWall(D.back, D.x(0) - 22, 20, 200 - 112, 200);
      layer = svgEl("g", {}, D.back);
    }
    const shade = k => {
      layer.innerHTML = "";
      read.innerHTML = "";
      if (k < 0) return;
      if (P.kind === "sd") {
        const n = k + 1, { x, y, f, BASE } = bell, lo = P.mean - n * P.sd, hi = P.mean + n * P.sd;
        svgEl("path", { class: "cv-band", d: `${curvePath(f, -n, n, x, y, 60)} L${x(n)} ${BASE} L${x(-n)} ${BASE} Z` }, layer);
        svgEl("text", { class: "cv-pct", x: x(0) - 70, y: BASE - 30 }, layer).textContent = P.pct[k];
        read.innerHTML = `<b>${lo}–${hi} ${esc(P.unit)}</b> · ${esc(P.pct[k])}`;
      } else {
        const v = P.values, [q1, q3] = Stats.quartiles(v), m = Stats.mean(v), sd = Stats.sd(v), x = D.x, AX = D.AX, half = D.sw * .46;
        const key = ["iqr", "range", "msd"][k];
        if (key === "iqr") {
          svgEl("rect", { class: "cv-box", x: x(q1) - half, y: AX - 116, width: x(q3) - x(q1) + 2 * half, height: 114, rx: 8 }, layer);
          svgEl("path", { class: "cv-boxmid", d: `M${x(Stats.median(v))} ${AX - 116} v114` }, layer);
          read.innerHTML = `<b>${num(q1)}–${num(q3)} ${esc(P.unit)}</b> · the middle half`;
        }
        if (key === "range") {
          const a = Math.min(...v), b = Math.max(...v);
          svgEl("path", { class: "cv-range", d: `M${x(a)} ${AX - 150} H${x(b)} M${x(a)} ${AX - 158} v16 M${x(b)} ${AX - 158} v16` }, layer);
          read.innerHTML = `<b>${num(a)}–${num(b)} ${esc(P.unit)}</b> · one patient stretches it`;
        }
        if (key === "msd") {
          const lo = m - 2 * sd, hi = m + 2 * sd, yy = AX - 150, w0 = x(0);
          svgEl("path", { class: "cv-msd", d: `M${w0} ${yy} H${x(hi)}` }, layer);
          if (lo < 0) {
            // below zero: through the wall, where no stay can be
            svgEl("path", { class: "cv-msd bad", d: `M${w0} ${yy} H${w0 - 44}` }, layer);
            svgEl("path", { class: "cv-arrow bad", d: `M${w0 - 38} ${yy - 9} l-10 9 l10 9` }, layer);
            svgEl("text", { class: "cv-bad", x: 6, y: yy - 16 }, layer).textContent = `${num(Math.round(lo)).replace("-", "−")} ${P.unit}?`;
          }
          svgEl("path", { class: "cv-msdcap", d: `M${x(hi)} ${yy - 8} v16` }, layer);
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
