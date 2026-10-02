/* ---------- story: a scene beside one figure that builds a beat per tap ----------
   The story itself is told in the video; the slide shows only the figure. Each kind draws its own
   beats from the slide's numbers, and works every sum out itself:
   mean    readings drop onto a line, greyer the further from the mean; their sum is written and the mean lands on the star
   median  the same readings in a row over a number line, in the order they were taken, each value under its dot;
           the mean lands on the line, one reading grows bold and runs to the far end past a break, then bolder
           still, and the mean follows it; only then do they line up in order and fall onto their values, and
           pairs drop out to leave the median on the star, the mean far off
   iqr     the ward's stays in a row line up in order; the middle one is the median, with a half boxed on each
           side; the middle of each half is a quartile; a box between the quartiles holds the middle half; then
           the same people stack on their days under their curve, with a chip per spread
   sampling a population (a crowd under its curve, its SD marked) and an empty axis below; a few of the crowd
           light up as a sample and its mean drops to the axis, then another, then many; the means pile up and
           the curve they make is drawn, with its half-width, the SEM, worked out (SD ÷ √n)
   mode    shoe sizes stack up, the mean is a size nobody wears, the mode is the tallest stack;
           then the same question for blood groups, where only the mode makes sense
   coin    H₀ (the coin is fair); then the coins land one by one, all heads, each with the chance of heads every
           time so far (1/2, 1/4 … 1/1024); then all heads or all tails, 2 in 1,024; then p = 2 ÷ 1,024 ≈ 0.002
   gap     the placebo group's mean blood pressure as a bell (its mean dashed and written, SEM marked), then the drug
           group's, the gap lower; the two join on one axis with the gap bracketed; three trials, one per tap, each its own pair of
           bells with its gap dropped onto an axis below; many more gaps pile into a wider bell (the SE of the difference);
           then the drug bell slides back onto the placebo's (no effect), three trials, one per tap, still give gaps either way, many pile
           round 0, and the pile becomes the bell of chance (both axes, its SE marked); the 2 SE lines with 2.5% beyond each; the
           trial's gap lands (4 ÷ 1.5 = 2.7 SEs); last, the tails at least that far out fill in: p = 0.4% + 0.4%
   line    a ruler of p-values (1 at the top, 0.001 at the foot, a log scale); with an origin, first a small bell on the
           left: 2.5% beyond 2 SE each side, 5% = 1 in 20, and who chose the line (Fisher, 1925); the dashed line at
           0.05 = 1 in 20 with the significant side below it shaded; then each trial lands on the ruler at its p
   grid    the trial run 1,000 times with placebo in both groups, one square per run, lined up by its gap (the biggest
           fall first, the biggest rise last); the runs with a gap at least ours light up at both ends, then how many in
           1,000 and p; with two trials side by side, both lit, then the cut's share at each end (50 in 1,000 = 1 in 20,
           Fisher, 1925), then each trial's verdict
   ncompare the same gap in two trials of different sizes side by side: each one's SE (SD × √(2 ÷ n)), its chance bell
           round 0 true to scale (the smaller trial's wider and lower), how many SEs out the gap is, then p with the tails filled
   ci      our trial's bell of gaps (SE of the difference wide) round what we found; the 2 SE lines and its middle 95%;
           the CI drops out beneath with its sum (4 ± 2 × 1.5 = 1 to 7); then chance's bell round 0 beside it, with
           its own 95% (−3 to +3) beneath: 0 lies outside our CI just as our gap lies outside chance's
   slide   one or two panels, a difference (no effect = 0) and a ratio (no effect = 1, on a log axis with `factor`); in each, one CI slides towards
           no effect, one place per tap, its p read out beneath: clear of it, touching it (p = 0.05), across it
   samples one sample's people as a bell (± SD shaded, its mean written), then a second beside it: the mean moves, the SD stays
   means   the two samples' means as dots on an axis of means, then many more samples piling up; their bell, SEM wide (SD ÷ √n)
   gaps    trials on placebo, one per tap: two groups' mean bells overlapping, their gap bracketed and dropped onto an axis
           of gaps round 0; many more trials pile up; their bell, SE wide
   twose   chance's bell in SEs: the 2 SE lines, 95% of trials between them, the cut's half beyond each, 1 in 20 (who chose it)
   far     the trial's gap on chance's bell with the 1, 2 and 3 SE lines; how many SEs out it lands; the tails beyond it: p
   nrows   the same gap in two trials, one row each on one axis, true to scale; 2 SE lines on the bigger, 1 SE on the smaller;
           the gap drops through both rows, then the tails and each p
   runs    the same trial repeated, each run's CI as a bar round a true effect we pretend to know, ours first; the rest drop in,
           each ticked or crossed; the one that misses is named; how many in 20 catch it, then the share (95%)
   mirror  our trial's bell round its gap and chance's round 0, the same width, each with its middle 95%: the gap lies outside
           chance's 95% exactly when 0 lies outside ours
   cibars  trials as CI bars on one axis with the no-effect line, one row per tap, with their sums and half-widths, or with a
           line at the smallest effect worth having; each row's p, or its verdict and a note, on the right
   art     a drawing from content/figures whose parts join beat by beat (data-beat="1", "2" …); its words come
           from the slide's slots, with {key} standing for a concept's label (so H₀ is never retyped) */
const ST = { W: 760, H: 350, AX: 270, TOP: 34 };

// a number line with one slot per whole number from lo to hi, and one far slot past a break
function storyAxis(svg, lo, hi, far) {
  const L = 60, R = 60, BR = 64, n = hi - lo + 1 + (far != null ? 1 : 0);
  const sw = (ST.W - L - R - (far != null ? BR : 0)) / n, xHi = L + (hi - lo + .5) * sw, xFar = ST.W - R - sw / 2;
  const A = { far, sw };
  A.x = v => v <= hi + .5 || A.far == null ? L + (v - lo + .5) * sw : xHi + (v - hi) / (A.far - hi) * (xFar - xHi);
  const endMain = L + (hi - lo + 1) * sw;
  svgEl("path", { class: "dp-axis", d: `M${L - 8} ${ST.AX} H${far != null ? endMain + 6 : ST.W - R + 8}` }, svg);
  if (far != null) {
    svgEl("path", { class: "dp-axis st-farseg", d: `M${endMain + BR - 6} ${ST.AX} H${ST.W - R + 8}` }, svg);
    svgEl("path", { class: "dp-break st-farseg", d: `M${endMain + 18} ${ST.AX + 10} l9 -20 M${endMain + 32} ${ST.AX + 10} l9 -20` }, svg);
  }
  for (let v = lo; v <= hi; v++) svgEl("text", { class: "dp-tlab", x: A.x(v), y: ST.AX + 46 }, svg).textContent = v;
  if (far != null) { A.farLab = svgEl("text", { class: "dp-tlab st-far", x: xFar, y: ST.AX + 46 }, svg); A.farLab.textContent = ""; }
  return A;
}

// one reading: a dot that can move along the line
function storyDot(parent, x, drop, delay) {
  const g = svgEl("g", { class: "st-pt", style: `transform:translate(${x}px, ${ST.AX - 18}px)` }, parent);
  svgEl("circle", { r: 14, class: drop ? "drop" : "", style: `animation-delay:${REDUCED_MOTION ? 0 : delay}ms` }, g);
  return g;
}

// a measure's marker: a dashed line up from the axis, its working written at the top;
// a result, if given, sits on a gold pill after the working, the whole label kept inside the figure
function storyMark(parent, key, x, text, top = ST.TOP, foot = ST.AX, result) {
  const g = svgEl("g", { class: `dp-mk st-mk f-${concept(key).family}`, style: `transform:translateX(${x}px)` }, parent);
  svgEl("path", { d: `M0 ${foot} V${top + 12}` }, g);
  const t = svgEl("text", { y: top }, g);
  let pill;
  const lay = (at, res) => {
    if (pill) pill.remove();
    if (res == null) { t.setAttribute("x", 0); return; }
    const w = t.getComputedTextLength() || t.textContent.length * 15.5, pw = 30 + 16 * res.length, gap = 12, all = w + gap + pw;
    const left = Math.min(Math.max(-all / 2, 4 - at), ST.W - 4 - all - at);
    t.setAttribute("x", left + w / 2);
    pill = svgEl("g", { class: "st-res" }, g);
    svgEl("rect", { x: left + w + gap, y: top - 33, width: pw, height: 44, rx: 22 }, pill);
    svgEl("text", { x: left + w + gap + pw / 2, y: top }, pill).textContent = res;
  };
  t.textContent = text; lay(x, result);
  return { g, set(x2, text2, res2) { g.style.transform = `translateX(${x2}px)`; if (text2) t.textContent = text2; lay(x2, res2); } };
}

// the mean's marker: its working, and its answer on the pill
const meanWork = v => [`${concept("mean").label} = ${Stats.sum(v)} ÷ ${v.length} =`, num(Stats.mean(v))];
const meanMark = (parent, x, v, top) => { const [work, res] = meanWork(v); return storyMark(parent, "mean", x, work, top, ST.AX, res); };

function storyStar(parent, x, y) {
  const p = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 8 : 18; p.push(`${(x + r * Math.cos(a)).toFixed(1)} ${(y + r * Math.sin(a)).toFixed(1)}`); }
  return svgEl("path", { class: "st-star", d: `M${p.join(" L")} Z` }, parent);
}

const sumText = v => `${v.join(" + ")} = ${Stats.sum(v)}`;

// helpers for the testing kinds (samples, means, gaps, twose, far, nrows)
const r1 = v => (Math.round(v * 10) / 10).toFixed(1);
const r1n = v => String(+r1(v));
const minus = v => String(v).replace("-", "−");
// a bell as % per `per` units of the axis, so it sits on a pile of dots in bins `per` wide
const normPct = (m, s, per) => v => 100 * per * Math.exp(-(((v - m) / s) ** 2) / 2) / (s * Math.sqrt(2 * Math.PI));
// n normal quantiles, in a scattered order so a pile builds up evenly
const quantiles = n => Array.from({ length: n }, (_, j) => Sampling.inv(((j * 37) % n + .5) / n));
// a plot: the value axis lo to hi (minus signs kept) and a y axis of %, with their titles
function storyPlot(parent, o) {
  const { L, R, AX, H, lo, hi, ymax } = o, PY = H / ymax;
  const x = v => L + (v - lo) / (hi - lo) * (R - L), y = p => AX - p * PY;
  const g = svgEl("g", { class: "st-plot" }, parent);
  svgEl("path", { class: "dp-axis", d: `M${L - 6} ${AX} H${R + 6}` }, g);
  svgEl("path", { class: "dp-axis", d: `M${L - 6} ${AX} V${AX - H}` }, g);
  o.ticks.forEach(t => { svgEl("text", { class: `dp-tlab${o.sm ? " st-smt" : ""}`, x: x(t), y: AX + 26 }, g).textContent = minus(t); });
  o.yticks.forEach(t => { svgEl("text", { class: `cv-ylab${o.sm ? " sm" : ""}`, x: L - 16, y: y(t) + 6 }, g).textContent = `${t}%`; });
  if (o.ytitle) svgEl("text", { class: `cv-ytitle${o.sm ? " sm" : ""}`, transform: `translate(${L - 58} ${AX - H / 2}) rotate(-90)` }, g).textContent = o.ytitle;
  if (o.xtitle) svgEl("text", { class: `cv-alab${o.sm ? " st-sma" : ""}`, x: (L + R) / 2, y: AX + 58 }, g).textContent = o.xtitle;
  const pts = (f, a, b) => { const q = [], n = 240; for (let i = 0; i <= n; i++) { const v = a + (b - a) * i / n; q.push(`${x(v).toFixed(1)} ${y(f(v)).toFixed(1)}`); } return q; };
  return { g, x, y, PY, AX,
    curve: (f, a = lo, b = hi) => `M${pts(f, a, b).join(" L")}`,
    area: (f, a = lo, b = hi) => `M${x(a)} ${AX} L${pts(f, a, b).join(" L")} L${x(b)} ${AX} Z` };
}
// a pile of N dots on a plot, in bins `bin` wide: each dot stands for 1 in N, so the pile fits the bell drawn with normPct
function dotPile(parent, P, bin, N) {
  const counts = {}, step = 100 / N * P.PY, r = Math.min(step, P.x(bin) - P.x(0)) / 2 - 1.5, g = svgEl("g", {}, parent);
  return {
    add(v, delay, ring) {
      const b = Math.round(v / bin) * bin, k = counts[b] || 0, cy = P.AX - step / 2 - k * step;
      counts[b] = k + 1;
      const style = `animation-delay:${REDUCED_MOTION ? 0 : delay}ms`;
      svgEl("circle", { class: "st-mdot", cx: P.x(b), cy, r, style }, g);
      if (ring) svgEl("circle", { class: "st-mring", cx: P.x(b), cy, r: r + 2.5, style }, g);
    }
  };
}
// a width marked from a to b at height y: a line with an arrowhead and its label
function stArrow(parent, P, a, b, y, label) {
  const g = svgEl("g", { class: "st-arrow" }, parent), xb = P.x(b);
  svgEl("path", { d: `M${P.x(a)} ${y} H${xb - 10}` }, g);
  svgEl("path", { class: "st-head", d: `M${xb} ${y} l-13 -8 v16 z` }, g);
  svgEl("text", { x: xb + 10, y: y + 7 }, g).textContent = label;
}
function stPill(parent, cx, cy, text, f) {
  const g = svgEl("g", { class: `st-cpill ${f}` }, parent), w = 34 + text.length * 11.5;
  svgEl("rect", { x: cx - w / 2, y: cy - 22, width: w, height: 40, rx: 20 }, g);
  svgEl("text", { x: cx, y: cy + 5 }, g).textContent = text;
  return g;
}

