/* ---------- small statistics and SVG helpers (dot plot and curve) ---------- */
const SVGNS = "http://www.w3.org/2000/svg";
const svgEl = (tag, attrs = {}, parent) => {
  const n = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  if (parent) parent.appendChild(n);
  return n;
};
const Stats = {
  sorted: v => [...v].sort((a, b) => a - b),
  sum: v => v.reduce((a, b) => a + b, 0),
  mean: v => Stats.sum(v) / v.length,
  median(v) { const s = Stats.sorted(v), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; },
  mode(v) {
    const c = new Map(); v.forEach(x => c.set(x, (c.get(x) || 0) + 1));
    const top = Math.max(...c.values());
    return Math.min(...[...c].filter(([, k]) => k === top).map(([x]) => x));
  },
  // quartiles as the medians of the lower and upper halves (the middle value left out when n is odd)
  quartiles(v) { const s = Stats.sorted(v), h = Math.floor(s.length / 2); return [Stats.median(s.slice(0, h)), Stats.median(s.slice(s.length - h))]; },
  sd(v) { const m = Stats.mean(v); return Math.sqrt(Stats.sum(v.map(x => (x - m) ** 2)) / (v.length - 1)); }
};
const num = x => Number.isInteger(x) ? String(x) : x.toFixed(1);
const ORD = n => n + (n % 10 === 1 && n % 100 !== 11 ? "st" : n % 10 === 2 && n % 100 !== 12 ? "nd" : n % 10 === 3 && n % 100 !== 13 ? "rd" : "th");

// one person, standing with their feet at (x, y): a head and a rounded body, in one of a few skin tones
const SKIN = ["#B97A50", "#E3B58E", "#8A5A3B", "#F1CBA7"];
function drawPerson(parent, x, y, k, delay, scale = 1) {
  const at = svgEl("g", { transform: `translate(${x} ${y}) scale(${scale})` }, parent);
  const g = svgEl("g", { class: "cv-person", style: `animation-delay:${delay}ms` }, at);
  svgEl("path", { class: "cv-body", d: "M-13 -2 V-14 A13 11 0 0 1 13 -14 V-2 Z" }, g);
  svgEl("circle", { class: "cv-head", cx: 0, cy: -31, r: 9, fill: SKIN[k % SKIN.length] }, g);
  return at;
}

/* ---------- stays chart ----------
   One person per value on a real axis. Every whole number in the main run of values has its own slot;
   a far-out value (a long stay, a very early birth) sits past a break in the axis. With row, people
   who share a value stand shoulder to shoulder, so the whole group reads in order left to right;
   otherwise they stack on their value with the count on top. x(v) places any value between the slots. */
