
/* ---------- stage: fit the 1280 x 720 canvas to the window, or reflow on small screens ---------- */
const Stage = {
  s: 1,
  fit() {
    const w = window.innerWidth, h = window.innerHeight;
    const fluid = w < 900 || h < 480;
    document.documentElement.classList.toggle("fluid", fluid);
    this.s = fluid ? 1 : Math.min(w / 1280, h / 720);
    $("#app").style.setProperty("--s", this.s);
  }
};

/* ---------- deck ----------
   Next and Back walk every slide in order. The title slide has no Back, Home or Next;
   it is left through its Learn and Practise cards. */
const NEXT_HTML = `Next${icon("right")}`;
const Deck = {
  i: 0, slides: [], shown: null,
  refresh() { this.slides = $$(".slide"); },
  byId(id) { return this.slides.findIndex(s => s.dataset.id === id); },
  firstOf(part) { return this.slides.findIndex(s => s.dataset.part === part); },
  go(i) { this.i = Math.max(0, Math.min(this.slides.length - 1, i)); this.render(); },
  next() { this.go(this.i + 1); },
  // Practise starts fresh: its first slide has no Back, so it never leads into the Learn slides
  prev() { if (this.i !== this.firstOf("Practise")) this.go(this.i - 1); },
  // the button that ends a case does what Next would do from there
  caseNextLabel(sec) {
    const after = sec.nextElementSibling;
    const nextCase = after && after.classList.contains("case");
    return nextCase ? `Next case${icon("right")}` : `See your score${icon("right")}`;
  },
  render() {
    const s = this.slides[this.i];
    this.slides.forEach((x, k) => x.classList.toggle("active", k === this.i));
    const label = s.getAttribute("aria-label") || "";
    $("#partLabel").textContent = s.dataset.part ? `${s.dataset.part} · ${label}` : "";
    const len = this.slides.length - 1;  // the title slide is not counted
    $("#navCount").textContent = this.i ? `${this.i} / ${len}` : "";
    $("#progressBar").style.width = (this.i / len * 100) + "%";
    const home = this.i === 0, end = this.i === this.slides.length - 1;
    $("#prevBtn").hidden = home || this.i === this.firstOf("Practise");
    $("#homeBtn").hidden = home;
    $("#nextBtn").hidden = home || end;
    if (this.shown !== s) {
      this.shown = s;
      s.dispatchEvent(new CustomEvent("slideenter"));
      $("#deck").scrollTop = 0;
      if (document.documentElement.classList.contains("fluid")) window.scrollTo({ top: 0 });
      record("view", { topic: TOPIC.id, slide: s.dataset.case || s.dataset.id });
    }
    try { history.replaceState(null, "", "#" + (this.i + 1)); } catch (e) {}
    try { localStorage.setItem(`mrcp-slide:${TOPIC.id}`, String(this.i)); } catch (e) {}
  },
  // Practise, or New cases: deal a fresh run and start the score again
  deal(target) {
    Quiz.deal();
    Score.reset();
    this.refresh();
    this.shown = null;
    this.go(target === "cases" ? this.slides.findIndex(s => s.classList.contains("case")) : this.firstOf("Practise"));
  }
};

document.addEventListener("DOMContentLoaded", () => {
  Stage.fit();
  window.addEventListener("resize", () => Stage.fit());
  buildSpectra();
  buildQuestionFlows();
  buildClueStems();
  buildRevealCards();
  buildSorts();
  Quiz.deal();
  Score.render();
  Deck.refresh();
  let start = parseInt(location.hash.slice(1), 10) - 1;
  if (!Number.isFinite(start)) { try { start = parseInt(localStorage.getItem(`mrcp-slide:${TOPIC.id}`), 10); } catch (e) {} }
  Deck.go(Number.isFinite(start) ? start : 0);

  $("#nextBtn").addEventListener("click", () => Deck.next());
  $("#prevBtn").addEventListener("click", () => Deck.prev());
  $("#homeBtn").addEventListener("click", () => Deck.go(0));
  $$("[data-go]").forEach(b => b.addEventListener("click", () =>
    b.dataset.go === "practise" ? Deck.deal() : Deck.go(Deck.firstOf("Learn"))));
  const restart = $("#restartBtn"), toStart = $("#toStartBtn");
  if (restart) restart.addEventListener("click", () => Deck.deal("cases"));
  if (toStart) toStart.addEventListener("click", () => Deck.go(0));
  document.addEventListener("keydown", e => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === "ArrowRight" || e.key === "PageDown") { e.preventDefault(); Deck.next(); }
    if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); Deck.prev(); }
  });
});
