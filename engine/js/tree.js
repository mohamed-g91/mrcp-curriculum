/* ---------- decision tree ----------
   Each question has Yes and No, centred beneath it. The chosen answer slides onto the centre line:
   Yes draws a green line down to the next question; No draws a coral line down to the final answer. Choosing the other answer re-routes the
   branch, tapping a chosen answer again undoes it, and a click anywhere else starts again.
   A final answer with examples opens them in a zoom circle; tapping it again, or anywhere else, closes
   the circle and leaves the tree as it was.
   A worked tree (data-path, the right answers) marks a wrong answer, says why, and goes no further
   until the right one is chosen. Side figures beside a worked tree change as the questions are answered. */
function buildTrees() {
  $$(".tree-grid").forEach(buildGridTree);
  $$(".tree:not(.tree-grid)").forEach(tree => {
    const levels = $$(".tree-level", tree), last = levels.length - 1;
    const zoom = makeZoom(tree.closest(".slide"));
    const path = tree.dataset.path ? tree.dataset.path.split(",") : null;
    const case_ = tree.closest(".tree-case"), sides = case_ ? $$(".side-fig", case_) : [];
    let ans = [], open = null, miss = null;  // miss: the wrong answer shown, as [step, answer]
    const render = () => {
      // the side figure under the stem follows the answers: the k-th after k answers, the last one stays
      sides.forEach((f, k) => f.classList.toggle("on", k === Math.min(ans.length, sides.length - 1)));
      levels.forEach((lv, i) => {
        const shown = i === 0 || ans[i - 1] === "yes";
        lv.classList.toggle("shown", shown);
        lv.classList.toggle("answered", i < last && !!ans[i]);
        lv.classList.toggle("yes", ans[i] === "yes");
        lv.classList.toggle("no", ans[i] === "no");
        lv.classList.toggle("missed", !!miss && miss[0] === i);
        $$(".tree-a", lv).forEach(b => {
          b.setAttribute("aria-pressed", String(ans[i] === b.dataset.a));
          b.classList.toggle("wrong", !!miss && miss[0] === i && miss[1] === b.dataset.a);
          b.tabIndex = shown ? 0 : -1;
        });
      });
    };
    const openFinal = (card, instant) => {
      if (open) open.setAttribute("aria-expanded", "false");
      open = card;
      if (card) card.setAttribute("aria-expanded", "true");
      zoom.show(card && { dot: $(".tree-dot", card), fam: famClass(card), letter: $(".tree-dot", card).innerHTML,
        label: $(".tree-label", card).textContent, ex: $(".spec-ex", card) }, instant);
    };
    $$(".tree-a", tree).forEach(b => b.addEventListener("click", () => {
      const i = +b.closest(".tree-level").dataset.step;
      const again = ans[i] === b.dataset.a;
      ans = ans.slice(0, i);
      miss = null;
      if (path && !again && path[i] !== b.dataset.a) {
        miss = [i, b.dataset.a];
        render();
        return shake(b);
      }
      if (!again) ans[i] = b.dataset.a;
      render();
    }));
    $$(".tree-final.zoomable", tree).forEach(card => {
      card.addEventListener("click", () => openFinal(open === card ? null : card));
      card.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); card.click(); }
      });
    });
    ClickAway.add(e => {
      if (e.target.closest(".tree-final.zoomable, .spec-bubble")) return;
      if (open) openFinal(null);  // the first click away closes the circle only
      else if (!e.target.closest(".tree-a") && (ans.length || miss)) { ans = []; miss = null; render(); }
    });
    document.addEventListener("keydown", e => { if (e.key === "Escape" && open) openFinal(null); });
    onEnter(tree, () => { openFinal(null, true); ans = []; miss = null; render(); });
    render();
  });
}
/* A tree laid out in rows. Each answer leads on to a step (the next, or a skip further down) or ends
   on a final under its step; the answers chosen so far form a trail, and a small arrow disc in each gap along
   it points the way. A worked tree (data-path) checks the trail's answers in order. */
