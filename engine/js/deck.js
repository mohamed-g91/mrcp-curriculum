
/* ---------- stage: scale the canvas to fill the window, or reflow on small screens ---------- */
const Stage = {
  s: 1,
  fit() {
    // clientWidth, not innerWidth: a tablet widens innerWidth to fit the 1280 canvas before we measure.
    // Portrait windows reflow too, since a 16:9 canvas would leave most of the screen empty.
    const d = document.documentElement, w = d.clientWidth, h = d.clientHeight;
    const fluid = w < 900 || h < 480 || h > w;
    document.documentElement.classList.toggle("fluid", fluid);
    this.s = fluid ? 1 : Math.min(w / 1280, h / 720);
    // the canvas is at least 1280 x 720 and grows to the window's shape, so it fills the window
    // with no letterbox; a 16:9 window (and every recording) still gets exactly 1280 x 720
    const app = $("#app");
    app.style.setProperty("--s", this.s);
    app.style.width = fluid ? "" : Math.floor(w / this.s) + "px";
    app.style.height = fluid ? "" : Math.floor(h / this.s) + "px";
  }
};

/* ---------- deck ----------
   Learn and Practise are separate runs: Next and Back walk the slides of one part and never
   cross into the other. Each part's first slide has no Back and its last has no Next.
   The title slide has no Back, Home or Next; it is left through its Learn and Practise cards. */
const NEXT_HTML = `Next${icon("right")}`;
const Deck = {
  i: 0, slides: [], shown: null,
  refresh() { this.slides = $$(".slide"); },
  byId(id) { return this.slides.findIndex(s => s.dataset.id === id); },
  firstOf(part) { return this.slides.findIndex(s => s.dataset.part === part); },
  // the first and last index of the part the current slide belongs to
  range() {
    const part = this.slides[this.i].dataset.part, idx = this.slides.map((s, k) => s.dataset.part === part ? k : -1).filter(k => k >= 0);
    return [idx[0], idx[idx.length - 1]];
  },
  go(i) { this.i = Math.max(0, Math.min(this.slides.length - 1, i)); this.render(); },
  // from the title, the arrow keys open Learn
  next() { if (!this.i) this.go(this.firstOf("Learn")); else if (this.i < this.range()[1]) this.go(this.i + 1); },
  prev() { if (this.i > this.range()[0]) this.go(this.i - 1); },
  // on a case, the bar's Next says where it goes: the next case, or the score after the last one
  nextLabel(s) {
    if (!s.classList.contains("case")) return NEXT_HTML;
    const after = s.nextElementSibling;
    return after && after.classList.contains("case") ? `Next case${icon("right")}` : `See your score${icon("right")}`;
  },
  // a solved case lights the bar's Next and puts the keyboard on it
  ready() { const b = $("#nextBtn"); b.classList.add("ready"); b.focus({ preventScroll: true }); },
  render() {
    const s = this.slides[this.i];
    this.slides.forEach((x, k) => x.classList.toggle("active", k === this.i));
    const label = s.getAttribute("aria-label") || "";
    $("#partLabel").textContent = s.dataset.part ? `${s.dataset.part} · ${label}` : "";
    // slides are counted within their part
    const [first, last] = this.range(), home = this.i === 0;
    $("#navCount").textContent = home ? "" : `${this.i - first + 1} / ${last - first + 1}`;
    $("#progressBar").style.width = home ? "0%" : ((this.i - first + 1) / (last - first + 1) * 100) + "%";
    $("#prevBtn").hidden = home || this.i === first;
    $("#homeBtn").hidden = home;
    const nb = $("#nextBtn");
    nb.hidden = home || this.i === last;
    nb.innerHTML = this.nextLabel(s);
    nb.classList.remove("ready");
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
  buildTrees();
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
