
/* ---------- decision tree ----------
   Each question has Yes and No. No draws a line to the side and grows the answer there;
   Yes draws a line down and opens the next question. Choosing the other answer re-routes the
   branch, tapping a chosen answer again undoes it, and a click anywhere else starts again. */
function buildTrees() {
  $$(".tree").forEach(tree => {
    const levels = $$(".tree-level", tree), last = levels.length - 1;
    let ans = [];
    const render = () => {
      levels.forEach((lv, i) => {
        const shown = i === 0 || ans[i - 1] === "yes";
        lv.classList.toggle("shown", shown);
        lv.classList.toggle("answered", i < last && !!ans[i]);
        lv.classList.toggle("no", ans[i] === "no");
        $$(".tree-a", lv).forEach(b => {
          b.setAttribute("aria-pressed", String(ans[i] === b.dataset.a));
          b.tabIndex = shown ? 0 : -1;
        });
      });
    };
    $$(".tree-a", tree).forEach(b => b.addEventListener("click", () => {
      const i = +b.closest(".tree-level").dataset.step;
      const again = ans[i] === b.dataset.a;
      ans = ans.slice(0, i);
      if (!again) ans[i] = b.dataset.a;
      render();
    }));
    ClickAway.add(e => { if (!e.target.closest(".tree-a") && ans.length) { ans = []; render(); } });
    onEnter(tree, () => { ans = []; render(); });
    render();
  });
}
