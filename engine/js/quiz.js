
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

// an answer's explanation can land under the bottom bar (a phone) or below the stage: bring it just into view,
// so nobody moves on without reading it
function bringIntoView(node) {
  const fluid = document.documentElement.classList.contains("fluid"), bar = $(".navbar");
  const limit = fluid ? (bar && bar.offsetParent ? bar.getBoundingClientRect().top : innerHeight) : $("#deck").getBoundingClientRect().bottom;
  const over = node.getBoundingClientRect().bottom + 12 - limit;
  if (over <= 0) return;
  const behavior = matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
  (fluid ? window : $("#deck")).scrollBy({ top: over, behavior });
}

function buildCaseSlide(Q, c, num) {
  // Practise carries no Arabic and no concept letters: plain options leave the stem and answers the room
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
  // a case may bring its own options; an option that is not a concept is plain text in neutral grey
  caseOrder(c.options || Q.options, c.id).forEach(key => {
    const k = concept(key) || { label: key, family: "gray", letter: "" };
    const b = el("button", { class: `choice f-${k.family}`, type: "button", "data-key": key },
      `<span class="choice-label">${esc(k.label)}</span>` +
      `<svg class="ico mark mark-ok" aria-hidden="true"><use href="#i-check"/></svg><svg class="ico mark mark-bad" aria-hidden="true"><use href="#i-cross"/></svg>`);
    // quiet: replaying a saved run, so nothing is reported, shaken or lit again
    b._pick = quiet => {
      if (b.disabled) return;
      const ok = key === c.answer;
      if (!quiet) { record("answer", { id: c.id, choice: key, correct: ok, firstTry: first }); Run.pick(c.id, key); }
      if (ok) {
        if (!c.solved) Score.add(c.id, first);
        b.classList.add("correct");
        $$(".choice", grid).forEach(x => x.disabled = true);
        fb.className = "feedback show ok";
        fb.innerHTML = `${icon("check")}<span><b>Correct.</b> ${esc(c.why)}</span>`;
        if (!quiet) Deck.ready();
      } else {
        first = false;
        b.classList.add("wrong"); b.disabled = true; if (!quiet) shake(b);
        fb.className = "feedback show bad";
        fb.innerHTML = `${icon("cross")}<span><b>Not quite.</b> ${esc(c.hint)} The key phrase is highlighted in the stem.</span>`;
        $$("mark", sec).forEach(m => m.classList.add("lit"));
      }
      if (!quiet) requestAnimationFrame(() => bringIntoView(fb));
    };
    b.addEventListener("click", () => b._pick(false));
    grid.appendChild(b);
  });
  sec.append(grid, fb);
  return sec;
}

const Quiz = {
  // deal every quiz on the page: solved example first, the rest shuffled,
  // or in a saved run's order (order: {quiz id: [case ids]}) when it still holds the same cases
  deal(order) {
    const dealt = {};
    $$(".case-anchor").forEach(anchor => {
      const Q = TOPIC.quizzes[anchor.dataset.quiz];
      $$(`.slide[data-quiz="${anchor.dataset.quiz}"]`).forEach(s => s.remove());
      let rest = Q.cases.slice(1);
      const saved = order && order[anchor.dataset.quiz], byId = Object.fromEntries(rest.map(c => [c.id, c]));
      if (saved && saved.length === rest.length && saved.every(id => byId[id])) rest = saved.map(id => byId[id]);
      else for (let i = rest.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [rest[i], rest[j]] = [rest[j], rest[i]]; }
      dealt[anchor.dataset.quiz] = rest.map(c => c.id);
      [Q.cases[0], ...rest].forEach((c, pos) => {
        const sec = buildCaseSlide(Q, c, pos);
        sec.dataset.quiz = anchor.dataset.quiz;
        anchor.parentNode.insertBefore(sec, anchor);
      });
    });
    return dealt;
  }
};

/* ---------- a saved run of Practise ----------
   The cases' order, every answer given and the slide last shown, kept in this browser per topic,
   so Practise can offer to carry on where the learner left off. Starting again forgets it. */
const Run = {
  data: null,
  key: () => `mrcp-run:${TOPIC.id}`,
  load() { try { return JSON.parse(localStorage.getItem(this.key())); } catch (e) { return null; } },
  save() { if (this.data) try { localStorage.setItem(this.key(), JSON.stringify(this.data)); } catch (e) {} },
  start(order) { this.data = { order, picks: {}, at: null }; this.save(); },
  pick(id, key) { if (this.data) { (this.data.picks[id] = this.data.picks[id] || []).push(key); this.save(); } },
  at(slide) { if (this.data && slide.dataset.part === "Practise") { this.data.at = slide.dataset.case || slide.dataset.id; this.save(); } },
  // worth offering: something answered, and a scored case still to do; with its score so far
  resumable() {
    const d = this.load();
    if (!d || !d.picks || !Object.keys(d.picks).length) return null;
    const scored = Object.values(TOPIC.quizzes).flatMap(Q => Q.cases).filter(c => !c.solved);
    const done = scored.filter(c => (d.picks[c.id] || []).includes(c.answer));
    if (done.length === scored.length) return null;
    return { ...d, got: done.filter(c => d.picks[c.id][0] === c.answer).length, total: done.length };
  },
  // deal the saved order, replay every answer quietly, and give back the slide to open
  resume(d) {
    Quiz.deal(d.order);
    Score.reset();
    this.data = d;
    $$(".slide.case").forEach(sec => (d.picks[sec.dataset.case] || []).forEach(key => {
      const b = $(`.choice[data-key="${CSS.escape(key)}"]`, sec);
      if (b) b._pick(true);
    }));
    return d.at;
  }
};
