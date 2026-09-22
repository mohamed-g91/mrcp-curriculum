
/* ---------- zoom circle ----------
   A large circle in the middle of the slide that grows out of a small dot and shrinks back into it,
   holding a letter, a name and examples. The rest of the slide fades back while it is open.
   Used by zoom spectra (from a circle) and by decision trees (from a final answer). */
function makeZoom(slide) {
  let bubble = null;
  // where the dot sits relative to the slide, in unscaled stage pixels
  const geometry = dot => {
    const s = Stage.s || 1, sr = slide.getBoundingClientRect(), dr = dot.getBoundingClientRect();
    const w = sr.width / s, h = sr.height / s;
    const D = Math.round(Math.min(500, w * .9, Math.max(h * .94, 320)));
    return { D, cx: w / 2, cy: Math.max(h / 2, D / 2 + 8),
      dx: (dr.left - sr.left + dr.width / 2) / s, dy: (dr.top - sr.top + dr.height / 2) / s, d: dr.width / s };
  };
  const atDot = g => `translate(${g.dx - g.cx}px, ${g.dy - g.cy}px) scale(${g.d / g.D})`;
  const grow = ({ dot, fam, letter, label, ex }) => {
    const g = geometry(dot);
    // a long name or a long list takes a smaller size, so everything stays inside the circle
    const n = $$("li", ex).length;
    const b = el("div", { class: `spec-bubble ${fam}${label.length > 10 ? " long-label" : ""}${n > 5 ? " many" : ""}`,
      role: "dialog", "aria-label": `${label} examples` });
    b.innerHTML = `<div class="bubble-body"><span class="bubble-letter">${esc(letter)}</span>` +
      `<b class="bubble-label">${esc(label)}</b></div>`;
    const list = ex.cloneNode(true);
    list.hidden = false;
    list.className = list.classList.contains("spec-split") ? "bubble-ex bubble-split" : "bubble-ex";
    $(".bubble-body", b).appendChild(list);
    Object.assign(b.style, { width: g.D + "px", height: g.D + "px", left: g.cx - g.D / 2 + "px", top: g.cy - g.D / 2 + "px" });
    b.style.transform = atDot(g);
    b._geo = g;
    slide.appendChild(b);
    void b.offsetWidth;
    b.classList.add("open");
    b.style.transform = "none";
    return b;
  };
  const shrink = (b, instant) => {
    if (!b) return;
    b.classList.remove("open");
    if (instant || REDUCED_MOTION) return b.remove();
    b.classList.add("closing");
    b.style.transform = atDot(b._geo);
    setTimeout(() => b.remove(), 480);
  };
  return {
    get open() { return !!bubble; },
    // show({dot, fam, letter, label, ex}) opens (or swaps to) a circle; show(null) closes it
    show(opts, instant) {
      shrink(bubble, instant);
      bubble = opts ? grow(opts) : null;
      slide.classList.toggle("focusing", !!opts);
    }
  };
}
const famClass = node => [...node.classList].find(c => c.startsWith("f-")) || "";

/* ---------- spectrum (tap-to-reveal circles) ----------
   Tapping a circle opens it and closes its neighbour; tapping it again or anywhere else closes it.
   List spectra show the examples as bullets under the circle.
   Zoom spectra (.spec-zoom) open the examples in a zoom circle instead. */
function buildSpectra() {
  $$(".spec").forEach(spec => {
    const zoom = spec.classList.contains("spec-zoom") ? makeZoom(spec.closest(".slide")) : null;
    const set = (stop, instant) => {
      $$(".spec-stop", spec).forEach(s => {
        s.classList.toggle("on", s === stop);
        $(".spec-dot", s).setAttribute("aria-expanded", String(s === stop));
      });
      if (zoom) zoom.show(stop && { dot: $(".spec-dot", stop), fam: famClass(stop), letter: $(".spec-dot", stop).textContent,
        label: $(":scope > b", stop).textContent, ex: $(".spec-ex", stop) }, instant);
      spec.dispatchEvent(new CustomEvent("specchange", { detail: stop ? stop.dataset.type : null }));
    };
    $$(".spec-dot", spec).forEach(dot => dot.addEventListener("click", () => {
      const stop = dot.closest(".spec-stop");
      set(stop.classList.contains("on") ? null : stop);
    }));
    ClickAway.add(e => {
      if (!e.target.closest(".spec-dot, .spec-ex, .spec-bubble, mark.clue") && $(".spec-stop.on", spec)) set(null);
    });
    document.addEventListener("keydown", e => { if (e.key === "Escape" && $(".spec-stop.on", spec)) set(null); });
    onEnter(spec, () => set(null, true));
  });
}
const REDUCED_MOTION = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
