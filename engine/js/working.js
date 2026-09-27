/* ---------- working: the hook solved as a sum ----------
   The stem sits beside the working. Each tap on the working shows its next line; after the last
   line the answer to the hook follows. A click anywhere else starts the working again. */
function buildWorkings() {
  $$(".working").forEach(wk => {
    const steps = $(".wk-steps", wk), lines = $$(".wk-line", wk), answer = $(".wk-answer", wk);
    let shown = 0;
    const stepper = on => {
      steps.classList.toggle("stepper", on);
      if (on) Object.entries({ role: "button", tabindex: "0", "aria-label": "Show the next line" }).forEach(([k, v]) => steps.setAttribute(k, v));
      else ["role", "tabindex", "aria-label"].forEach(k => steps.removeAttribute(k));
    };
    const render = () => {
      lines.forEach((ln, i) => ln.classList.toggle("on", i < shown));
      answer.classList.toggle("on", shown > lines.length);
      stepper(shown <= lines.length);
    };
    const next = () => { if (shown <= lines.length) { shown++; render(); } };
    const reset = () => { shown = 0; render(); };
    steps.addEventListener("click", next);
    steps.addEventListener("keydown", e => { if ((e.key === "Enter" || e.key === " ") && steps.classList.contains("stepper")) { e.preventDefault(); next(); } });
    ClickAway.add(e => { if (shown && wk.closest(".slide").classList.contains("active") && !e.target.closest(".wk-steps")) reset(); });
    onEnter(wk, reset);
    reset();
  });
}
