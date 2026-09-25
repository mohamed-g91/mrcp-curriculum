/* ---------- story: a scene beside one figure that builds a beat per tap ----------
   The story itself is told in the video; the slide shows only the figure. Each kind draws its own
   beats from the slide's numbers, and works every sum out itself:
   mean    readings drop onto a line, greyer the further from the mean; their sum is written and the mean lands on the star
   median  the same readings, one flies off and then further, the mean follows it, the median stays on the star
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

// a measure's marker: a dashed line up from the axis, its working written at the top
function storyMark(parent, key, x, text, top = ST.TOP, foot = ST.AX) {
  const g = svgEl("g", { class: `dp-mk st-mk f-${concept(key).family}`, style: `transform:translateX(${x}px)` }, parent);
  svgEl("path", { d: `M0 ${foot} V${top + 12}` }, g);
  const t = svgEl("text", { y: top }, g); t.textContent = text;
  return { g, set(x2, text2) { g.style.transform = `translateX(${x2}px)`; if (text2) t.textContent = text2; } };
}

// the answer on a gold pill, the star's colour, after a marker's working
function storyResult(mark, text) {
  const t = $("text", mark.g), y = +t.getAttribute("y"), w = t.getComputedTextLength(), pw = 30 + 16 * text.length, gap = 12;
  const left = -(w + gap + pw) / 2;
  t.setAttribute("x", left + w / 2);
  const g = svgEl("g", { class: "st-res" }, mark.g);
  svgEl("rect", { x: left + w + gap, y: y - 33, width: pw, height: 44, rx: 22 }, g);
  svgEl("text", { x: left + w + gap + pw / 2, y }, g).textContent = text;
  return g;
}

function storyStar(parent, x, y) {
  const p = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 8 : 18; p.push(`${(x + r * Math.cos(a)).toFixed(1)} ${(y + r * Math.sin(a)).toFixed(1)}`); }
  return svgEl("path", { class: "st-star", d: `M${p.join(" L")} Z` }, parent);
}

const sumText = v => `${v.join(" + ")} = ${Stats.sum(v)}`;
const meanText = (key, v) => `${concept(key).label} = ${Stats.sum(v)} ÷ ${v.length} = ${num(Stats.mean(v))}`;

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
        storyResult(storyMark(layer, "mean", A.x(m), `${concept("mean").label} = ${Stats.sum(S.values)} ÷ ${S.values.length} =`, ST.TOP + 44), num(m));
        storyStar(layer, A.x(m), ST.AX - 64);
      }
    ];
  },

  median(svg, S, later) {
    const v = Stats.sorted(S.values), lo = v[0] - 1, hi = v[v.length - 1] + 1, med = Stats.median(v);
    const [first, second] = S.outlier.to, oi = S.values.indexOf(S.outlier.from);
    svg.classList.add(`f-${concept("median").family}`);
    const A = storyAxis(svg, lo, hi, first), layer = svgEl("g", {}, svg), pts = svgEl("g", {}, svg);
    const vals = S.values.slice();
    storyStar(layer, A.x(med), ST.AX - 64);
    const dots = vals.map(x => storyDot(pts, A.x(x), false, 0));
    const mean = storyMark(layer, "mean", A.x(Stats.mean(vals)), `${concept("mean").label} = ${num(Stats.mean(vals))}`);
    return [
      // one wild reading: the dot flies past the break, and the mean follows it
      () => {
        vals[oi] = first;
        A.farLab.textContent = first;
        dots[oi].style.transform = `translate(${A.x(first)}px, ${ST.AX - 18}px)`;
        later(500, () => mean.set(A.x(Stats.mean(vals)), meanText("mean", vals)));
      },
      // make the wild reading wilder: the mean runs off
      () => {
        vals[oi] = second; A.far = second;
        A.farLab.textContent = second;
        dots[oi].classList.remove("pulse"); void dots[oi].getBBox(); dots[oi].classList.add("pulse");
        mean.set(A.x(Stats.mean(vals)), meanText("mean", vals));
      },
      // in order, the readings drop out in pairs from both ends; the one left is the median, on the star
      () => {
        const order = vals.map((x, i) => [x, i]).sort((a, b) => a[0] - b[0]).map(p => p[1]), n = order.length;
        for (let k = 0; k < Math.floor(n / 2); k++) later(k * 300, () => { dots[order[k]].classList.add("out"); dots[order[n - 1 - k]].classList.add("out"); });
        later(Math.floor(n / 2) * 300, () => {
          dots[order[(n - 1) / 2]].classList.add("hit");
          storyMark(layer, "median", A.x(med), `${concept("median").label} = ${num(med)}`, ST.TOP + 64, ST.AX - 34);
        });
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
        mean = storyMark(D.marks, "mean", D.x(m), meanText("mean", sizes), ST.TOP);
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
