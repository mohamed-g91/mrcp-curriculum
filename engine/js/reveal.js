
/* ---------- reveal cards ----------
   Tapping a card shows its answer and closes the others in its group; tapping again or anywhere else hides it. */
function buildRevealCards() {
  const items = $$(".reveal-item");
  const set = (it, on) => { it.classList.toggle("on", on); it.setAttribute("aria-expanded", String(on)); };
  items.forEach(it => {
    it.addEventListener("click", () => {
      const on = !it.classList.contains("on");
      if (on) $$(".reveal-item", it.parentElement).forEach(o => { if (o !== it) set(o, false); });
      set(it, on);
    });
    it.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); it.click(); } });
    onEnter(it, () => set(it, false));
  });
  ClickAway.add(e => { if (!e.target.closest(".reveal-item")) items.forEach(it => set(it, false)); });
}
