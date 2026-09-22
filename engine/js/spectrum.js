
/* ---------- spectrum (tap-to-reveal circles) ----------
   Tapping a circle opens its list and closes its neighbour; tapping it again or anywhere else closes it. */
function buildSpectra() {
  $$(".spec").forEach(spec => {
    const set = stop => {
      $$(".spec-stop", spec).forEach(s => {
        s.classList.toggle("on", s === stop);
        $(".spec-dot", s).setAttribute("aria-expanded", String(s === stop));
      });
      spec.dispatchEvent(new CustomEvent("specchange", { detail: stop ? stop.dataset.type : null }));
    };
    $$(".spec-dot", spec).forEach(dot => dot.addEventListener("click", () => {
      const stop = dot.closest(".spec-stop");
      set(stop.classList.contains("on") ? null : stop);
    }));
    ClickAway.add(e => {
      if (!e.target.closest(".spec-dot, .spec-ex, mark.clue") && $(".spec-stop.on", spec)) set(null);
    });
    onEnter(spec, () => set(null));
  });
}
