
/* ---------- clue stem (linked highlight) ----------
   Tapping a circle lights its phrases in the stem; tapping a phrase opens its circle. */
function buildClueStems() {
  $$(".clue-stem").forEach(stem => {
    const spec = $(".clue-spec", stem.closest(".slide"));
    if (!spec) return;
    spec.addEventListener("specchange", e => {
      stem.classList.toggle("filtering", !!e.detail);
      $$("mark.clue", stem).forEach(m => m.classList.toggle("on", m.dataset.type === e.detail));
    });
    $$("mark.clue", stem).forEach(m => {
      m.tabIndex = 0;
      m.setAttribute("role", "button");
      const pick = () => $(`.spec-stop[data-type="${m.dataset.type}"] .spec-dot`, spec).click();
      m.addEventListener("click", pick);
      m.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); } });
    });
  });
}
