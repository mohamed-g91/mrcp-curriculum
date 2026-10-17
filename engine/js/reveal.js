/* ---------- reveal cards ----------
   Tapping a card shows its answer and closes the others in its group; tapping again or anywhere else hides it.
   In tray mode (.rtray) a strip above the cards opens its points in place, and a tapped card opens its mechanism and
   catch in the tray under the row, a pointer up to the card; one thing is open at a time. */
function buildRevealCards() {
  const items = $$(".reveal-item");
  const group = it => it.closest(".rtray") || it.parentElement;
  const sync = rt => {
    const tray = $(".rt-tray", rt), card = $(".rt-card.on", rt);
    tray.className = "rt-tray";
    tray.replaceChildren();
    if (!card) return;
    tray.classList.add("on", `f-${card.dataset.fam}`);
    tray.appendChild($("template.rt-body", card).content.cloneNode(true));
    // the stage may be scaled: measure in its own pixels
    const a = card.getBoundingClientRect(), b = tray.getBoundingClientRect(), k = b.width / tray.offsetWidth || 1;
    tray.style.setProperty("--px", `${(a.left + a.width / 2 - b.left) / k}px`);
  };
  const set = (it, on) => {
    it.classList.toggle("on", on); it.setAttribute("aria-expanded", String(on));
    const rt = it.closest(".rtray");
    if (rt) sync(rt);
  };
  items.forEach(it => {
    it.addEventListener("click", () => {
      const on = !it.classList.contains("on");
      if (on) $$(".reveal-item", group(it)).forEach(o => { if (o !== it) set(o, false); });
      set(it, on);
    });
    it.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); it.click(); } });
    onEnter(it, () => set(it, false));
  });
  ClickAway.add(e => { if (!e.target.closest(".reveal-item")) items.forEach(it => { if (it.classList.contains("on")) set(it, false); }); });
}