const STORIES = {
  samples(svg, S) {
    // people's values in one sample, then a second: the same SD, the mean a little moved; the first bell stays dashed behind
    const AX = 260, H = 200, [m1, m2] = S.means, sd = S.sd, f = m => normPct(m, sd, 1);
    const lo = Math.floor((m1 - 3.3 * sd) / 10) * 10, hi = lo + Math.ceil(6.6 * sd / 10) * 10, ticks = [];
    for (let t = Math.ceil(lo / 20) * 20; t <= hi; t += 20) ticks.push(t);
    svg.setAttribute("viewBox", `0 0 ${ST.W} 380`);
    const ymax = Math.ceil(f(m1)(m1)), yticks = [...Array(ymax + 1).keys()];
    const panel = (L, m, cls, ghost) => {
      const P = storyPlot(svg, { L, R: L + 262, AX, H, lo, hi, ymax, ticks, yticks, ytitle: S.y_axis, xtitle: S.axis, sm: true });
      P.g.classList.add("st-pb", cls);
      svgEl("path", { class: "st-pb-a", d: P.area(f(m)) }, P.g);
      svgEl("path", { class: "st-pb-band", d: P.area(f(m), m - sd, m + sd) }, P.g);
      if (ghost != null) svgEl("path", { class: "st-pb-ghost", d: P.curve(f(ghost)) }, P.g);
      svgEl("path", { class: "st-pb-l", d: P.curve(f(m)) }, P.g);
      svgEl("path", { class: "st-pb-mean", d: `M${P.x(m)} ${AX} V${P.y(f(m)(m)) - 4}` }, P.g);
      svgEl("text", { class: "st-pb-mt", x: P.x(m), y: P.y(f(m)(m)) - 16 }, P.g).textContent = `Mean ${m}`;
      svgEl("text", { class: "st-pb-sd", x: P.x(m), y: P.y(.5) }, P.g).textContent = `± ${concept("sd").label} ${sd}`;
    };
    return [
      () => panel(92, m1, "st-pb-old"),
      () => panel(468, m2, "st-pb-new", m1),
      () => stPill(svg, ST.W / 2, 352, `Means differ · ${concept("sd").label} stays ${sd}`, "f-par")
    ];
  },
  means(svg, S) {
    // the two samples' means as dots on an axis of means, then many more samples of n piling up; the bell they make is SEM wide
    const sem = S.sd / Math.sqrt(S.n), c = S.means[0], span = Math.max(5, Math.ceil(4 * sem)), BIN = .5, N = 60;
    const lo = c - span, hi = c + span, f = normPct(c, sem, BIN), ymax = Math.ceil(f(c) / 5) * 5;
    svg.setAttribute("viewBox", `0 0 ${ST.W} 390`);
    svg.classList.add("f-se");
    const ticks = []; for (let t = lo; t <= hi; t++) ticks.push(t);
    const P = storyPlot(svg, { L: 110, R: 720, AX: 320, H: 250, lo, hi, ymax, ticks, yticks: [...Array(ymax / 5 + 1).keys()].map(k => k * 5), ytitle: S.y_axis, xtitle: S.axis });
    const pile = dotPile(svg, P, BIN, N);
    return [
      () => S.means.forEach(m => pile.add(m, 0, true)),
      () => quantiles(N - 2).forEach((q, j) => pile.add(c + sem * q, j * 28)),
      () => {
        const g = svgEl("g", { class: "st-in" }, svg);
        svgEl("path", { class: "cv-line", pathLength: 1, d: P.curve(f) }, g);
        stArrow(g, P, c, c + sem, P.y(f(c + sem)) - 4, `${concept("sem").label} ${r1(sem)}`);
        svgEl("text", { class: "st-formula", x: 720, y: 130 }, g).textContent = `${S.sd} ÷ √${S.n} ≈ ${r1(sem)}`;
      }
    ];
  },
  gaps(svg, S, later) {
    // trials with both groups on placebo, one per tap: each group's mean as a bell (SEM wide), the two overlapping on one axis,
    // the gap between them bracketed; each gap drops as a dot onto an axis of gaps round 0. Then many more trials pile up
    // there, and the bell they make is the SE of the difference wide
    const sem = S.sd / Math.sqrt(S.n), se = S.sd * Math.sqrt(2 / S.n), BIN = .5, N = 60, f = normPct(0, se, BIN);
    const ymax = Math.ceil(f(0) / 5) * 5;
    svg.setAttribute("viewBox", `0 0 ${ST.W} 390`);
    svg.classList.add("f-se");
    // the pair of bells, on the left
    const all = S.pairs.flat(), ML = 14, MR = 300, MA = 300, BH = 130;
    const mlo = Math.min(...all) - 3.6 * sem, mhi = Math.max(...all) + 3.6 * sem, mx = v => ML + (v - mlo) / (mhi - mlo) * (MR - ML);
    const left = svgEl("g", { class: "st-in" }, svg);
    svgEl("path", { class: "dp-axis", d: `M${ML} ${MA} H${MR}` }, left);
    for (let t = Math.ceil(mlo / 2) * 2; t <= mhi; t += 2) svgEl("text", { class: "dp-tlab st-smt", x: mx(t), y: MA + 26 }, left).textContent = t;
    svgEl("text", { class: "cv-alab st-sma", x: (ML + MR) / 2, y: MA + 56 }, left).textContent = S.means_axis;
    const lump = m => { const q = []; for (let i = 0; i <= 120; i++) { const v = m - 3.4 * sem + 6.8 * sem * i / 120; q.push([mx(v), MA - BH * Math.exp(-(((v - m) / sem) ** 2) / 2)]); } return q; };
    const ticks = []; for (let t = -6; t <= 6; t += 2) ticks.push(t);
    const P = storyPlot(svg, { L: 400, R: 740, AX: 320, H: 250, lo: -6, hi: 6, ymax, ticks, yticks: [...Array(ymax / 5 + 1).keys()].map(k => k * 5), ytitle: S.y_axis, xtitle: S.axis });
    svgEl("path", { class: "st-zero", d: `M${P.x(0)} ${320} V${70}` }, P.g);
    const arrow = svgEl("g", { class: "st-in" }, svg);
    svgEl("path", { class: "st-garrow", d: `M${MR + 6} ${MA - 18} H${MR + 34}` }, arrow);
    svgEl("path", { class: "st-garrow-h", d: `M${MR + 46} ${MA - 18} l-13 -8 v16 z` }, arrow);
    const pile = dotPile(svg, P, BIN, N);
    let shown;
    const trial = ([a, b]) => {
      if (shown) { const old = shown; old.classList.add("st-gone"); later(450, () => old.remove()); }
      const g = shown = svgEl("g", { class: "st-trial" }, svg), gap = b - a;
      [[a, "st-pair-a"], [b, "st-pair-b"]].forEach(([m, cls]) => {
        const q = lump(m), line = q.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L"), bg = svgEl("g", { class: `st-pair ${cls}` }, g);
        svgEl("path", { class: "st-pair-f", d: `M${q[0][0].toFixed(1)} ${MA} L${line} L${q[q.length - 1][0].toFixed(1)} ${MA} Z` }, bg);
        svgEl("path", { class: "st-pair-l", d: `M${line}` }, bg);
        svgEl("path", { class: "st-pair-m", d: `M${mx(m)} ${MA} V${MA - BH}` }, bg);
      });
      const yb = MA - BH - 22, br = svgEl("g", { class: "st-gbr" }, g);
      svgEl("path", { d: `M${mx(a)} ${yb + 8} V${yb} H${mx(b)} V${yb + 8}` }, br);
      svgEl("text", { x: (mx(a) + mx(b)) / 2, y: yb - 12 }, br).textContent = `Gap ${minus(r1n(gap))}`;
      later(700, () => pile.add(gap, 0, true));
    };
    return [
      ...S.pairs.map(pr => () => trial(pr)),
      () => {
        // the last trial stays on the left beside the pile
        quantiles(N - S.pairs.length).forEach((q, j) => pile.add(se * q, j * 28));
      },
      () => {
        const g = svgEl("g", { class: "st-in" }, svg), exact = Math.abs(se - +r1(se)) < 1e-9;
        svgEl("path", { class: "cv-line", pathLength: 1, d: P.curve(f) }, g);
        stArrow(g, P, 0, se, P.y(f(se)) - 4, `${concept("se").label} ${r1(se)}`);
        svgEl("text", { class: "st-formula st-fmid", x: (ML + MR) / 2, y: 80 }, g).textContent = `${S.sd} × √(2 ÷ ${S.n}) ${exact ? "=" : "≈"} ${r1(se)}`;
      }
    ];
  },
  twose(svg, S) {
    // chance's bell in SEs from 0: 95% of trials within 2 SE either side, the cut's half beyond each, 1 in 20 in all
    const AX = 262, f = normPct(0, 1, .5), ymax = 20, SE = concept("se").label, pc = v => `${+(v * 100).toFixed(1)}%`;
    svg.setAttribute("viewBox", `0 0 ${ST.W} 380`);
    svg.classList.add("f-se");
    const ticks = []; for (let t = -4; t <= 4; t++) ticks.push(t);
    const P = storyPlot(svg, { L: 110, R: 720, AX, H: 210, lo: -4, hi: 4, ymax, ticks, yticks: [0, 10, 20], ytitle: S.y_axis, xtitle: S.axis });
    return [
      () => {
        svgEl("path", { class: "st-bell-a", d: P.area(f) }, P.g);
        svgEl("path", { class: "cv-line", pathLength: 1, d: P.curve(f) }, P.g);
        svgEl("path", { class: "st-zero", d: `M${P.x(0)} ${AX} V${AX - 216}` }, P.g);
      },
      () => {
        const g = svgEl("g", { class: "st-in" }, svg);
        [-2, 2].forEach(k => {
          svgEl("path", { class: "st-sel", d: `M${P.x(k)} ${AX} V${AX - 120}` }, g);
          svgEl("text", { class: "st-sel-t", x: P.x(k), y: AX - 130 }, g).textContent = `2 ${SE}`;
        });
      },
      () => {
        // under the axis, a double-headed arrow from −2 to +2 SE, its share written in a gap at its middle
        const g = svgEl("g", { class: "st-in st-95" }, svg), y = AX + 92, a = P.x(-2), b = P.x(2), m = P.x(0), w = 96;
        [a, b].forEach(v => svgEl("path", { class: "st-95-up", d: `M${v} ${AX + 66} V${y + 12}` }, g));
        svgEl("path", { d: `M${a + 12} ${y} H${m - w} M${m + w} ${y} H${b - 12}` }, g);
        svgEl("path", { class: "st-head", d: `M${a} ${y} l13 -8 v16 z M${b} ${y} l-13 -8 v16 z` }, g);
        svgEl("text", { x: m, y: y + 8 }, g).textContent = `${pc(1 - S.cut)} of trials`;
      },
      () => {
        const g = svgEl("g", { class: "st-ptail f-test" }, P.g);
        [[2, 4], [-4, -2]].forEach(([a, b]) => {
          svgEl("path", { class: "st-pfill", d: P.area(f, a, b) }, g);
          svgEl("path", { class: "st-pedge st-thin", d: P.curve(f, a, b) }, g);
          svgEl("text", { class: "st-ppct", x: P.x((a + b) / 2 + Math.sign(a) * .1), y: AX - 60 }, g).textContent = pc(S.cut / 2);
        });
      },
      () => {
        stPill(svg, 600, 42, `${pc(S.cut)} = 1 in ${Math.round(1 / S.cut)}`, "f-test");
        if (S.origin) svgEl("text", { class: "st-orwho st-in", x: 600, y: 90 }, svg).textContent = S.origin;
      },
      () => stPill(svg, 236, 42, `Past 2 ${SE} → p < ${S.cut}`, "f-test")
    ];
  },
  far(svg, S) {
    // the trial's gap on chance's bell (SE of the difference wide): the 1, 2 and 3 SE lines either side,
    // the gap landing between them, then the tails at least that far out, either way: p
    const se = S.sd * Math.sqrt(2 / S.n), z = S.gap / +r1(se), tail = 1 - Sampling.cdf(S.gap / se), AX = 300;
    const f = normPct(0, se, .5), ymax = Math.ceil(f(0) / 5) * 5, SE = concept("se").label, pc = v => `${r1(v * 100)}%`;
    svg.setAttribute("viewBox", `0 0 ${ST.W} 390`);
    svg.classList.add("f-se");
    const ticks = []; for (let t = -6; t <= 6; t += 2) ticks.push(t);
    const P = storyPlot(svg, { L: 110, R: 720, AX, H: 230, lo: -6, hi: 6, ymax, ticks, yticks: [...Array(ymax / 5 + 1).keys()].map(k => k * 5), ytitle: S.y_axis, xtitle: S.axis });
    let tails;
    return [
      () => {
        svgEl("path", { class: "st-bell-a", d: P.area(f) }, P.g);
        tails = svgEl("g", {}, P.g);
        svgEl("path", { class: "cv-line", pathLength: 1, d: P.curve(f) }, P.g);
        svgEl("path", { class: "st-zero", d: `M${P.x(0)} ${AX} V${AX - 236}` }, P.g);
      },
      () => {
        const g = svgEl("g", { class: "st-in" }, svg);
        [1, 2, 3].forEach(k => [-1, 1].forEach(s => {
          svgEl("path", { class: "st-sel", d: `M${P.x(s * k * se)} ${AX} V${AX - 214}` }, g);
          svgEl("text", { class: "st-sel-t", x: P.x(s * k * se), y: AX - 222 }, g).textContent = `${k} ${SE}`;
        }));
      },
      () => {
        const g = svgEl("g", {}, svg), x = P.x(S.gap), top = AX - 128;
        svgEl("path", { class: "st-lead st-in", d: `M${x} ${AX - 9} V${top + 6}` }, g);
        svgEl("text", { class: "st-zt st-in", x, y: top }, g).textContent = `${r1(z)} ${SE}s`;
        svgEl("circle", { class: "st-real", cx: x, cy: AX, r: 8 }, g);
      },
      () => {
        const g = svgEl("g", { class: "st-ptail f-test" }, tails);
        [[S.gap, 6], [-6, -S.gap]].forEach(([a, b]) => {
          svgEl("path", { class: "st-pfill", d: P.area(f, a, b) }, g);
          svgEl("path", { class: "st-pedge", d: `${P.curve(f, a, b)} M${P.x(a)} ${AX} H${P.x(b)}` }, g);
          svgEl("text", { class: "st-ppct", x: P.x(Math.sign(a + b) * 5.4), y: AX - 34 }, g).textContent = pc(tail);
        });
        const p = 2 * tail;
        stPill(svg, 236, 34, `p ≈ ${p < .01 ? p.toFixed(3) : p.toPrecision(1)}`, "f-test");
      }
    ];
  },
  nrows(svg, S) {
    // the same gap in two trials, one row each on the same axis, true to scale: the bigger trial's bell narrow with its
    // 2 SE lines, the smaller one's wide with its 1 SE lines; one dotted line drops from the gap through both, then the tails: p
    const SE = concept("se").label, L = 170, R = 600, H = 112, lo = -15, hi = 15, rowsAX = [150, 318];
    const rows = S.ns.map((n, i) => {
      const se = S.sd * Math.sqrt(2 / n), shown = +r1(se), z = S.gap / shown, p = 2 * (1 - Sampling.cdf(S.gap / se));
      return { n, se, z, p, f: normPct(0, se, .5), AX: rowsAX[i], k: i ? 1 : 2, label: S.labels[i] };
    });
    const ymax = Math.ceil(rows[0].f(0) / 5) * 5, ticks = []; for (let t = lo; t <= hi; t += 5) ticks.push(t);
    svg.setAttribute("viewBox", `0 0 ${ST.W} 386`);
    svg.classList.add("f-se");
    rows.forEach((r, i) => { r.P = storyPlot(svg, { L, R, AX: r.AX, H, lo, hi, ymax, ticks, yticks: [0, ymax], xtitle: i ? S.axis : "", sm: true }); });
    const yt = svgEl("text", { class: "cv-ytitle sm", transform: `translate(${L - 58} ${(rowsAX[0] + rowsAX[1] - H) / 2}) rotate(-90)` }, svg);
    yt.textContent = S.y_axis;
    const zt = z => (z < 1 ? z.toFixed(2) : r1(z));
    return [
      () => rows.forEach(r => {
        svgEl("path", { class: "st-bell-a", d: r.P.area(r.f) }, r.P.g);
        r.tails = svgEl("g", {}, r.P.g);
        svgEl("path", { class: "cv-line", pathLength: 1, d: r.P.curve(r.f) }, r.P.g);
        svgEl("path", { class: "st-zero", d: `M${r.P.x(0)} ${r.AX} V${r.AX - H - 8}` }, r.P.g);
        svgEl("text", { class: "st-rowh", x: 690, y: r.AX - 100 }, r.P.g).textContent = r.label;
        svgEl("text", { class: "st-rowse", x: 690, y: r.AX - 72 }, r.P.g).textContent = `${SE} ${r1(r.se)}`;
        // its sum beneath: the trial's own n in each group
        svgEl("text", { class: "st-rowsum", x: 690, y: r.AX - 48 }, r.P.g).textContent = `${S.sd} × √(2 ÷ ${r.n})`;
      }),
      () => rows.forEach(r => {
        const g = svgEl("g", { class: "st-in" }, svg);
        [-1, 1].forEach(s => {
          svgEl("path", { class: "st-sel", d: `M${r.P.x(s * r.k * r.se)} ${r.AX} V${r.AX - H + 14}` }, g);
          svgEl("text", { class: "st-sel-t", x: r.P.x(s * r.k * r.se), y: r.AX - H + 4 }, g).textContent = `${r.k} ${SE}`;
        });
      }),
      () => {
        const x = rows[0].P.x(S.gap);
        svgEl("path", { class: "st-dotline st-in", d: `M${x} ${rows[0].AX - H} V${rows[1].AX}` }, svg);
        rows.forEach(r => {
          svgEl("text", { class: "st-zt st-zl st-in", x: x + 12, y: r.P.y(r.f(S.gap)) - 12 }, svg).textContent = `${zt(r.z)} ${SE}s`;
          svgEl("circle", { class: "st-real", cx: x, cy: r.AX, r: 7 }, svg);
        });
      },
      () => rows.forEach(r => {
        const g = svgEl("g", { class: "st-ptail f-test" }, r.tails);
        [[S.gap, hi], [lo, -S.gap]].forEach(([a, b]) => {
          svgEl("path", { class: "st-pfill", d: r.P.area(r.f, a, b) }, g);
          svgEl("path", { class: "st-pedge st-thin", d: `${r.P.curve(r.f, a, b)} M${r.P.x(a)} ${r.AX} H${r.P.x(b)}` }, g);
        });
        stPill(svg, 690, r.AX - 6, `p ≈ ${r.p < .01 ? r.p.toFixed(3) : r.p.toPrecision(1)}`, "f-test");
      })
    ];
  },
  runs(svg, S) {
    // the same trial repeated, each run's CI (its gap ± 2 SE) as a bar round a true effect we pretend to know: ours first,
    // then the rest drop in one after another, each ticked if it catches the truth or crossed if not; then the one that
    // misses is named, then how many catch it, and the share
    const half = 2 * S.se, n = S.centres.length, [lo, hi] = S.range, L = 60, R = 500, TOP = 56, STEP = 12.5, AX = TOP + n * STEP + 8;
    const x = v => L + (v - lo) / (hi - lo) * (R - L), yr = i => TOP + (i + .5) * STEP, num = v => minus(+v.toFixed(1));
    const caught = c => Math.abs(c - S.truth) <= half + 1e-9, hits = S.centres.filter(caught).length;
    svg.setAttribute("viewBox", `0 0 ${ST.W} ${AX + 64}`);
    svg.classList.add("f-se");
    svgEl("path", { class: "dp-axis", d: `M${L - 6} ${AX} H${R + 6}` }, svg);
    for (let t = lo; t <= hi; t += 2) svgEl("text", { class: "dp-tlab st-smt", x: x(t), y: AX + 26 }, svg).textContent = minus(t);
    svgEl("text", { class: "cv-alab st-sma", x: (L + R) / 2, y: AX + 56 }, svg).textContent = S.axis;
    svgEl("path", { class: "st-truth", d: `M${x(S.truth)} ${TOP - 10} V${AX}` }, svg);
    svgEl("text", { class: "st-truth-t", x: x(S.truth), y: TOP - 22 }, svg).textContent = S.truth_label;
    const row = (c, i, delay) => {
      const g = svgEl("g", { class: `st-run${caught(c) ? "" : " f-test"}`, style: `animation-delay:${REDUCED_MOTION ? 0 : delay}ms` }, svg), y = yr(i);
      svgEl("path", { d: `M${x(c - half)} ${y} H${x(c + half)}` }, g);
      svgEl("circle", { cx: x(c), cy: y, r: 5 }, g);
      svgEl("text", { class: "st-run-k", x: R + 34, y: y + 6 }, g).textContent = caught(c) ? "✓" : "✕";
      return g;
    };
    return [
      () => {
        const g = row(S.centres[0], 0, 0), c = S.centres[0];
        svgEl("text", { class: "st-run-t", x: x(c - half) - 12, y: yr(0) + 5 }, g).textContent = `${S.label} · ${num(c - half)} to ${num(c + half)}`;
      },
      () => S.centres.slice(1).forEach((c, j) => row(c, j + 1, j * 160)),
      () => S.centres.forEach((c, i) => {
        if (caught(c)) return;
        const g = svgEl("g", { class: "st-in f-test" }, svg), y = yr(i), edge = c > S.truth ? c - half : c + half;
        svgEl("path", { class: "st-run-gap", d: `M${x(S.truth)} ${y} H${x(edge)}` }, g);
        svgEl("text", { class: `st-run-t${c > S.truth ? "" : " st-run-r"}`, x: x(S.truth) + (c > S.truth ? -12 : 12), y: y + 5 }, g).textContent = `Misses ${S.truth}`;
      }),
      () => stPill(svg, 650, AX / 2 - 10, `${hits} in ${n} catch ${S.truth}`, "f-se"),
      () => stPill(svg, 650, AX / 2 + 50, `${Math.round(100 * hits / n)}%`, "f-se")
    ];
  },
  mirror(svg, S) {
    // our trial's bell round its gap and chance's bell round 0, the same width (the SE of the difference), each with its
    // middle 95% shaded: the gap lies outside chance's 95% exactly when 0 lies outside ours
    const se = S.sd * Math.sqrt(2 / S.n), f = c => normPct(c, se, .5), ymax = Math.ceil(f(0)(0) / 5) * 5, AX = 300, [lo, hi] = S.range;
    svg.setAttribute("viewBox", `0 0 ${ST.W} 390`);
    const ticks = []; for (let t = lo; t <= hi; t += 2) ticks.push(t);
    const P = storyPlot(svg, { L: 110, R: 720, AX, H: 220, lo, hi, ymax, ticks, yticks: [...Array(ymax / 5 + 1).keys()].map(k => k * 5), ytitle: S.y_axis, xtitle: S.axis });
    const bell = (c, fam, label) => {
      const g = svgEl("g", { class: `st-mir ${fam}` }, P.g), a = Math.max(lo, c - 3.6 * se), b = Math.min(hi, c + 3.6 * se);
      svgEl("path", { class: "st-mir-95", d: P.area(f(c), c - 2 * se, c + 2 * se) }, g);
      svgEl("path", { class: "st-mir-l", d: P.curve(f(c), a, b) }, g);
      svgEl("text", { class: "st-mir-t", x: P.x(c), y: P.y(f(c)(c)) - 14 }, g).textContent = label;
      return g;
    };
    let ours;
    return [
      () => {
        ours = bell(S.gap, "f-se", S.labels[0]);
        svgEl("circle", { class: "st-real", cx: P.x(S.gap), cy: AX, r: 8 }, svg);
      },
      () => {
        P.g.insertBefore(bell(0, "f-test", S.labels[1]), ours);
        svgEl("circle", { class: "st-zdot", cx: P.x(0), cy: AX, r: 8 }, svg);
      },
      () => stPill(svg, 210, 34, S.chips[0], "f-test"),
      () => stPill(svg, 530, 34, S.chips[1], "f-se")
    ];
  },
  cibars(svg, S) {
    // trials as CI bars (gap ± 2 SE, SE = SD × √(2 ÷ n) in whole tenths) on one axis with the dashed no-effect line, one row per
    // tap; a bar that crosses no effect is grey. With `sums`, each bar's sum above it and its half-width bracketed below.
    // Each row's p on a pill on the right, or its verdict (a concept) and a note. With `worth`, a solid line at the smallest
    // effect worth having, the ground either side shaded and named
    const [lo, hi] = S.range, L = 170, R = 540, TOP = 70, AX = 320, n = S.rows.length, step = (AX - 20 - TOP) / n;
    const x = v => L + (v - lo) / (hi - lo) * (R - L), num = v => minus(+v.toFixed(1));
    svg.setAttribute("viewBox", `0 0 ${ST.W} ${AX + 66}`);
    svg.classList.add("f-se");
    if (S.worth) {
      const w = S.worth;
      svgEl("rect", { class: "st-zone-lo", x: x(0), y: TOP - 30, width: x(w.at) - x(0), height: AX - TOP + 30 }, svg);
      svgEl("rect", { class: "st-zone-hi", x: x(w.at), y: TOP - 30, width: R - x(w.at), height: AX - TOP + 30 }, svg);
      svgEl("text", { class: "st-zone-t", x: (x(0) + x(w.at)) / 2, y: AX - 12 }, svg).textContent = w.below;
      svgEl("text", { class: "st-zone-t st-zone-th", x: (x(w.at) + R) / 2, y: AX - 12 }, svg).textContent = w.above;
    }
    svgEl("path", { class: "dp-axis", d: `M${L - 6} ${AX} H${R + 6}` }, svg);
    for (let t = lo; t <= hi; t += S.step || 2) svgEl("text", { class: "dp-tlab st-smt", x: x(t), y: AX + 26 }, svg).textContent = minus(t);
    svgEl("text", { class: "cv-alab st-sma", x: (L + R) / 2, y: AX + 56 }, svg).textContent = S.axis;
    svgEl("path", { class: "st-none", d: `M${x(0)} ${AX} V${TOP - 30}` }, svg);
    svgEl("text", { class: "st-nonelab", x: x(0), y: TOP - 40 }, svg).textContent = S.none_label;
    if (S.worth) {
      svgEl("path", { class: "st-worth", d: `M${x(S.worth.at)} ${AX} V${TOP - 30}` }, svg);
      svgEl("text", { class: "st-worth-t", x: x(S.worth.at) + 8, y: TOP - 40 }, svg).textContent = `${S.worth.label} · ${S.worth.at}`;
    }
    return S.rows.map((r, i) => () => {
      const se = S.sd * Math.sqrt(2 / r.n), shown = +r1(se), h = 2 * shown, a = r.gap - h, b = r.gap + h, y = TOP + (i + .5) * step;
      const p = 2 * (1 - Sampling.cdf(r.gap / se)), across = a < 0 && b > 0;
      const g = svgEl("g", { class: `st-cirow${across ? " f-gray" : ""}` }, svg);
      svgEl("text", { class: "st-cirow-n", x: L - 18, y: y + 7 }, g).textContent = r.label;
      svgEl("path", { class: "st-cirow-bar", d: `M${x(a)} ${y} H${x(b)}` }, g);
      // a narrow CI keeps its bar in sight: its dot shrinks to fit
      svgEl("circle", { class: "st-cirow-dot", cx: x(r.gap), cy: y, r: Math.max(4, Math.min(9, (x(b) - x(a)) / 2 - 2)) }, g);
      if (S.sums) {
        svgEl("text", { class: "st-cirow-sum", x: x(r.gap), y: y - 22 }, g).textContent = `${r.gap} ± 2 × ${r1(shown)}`;
        const by = y + 18, br = svgEl("g", { class: "st-gbr st-cirow-br" }, g);
        svgEl("path", { d: `M${x(r.gap)} ${by - 7} V${by} H${x(b)} V${by - 7}` }, br);
        svgEl("text", { x: (x(r.gap) + x(b)) / 2, y: by + 24 }, br).textContent = num(h);
      }
      if (r.verdict) {
        const c = concept(r.verdict), w = 30 + Math.max(c.label.length * 11, r.note.length * 9.6), v = svgEl("g", { class: `st-vchip f-${c.family}` }, g);
        svgEl("rect", { x: 650 - w / 2, y: y - 31, width: w, height: 62, rx: 22 }, v);
        svgEl("text", { class: "st-vchip-a", x: 650, y: y - 5 }, v).textContent = c.label;
        svgEl("text", { class: "st-vchip-b", x: 650, y: y + 19 }, v).textContent = r.note;
      } else {
        const pt = p < .001 ? "p < 0.001" : `p ≈ ${p < .01 ? p.toFixed(3) : p.toPrecision(1)}`;
        stPill(g, 650, y, pt, p < .05 ? "f-test" : "f-gray");
      }
    });
  },
  grid(svg, S) {
    // the trial run 1,000 times with placebo in both groups: one square per run, lined up by its gap (the biggest fall
    // first, the biggest rise last), so the runs with a gap at least as big as ours light up at both ends; p = how many
    // in 1,000. Two trials side by side add the line: the cut (0.05 = 50 in 1,000) marks its share at each end
    const RUNS = 1000, ROWS = 25, COLS = RUNS / ROWS, two = S.ns.length > 1;
    const H = two ? 382 : 390, cell = two ? 8 : 12, sq = cell * .8;
    // side by side, the cut's columns at each end stand a little apart, so the line can fall between them
    const cut = Math.round((S.cut || 0) * RUNS), edge = two ? cut / 2 / ROWS : 0, SEP = two ? 6 : 0;
    const colX = (t, c) => t.x0 + c * cell + (c >= edge ? SEP : 0) + (c >= COLS - edge ? SEP : 0);
    svg.setAttribute("viewBox", `0 0 ${ST.W} ${H}`);
    const fmt = v => v.toLocaleString("en-GB"), pText = k => String(+(k / RUNS).toFixed(3));
    const text = (x, y, s, cls, parent = svg) => { const t = svgEl("text", { class: cls, x, y }, parent); t.textContent = s; return t; };
    const pill = (cx, cy, s, f) => {
      const g = svgEl("g", { class: `st-cpill ${f}` }, svg), w = 34 + s.length * 11.5;
      svgEl("rect", { x: cx - w / 2, y: cy - 22, width: w, height: 40, rx: 20 }, g);
      svgEl("text", { x: cx, y: cy + 5 }, g).textContent = s;
    };
    const trials = S.ns.map((n, i) => {
      // two-sided: the share of chance's gaps at least ours either way, half at each end
      const se = S.sd * Math.sqrt(2 / n), half = Math.round(RUNS * (1 - Sampling.cdf(S.gap / se)));
      const x0 = two ? (i ? 404 : 24) : 20, y0 = two ? 40 : 48;
      return { half, lit: 2 * half, x0, y0, cx: x0 + (COLS * cell + 2 * SEP) / 2, label: S.labels[i] };
    });
    // one trial's 1,000 runs; the hits at both ends light up from the outside in, both ends together
    const grid = (t, lit) => {
      const g = svgEl("g", { class: `st-grid f-test${lit ? " st-lit st-now" : ""}` }, svg), spread = Math.min(800, (t.half - 1) * 160);
      for (let i = 0; i < RUNS; i++) {
        const out = Math.min(i, RUNS - 1 - i), hit = out < t.half;
        const r = svgEl("rect", { class: hit ? "st-run st-hit" : "st-run", x: colX(t, Math.floor(i / ROWS)), y: t.y0 + (i % ROWS) * cell, width: sq, height: sq, rx: sq * .2 }, g);
        if (hit && !lit) r.style.animationDelay = `${REDUCED_MOTION || t.half < 2 ? 0 : out / (t.half - 1) * spread}ms`;
      }
      return g;
    };
    if (!two) {
      const t = trials[0], foot = t.y0 + ROWS * cell + 26, right = t.x0 + COLS * cell;
      let g;
      return [
        () => { text(t.x0, 28, S.heading, "st-gh"); g = grid(t); },
        () => {
          g.classList.add("st-lit");
          const e = svgEl("g", { class: "st-gend" }, svg);
          text(t.x0, foot, `${fmt(t.half)} · ≥ ${S.gap} ${S.unit} lower`, "", e);
          text(right, foot, `≥ ${S.gap} ${S.unit} higher · ${fmt(t.half)}`, "st-gr", e);
        },
        () => {
          text(640, 190, `${fmt(t.lit)} in ${fmt(RUNS)}`, "st-gcount");
          pill(640, 238, `p = ${pText(t.lit)}`, "f-test st-gp");
        }
      ];
    }
    // two trials: both grids lit at once, then the line, then each trial's verdict
    return [
      () => trials.forEach(t => {
        text(t.cx, 24, t.label, "st-nc-h");
        t.g = grid(t, true);
        text(t.cx, 268, `${fmt(t.lit)} in ${fmt(RUNS)} · p = ${pText(t.lit)}`, "st-nc-t");
      }),
      () => {
        trials.forEach(t => {
          // the cut's share at each end: a shaded band behind the end columns, the dashed line just inside it
          const g = svgEl("g", { class: "st-gcut f-test" }, svg), top = t.y0 - 4, h = ROWS * cell + 6 - (cell - sq);
          [[0, edge - 1, colX(t, edge - 1) + sq + (SEP + cell - sq) / 2], [COLS - edge, COLS - 1, colX(t, COLS - edge) - (SEP + cell - sq) / 2]].forEach(([a, b, line]) => {
            svgEl("rect", { class: "st-sigzone", x: colX(t, a) - 3, y: top, width: colX(t, b) + sq - colX(t, a) + 6, height: h, rx: 3 }, g);
            svgEl("path", { class: "st-cutline", d: `M${line} ${top - 6} V${top + h + 6}` }, g);
          });
          svg.insertBefore(g, t.g);
        });
        const line = `${fmt(cut)} in ${fmt(RUNS)} = 1 in ${Math.round(RUNS / cut)} = ${S.cut}`;
        pill(ST.W / 2, 306, line, "f-test");
        // who drew the line, beside it
        if (S.origin) text(ST.W / 2 + (34 + line.length * 11.5) / 2 + 14, 313, S.origin, "st-orwho st-gwho");
      },
      ...trials.map(t => () => {
        const sig = t.lit < cut, c = concept(sig ? "sig" : "ns");
        pill(t.cx, 356, `${fmt(t.lit)} ${sig ? "<" : ">"} ${fmt(cut)} · ${c.label}`, `f-${c.family}`);
      })
    ];
  },
  ncompare(svg, S) {
    // the same gap in two trials of different sizes, side by side: each trial's SE (SD × √(2 ÷ n)), its chance bell round 0
    // (true to scale, so the smaller trial's is wider and lower), how many SEs out the gap is, and its p with the tails filled
    const H = 390, AX = 330, PY = 3.6, SPAN = 13, CW = 300, fam = `f-${concept("ci").family}`;
    svg.setAttribute("viewBox", `0 0 ${ST.W} ${H}`);
    svg.classList.add(fam);
    const r1 = v => (Math.round(v * 10) / 10).toFixed(1);
    const cols = S.ns.map((n, i) => {
      const se = S.sd * Math.sqrt(2 / n), shown = +r1(se), z = S.gap / shown, zTrue = S.gap / se;
      const p = 2 * (1 - Sampling.cdf(zTrue)), cx = i ? 575 : 205, x = v => cx + v * CW / (2 * SPAN);
      const dens = v => Math.exp(-v * v / (2 * se * se)) / (se * Math.sqrt(2 * Math.PI)), y = v => AX - dens(v) * 100 * PY;
      const pts = (a, b) => { const q = []; for (let v = a; v <= b + 1e-9; v += .1) q.push(`${x(v).toFixed(1)} ${y(v).toFixed(1)}`); return q; };
      return { n, se, shown, z, p, cx, x, y, pts, label: S.labels[i] };
    });
    const pill = (cx, cy, text, f) => {
      const g = svgEl("g", { class: `st-cpill ${f}` }, svg), w = 34 + text.length * 11.5;
      svgEl("rect", { x: cx - w / 2, y: cy - 22, width: w, height: 40, rx: 20 }, g);
      svgEl("text", { x: cx, y: cy + 5 }, g).textContent = text;
    };
    const text = (cx, cy, s, cls = "st-nc-t") => { svgEl("text", { class: cls, x: cx, y: cy }, svg).textContent = s; };
    cols.forEach(c => text(c.cx, 24, c.label, "st-nc-h"));
    const num = v => v < 1 ? v.toFixed(2) : r1(v);
    return [
      // each trial's SE of the gap: the smaller trial's is larger
      () => cols.forEach(c => {
        text(c.cx, 62, `SE = ${S.sd} × √(2 ÷ ${c.n})`);
        pill(c.cx, 98, `${Math.abs(c.shown - c.se) < 1e-9 ? "=" : "≈"} ${r1(c.se)}`, fam);
      }),
      // chance's bell round 0 for each, true to scale, both axes; the gap lands on each
      () => { text(ST.W / 2, AX + 52, S.axis, "cv-alab st-nc-ax"); cols.forEach((c, i) => {
        const g = svgEl("g", { class: "st-nc-bell" }, svg), [a, b] = [-SPAN, SPAN];
        svgEl("path", { class: "dp-axis", d: `M${c.x(a) - 6} ${AX} H${c.x(b) + 6}` }, g);
        svgEl("path", { class: "dp-axis", d: `M${c.x(a) - 6} ${AX} V${AX - 30 * PY}` }, g);
        [0, 10, 20, 30].forEach(t => { svgEl("text", { class: "cv-ylab sm", x: c.x(a) - 12, y: AX - t * PY + 5 }, g).textContent = `${t}%`; });
        if (!i) { const yt = svgEl("text", { class: "cv-ytitle sm", transform: `translate(${c.x(a) - 52} ${AX - 15 * PY}) rotate(-90)` }, g); yt.textContent = S.y_axis; }
        for (let v = 0; v <= 12; v += 4) svgEl("text", { class: "dp-tlab st-nc-tick", x: c.x(v), y: AX + 22 }, g).textContent = v;
        svgEl("path", { class: "cv-area", d: `M${c.x(a)} ${AX} L${c.pts(a, b).join(" L")} L${c.x(b)} ${AX} Z` }, g);
        svgEl("path", { class: "cv-line", pathLength: 1, d: `M${c.pts(a, b).join(" L")}` }, g);
        c.bell = g;
        svgEl("circle", { class: "st-real", cx: c.x(S.gap), cy: AX, r: 6 }, svg);
      }); },
      // how many SEs out the gap is
      () => cols.forEach(c => text(c.cx, 140, `${S.gap} ÷ ${r1(c.shown)} = ${num(c.z)} SEs`)),
      // p: the tails at least that far out, either way
      () => cols.forEach(c => {
        const g = svgEl("g", { class: "st-ptail f-test" }, c.bell);
        // true to scale, so a thin tail is edged thick to show
        [[S.gap, SPAN], [-SPAN, -S.gap]].forEach(([a, b]) => {
          svgEl("path", { class: "st-pfill", d: `M${c.x(a)} ${AX} L${c.pts(a, b).join(" L")} L${c.x(b)} ${AX} Z` }, g);
          svgEl("path", { class: "st-pedge", d: `M${c.pts(a, b).join(" L")} M${c.x(a)} ${AX} H${c.x(b)}` }, g);
        });
        pill(c.cx, 180, `p ≈ ${c.p.toPrecision(1)}`, "f-test");
      })
    ];
  },
  ci(svg, S) {
    // our trial's bell of gaps (SE of the difference wide) round what we found; its middle 95% is the CI.
    // Then chance's bell round 0 beside it: 0 lies outside our CI just as our gap lies outside chance's 95%.
    const se = S.sd * Math.sqrt(2 / S.n), est = S.gap, lo = est - 2 * se, hi = est + 2 * se;
    const r1 = v => (Math.round(v * 10) / 10).toFixed(1), num = v => Number.isInteger(+r1(v)) ? String(+r1(v)) : r1(v);
    const H = 385, L = 80, R = 700, A = -5, B = 9, AX = 260, PY = 7, fam = `f-${concept("ci").family}`;
    svg.setAttribute("viewBox", `0 0 ${ST.W} ${H}`);
    svg.classList.add(fam);
    const x = v => L + (v - A) / (B - A) * (R - L), dens = v => Math.exp(-v * v / (2 * se * se)) / (se * Math.sqrt(2 * Math.PI));
    const y = (c, v) => AX - dens(v - c) * 100 * PY;
    const pts = (c, a, b) => { const p = []; for (let v = a; v <= b + 1e-9; v += .05) p.push(`${x(v).toFixed(1)} ${y(c, v).toFixed(1)}`); return p; };
    const area = (c, a, b) => `M${x(a)} ${AX} L${pts(c, a, b).join(" L")} L${x(b)} ${AX} Z`;
    const curve = (c, a, b) => `M${pts(c, a, b).join(" L")}`;
    const lim = c => [Math.max(A, c - 3.4 * se), Math.min(B, c + 3.4 * se)];
    // both axes: the value (no minus signs: only 0 and the drug's side are labelled), and % of trials
    svgEl("path", { class: "dp-axis", d: `M${L - 10} ${AX} H${R + 10}` }, svg);
    svgEl("path", { class: "dp-axis", d: `M${L - 10} ${AX} V${AX - 30 * PY}` }, svg);
    [0, 10, 20, 30].forEach(t => { svgEl("text", { class: "cv-ylab", x: L - 18, y: AX - t * PY + 6 }, svg).textContent = `${t}%`; });
    const yt = svgEl("text", { class: "cv-ytitle", transform: `translate(${L - 62} ${AX - 15 * PY}) rotate(-90)` }, svg); yt.textContent = S.y_axis;
    for (let v = 0; v <= B - 1; v += 2) svgEl("text", { class: "dp-tlab", x: x(v), y: AX + 28 }, svg).textContent = v;
    svgEl("text", { class: "cv-alab", x: x((A + B) / 2), y: AX + 56 }, svg).textContent = S.axis;
    const bellAt = (c, cls, label) => {
      const g = svgEl("g", { class: `st-cib ${cls}` }, svg), [a, b] = lim(c);
      svgEl("path", { class: "st-cib-a", d: area(c, a, b) }, g);
      svgEl("path", { class: "st-cib-l", d: curve(c, a, b) }, g);
      svgEl("text", { class: "st-cib-t", x: x(c), y: y(c, c) - 12 }, g).textContent = label;
      return g;
    };
    const bar = (a, b, c, yy, cls) => {
      const g = svgEl("g", { class: `st-cibar ${cls}` }, svg);
      svgEl("path", { d: `M${x(a)} ${yy} H${x(b)} M${x(a)} ${yy - 10} V${yy + 10} M${x(b)} ${yy - 10} V${yy + 10}` }, g);
      svgEl("rect", { x: x(c) - 9, y: yy - 9, width: 18, height: 18, rx: 3 }, g);
      return g;
    };
    let trialBell;
    const beats = [
      // our trial's gap, and the bell it could have come from: SE 1.5 either way
      () => {
        trialBell = bellAt(est, "st-cib-trial", S.labels[0]);
        svgEl("circle", { class: "st-real", cx: x(est), cy: AX, r: 7 }, svg);
      },
      // 2 SE either side: its middle 95%
      () => {
        const g = svgEl("g", { class: "st-ci95" }, svg);
        svgEl("path", { class: "st-ci95-a", d: area(est, lo, hi) }, g);
        [lo, hi].forEach(v => svgEl("path", { class: "st-line2", d: `M${x(v)} ${AX} V${AX - 23 * PY}` }, g));
        svgEl("text", { class: "st-ci95-t", x: x(est), y: AX - 60 }, g).textContent = "95%";
        trialBell.parentNode.appendChild(trialBell);
      },
      // it drops out beneath as the CI, with its sum
      () => {
        bar(lo, hi, est, AX + 88, "st-cibar-trial");
        const text = `${concept("ci").label} = ${num(est)} ± 2 × ${num(se)} = ${num(lo)} to ${num(hi)}`;
        const g = svgEl("g", { class: "st-cpill f-se" }, svg), w = 30 + text.length * 12.5;
        svgEl("rect", { x: ST.W / 2 - w / 2, y: -2, width: w, height: 44, rx: 22 }, g);
        svgEl("text", { x: ST.W / 2, y: 28 }, g).textContent = text;
      },
      // chance's bell round 0 beside it, and its own 95%: neither reaches the other's centre
      () => {
        const g = bellAt(0, "st-cib-null", S.labels[1]);
        svg.insertBefore(g, svg.querySelector(".st-cib-trial"));
        bar(-2 * se, 2 * se, 0, AX + 116, "st-cibar-null");
      }
    ];
    // with chance: false the story stops at our CI
    return S.chance === false ? beats.slice(0, 3) : beats;
  },
  slide(svg, S) {
    // one or two panels, a difference and a ratio; in each, one CI slides towards no effect, one place per tap.
    // A difference's p is worked out from its SE; a ratio's is read from where its CI stands against 1.
    // A ratio's CI runs from c ÷ factor to c × factor on a log axis (or c ± half on a plain one); one panel fills the width
    const one = S.panels.length === 1, PW = one ? 560 : 330, GAP = 100, BY = 150, AX = 262, fam = `f-${concept("ci").family}`;
    const P = S.panels.map((pn, i) => {
      const L = one ? (ST.W - PW) / 2 : i * (PW + GAP) + 20, [a, b] = pn.range, log = pn.factor != null, t = log ? Math.log : v => v;
      const x = v => L + (t(v) - t(a)) / (t(b) - t(a)) * PW;
      const g = svgEl("g", {}, svg);
      if (pn.label) svgEl("text", { class: "st-ptitle", x: L + PW / 2, y: 22 }, g).textContent = pn.label;
      svgEl("path", { class: "dp-axis", d: `M${L} ${AX} H${L + PW}` }, g);
      pn.ticks.forEach(k => {
        svgEl("path", { class: "dp-tick", d: `M${x(k)} ${AX} V${AX + 8}` }, g);
        svgEl("text", { class: "dp-tlab", x: x(k), y: AX + 32 }, g).textContent = minus(k);
      });
      svgEl("text", { class: "cv-alab st-palab", x: L + PW / 2, y: AX + 66 }, g).textContent = pn.axis;
      svgEl("path", { class: "st-none", d: `M${x(pn.none)} ${AX} V${62}` }, g);
      svgEl("text", { class: "st-nonelab", x: x(pn.none), y: 52 }, g).textContent = `No effect = ${pn.none}`;
      const ends = log ? c => [c / pn.factor, c * pn.factor] : c => { const h = pn.se != null ? 2 * pn.se : pn.half; return [c - h, c + h]; };
      return { pn, x, ends, L, g, bar: null, pill: null };
    });
    const pText = (Q, c) => {
      if (Q.pn.se != null) return `p = ${(2 * (1 - Sampling.cdf(Math.abs(c - Q.pn.none) / Q.pn.se))).toPrecision(1)}`;
      const [lo, hi] = Q.ends(c), d = Math.min(Math.abs(lo - Q.pn.none), Math.abs(hi - Q.pn.none)), across = lo < Q.pn.none && hi > Q.pn.none;
      return d < 1e-9 ? "p = 0.05" : across ? "p > 0.05" : "p < 0.05";
    };
    const place = (Q, k) => {
      const c = Q.pn.at[k], [lo, hi] = Q.ends(c), xc = Q.x(c), l = Q.x(lo) - xc, r = Q.x(hi) - xc;
      if (!Q.bar) {
        Q.bar = svgEl("g", { class: `st-ci ${fam}` }, Q.g);
        svgEl("path", {}, Q.bar);
        svgEl("rect", { x: -11, y: -11, width: 22, height: 22, rx: 3 }, Q.bar);
        // the pill sits just right of the no-effect line; it pops in with a CSS transform, so its place is set on a wrapper
        Q.pill = svgEl("g", { class: "st-cpill f-test" }, svgEl("g", { transform: `translate(${Q.x(Q.pn.none) + 100} 218)` }, Q.g));
        svgEl("rect", { x: -80, y: -30, width: 160, height: 44, rx: 22 }, Q.pill);
        svgEl("text", { x: 0, y: 0 }, Q.pill);
      }
      $("path", Q.bar).setAttribute("d", `M${l} 0 H${r} M${l} -12 V12 M${r} -12 V12`);
      Q.bar.style.transform = `translate(${xc}px, ${BY}px)`;
      $("text", Q.pill).textContent = pText(Q, c);
    };
    return P.flatMap(Q => Q.pn.at.map((_, k) => () => place(Q, k)));
  },
  line(svg, S) {
    // a ruler of p-values on a log scale, 1 at the top; one dashed line at the cut, the significant side below it.
    // With an `origin`, a small bell comes first on the left: beyond 2 SE lies half the cut each side (who drew the line, and when)
    const X = S.origin ? 420 : 210, TOP = 34, BOT = 318, DEC = 3, R = S.origin ? 750 : 700, y = p => TOP + (-Math.log10(p)) / DEC * (BOT - TOP);
    const fmt = p => String(+p.toPrecision(2));
    svgEl("path", { class: "dp-axis", d: `M${X} ${TOP - 10} V${BOT + 10}` }, svg);
    for (let k = 0; k <= DEC; k++) {
      svgEl("path", { class: "dp-tick", d: `M${X - 10} ${y(10 ** -k)} H${X}` }, svg);
      svgEl("text", { class: "st-rtick", x: X - 18, y: y(10 ** -k) + 7 }, svg).textContent = fmt(10 ** -k);
    }
    svgEl("text", { class: "st-rname", x: X, y: TOP - 22 }, svg).textContent = "p";
    const chip = (t, i) => {
      const g = svgEl("g", { class: "st-tchip", transform: `translate(0 ${y(t.p)})` }, svg);
      svgEl("circle", { cx: X, cy: 0, r: 8 }, g);
      const text = `${t.label} · p = ${fmt(t.p)}`, w = 30 + text.length * 11;
      svgEl("rect", { x: X + 26, y: -22, width: w, height: 44, rx: 22 }, g);
      svgEl("text", { x: X + 26 + w / 2, y: 7 }, g).textContent = text;
    };
    const origin = () => {
      const g = svgEl("g", { class: "st-origin f-test" }, svg), cx = 180, sd = 30, h = 120, base = 230;
      const yb = v => base - h * Math.exp(-v * v / 2), path = (a, b) => { let d = ""; for (let v = a; v <= b + 1e-9; v += .05) d += `${d ? " L" : "M"}${(cx + v * sd).toFixed(1)} ${yb(v).toFixed(1)}`; return d; };
      svgEl("path", { class: "dp-axis", d: `M${cx - 3.6 * sd} ${base} H${cx + 3.6 * sd}` }, g);
      svgEl("path", { class: "st-orbell-a", d: `${path(-3.4, 3.4)} L${cx + 3.4 * sd} ${base} L${cx - 3.4 * sd} ${base} Z` }, g);
      [-1, 1].forEach(s => {
        const [a, b] = s > 0 ? [2, 3.4] : [-3.4, -2];
        svgEl("path", { class: "st-pfill", d: `${path(a, b)} L${cx + b * sd} ${base} L${cx + a * sd} ${base} Z` }, g);
        svgEl("path", { class: "st-pedge", d: `${path(a, b)} M${cx + a * sd} ${base} H${cx + b * sd}` }, g);
        svgEl("path", { class: "st-line2", d: `M${cx + s * 2 * sd} ${base} V${base - h - 8}` }, g);
        svgEl("text", { class: "st-ppct", x: cx + s * 3.3 * sd, y: base - 44 }, g).textContent = `${+(S.cut * 50).toFixed(1)}%`;
      });
      svgEl("path", { class: "st-orbell", d: path(-3.4, 3.4) }, g);
      svgEl("text", { class: "st-2lab", x: cx + 2 * sd + 6, y: base - h - 12 }, g).textContent = "2 SE";
      const pill = svgEl("g", { class: "st-cpill f-test" }, g), text = `${+(S.cut * 100).toFixed(1)}% = 1 in ${Math.round(1 / S.cut)}`;
      svgEl("rect", { x: cx - 90, y: base + 22, width: 180, height: 44, rx: 22 }, pill);
      svgEl("text", { x: cx, y: base + 52 }, pill).textContent = text;
      svgEl("text", { class: "st-orwho", x: cx, y: base + 100 }, g).textContent = S.origin;
    };
    return [
      ...(S.origin ? [origin] : []),
      () => {
        const g = svgEl("g", { class: "st-cut f-test" }, svg), yc = y(S.cut);
        svgEl("rect", { class: "st-sigzone", x: X, y: yc, width: R - X, height: BOT + 10 - yc }, g);
        svgEl("path", { class: "st-cutline", d: `M${X - 10} ${yc} H${R}` }, g);
        // the line's value just under it; the two sides named either side of it, clear of the trials' chips
        svgEl("text", { class: "st-cutlab", x: R - 10, y: yc + 32 }, g).textContent = `${fmt(S.cut)} = 1 in ${Math.round(1 / S.cut)}`;
        svgEl("text", { class: "st-zlab st-zsig", x: R - 14, y: BOT - 4 }, g).textContent = concept("sig").label;
        svgEl("text", { class: "st-zlab", x: R - 14, y: yc - 14 }, g).textContent = concept("ns").label;
      },
      ...S.trials.map((t, i) => () => chip(t, i))
    ];
  },
  gap(svg, S, later) {
    // the numbers: each group's mean wobbles by its SEM, the gap between them by the SE of the difference
    const sem = S.sd / Math.sqrt(S.n), se = S.sd * Math.sqrt(2 / S.n), z = S.gap / se;
    const tail = 1 - Sampling.cdf(z), p = 2 * tail, r1 = v => (Math.round(v * 10) / 10).toFixed(1);
    const pct = v => `${r1(v * 100)}%`, ps = p < .001 ? "< 0.001" : `= ${p.toFixed(3)}`;
    const L = 80, R = 680, AX = 300, SPAN = 6, PY = 8, X0 = (L + R) / 2;
    const x = v => X0 + v * (R - L) / (2 * SPAN), dens = v => Math.exp(-v * v / (2 * se * se)) / (se * Math.sqrt(2 * Math.PI));
    const y = v => AX - dens(v) * 100 * PY, fam = `f-${concept(S.family || "ci").family}`;
    svg.classList.add(fam);
    // a bell SEM wide round c, standing on base; cut where the axis ends
    const lump = (c, s, h, base) => {
      let d = ""; for (let k = -3.2 * s; k <= 3.2 * s + 1e-9; k += s / 20) if (Math.abs(c + k) <= SPAN + .8) d += `${d ? " L" : "M"}${x(c + k).toFixed(1)} ${(base - h * Math.exp(-k * k / (2 * s * s))).toFixed(1)}`;
      return d;
    };
    const TOP = 110, ROW2 = 200, TH = 72, TB = 205, SH = 50, N = 60, BIN = .5, DOT = 12, dly = ms => REDUCED_MOTION ? 0 : ms;
    const bin = v => Math.round(v / BIN) * BIN;
    // the top strip is each group's blood pressure: the placebo's mean at PC, the drug's (lower) the gap to its left
    const PC = S.gap / 2, DC = PC - S.gap;
    // one group's bell: its mean dashed down to the axis with its value, its SEM marked, 2 SEM either side
    const groupBell = (c, base, cls, lab, side, mean) => {
      const g = svgEl("g", { class: `st-tb ${cls}`, style: `transform:translateY(0px)` }, svg), d = lump(c, sem, TH, base);
      svgEl("path", { class: "dp-axis", d: `M${x(DC - 3.4 * sem)} ${base} H${x(PC + 3.4 * sem)}` }, g);
      svgEl("path", { class: "st-tb-a", d: `${d} L${x(c + 3.2 * sem)} ${base} L${x(c - 3.2 * sem)} ${base} Z` }, g);
      svgEl("path", { class: "st-tb-l", d }, g);
      svgEl("path", { class: "st-tb-mean", d: `M${x(c)} ${base - TH} V${base}` }, g);
      // 2 SEM either side, dashed: they stay on the bell when the groups join and when the drug slides back
      [-1, 1].forEach(k => svgEl("path", { class: "st-line2", d: `M${x(c + k * 2 * sem)} ${base} V${base - TH - 4}` }, g));
      // its name and "2 SEM" stand just outside its outer dashed line: the drug's on the left, the placebo's on the right
      const out = x(c + side * 2 * sem) + side * 8, anchor = side < 0 ? "end" : "start";
      svgEl("text", { class: "st-tb-2", x: out, y: base - TH * .45 + 6, "text-anchor": anchor }, g).textContent = "2 SEM";
      svgEl("text", { class: "st-tb-t", x: out, y: base - TH + 12, "text-anchor": anchor }, g).textContent = lab;
      svgEl("text", { class: "st-tb-v", x: x(c), y: base + 22 }, g).textContent = mean;
      svgEl("text", { class: "st-tb-ax", x: x(PC + 3.4 * sem), y: base + 22, "text-anchor": "end" }, g).textContent = S.means_axis;
      const mk = svgEl("g", { class: "st-tb-sem" }, g), yy = base - TH * Math.exp(-.5);
      svgEl("path", { d: `M${x(c)} ${yy} H${x(c + sem)}` }, mk);
      svgEl("text", { x: x(c) + 7, y: yy - 9, "text-anchor": "start" }, mk).textContent = `SEM ${r1(sem)}`;
      return g;
    };
    // one trial: its own pair of bells round its two means, the gap between them (placebo − drug) bracketed and dropped below
    const trial = (parent, pm, dm, stay) => {
      const g = svgEl("g", { class: "st-trial" }, parent), gap = pm - dm;
      [[pm, "st-tb-plac"], [dm, "st-tb-drug"]].forEach(([c, cls]) => {
        const b = svgEl("g", { class: `st-tb ${cls}` }, g), d = lump(c, sem, SH, TB);
        svgEl("path", { class: "st-tb-a", d: `${d} L${x(c + 3.2 * sem)} ${TB} L${x(c - 3.2 * sem)} ${TB} Z` }, b);
        svgEl("path", { class: "st-tb-l", d }, b);
      });
      const yb = TB - SH - 12;
      svgEl("path", { class: "st-onebr", d: `M${x(pm)} ${yb} H${x(dm)} M${x(pm)} ${yb - 6} V${yb + 6} M${x(dm)} ${yb - 6} V${yb + 6}` }, g);
      svgEl("text", { class: "st-onet", x: x((pm + dm) / 2), y: yb - 10 }, g).textContent = `${S.labels[2]} ${r1(gap).replace("-", "−")}`;
      if (!stay) later(1300, () => g.classList.add("st-gone"));
      return gap;
    };
    const drop = (parent, v, k, delay) => svgEl("circle", { class: "st-gdot", cx: x(bin(v)), cy: AX - DOT / 2 - 1 - k * DOT, r: 5.5, style: `animation-delay:${dly(delay)}ms` }, parent);
    // the rest of many trials' gaps, at the quantiles of their bell round c, onto a pile that already holds `first`
    const pileUp = (parent, c, first) => {
      const counts = {}; first.forEach(v => { counts[bin(v)] = (counts[bin(v)] || 0) + 1; });
      for (let j = 0; j < N - first.length; j++) {
        const i = (j * 37) % (N - first.length), v = bin(c + se * Sampling.inv((i + .5) / (N - first.length))), k = counts[v] || 0;
        if (Math.abs(v) > SPAN + .5) continue;  // past the end of the axis
        counts[v] = k + 1;
        drop(parent, v, k, j * 28);
      }
      const h = N * BIN * dens(0) * DOT, mk = svgEl("g", { class: "st-pilemk", style: `animation-delay:${dly(N * 28 + 200)}ms` }, parent);
      svgEl("path", { class: "st-pileline", d: lump(c, se, h, AX) }, mk);
      const yy = AX - h * Math.exp(-.5);
      svgEl("path", { class: "st-pilese", d: `M${x(c)} ${yy} H${x(c + se)}` }, mk);
      svgEl("text", { class: "st-pilet", x: x(c + se) + 8, y: yy - 8 }, mk).textContent = `SE ${r1(se)}`;
    };
    let calc, bell, plac, drug, gapBr, low, pile4, pile0, strip;
    const say = (text, f) => {
      if (calc) calc.remove();
      calc = svgEl("g", { class: `st-cpill ${f}` }, svg);
      const w = 30 + text.length * 12.5;
      svgEl("rect", { x: X0 - w / 2, y: -2, width: w, height: 44, rx: 22 }, calc);
      svgEl("text", { x: X0, y: 28 }, calc).textContent = text;
    };
    const area = (a, b) => {
      let d = `M${x(a)} ${AX}`;
      for (let v = a; v <= b + 1e-9; v += .05) d += ` L${x(v).toFixed(1)} ${y(v).toFixed(1)}`;
      return d + ` L${x(b)} ${AX} Z`;
    };
    const curve = (a, b) => { let d = ""; for (let v = a; v <= b + 1e-9; v += .05) d += `${d ? " L" : "M"}${x(v).toFixed(1)} ${y(v).toFixed(1)}`; return d; };
    // each trial's two means [placebo, drug] on the top strip: three with the drug working (gaps 2.9, 5.1, 3.6),
    // then three with it doing nothing, both round the placebo's mean (gaps 1.2, -1.0, 0.6)
    const TRIALS = [[PC - .6, DC + .5], [PC + .4, DC - .7], [PC - .3, DC + .1]], NULLS = [[PC + .3, PC - .9], [PC - .5, PC + .5], [PC + .2, PC - .4]];
    // one trial per tap: its own pair of bells, its gap dropped onto the pile; the one before fades
    const trialBeat = (list, i, pileOf) => {
      if (strip) strip.classList.add("st-gone");
      strip = svgEl("g", {}, svg);
      const [pm, dm] = list[i], gp = trial(strip, pm, dm, true), k = list.slice(0, i).filter(([a, b]) => bin(a - b) === bin(gp)).length;
      later(600, () => drop(pileOf(), gp, k, 0));
    };
    return [
      // the placebo group's mean blood pressure: a bell, SEM wide
      () => { plac = groupBell(PC, TOP, "st-tb-plac", S.labels[0], 1, S.means[0]); },
      // the drug group's: the same width, the gap lower
      () => { drug = groupBell(DC, ROW2, "st-tb-drug", S.labels[1], -1, S.means[1]); },
      // together on one axis: the gap between the means
      () => {
        drug.style.transform = `translateY(${TOP - ROW2}px)`;
        [plac, drug].forEach(g => { $(".st-tb-sem", g).classList.add("st-gone"); $(".dp-axis", g).classList.add("st-gone"); });
        $(".st-tb-ax", drug).classList.add("st-gone");
        $(".dp-axis", plac).classList.remove("st-gone");
        gapBr = svgEl("g", { class: "st-gapbr" }, svg);
        const yb = TOP - TH - 16;
        svgEl("path", { d: `M${x(DC)} ${yb} H${x(PC)} M${x(DC)} ${yb - 7} V${yb + 7} M${x(PC)} ${yb - 7} V${yb + 7}` }, gapBr);
        svgEl("text", { x: x((DC + PC) / 2), y: yb - 10 }, gapBr).textContent = `${S.labels[2]} ${S.gap} ${S.unit}`;
      },
      // three trials, one per tap: each its own pair of bells, its gap dropped onto the axis below
      ...TRIALS.map((_, i) => () => {
        if (!i) {
          low = svgEl("g", { class: "st-lowax" }, svg);
          svgEl("path", { class: "dp-axis", d: `M${L - 10} ${AX} H${R + 10}` }, low);
          for (let v = 0; v <= SPAN; v += 2) svgEl("text", { class: "dp-tlab", x: x(v), y: AX + 30 }, low).textContent = v;
          svgEl("text", { class: "cv-alab", x: X0, y: AX + 62 }, low).textContent = S.axis;
          pile4 = svgEl("g", { class: "st-pile" }, svg);
          // the means' values have had their say; the trials' gaps are written where they stood
          [plac, drug].forEach(g => $$(".st-tb-v, .st-tb-ax", g).forEach(t => t.classList.add("st-gone")));
        }
        trialBeat(TRIALS, i, () => pile4);
      }),
      // many more trials: the gaps pile into a bell wider than either mean's, the SE of the difference
      () => { strip.classList.add("st-gone"); pileUp(pile4, S.gap, TRIALS.map(([pm, dm]) => pm - dm)); },
      // if the drug did nothing: its bell slides over onto the placebo's
      () => {
        drug.style.transform = `translateY(${TOP - ROW2}px) translateX(${x(PC) - x(DC)}px)`;
        gapBr.classList.add("st-gone"); pile4.classList.add("st-gone"); strip.classList.add("st-gone");
      },
      // three trials even so, one per tap: gaps either side of 0, by chance alone
      ...NULLS.map((_, i) => () => {
        if (!i) pile0 = svgEl("g", { class: "st-pile" }, svg);
        trialBeat(NULLS, i, () => pile0);
      }),
      // many trials: their gaps pile round 0, the same width as before
      () => { strip.classList.add("st-gone"); pileUp(pile0, 0, NULLS.map(([pm, dm]) => pm - dm)); },
      // the pile becomes the bell of chance, with both axes
      () => {
        [plac, drug].forEach(g => g.classList.add("st-gone"));
        pile0.classList.add("st-gone");
        bell = svgEl("g", { class: `${fam} st-chance` }, svg);
        svgEl("path", { class: "dp-axis", d: `M${L - 10} ${AX} V${AX - 30 * PY}` }, bell);
        [0, 10, 20, 30].forEach(t => { svgEl("text", { class: "cv-ylab", x: L - 18, y: AX - t * PY + 6 }, bell).textContent = `${t}%`; });
        const yt = svgEl("text", { class: "cv-ytitle", transform: `translate(${L - 62} ${AX - 15 * PY}) rotate(-90)` }, bell); yt.textContent = S.y_axis;
        svgEl("path", { class: "cv-area", d: area(-SPAN, SPAN) }, bell);
        svgEl("path", { class: "cv-line", pathLength: 1, d: curve(-SPAN, SPAN) }, bell);
        const mk = svgEl("g", { class: "st-semk" }, bell), yy = y(se);
        svgEl("path", { d: `M${x(0)} ${yy} H${x(se)}` }, mk);
        svgEl("path", { class: "st-drop", d: `M${x(se)} ${yy} V${AX}` }, mk);
        svgEl("text", { x: x(se) + 10, y: yy - 10 }, mk).textContent = `SE ${r1(se)}`;
      },
      // the 2 SE lines: 2.5% of harmless trials land beyond each
      () => {
        const g = svgEl("g", { class: "st-2se" }, bell);
        [-1, 1].forEach(s => {
          svgEl("path", { class: "st-shade", d: s > 0 ? area(2 * se, SPAN) : area(-SPAN, -2 * se) }, g);
          svgEl("path", { class: "st-line2", d: `M${x(s * 2 * se)} ${AX} V${AX - 29 * PY}` }, g);
          svgEl("text", { class: "st-tailpct", x: x(s * 4.8), y: AX - 34 }, g).textContent = "2.5%";
        });
        svgEl("text", { class: "st-2lab", x: x(2 * se) + 8, y: AX - 26 * PY }, g).textContent = "2 SE";
      },
      // the trial's gap lands, and how many SEs out it is
      () => {
        svgEl("circle", { class: "st-real", cx: x(S.gap), cy: AX, r: 7 }, bell);
        say(`${S.gap} ÷ ${r1(se)} = ${r1(z)} SEs`, fam);
      },
      // the tails at least that far out, either way: their share of the bell is p
      () => {
        $$(".st-shade, .st-tailpct", bell).forEach(t => t.classList.add("st-gone"));
        const g = svgEl("g", { class: "st-ptail f-test" }, bell);
        [-1, 1].forEach(s => {
          const [a, b] = s > 0 ? [S.gap, SPAN] : [-SPAN, -S.gap];
          svgEl("path", { class: "st-pfill", d: area(a, b) }, g);
          svgEl("path", { class: "st-pedge", d: `${curve(a, b)} M${x(a)} ${AX} H${x(b)}` }, g);
          svgEl("text", { class: "st-ppct", x: x(s * 5), y: AX - 30 }, g).textContent = pct(tail);
        });
        $("circle.st-real", bell).parentNode.appendChild($("circle.st-real", bell));
        say(`p = ${pct(tail)} + ${pct(tail)} ${ps.replace("= ", "≈ ")}`, "f-test");
      }
    ];
  },
  coin(svg, S, later) {
    const n = S.tosses, ways = 2 ** n, gap = 64, x0 = ST.W / 2 - gap * (n - 1) / 2, CY = 128;
    const fmt = v => v.toLocaleString("en-GB"), p = 2 / ways;
    const pill = (cls, y, text, w) => {
      const g = svgEl("g", { class: `st-cpill ${cls}` }, svg);
      svgEl("rect", { x: ST.W / 2 - w / 2, y: y - 30, width: w, height: 44, rx: 22 }, g);
      svgEl("text", { x: ST.W / 2, y }, g).textContent = text;
      return g;
    };
    return [
      // the judge's starting point: nothing is going on, the coin is fair
      () => pill("f-test", 36, S.claim.replace(/\{(\w+)\}/g, (m, k) => concept(k).label), 300),
      // the tosses land, all heads; under each, the chance of heads every time so far
      () => {
        for (let i = 0; i < n; i++) {
          const x = x0 + i * gap, d = `animation-delay:${REDUCED_MOTION ? 0 : i * 160}ms`;
          const c = svgEl("g", { class: "st-coin", style: d, transform: `translate(${x} ${CY})` }, svg);
          svgEl("circle", { r: 25 }, c); svgEl("circle", { r: 18, class: "st-rim" }, c);
          svgEl("text", { y: 7 }, c).textContent = "H";
          const f = svgEl("g", { class: "st-frac", style: d, transform: `translate(${x} ${CY + 58})` }, svg);
          svgEl("text", { y: 0 }, f).textContent = "1";
          svgEl("path", { d: "M-24 8 H24" }, f);
          svgEl("text", { y: 30 }, f).textContent = fmt(2 ** (i + 1));
        }
      },
      // as far out as this, either way
      () => { const t = svgEl("text", { class: "st-csum", x: ST.W / 2, y: 272 }, svg); t.textContent = `All heads or all tails: 2 in ${fmt(ways)}`; },
      // the p-value: how often a fair coin gives a result at least this extreme
      () => pill("f-test st-cp", 330, `p = 2 ÷ ${fmt(ways)} ≈ ${p.toFixed(3)}`, 330)
    ];
  },
  art(svg, S, later, chart) {
    const src = $("template.st-art", chart.closest(".story")).content.querySelector("svg");
    svg.setAttribute("viewBox", src.getAttribute("viewBox"));
    svg.classList.add("scene", "st-art");
    [...src.cloneNode(true).childNodes].forEach(n => svg.appendChild(n));
    $$("[data-slot]", svg).forEach(t => { t.textContent = String(S.slots[t.dataset.slot]).replace(/\{(\w+)\}/g, (m, k) => concept(k).label); });
    const last = Math.max(...$$("[data-beat]", svg).map(g => +g.dataset.beat));
    return Array.from({ length: last }, (_, i) => () => $$(`[data-beat="${i + 1}"]`, svg).forEach(g => g.classList.add("st-on")));
  },
  mean(svg, S, later) {
    const v = Stats.sorted(S.values), lo = v[0] - 1, hi = v[v.length - 1] + 1, m = Stats.mean(v);
    svg.classList.add(`f-${concept("mean").family}`);
    const A = storyAxis(svg, lo, hi), layer = svgEl("g", {}, svg), pts = svgEl("g", {}, svg);
    let dots = [];
    return [
      // the readings arrive one at a time, in the order they were taken; a shade of grey for each distance from the mean
      () => { dots = S.values.map((x, i) => { const d = storyDot(pts, A.x(x), true, i * 160); if (x !== m) d.classList.add(`st-d${Math.min(Math.ceil(Math.abs(x - m)), 2)}`); return d; }); },
      // the sum is written, and the mean lands on the star
      () => {
        svgEl("text", { class: "st-sum", x: A.x(m), y: ST.TOP }, layer).textContent = sumText(S.values);
        meanMark(layer, A.x(m), S.values, ST.TOP + 44);
        storyStar(layer, A.x(m), ST.AX - 64);
      }
    ];
  },

  median(svg, S, later) {
    const v = Stats.sorted(S.values), lo = v[0] - 1, hi = v[v.length - 1] + 1, med = Stats.median(v);
    const [first, second] = S.outlier.to, oi = S.values.indexOf(S.outlier.from);
    svg.classList.add(`f-${concept("median").family}`, "st-numrow", "st-farhide");
    const A = storyAxis(svg, lo, hi, first), layer = svgEl("g", {}, svg), pts = svgEl("g", {}, svg);
    const vals = S.values.slice(), ROW = 62, X = k => A.x(lo + 1 + k);
    // the number line waits below; the readings stand in a row over it in the order they were taken, each value under its dot
    const dots = vals.map(x => { const d = storyDot(pts, 0, false, 0); svgEl("text", { class: "st-num", y: 40 }, d).textContent = x; return d; });
    const put = (i, x, y) => { dots[i].style.transform = `translate(${x}px, ${y}px)`; };
    dots.forEach((d, i) => put(i, X(i), ROW));
    const rank = () => vals.map((x, i) => [x, i]).sort((a, b) => a[0] - b[0] || a[1] - b[1]).map(p => p[1]);
    // the mean stands on the number line under the row (a mean needs no order); its working sits between the two
    const MT = 190;
    let mean;
    // the wild reading grows bolder each time and runs to the far end of the line; the mean's working follows it
    const grow = (to, cls) => {
      vals[oi] = to; A.far = to; A.farLab.textContent = to;
      $(".st-num", dots[oi]).textContent = to;
      dots[oi].classList.add(cls);
      put(oi, A.x(to), ROW);
      mean.set(A.x(Stats.mean(vals)), ...meanWork(vals));
    };
    return [
      // add them up and share them out: the mean
      () => { const [work, res] = meanWork(vals); mean = storyMark(layer, "mean", A.x(Stats.mean(vals)), work, MT, ST.AX, res); },
      // the storm: one reading turns wild and is pulled to the far end, past a break in the line
      () => { svg.classList.remove("st-farhide"); grow(first, "w1"); },
      // wilder still, and the mean runs after it
      () => grow(second, "w2"),
      // only now, in order, smallest to largest; then each falls onto its value on the line
      () => {
        rank().forEach((i, k) => { if (i !== oi) put(i, X(k), ROW); });
        later(900, () => dots.forEach((d, i) => { d.classList.add("down"); put(i, A.x(vals[i]), ST.AX - (i === oi ? 32 : 18)); }));
      },
      // the readings drop out in pairs from both ends; the one left is the median, on the star, with the mean far off
      () => {
        const order = rank(), n = order.length;
        for (let k = 0; k < Math.floor(n / 2); k++) later(k * 300, () => { dots[order[k]].classList.add("out"); dots[order[n - 1 - k]].classList.add("out"); });
        later(Math.floor(n / 2) * 300, () => {
          dots[order[(n - 1) / 2]].classList.add("hit");
          storyStar(layer, A.x(med), ST.AX - 64);
          storyMark(layer, "median", A.x(med), `${concept("median").label} = ${num(med)}`, 130, ST.AX - 84);
        });
      }
    ];
  },

  iqr(svg, S, later, chart) {
    svg.remove();
    const P = S.panel, v = S.values, n = v.length, h = (n - 1) / 2, i1 = (h - 1) / 2, i3 = n - 1 - i1, AX = 214;
    const [q1, q3] = Stats.quartiles(v), med = Stats.median(v), fam = concept("median").family;
    const D = drawStays(chart, v, { unit: S.unit, W: 1000, H: 290, AX, wall: "left", counts: false, scale: .8, left: 210,
      // room on the axis for mean ± 2 SD: up to 14 days, and past the wall to below 0
      extra: Array.from({ length: 14 - Math.max(...v.filter(x => x <= 14)) }, (_, k) => Math.max(...v.filter(x => x <= 14)) + 1 + k) });
    D.svg.classList.add("st-svg", "st-rowmode", `f-${fam}`);
    D.svg.setAttribute("aria-label", chart.closest(".slide").getAttribute("aria-label"));
    // rank[k] is the person with the kth shortest stay
    const rank = v.map((x, i) => [x, i]).sort((a, b) => a[0] - b[0] || a[1] - b[1]).map(p => p[1]);
    const gap = 840 / n, X = k => 80 + (k + .5) * gap, rowLayer = svgEl("g", { class: "st-rowlayer" }, D.back);
    svgEl("path", { class: "dp-axis st-floor", d: `M40 ${AX} H960` }, D.back);
    const rowAt = (i, k) => { D.dots[i].style.transform = `translate(${X(k)}px, ${AX - 2}px)`; };
    // the people stand evenly spaced in the order they were admitted, each with their stay over their head
    D.dots.forEach((d, i) => { rowAt(i, i); svgEl("text", { class: "st-num", y: -50 }, d).textContent = v[i]; });
    const who = k => D.dots[rank[k]];
    const box = (k0, k1, cls) => svgEl("rect", { class: cls, x: X(k0) - gap / 2 + 4, y: AX - 80, width: X(k1) - X(k0) + gap - 8, height: 88, rx: 14 }, rowLayer);
    let halves = [];
    // the chips shade one spread at a time once the graph is built; a click anywhere else clears them
    const tools = $(".st-tools", chart.parentNode), chips = $$(".cv-chip", tools), layer = svgEl("g", {}, D.back);
    let open = -1;
    const set = k => {
      open = k; layer.innerHTML = "";
      D.dots.forEach(d => d.classList.remove("out", "hit"));
      chips.forEach((c, i) => { c.classList.toggle("on", i === k); c.setAttribute("aria-pressed", String(i === k)); });
      tools.classList.toggle("open", k >= 0);
      if (k >= 0) shadeStays(D, P, layer, k);
    };
    chips.forEach((c, i) => { c.onclick = () => set(open === i ? -1 : i); });
    tools.clear = e => { if (open >= 0 && !e.target.closest(".cv-chip")) set(-1); };
    if (!tools.dataset.wired) { tools.dataset.wired = "1"; ClickAway.add(e => tools.clear && tools.clear(e)); }
    set(-1); tools.hidden = true;
    return [
      // in order, shortest stay to longest
      () => rank.forEach((i, k) => rowAt(i, k)),
      // the middle one is the median, with a half of five boxed on each side
      () => {
        who(h).classList.add("hit");
        storyMark(rowLayer, "median", X(h), `${concept("median").label} = ${num(med)}`, 70, AX - 76);
        halves = [box(0, h - 1, "st-half"), box(h + 1, n - 1, "st-half")];
      },
      // the middle of each half: the quartiles
      () => [[i1, "Q1", q1], [i3, "Q3", q3]].forEach(([k, name, q]) => {
        who(k).classList.add("q");
        storyMark(rowLayer, "median", X(k), `${name} = ${num(q)}`, 118, AX - 84).g.classList.add("st-q");
      }),
      // the box between the quartiles holds the middle half; the long stay sits outside it
      () => {
        halves.forEach(b => b.classList.add("st-gone"));
        box(i1, i3, "st-box");
        svgEl("text", { class: "st-boxlab", x: X(h), y: AX + 46 }, rowLayer).textContent = `IQR ${num(q1)} to ${num(q3)} ${S.unit}`;
        svgEl("text", { class: "st-sum st-iqsum", x: X(h), y: 26 }, rowLayer).textContent = `${concept("median").label} ${num(med)} (IQR ${num(q1)}–${num(q3)})`;
        const far = who(n - 1); far.classList.remove("pulse"); void far.getBBox(); far.classList.add("pulse");
      },
      // the same people step onto their days and stack up, and the curve they make is drawn over them
      () => {
        rowLayer.classList.add("st-gone");
        D.dots.forEach(d => d.classList.remove("hit", "q"));
        D.svg.classList.remove("st-rowmode");
        D.place(v);
        later(700, () => { dressStays(D, P, AX); tools.hidden = false; });
      }
    ];
  },

  sampling(svg, S, later, chart) {
    svg.remove();
    const G = Sampling.G, pop = S.population, N = G.SAMPLES;
    const root = svgEl("svg", { class: "st-svg sp-svg", viewBox: `0 0 ${G.W} ${G.H}`, role: "img", "aria-label": chart.closest(".slide").getAttribute("aria-label") }, chart);
    const F = Sampling.draw(root, S), x = F.x, M = Sampling.dist(pop, S.n), se = M.sd, bin = se / 2;
    // the means of N samples, at the quantiles of their distribution, dealt in a fixed shuffled order
    let seed = 7;
    const rand = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    const means = Array.from({ length: N }, (_, i) => M.q((i + .5) / N));
    for (let i = N - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [means[i], means[j]] = [means[j], means[i]]; }
    // each mean drops into a bin half an SEM wide; each sample is 100 / N % of them
    const binPx = x(pop.mean + bin) - x(pop.mean), step = Math.min(binPx * .96, 18), r = step * .46;
    F.yAxis(step * N / 100, [0, 10, 20]);
    const dotsLayer = svgEl("g", {}, F.bottom), labels = svgEl("g", {}, F.bottom), stacks = new Map();
    let many = false;  // once the many samples start, a late label from an earlier one stays away
    const drop = (i, label) => {
      const v = means[i], b = Math.round((v - pop.mean) / bin), c = stacks.get(b) || 0;
      stacks.set(b, c + 1);
      const cx = x(pop.mean + b * bin), cy = G.B2 - (c + .5) * step;
      const g = svgEl("g", { class: "sp-dot", style: `transform:translate(${cx}px, ${G.B1}px)` }, dotsLayer);
      svgEl("circle", { r }, g);
      void g.getBoundingClientRect();
      g.style.transform = `translate(${cx}px, ${cy}px)`;
      if (label) later(400, () => { if (many) return; labels.innerHTML = ""; svgEl("text", { class: "sp-mlab", x: cx, y: cy - 16 }, labels).textContent = num(Math.round(v * 10) / 10); });
    };
    // a sample: a few of the crowd light up, standing in for the n picked, and their mean drops to the axis below
    const pick = () => {
      F.crowd.forEach(p => p.classList.remove("sp-pick"));
      const idx = F.crowd.map((_, i) => i);
      for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
      idx.slice(0, 7).forEach(i => F.crowd[i].classList.add("sp-pick"));
    };
    const sample = i => { labels.innerHTML = ""; pick(); later(100, () => drop(i, true)); };
    return [
      () => sample(0),
      () => sample(1),
      // many more samples: their means pile up
      () => {
        many = true; labels.innerHTML = "";
        F.crowd.forEach(p => p.classList.remove("sp-pick"));
        for (let i = 2; i < N; i++) later((i - 2) * 55, () => drop(i));
      },
      // the curve the means make, and its half-width: the standard error, worked out
      () => {
        const y = fv => G.B2 - fv * bin * N * step, a = Math.max(F.lo + .02, pop.mean - 4.5 * se), b = Math.min(F.hi, pop.mean + 4.5 * se);
        const d = curvePath(M.f, a, b, x, y, 200), g = svgEl("g", { class: "sp-curve" }, F.bottom);
        svgEl("path", { class: "cv-area", d: `${d} L${x(b)} ${G.B2} L${x(a)} ${G.B2} Z` }, g);
        svgEl("path", { class: "cv-line", d, pathLength: 1 }, g);
        Sampling.width(g, "sem", x(pop.mean), x(pop.mean + se), y(M.f(pop.mean + se)),
          `${concept("sem").label} = ${Sampling.fmt(pop.sd)} ÷ √${S.n} = ${Sampling.fmt(se)} ${Sampling.unit(se, S.unit)}`);
      }
    ];
  },

  mode(svg, S, later, chart) {
    const expand = counts => Object.entries(counts).flatMap(([k, c]) => Array(c).fill(k));
    const sizes = expand(S.counts).map(Number), m = Stats.mean(sizes), mo = Stats.mode(sizes);
    svg.remove();
    const D = drawStays(chart, sizes, { unit: S.unit, W: ST.W, H: ST.H, AX: ST.AX, scale: .85, breaks: false });
    D.svg.classList.add("st-svg", "st-wait", `f-${concept("mode").family}`);
    D.svg.setAttribute("aria-label", chart.closest(".slide").getAttribute("aria-label"));
    D.dots.forEach((d, i) => { const p = $(".cv-person", d); if (p) p.style.animationDelay = `${REDUCED_MOTION ? 0 : i * 70}ms`; });
    let mean, shoe, B;
    return [
      // the customers arrive, each standing on their size
      () => D.svg.classList.remove("st-wait"),
      // the mean is a size nobody can buy
      () => {
        mean = meanMark(D.marks, D.x(m), sizes, ST.TOP);
        shoe = svgEl("g", { class: "st-shoe", transform: `translate(${D.x(m) + 200} 4)` }, D.marks);
        svgEl("path", { d: "M0 26 V6 Q0 0 6 0 H22 L32 12 Q50 14 58 18 Q66 22 66 28 V32 H0 Z" }, shoe);
        svgEl("text", { x: 33, y: 58 }, shoe).textContent = num(m);
        svgEl("path", { class: "st-x", d: "M-4 -4 L70 40 M70 -4 L-4 40" }, shoe);
      },
      // the size most people wear
      () => {
        mean.g.classList.add("st-gone"); shoe.classList.add("st-gone");
        D.dots.forEach(d => d.classList.add(+d.dataset.v === mo ? "hit" : "out"));
        storyMark(D.marks, "mode", D.x(mo), `${concept("mode").label} = ${mo}`, ST.TOP);
      },
      // blood groups: words, not numbers; only the mode makes sense
      () => {
        D.svg.classList.add("st-gone");
        const names = Object.keys(S.categories), groups = expand(S.categories).map(g => names.indexOf(g) + 1);
        B = drawStays(chart, groups, { unit: S.categories_unit, W: ST.W, H: ST.H, AX: ST.AX, scale: .85, breaks: false });
        B.svg.classList.add("st-svg", "st-next", `f-${concept("mode").family}`);
        B.svg.setAttribute("aria-label", D.svg.getAttribute("aria-label"));
        $$(".dp-tlab", B.svg).forEach(t => { t.textContent = names[+t.textContent - 1]; });
        const top = Stats.mode(groups);
        B.dots.forEach(d => d.classList.add(+d.dataset.v === top ? "hit" : "out"));
        ["mean", "median"].forEach((k, i) => {
          const g = svgEl("g", { class: "st-no", transform: `translate(${60 + i * 150} ${ST.TOP})` }, B.marks);
          const t = svgEl("text", { x: 0, y: 0 }, g); t.textContent = concept(k).label;
          svgEl("path", { d: `M-4 -9 H${k === "mean" ? 74 : 104}` }, g);
        });
        storyMark(B.marks, "mode", B.x(top), `${concept("mode").label} = ${names[top - 1]}`, ST.TOP);
      }
    ];
  }
};