function buildGridTree(tree) {
  const rules = JSON.parse(tree.dataset.steps), levels = $$(".tree-level", tree), finals = $$(".tg-final", tree);
  const zoom = makeZoom(tree.closest(".slide"));
  const path = tree.dataset.path ? tree.dataset.path.split(",") : null;
  const case_ = tree.closest(".tree-case"), sides = case_ ? $$(".side-fig", case_) : [];
  const links = svgEl("svg", { class: "tg-links", "aria-hidden": "true" }, tree);
  let trail = [], miss = null, open = null;  // trail: [step, answer] in the order answered
  const walk = () => {
    const shown = [0]; let end = null;
    trail.forEach(([i, a]) => { const r = rules[i][a]; if (r.step != null) shown.push(r.step); else end = [i, a]; });
    return { shown, end };
  };
  // where each chosen answer leads, shown by an arrow in the gap between the two cells
  const drawLinks = () => {
    links.innerHTML = "";
    const box = tree.getBoundingClientRect(), k = box.width / tree.offsetWidth || 1;
    const rel = el => { const r = el.getBoundingClientRect(); return { l: (r.left - box.left) / k, r: (r.right - box.left) / k, t: (r.top - box.top) / k, b: (r.bottom - box.top) / k }; };
    const { end } = walk();
    trail.forEach(([i, a]) => {
      const rule = rules[i][a], btn = $(`.tree-a.${a}`, levels[i]), pill = $(".tree-q", levels[i]);
      const to = rule.step != null ? $(".tree-q", levels[rule.step]) : end && end[0] === i ? $(".tree-final", finals.find(f => +f.dataset.from === i && f.dataset.a === a)) : null;
      if (!btn || !to) return;
      const s = rel(btn), q = rel(pill), t = rel(to), cx = v => (v.l + v.r) / 2, cy = v => (v.t + v.b) / 2;
      // no lines: a small arrow disc in the gap points the way, down to a cell below or across to one beside
      const below = t.t >= s.b - 2;
      const [ax, ay, turn] = below ? [cx(t), (s.b + t.t) / 2, 90] : t.l >= q.r ? [(q.r + t.l) / 2, cy(t), 0] : [(t.r + q.l) / 2, cy(t), 180];
      const g = svgEl("g", { class: "tg-arrow", transform: `translate(${ax} ${ay}) rotate(${turn})` }, links);
      svgEl("circle", { r: 15 }, g);
      svgEl("path", { d: "M-6 0 H6 M1 -5 L6 0 L1 5" }, g);
    });
  };
  const render = () => {
    const { shown, end } = walk(), ansOf = new Map(trail);
    sides.forEach((f, n) => f.classList.toggle("on", n === Math.min(trail.length, sides.length - 1)));
    levels.forEach((lv, i) => {
      const on = shown.includes(i), a = ansOf.get(i);
      lv.classList.toggle("shown", on);
      lv.classList.toggle("answered", !!a);
      lv.classList.toggle("yes", a === "yes");
      lv.classList.toggle("no", a === "no");
      lv.classList.toggle("missed", !!miss && miss[0] === i);
      $$(".tree-a", lv).forEach(b => {
        b.setAttribute("aria-pressed", String(a === b.dataset.a));
        b.classList.toggle("wrong", !!miss && miss[0] === i && miss[1] === b.dataset.a);
        b.tabIndex = on ? 0 : -1;
      });
    });
    finals.forEach(f => f.classList.toggle("shown", !!end && +f.dataset.from === end[0] && f.dataset.a === end[1]));
    requestAnimationFrame(drawLinks);
  };
  const openFinal = (card, instant) => {
    if (open) open.setAttribute("aria-expanded", "false");
    open = card;
    if (card) card.setAttribute("aria-expanded", "true");
    zoom.show(card && { dot: $(".tree-dot", card), fam: famClass(card), letter: $(".tree-dot", card).innerHTML,
      label: $(".tree-label", card).textContent, ex: $(".spec-ex", card) }, instant);
  };
  $$(".tree-a", tree).forEach(b => b.addEventListener("click", () => {
    const i = +b.closest(".tree-level").dataset.step, at = trail.findIndex(([j]) => j === i);
    const again = at >= 0 && trail[at][1] === b.dataset.a;
    trail = trail.slice(0, at >= 0 ? at : trail.length);
    miss = null;
    if (path && !again && path[trail.length] !== b.dataset.a) {
      miss = [i, b.dataset.a];
      render();
      return shake(b);
    }
    if (!again) trail.push([i, b.dataset.a]);
    render();
  }));
  $$(".tree-final.zoomable", tree).forEach(card => {
    card.addEventListener("click", () => openFinal(open === card ? null : card));
    card.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); card.click(); } });
  });
  ClickAway.add(e => {
    if (e.target.closest(".tree-final.zoomable, .spec-bubble")) return;
    if (open) openFinal(null);
    else if (tree.contains(e.target) || !tree.closest(".slide").classList.contains("active")) return;
    else if (trail.length || miss) { trail = []; miss = null; render(); }
  });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && open) openFinal(null); });
  addEventListener("resize", () => requestAnimationFrame(drawLinks));
  onEnter(tree, () => { openFinal(null, true); trail = []; miss = null; render(); });
  render();
}
