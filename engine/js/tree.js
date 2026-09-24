/* ---------- decision tree ----------
   Each question has Yes and No, centred beneath it. The chosen answer slides onto the centre line:
   Yes draws a green line down to the next question; No draws a coral line down to the final answer. Choosing the other answer re-routes the
   branch, tapping a chosen answer again undoes it, and a click anywhere else starts again.
   A final answer with examples opens them in a zoom circle; tapping it again, or anywhere else, closes
   the circle and leaves the tree as it was.
   A worked tree (data-path, the right answers) marks a wrong answer, says why, and goes no further
   until the right one is chosen. Side figures beside a worked tree change as the questions are answered. */
function buildTrees() {
  $$(".tree").forEach(tree => {
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