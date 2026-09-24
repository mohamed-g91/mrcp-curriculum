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

/* ---------- dot plot ----------
   A handful of values as stacked dots on an axis. Tapping a measure's circle shows how it is found:
   the mean gathers the sum and a fulcrum slides to the balance point; the median fades the dots in
   pairs from both ends until the middle one is left; the mode lights the tallest stack. One dot
   (data-swap) can be tapped to move to another value and back; the open measure follows it.
   A click anywhere else returns the slide to its starting state. */
function drawDots(host, values, o) {
  const { min = 0, max, unit = "", W = 1000, H = 240, r = 12.5, gap = 30, AX = 152, tick, rows = 4 } = o;
  const L = 34, R = 34;
  const x = v => L + (v - min) / (max - min) * (W - L - R);
  const svg = svgEl("svg", { class: "dp-svg", viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": `${values.length} values from ${min} to ${max} ${unit}` });
  const back = svgEl("g", { class: "dp-back" }, svg);
  const marks = svgEl("g", { class: "dp-marks" }, svg);
  svgEl("path", { class: "dp-axis", d: `M${L - 14} ${AX} H${W - R + 14}` }, svg);
  const step = tick || (max - min > 20 ? 5 : max - min > 10 ? 2 : 1);
  for (let t = Math.ceil(min / step) * step; t <= max; t += step) {
    svgEl("path", { class: "dp-tick", d: `M${x(t)} ${AX} v8` }, svg);
    svgEl("text", { class: "dp-tlab", x: x(t), y: AX + 56 * (r / 12.5) ** .4 }, svg).textContent = String(t).replace("-", "−");
  }
  if (unit) svgEl("text", { class: "dp-unit", x: W - R + 14, y: AX + 80 * (r / 12.5) ** .4 }, svg).textContent = unit;
  const fulcrum = svgEl("path", { class: "dp-fulcrum", d: "M0 0 l-15 26 h30 z" }, svg);
  const dots = values.map((v, i) => {
    const g = svgEl("g", { class: "dp-pt", "data-i": i }, svg);
    svgEl("circle", { r }, g);
    return g;
  });
  const place = vals => {
    const seen = new Map();
    vals.forEach((v, i) => {
      const k = seen.get(v) || 0; seen.set(v, k + 1);
      dots[i].style.transform = `translate(${x(v)}px, ${AX - r - 3 - k * gap}px)`;
      dots[i].dataset.v = v;
    });
  };
  place(values);
  host.appendChild(svg);
  return { svg, back, marks, dots, fulcrum, place, x, AX, r, top: AX - r - 3 - rows * gap };
}

function buildDotPlots() {
  $$(".dotplot").forEach(dp => {
    const base = dp.dataset.values.split(",").map(Number), max = +dp.dataset.max, unit = dp.dataset.unit;
    const swap = dp.dataset.swap ? dp.dataset.swap.split(",").map(Number) : null;
    const D = drawDots($(".dp-chart", dp), base, { max, unit });
    const readout = $(".dp-readout", dp), stops = $$(".dp-m", dp);
    const swapIdx = swap ? base.indexOf(swap[0]) : -1;
    let vals = base.slice(), open = null, timers = [];
    if (swapIdx >= 0) {
      const d = D.dots[swapIdx];
      Object.assign(d, { tabIndex: 0 });
      d.setAttribute("class", "dp-pt dp-swap");
      d.insertBefore(svgEl("circle", { class: "dp-ring", r: D.r + 7 }), d.firstChild);
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
        svgEl("path", { d: `M0 ${D.AX} V${D.top + 26}` }, g);
        const t = svgEl("text", { y: D.top + 14 }, g);
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