function buildStories() {
  $$(".story").forEach(sb => {
    const S = JSON.parse(sb.dataset.story), chart = $(".st-chart", sb), scene = $(".st-scene", sb);
    let beats = [], beat = 0, timers = [], replay = null, buttons = () => {};
    const base = S.start || 0;
    // while replaying to a step, the timers run at once, in the order they would have fired
    const later = (ms, f) => {
      if (replay) replay.q.push({ t: replay.now + ms, n: replay.n++, f });
      else timers.push(setTimeout(f, REDUCED_MOTION ? 0 : ms));
    };
    const setScene = () => {
      if (!scene) return;
      $$("[data-beat]", scene).forEach(g => g.classList.toggle("st-on", beat >= +g.dataset.beat));
      $$("[data-until]", scene).forEach(g => g.classList.toggle("st-off", beat >= +g.dataset.until));
    };
    const stepper = on => {
      chart.classList.toggle("stepper", on);
      if (on) Object.entries({ role: "button", tabindex: "0", "aria-label": "Show the next part" }).forEach(([k, v]) => chart.setAttribute(k, v));
      else ["role", "tabindex", "aria-label"].forEach(k => chart.removeAttribute(k));
    };
    const start = () => {
      timers.forEach(clearTimeout); timers = [];
      [...chart.children].forEach(c => { if (!c.classList.contains("step-ctl")) c.remove(); });
      beat = 0;
      const svg = svgEl("svg", { class: "st-svg", viewBox: `0 0 ${ST.W} ${ST.H}`, role: "img", "aria-label": sb.closest(".slide").getAttribute("aria-label") }, chart);
      beats = STORIES[S.kind](svg, S, later, chart);
      // a story can open on its first beats already shown (`start`); Back stops there
      while (beat < base) beats[beat++]();
      setScene(); stepper(beat < beats.length); buttons(false, beat < beats.length);
    };
    const next = () => {
      if (beat >= beats.length) return;
      beats[beat++]();
      setScene();
      if (beat >= beats.length) stepper(false);
      buttons(beat > base, beat < beats.length);
    };
    // one step back: the story is built again, at once, up to the step before
    const back = () => {
      if (beat <= base) return;
      const k = beat - 1;
      start();
      replay = { now: 0, n: 0, q: [] };
      while (beat < k) {
        beats[beat++]();
        while (replay.q.length) {
          replay.q.sort((a, b) => a.t - b.t || a.n - b.n);
          const job = replay.q.shift(); replay.now = job.t; job.f();
        }
      }
      replay = null;
      setScene(); stepper(beat < beats.length); buttons(beat > base, beat < beats.length);
      sb.getAnimations({ subtree: true }).forEach(a => { try { a.finish(); } catch (err) {} });
    };
    buttons = stepButtons(chart, back, next);
    chart.addEventListener("click", next);
    chart.addEventListener("keydown", e => { if ((e.key === "Enter" || e.key === " ") && chart.classList.contains("stepper")) { e.preventDefault(); next(); } });
    onEnter(sb, start);
    start();
  });
}
