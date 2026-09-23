
/* ---------- stem quiz: one-question cases ----------
   Each run deals the cases in a fresh random order, with the solved example first, and numbers
   them by their place in the run. Each case fixes its own order for the options. A wrong answer
   gives a hint and lights the clue phrase; a right one shows why and lights the bar's Next. */
function caseOrder(opts, id) {
  let h = 2166136261;
  for (const ch of id) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  let x = h % 233280;
  const rand = () => (x = (x * 9301 + 49297) % 233280) / 233280;
  const a = opts.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

function buildCaseSlide(Q, c, num) {
  const title = c.solved ? "Solved example" : `Case ${num}`;
  const sec = el("section", { class: `slide case p-stem-quiz${c.solved ? " solved" : ""}`, "data-id": c.solved ? "case-solved" : `case-${num}`,
    "data-case": c.id, "data-part": "Practise", "aria-label": title });
  sec.innerHTML = `<div class="case-head"><h2>${title}</h2>${c.solved ? '<span class="solved-badge">Not scored</span>' : ""}</div>
    <div class="case-row">${c.scene ? `<figure class="fig case-fig">${c.scene}</figure>` : ""}<div class="stem-card"><p class="stem-text">${c.stem}</p><p class="stem-q">${esc(c.question)}</p></div></div>`;
  if (c.solved) {
    $$("mark", sec).forEach(m => m.classList.add("lit"));
    sec.appendChild(el("div", { class: "feedback info show" }, `${icon("bulb")}<span><b>Tutor note:</b> ${esc(c.tutor)}</span>`));
  }
  const grid = el("div", { class: "choices" });
  const fb = el("div", { class: "feedback", "aria-live": "polite" });
  let first = true;
  caseOrder(Q.options, c.id).forEach(key => {
    const k = concept(key);
    const b = el("button", { class: `choice f-${k.family}`, type: "button", "data-key": key },
      `<span class="choice-dot">${esc(k.letter)}</span><span>${esc(k.label)}</span>` +
      `<svg class="ico mark mark-ok" aria-hidden="true"><use href="#i-check"/></svg><svg class="ico mark mark-bad" aria-hidden="true"><use href="#i-cross"/></svg>`);
    b.addEventListener("click", () => {
      if (b.disabled) return;
      const ok = key === c.answer;
      record("answer", { id: c.id, choice: key, correct: ok, firstTry: first });
      if (ok) {
        if (!c.solved) Score.add(c.id, first);
        b.classList.add("correct");
        $$(".choice", grid).forEach(x => x.disabled = true);
        fb.className = "feedback show ok";
        fb.innerHTML = `${icon("check")}<span><b>Correct.</b> ${esc(c.why)}</span>`;
        Deck.ready();
      } else {
        first = false;
        b.classList.add("wrong"); b.disabled = true; shake(b);
        fb.className = "feedback show bad";
        fb.innerHTML = `${icon("cross")}<span><b>Not quite.</b> ${esc(c.hint)} The key phrase is highlighted in the stem.</span>`;
        $$("mark", sec).forEach(m => m.classList.add("lit"));
      }
    });
    grid.appendChild(b);
  });
  sec.append(grid, fb);
  return sec;
}

const Quiz = {
  // deal every quiz on the page: solved example first, the rest shuffled
  deal() {
    $$(".case-anchor").forEach(anchor => {
      const Q = TOPIC.quizzes[anchor.dataset.quiz];
      $$(`.slide[data-quiz="${anchor.dataset.quiz}"]`).forEach(s => s.remove());
      const rest = Q.cases.slice(1);
      for (let i = rest.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [rest[i], rest[j]] = [rest[j], rest[i]]; }
      [Q.cases[0], ...rest].forEach((c, pos) => {
        const sec = buildCaseSlide(Q, c, pos);
        sec.dataset.quiz = anchor.dataset.quiz;
        anchor.parentNode.insertBefore(sec, anchor);
      });
    });
  }
};
