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
   How many patients stayed each number of days: one person per patient, stacked on their day, with
   the count on top. Every day from 1 to the last short stay has its own slot; a far-out value (a
   long stay) sits after a break in the axis. x(v) places any value, such as a mean, between the slots. */
function drawStays(host, values, o) {
  const { unit = "", W = 1000, H = 266, AX = 176, scale = 1, extra = [], wall = false } = o;
  const all = Stats.sorted([...new Set([...values, ...extra])]);
  // short stays run on from day 1; anything more than 3 days past the last of them goes after a break
  let lastPre = all[0];
  for (const v of all) if (v <= lastPre + 3) lastPre = Math.max(lastPre, v);
  const pre = []; for (let d = Math.min(1, all[0]); d <= lastPre; d++) pre.push(d);
  const post = all.filter(v => v > lastPre);
  const L = wall ? 70 : 40, R = 40, BR = post.length ? 64 : 0;
  const sw = (W - L - R - BR) / (pre.length + post.length);
  const slotX = new Map();
  pre.forEach((d, i) => slotX.set(d, L + sw * (i + .5)));
  post.forEach((d, i) => slotX.set(d, L + BR + sw * (pre.length + i + .5)));
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
  const endPre = slotX.get(lastPre) + sw / 2;
  svgEl("path", { class: "dp-axis", d: `M${L - 8} ${AX} H${endPre + 6}` + (post.length ? ` M${endPre + BR - 6} ${AX} H${W - R + 8}` : "") }, svg);
  if (post.length) svgEl("path", { class: "dp-break", d: `M${endPre + 18} ${AX + 10} l9 -20 M${endPre + 32} ${AX + 10} l9 -20` }, svg);
  const fs = Math.max(16, 22 * scale ** .5);
  keys.forEach(d => { const t = svgEl("text", { class: "dp-tlab", x: slotX.get(d), y: AX + fs + 24, style: `font-size:${fs}px` }, svg); t.textContent = d; });
  if (unit) { const t = svgEl("text", { class: "dp-unit", x: (L + W - R) / 2, y: AX + 2 * fs + 30, style: `font-size:${fs * .9}px` }, svg); t.textContent = unit; }
  const fulcrum = svgEl("path", { class: "dp-fulcrum", d: "M0 0 l-11 18 h22 z" }, svg);
  const counts = new Map(keys.map(d => [d, svgEl("text", { class: "dp-count", x: slotX.get(d), style: `font-size:${fs}px` }, svg)]));
  const STEP = 44 * scale;
  const dots = values.map((v, i) => {
    const g = svgEl("g", { class: "dp-pt", "data-i": i }, svg);
    drawPerson(g, 0, 0, i, 0, scale);
    return g;
  });
  const place = vals => {
    const seen = new Map();
    vals.forEach((v, i) => {
      const k = seen.get(v) || 0; seen.set(v, k + 1);
      dots[i].style.transform = `translate(${x(v)}px, ${AX - 2 - k * STEP}px)`;
      dots[i].dataset.v = v;
    });
    counts.forEach((t, d) => { const n = seen.get(d) || 0; t.textContent = n || ""; t.setAttribute("y", AX - 2 - n * STEP - 6 * scale); });
  };
  place(values);
  host.appendChild(svg);
  return { svg, back, marks, dots, fulcrum, place, x, AX, sw, STEP, top: 20 };
}

function buildDotPlots() {
  $$(".dotplot").forEach(dp => {
    const base = dp.dataset.values.split(",").map(Number), unit = dp.dataset.unit;
    const swap = dp.dataset.swap ? dp.dataset.swap.split(",").map(Number) : null;
    const D = drawStays($(".dp-chart", dp), base, { unit, extra: swap ? [swap[1]] : [] });
    const readout = $(".dp-readout", dp), stops = $$(".dp-m", dp);
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
      readout.innerHTML = "";
      readout.className = "dp-readout";
      if (!key) return;
      const c = concept(key), fam = `f-${c.family}`;
      readout.classList.add("show", fam);
      const mark = (v, delay) => {
        const g = svgEl("g", { class: `dp-mk ${fam}`, style: `transform:translateX(${D.x(v)}px);animation-delay:${REDUCED_MOTION || instant ? 0 : delay}ms` }, D.marks);
        svgEl("path", { d: `M0 ${D.AX} V${D.top + 12}` }, g);
        const t = svgEl("text", { y: D.top }, g);
        t.textContent = `${c.letter} = ${num(Stats[key](vals))}`;
      };
      if (key === "mean") {
        const s = Stats.sum(vals), m = Stats.mean(vals);
        D.dots.forEach(d => d.classList.add("sum"));
        readout.innerHTML = `<span>${vals.join(" + ")} = <b>${s}</b></span>`;
        later(instant ? 0 : 650, () => {
          readout.insertAdjacentHTML("beforeend", `<span class="dp-then">${s} ÷ ${vals.length} = <b>${num(m)}</b></span>`);
          D.fulcrum.style.transform = `translate(${D.x(m)}px, ${D.AX + 3}px)`;
          D.fulcrum.classList.add("on");
          mark(m, 250);
        });
      }
      if (key === "median") {
        const order = vals.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0] || a[1] - b[1]).map(p => p[1]);
        const n = order.length, mid = (n - 1) / 2, sorted = order.map(i => vals[i]);
        readout.innerHTML = `<span class="dp-row">${sorted.map((v, k) => `<i style="--k:${Math.min(k, n - 1 - k)}"${k === mid ? ' class="mid"' : ""}>${v}</i>`).join("")}</span>`;
        for (let k = 0; k < Math.floor(n / 2); k++) later(instant ? 0 : 150 + k * 190, () => { D.dots[order[k]].classList.add("out"); D.dots[order[n - 1 - k]].classList.add("out"); });
        const done = instant ? 0 : 150 + Math.floor(n / 2) * 190;
        later(done, () => {
          if (Number.isInteger(mid)) D.dots[order[mid]].classList.add("hit");
          readout.insertAdjacentHTML("beforeend", `<span class="dp-then">${ORD(mid + 1)} of ${n} = <b>${num(Stats.median(vals))}</b></span>`);
          readout.classList.add("done");
          mark(Stats.median(vals), 0);
        });
      }
      if (key === "mode") {
        const m = Stats.mode(vals), k = vals.filter(v => v === m).length;
        D.dots.forEach(d => d.classList.add(+d.dataset.v === m ? "hit" : "out"));
        readout.innerHTML = `<span><b>${m}</b> ${esc(unit)} · ${k} of ${vals.length}</span>`;
        mark(m, 200);
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
