
/* ---------- spectrum (tap-to-reveal circles) ----------
   Tapping a circle opens it and closes its neighbour; tapping it again or anywhere else closes it.
   List spectra show the examples as bullets under the circle.
   Zoom spectra (.spec-zoom) fade the slide back and grow the circle out of its dot into a large
   circle in the middle of the slide, with its name and examples inside; closing shrinks it back. */
function buildSpectra() {
  $$(".spec").forEach(spec => {
    const zoom = spec.classList.contains("spec-zoom");
    const slide = spec.closest(".slide");
    let bubble = null;

    // where the dot sits relative to the slide, in unscaled stage pixels
    const geometry = stop => {
      const s = Stage.s || 1, sr = slide.getBoundingClientRect(), dr = $(".spec-dot", stop).getBoundingClientRect();
      const w = sr.width / s, h = sr.height / s;
      const D = Math.round(Math.min(500, w * .9, Math.max(h * .94, 320)));
      return { D, cx: w / 2, cy: Math.max(h / 2, D / 2 + 8),
        dx: (dr.left - sr.left + dr.width / 2) / s, dy: (dr.top - sr.top + dr.height / 2) / s, d: dr.width / s };
    };
    const atDot = (b, g) => `translate(${g.dx - g.cx}px, ${g.dy - g.cy}px) scale(${g.d / g.D})`;

    const grow = stop => {
      const g = geometry(stop);
      const b = el("div", { class: `spec-bubble ${[...stop.classList].find(c => c.startsWith("f-")) || ""}`, role: "dialog",
        "aria-label": `${$("b", stop).textContent} examples` });
      b.innerHTML = `<div class="bubble-body"><span class="bubble-letter">${esc($(".spec-dot", stop).textContent)}</span>` +
        `<b class="bubble-label">${esc($(":scope > b", stop).textContent)}</b></div>`;
      const ex = $(".spec-ex", stop).cloneNode(true);
      ex.className = ex.classList.contains("spec-split") ? "bubble-ex bubble-split" : "bubble-ex";
      $(".bubble-body", b).appendChild(ex);
      Object.assign(b.style, { width: g.D + "px", height: g.D + "px", left: g.cx - g.D / 2 + "px", top: g.cy - g.D / 2 + "px" });
      b.style.transform = atDot(b, g);
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
      b.style.transform = atDot(b, b._geo);
      setTimeout(() => b.remove(), 480);
    };

    const set = (stop, instant) => {
      $$(".spec-stop", spec).forEach(s => {
        s.classList.toggle("on", s === stop);
        $(".spec-dot", s).setAttribute("aria-expanded", String(s === stop));
      });
      if (zoom) {
        shrink(bubble, instant);
        bubble = stop ? grow(stop) : null;
        slide.classList.toggle("focusing", !!stop);
      }
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
