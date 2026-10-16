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

/* a painted drawing (p_heart_image, p_heart_arteries): each wall or artery is a spot on it; tapping one names it and
   shows what goes with it: on the mirror, its leads and their mirror; on Three arteries, the walls it feeds lit on
   the slice beside it (data-is lists the spots that light a part). One at a time: tapping it again, or anywhere
   else, closes it. */
function buildHeartImages() {
  $$(".hsi").forEach(box => {
    const spots = $$(".hsi-spot", box);
    let open = -1;
    const set = i => {
      open = i;
      $$(".hsi-label, .hsi-mark, .hs-leads", box).forEach(x => x.classList.toggle("on", +x.dataset.i === i));
      $$("[data-is]", box).forEach(x => x.classList.toggle("on", i >= 0 && x.dataset.is.split(" ").includes(String(i))));
      spots.forEach(p => { const on = +p.dataset.i === i; p.classList.toggle("on", on); p.setAttribute("aria-pressed", String(on)); });
    };
    spots.forEach(p => {
      p.addEventListener("click", () => set(open === +p.dataset.i ? -1 : +p.dataset.i));
      p.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); p.dispatchEvent(new MouseEvent("click", { bubbles: true })); } });
    });
    onEnter(box, () => set(-1));
    ClickAway.add(e => { if (!e.target.closest(".hsi-spot")) set(-1); });
  });
}

/* the slice and its leads (p_heart_leads): a wall's button lights the wall, its own leads and the dotted lines to it,
   and its mirror leads with the dashed lines on through the heart, and the patient's electrodes for them; the other leads fade. One wall at a time:
   tapping its button again, or anywhere else, closes it. */
function buildHeartLeads() {
  $$(".hsl").forEach(box => {
    const info = JSON.parse(box.dataset.hsl), buttons = $$(".hsl-wall", box);
    let open = null;
    const set = key => {
      open = key;
      const w = key ? info[key] : null;
      buttons.forEach(b => b.setAttribute("aria-pressed", String(b.dataset.wall === key)));
      $$(".hsl-spot", box).forEach(c => c.classList.toggle("on", c.dataset.wall === key));
      $$(".hsl-lines", box).forEach(g => g.classList.toggle("on", g.dataset.wall === key));
      $$(".hsl-lead", box).forEach(g => {
        const n = g.dataset.lead, own = !!w && w.own.includes(n), mir = !!w && w.mir.includes(n);
        g.setAttribute("class", "hsl-lead" + (own ? " own f-" + w.family : mir ? " mir" : w ? " fade" : ""));
      });
      // the patient's chest electrodes light as their leads do
      $$(".hsl-el[data-lead]", box).forEach(c => {
        const n = c.dataset.lead, own = !!w && w.own.includes(n), mir = !!w && w.mir.includes(n);
        c.setAttribute("class", "hsl-el" + (own ? " own f-" + w.family : mir ? " mir" : w ? " fade" : ""));
      });
    };
    buttons.forEach(b => b.addEventListener("click", () => set(open === b.dataset.wall ? null : b.dataset.wall)));
    onEnter(box, () => set(null));
    ClickAway.add(e => { if (!e.target.closest(".hsl-wall")) set(null); });
  });
}
