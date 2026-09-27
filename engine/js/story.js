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
           then the same question for blood groups, where only the mode makes sense */
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

const STORIES = {
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
      setScene(); stepper(true); buttons(false, true);
    };
    const next = () => {
      if (beat >= beats.length) return;
      beats[beat++]();
      setScene();
      if (beat >= beats.length) stepper(false);
      buttons(true, beat < beats.length);
    };
    // one step back: the story is built again, at once, up to the step before
    const back = () => {
      if (!beat) return;
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
      setScene(); stepper(beat < beats.length); buttons(beat > 0, beat < beats.length);
      sb.getAnimations({ subtree: true }).forEach(a => { try { a.finish(); } catch (err) {} });
    };
    buttons = stepButtons(chart, back, next);
    chart.addEventListener("click", next);
    chart.addEventListener("keydown", e => { if ((e.key === "Enter" || e.key === " ") && chart.classList.contains("stepper")) { e.preventDefault(); next(); } });
    onEnter(sb, start);
    start();
  });
}
