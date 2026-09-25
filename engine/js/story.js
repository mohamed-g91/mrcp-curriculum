/* ---------- story: a scene beside one figure that builds a beat per tap ----------
   The story itself is told in the video; the slide shows only the figure. Each kind draws its own
   beats from the slide's numbers, and works every sum out itself:
   mean    readings drop onto a line, greyer the further from the mean; their sum is written and the mean lands on the star
   median  the same readings in a row as they were taken; the mean is worked out, one reading grows wild and then
           wilder and the mean follows it; then they line up in order, pairs drop out to leave the median, and all
           of them step onto the line, the median on the star and the mean far off
   iqr     the ward's stays in a row line up in order; the middle one is the median, with a half boxed on each
           side; the middle of each half is a quartile; a box between the quartiles holds the middle half; then
           the same people stack on their days under their curve, with a chip per spread
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
  svgEl("path", { class: "dp-axis", d: far != null ? `M${L - 8} ${ST.AX} H${endMain + 6} M${endMain + BR - 6} ${ST.AX} H${ST.W - R + 8}` : `M${L - 8} ${ST.AX} H${ST.W - R + 8}` }, svg);
  if (far != null) svgEl("path", { class: "dp-break", d: `M${endMain + 18} ${ST.AX + 10} l9 -20 M${endMain + 32} ${ST.AX + 10} l9 -20` }, svg);
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
    svg.classList.add(`f-${concept("median").family}`, "st-rowmode");
    const A = storyAxis(svg, lo, hi, first), layer = svgEl("g", {}, svg), pts = svgEl("g", {}, svg);
    const vals = S.values.slice();
    // first a row above the line, each reading wearing its value, in the order the readings were taken
    const ROW = ST.AX - 130, X = k => A.x(lo + 1 + k), rowAt = (i, k) => { dots[i].style.transform = `translate(${X(k)}px, ${ROW}px)`; };
    const dots = vals.map((x, i) => { const d = storyDot(pts, 0, false, 0); svgEl("text", { class: "st-num", y: -24 }, d).textContent = x; return d; });
    dots.forEach((d, i) => rowAt(i, i));
    const rank = () => vals.map((x, i) => [x, i]).sort((a, b) => a[0] - b[0] || a[1] - b[1]).map(p => p[1]);
    // the wild reading grows: its value changes over its head, and the mean's working follows
    const grow = to => {
      vals[oi] = to;
      $(".st-num", dots[oi]).textContent = to;
      dots[oi].classList.remove("pulse"); void dots[oi].getBBox(); dots[oi].classList.add("pulse");
      mean.set(X(2), ...meanWork(vals));
    };
    let mean, median;
    return [
      // the mean needs no order: add them up and share them out
      () => { mean = storyMark(layer, "mean", X(2), ...meanWork(vals).slice(0, 1), ST.TOP, ST.TOP + 12, meanWork(vals)[1]); },
      // one wild reading, then a wilder one: the mean runs off each time
      () => grow(first),
      () => grow(second),
      // in order, smallest to largest: the step that comes before any median
      () => rank().forEach((i, k) => rowAt(i, k)),
      // the readings drop out in pairs from both ends; the one left is the median
      () => {
        const order = rank(), n = order.length;
        for (let k = 0; k < Math.floor(n / 2); k++) later(k * 300, () => { dots[order[k]].classList.add("out"); dots[order[n - 1 - k]].classList.add("out"); });
        later(Math.floor(n / 2) * 300, () => {
          dots[order[(n - 1) / 2]].classList.add("hit");
          median = storyMark(layer, "median", X((n - 1) / 2), `${concept("median").label} = ${num(med)}`, ST.TOP + 64, ST.TOP + 76);
        });
      },
      // onto the number line: the median stands on the star, and the mean is far off with the wild reading
      () => {
        svg.classList.remove("st-rowmode");
        A.far = second; A.farLab.textContent = second;
        dots.forEach((d, i) => { d.classList.remove("out"); d.style.transform = `translate(${A.x(vals[i])}px, ${ST.AX - 18}px)`; });
        layer.innerHTML = "";
        storyStar(layer, A.x(med), ST.AX - 64).style.animationDelay = ".6s";
        const [work, res] = meanWork(vals);
        storyMark(layer, "mean", A.x(Stats.mean(vals)), work, ST.TOP, ST.AX, res).g.style.animationDelay = ".6s";
        storyMark(layer, "median", A.x(med), `${concept("median").label} = ${num(med)}`, ST.TOP + 64, ST.AX - 34).g.style.animationDelay = ".6s";
      }
    ];
  },

  iqr(svg, S, later, chart) {
    svg.remove();
    const P = S.panel, v = S.values, n = v.length, h = (n - 1) / 2, i1 = (h - 1) / 2, i3 = n - 1 - i1, AX = 214;
    const [q1, q3] = Stats.quartiles(v), med = Stats.median(v), fam = concept("median").family;
    const D = drawStays(chart, v, { unit: S.unit, W: 1000, H: 290, AX, wall: "left", counts: false, scale: .8, left: 130 });
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
    let beats = [], beat = 0, timers = [];
    const later = (ms, f) => timers.push(setTimeout(f, REDUCED_MOTION ? 0 : ms));
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
      chart.innerHTML = ""; beat = 0;
      const svg = svgEl("svg", { class: "st-svg", viewBox: `0 0 ${ST.W} ${ST.H}`, role: "img", "aria-label": sb.closest(".slide").getAttribute("aria-label") }, chart);
      beats = STORIES[S.kind](svg, S, later, chart);
      setScene(); stepper(true);
    };
    const next = () => {
      if (beat >= beats.length) return;
      beats[beat++]();
      setScene();
      if (beat >= beats.length) stepper(false);
    };
    chart.addEventListener("click", next);
    chart.addEventListener("keydown", e => { if ((e.key === "Enter" || e.key === " ") && chart.classList.contains("stepper")) { e.preventDefault(); next(); } });
    // a click anywhere else starts the story again
    ClickAway.add(e => { if (beat && sb.closest(".slide").classList.contains("active") && !e.target.closest(".story")) start(); });
    onEnter(sb, start);
    start();
  });
}
