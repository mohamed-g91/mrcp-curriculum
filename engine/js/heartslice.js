/* ---------- heart-slice: the slice across both ventricles, every wall tapped on its own ----------
   A tap lights that wall in its artery's colour and the card beside the slice names the wall and its artery; with
   mode: mirror the wall's own leads (ST up) and its mirror leads (dashed, ST down) appear round it. One wall at a time:
   tapping it again, or anywhere else, closes it (engine/patterns.py, p_heart_slice). */
function buildHeartSlices() {
  $$(".hs").forEach(box => {
    const info = JSON.parse(box.dataset.hs), card = $(".hs-card", box), parts = $$(".hs-part", box);
    const set = key => {
      parts.forEach(p => { const on = p.dataset.part === key; p.classList.toggle("on", on); p.setAttribute("aria-pressed", String(on)); });
      $$(".hs-leads", box).forEach(g => g.classList.toggle("on", g.dataset.for === key));
      box.dataset.wall = key || "";
      if (!key) { card.classList.add("off"); return; }
      const w = info[key];
      card.className = `hs-card f-${w.family}`;
      $(".hs-wall", card).innerHTML = `${esc(w.name)}${w.ar ? ` <span class="ar" lang="ar" dir="rtl">${esc(w.ar)}</span>` : ""}`;
      $(".hs-dot", card).textContent = w.letter;
      $(".hs-artname", card).innerHTML = `${esc(w.artery)}${w.artery_ar ? ` <span class="ar" lang="ar" dir="rtl">${esc(w.artery_ar)}</span>` : ""}`;
    };
    parts.forEach(p => {
      p.addEventListener("click", () => set(box.dataset.wall === p.dataset.part ? null : p.dataset.part));
      p.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); p.dispatchEvent(new MouseEvent("click", { bubbles: true })); } });
    });
    onEnter(box, () => set(null));
    ClickAway.add(e => { if (!e.target.closest(".hs-part, .hs-card")) set(null); });
  });
}
