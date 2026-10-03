/* ---------- working: the hook solved as a sum ----------
   The stem sits beside the working. Each tap on the working shows its next line; after the last
   line the answer to the hook follows. Small Back and Next buttons step it either way; a stray click leaves it. */
function buildWorkings() {
  $$(".working").forEach(wk => {
    const steps = $(".wk-steps", wk), lines = $$(".wk-line", wk), answer = $(".wk-answer", wk);
    let shown = 0;
    const stepper = on => {
      steps.classList.toggle("stepper", on);
      if (on) Object.entries({ role: "button", tabindex: "0", "aria-label": "Show the next line" }).forEach(([k, v]) => steps.setAttribute(k, v));
      else ["role", "tabindex", "aria-label"].forEach(k => steps.removeAttribute(k));
    };
    let buttons = () => {};
    const render = () => {
      lines.forEach((ln, i) => ln.classList.toggle("on", i < shown));
      answer.classList.toggle("on", shown > lines.length);
      stepper(shown <= lines.length);
      buttons(shown > 0, shown <= lines.length);
    };
    const next = () => { if (shown <= lines.length) { shown++; render(); } };
    const back = () => { if (shown) { shown--; render(); } };
    const reset = () => { shown = 0; render(); };
    buttons = stepButtons(steps, back, next);
    steps.addEventListener("click", next);
    // only when the working itself has focus: Enter on its Back or Next button is that button's own
    steps.addEventListener("keydown", e => { if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ") && steps.classList.contains("stepper")) { e.preventDefault(); next(); } });
    onEnter(wk, reset);
    reset();
  });
}