function drawStays(host, values, o) {
  const { unit = "", W = 1000, H = 266, AX = 176, scale = 1, extra = [], wall = null, row = false, counts: showCounts = !row } = o;
  const all = Stats.sorted([...new Set([...values, ...extra])]);
  // the main run: the biggest group of values with no gap of more than 3 between neighbours
  const runs = [[all[0]]];
  all.slice(1).forEach(v => v - runs[runs.length - 1].slice(-1)[0] <= 3 ? runs[runs.length - 1].push(v) : runs.push([v]));
  const run = o.breaks === false ? all : runs.reduce((a, b) => b.length > a.length ? b : a);
  const main = []; for (let d = run[0]; d <= run[run.length - 1]; d++) main.push(d);
  const pre = all.filter(v => v < run[0]), post = all.filter(v => v > run[run.length - 1]);
  const L = wall === "left" ? 70 : 40, R = wall === "right" ? 70 : 40, BR = 64;
  const sw = (W - L - R - (pre.length ? BR : 0) - (post.length ? BR : 0)) / (pre.length + main.length + post.length);
  const slotX = new Map();
  let at = L;
  pre.forEach(d => { slotX.set(d, at + sw / 2); at += sw; });
  const endPreBrk = at; if (pre.length) at += BR;
  const startMain = at;
  main.forEach(d => { slotX.set(d, at + sw / 2); at += sw; });
  const endMain = at; if (post.length) at += BR;
  post.forEach(d => { slotX.set(d, at + sw / 2); at += sw; });
  const keys = [...slotX.keys()].sort((a, b) => a - b);
  const x = v => {
    if (slotX.has(v)) return slotX.get(v);
    if (v < keys[0]) return slotX.get(keys[0]) - (keys[0] - v) * sw;
    if (v > keys[keys.length - 1]) return slotX.get(keys[keys.length - 1]) + (v - keys[keys.length - 1]) * sw;
    const hi = keys.find(k => k > v), lo = keys[keys.indexOf(hi) - 1];
    return slotX.get(lo) + (v - lo) / (hi - lo) * (slotX.get(hi) - slotX.get(lo));
  };
  const svg = svgEl("svg", { class: "dp-svg", viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": `${values.length} patients by ${unit} in hospital` });
  const back = svgEl("g", { class: "dp-back" }, svg);
  const marks = svgEl("g", { class: "dp-marks" }, svg);
  // the axis in pieces, with a break (//) wherever a far-out value was set apart
  const pieces = [[pre.length ? startMain - 6 : L - 8, post.length ? endMain + 6 : W - R + 8]];
  if (pre.length) pieces.push([L - 8, endPreBrk + 6]);
  if (post.length) pieces.push([endMain + BR - 6, W - R + 8]);
  svgEl("path", { class: "dp-axis", d: pieces.map(p => `M${p[0]} ${AX} H${p[1]}`).join(" ") }, svg);
  const brk = x0 => svgEl("path", { class: "dp-break", d: `M${x0 + 18} ${AX + 10} l9 -20 M${x0 + 32} ${AX + 10} l9 -20` }, svg);
  if (pre.length) brk(endPreBrk);
  if (post.length) brk(endMain);
  const fs = Math.max(16, 22 * scale ** .5);
  keys.forEach(d => { const t = svgEl("text", { class: "dp-tlab", x: slotX.get(d), y: AX + fs + 24, style: `font-size:${fs}px` }, svg); t.textContent = d; });
  if (unit) { const t = svgEl("text", { class: "dp-unit", x: (L + W - R) / 2, y: AX + 2 * fs + 30, style: `font-size:${fs * .9}px` }, svg); t.textContent = unit; }
  const fulcrum = svgEl("path", { class: "dp-fulcrum", d: "M0 0 l-11 18 h22 z" }, svg);
  const counts = !showCounts ? new Map() : new Map(keys.map(d => [d, svgEl("text", { class: "dp-count", x: slotX.get(d), style: `font-size:${fs}px` }, svg)]));
  const STEP = 44 * scale, PW = 29 * scale;
  const dots = values.map((v, i) => {
    const g = svgEl("g", { class: "dp-pt", "data-i": i }, svg);
    drawPerson(g, 0, 0, i, 0, scale);
    return g;
  });
  const place = vals => {
    const seen = new Map(), n = new Map();
    vals.forEach(v => n.set(v, (n.get(v) || 0) + 1));
    vals.forEach((v, i) => {
      const k = seen.get(v) || 0; seen.set(v, k + 1);
      const px = row ? x(v) + (k - (n.get(v) - 1) / 2) * PW : x(v), py = row ? AX - 2 : AX - 2 - k * STEP;
      dots[i].style.transform = `translate(${px}px, ${py}px)`;
      Object.assign(dots[i].dataset, { v, x: px, y: py });
    });
    counts.forEach((t, d) => { const c = seen.get(d) || 0; t.textContent = c || ""; t.setAttribute("y", AX - 2 - c * STEP - 6 * scale); });
  };
  place(values);
  host.appendChild(svg);
  return { svg, back, marks, dots, fulcrum, place, x, AX, sw, STEP, PW, top: 20 };
}

function buildDotPlots() {
  $$(".dotplot").forEach(dp => {
    const base = dp.dataset.values.split(",").map(Number), unit = dp.dataset.unit;
    const swap = dp.dataset.swap ? dp.dataset.swap.split(",").map(Number) : null;
    const D = drawStays($(".dp-chart", dp), base, { unit, extra: swap ? [swap[1]] : [], row: true });
    const stops = $$(".dp-m", dp);
    const swapIdx = swap ? base.indexOf(swap[0]) : -1;
    let vals = base.slice(), open = null, timers = [];
    if (swapIdx >= 0) {
      const d = D.dots[swapIdx];
      Object.assign(d, { tabIndex: 0 });
      d.setAttribute("class", "dp-pt dp-swap");
      d.insertBefore(svgEl("rect", { class: "dp-ring", x: -24, y: -48, width: 48, height: 54, rx: 14 }), d.firstChild);
      d.setAttribute("role", "button");
      d.setAttribute("aria-label", `Move the ${swap[0]} to ${swap[1]}`);
    }
    const later = (ms, f) => timers.push(setTimeout(f, REDUCED_MOTION ? 0 : ms));
    const clearDots = () => D.dots.forEach(d => d.classList.remove("out", "hit", "sum"));
    const show = (key, instant) => {
      timers.forEach(clearTimeout); timers = [];
      open = key;
      stops.forEach(s => { s.classList.toggle("on", s.dataset.key === key); $(".spec-dot", s).setAttribute("aria-expanded", String(s.dataset.key === key)); });
      clearDots();
      D.svg.setAttribute("class", "dp-svg" + (key ? ` f-${concept(key).family}` : ""));
      D.marks.innerHTML = "";
      D.fulcrum.classList.remove("on");
      if (!key) return;
      const c = concept(key), fam = `f-${c.family}`;
      // each measure's working is written on its marker: 66 ÷ 11 = 6, the 6th of 11, 2 three times
      const mark = (v, text, delay, foot = D.AX) => {
        const g = svgEl("g", { class: `dp-mk ${fam}`, style: `transform:translateX(${v}px);animation-delay:${REDUCED_MOTION || instant ? 0 : delay}ms` }, D.marks);
        svgEl("path", { d: `M0 ${D.AX} V${D.top + 12}` }, g);
        svgEl("text", { y: D.top }, g).textContent = text;
      };
      if (key === "mean") {
        const s = Stats.sum(vals), m = Stats.mean(vals);
        D.dots.forEach(d => d.classList.add("sum"));
        later(instant ? 0 : 650, () => {
          D.fulcrum.style.transform = `translate(${D.x(m)}px, ${D.AX + 3}px)`;
          D.fulcrum.classList.add("on");
          mark(D.x(m), `${c.letter} = ${s} ÷ ${vals.length} = ${num(m)}`, 250);
        });
      }
      if (key === "median") {
        // people drop out in pairs from both ends until one is left; a box then holds each half
        const order = vals.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0] || a[1] - b[1]).map(p => p[1]);
        const n = order.length, h = Math.floor(n / 2), mid = (n - 1) / 2;
        for (let k = 0; k < h; k++) later(instant ? 0 : 150 + k * 190, () => { D.dots[order[k]].classList.add("out"); D.dots[order[n - 1 - k]].classList.add("out"); });
        later(instant ? 0 : 150 + h * 190, () => {
          [order.slice(0, h), order.slice(n - h)].forEach(half => {
            const xs = half.map(i => +D.dots[i].dataset.x), a = Math.min(...xs) - D.PW / 2 - 8, b = Math.max(...xs) + D.PW / 2 + 8;
            const g = svgEl("g", { class: "dp-half" }, D.marks);
            svgEl("rect", { x: a, y: D.AX - 62, width: b - a, height: 70, rx: 12 }, g);
            svgEl("text", { x: (a + b) / 2, y: D.AX - 74 }, g).textContent = h;
          });
          if (Number.isInteger(mid)) D.dots[order[mid]].classList.add("hit");
          const mx = Number.isInteger(mid) ? +D.dots[order[mid]].dataset.x : D.x(Stats.median(vals));
          mark(mx, `${c.letter} = ${num(Stats.median(vals))}`, 0, D.AX - 54);
        });
      }
      if (key === "mode") {
        const m = Stats.mode(vals), k = vals.filter(v => v === m).length;
        D.dots.forEach(d => d.classList.add(+d.dataset.v === m ? "hit" : "out"));
        mark(D.x(m), `${c.letter} = ${m}  ×${k}`, 200);
      }
    };
    const setSwap = on => {
      vals = base.slice();
      if (on) vals[swapIdx] = swap[1];
      if (swapIdx >= 0) D.dots[swapIdx].classList.toggle("moved", on);
      D.place(vals);
    };
    stops.forEach(s => $(".spec-dot", s).addEventListener("click", () => show(open === s.dataset.key ? null : s.dataset.key)));
    if (swapIdx >= 0) {
      const d = D.dots[swapIdx];
      const flip = () => { setSwap(!d.classList.contains("moved")); if (open) show(open, true); };
      d.addEventListener("click", flip);
      d.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); } });
    }
    const reset = () => { setSwap(false); show(null); };
    ClickAway.add(e => { if (dp.closest(".slide").contains(e.target) && e.target.closest(".dp-m .spec-dot, .dp-swap")) return; if (open || (swapIdx >= 0 && D.dots[swapIdx].classList.contains("moved"))) reset(); });
    onEnter(dp, reset);
    reset();
  });
}
