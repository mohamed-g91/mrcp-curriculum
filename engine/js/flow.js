
/* ---------- question flow ----------
   Questions are answered in order: each one unlocks the next and shows its "No" result.
   Tapping an answered question steps back to it; a stray click leaves it as it is.
   With data-path (e.g. "yes,no") the flow works one example: only the branch taken lights,
   and the result it lands on stands out. */
function buildQuestionFlows() {
  $$(".qf-chart").forEach(qf => {
    const path = qf.dataset.path ? qf.dataset.path.split(",") : null;
    const steps = $$(".qf-step", qf), n = steps.length - 1;  // the last step is the end result
    const max = path ? path.length : n;
    let k = 0;
    const render = () => {
      steps.forEach(st => {
        const i = +st.dataset.step, q = $(".qf-q", st), res = $(".qf-res", st);
        const done = i < k;
        const ans = path ? path[i] : null;
        st.classList.toggle("yes", done && ans === "yes");
        st.classList.toggle("no", done && ans === "no");
        const reached = i === n ? k === n && (!path || path.every(a => a === "yes")) : false;
        st.classList.toggle("on", (done && !path) || reached);
        const stopped = path && k === max && path[max - 1] === "no";
        st.classList.toggle("locked", i > k || (stopped && i >= k));
        if (res) res.classList.toggle("final", !!path && ((done && ans === "no") || reached));
        if (q) { q.setAttribute("aria-expanded", String(done)); q.disabled = i > k || (stopped && i >= k); }
      });
      $$(".qf-yes", qf).forEach(y => {
        const i = +y.dataset.step;
        y.classList.toggle("on", i < k && (!path || path[i] === "yes"));
      });
    };
    $$(".qf-q", qf).forEach(q => q.addEventListener("click", () => {
      const i = +q.closest(".qf-step").dataset.step;
      if (i > k) return;
      k = i < k ? i : Math.min(i + 1, max);
      render();
    }));
    onEnter(qf, () => { k = 0; render(); });
    render();
  });
}
