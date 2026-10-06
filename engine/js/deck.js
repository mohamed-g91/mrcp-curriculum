
/* ---------- stage: scale the canvas to fill the window, or reflow on small screens ---------- */
const TRAY_MIN = 56;  // the recording view's tray is at least this tall, in screen pixels
const Stage = {
  s: 1,
  fit() {
    // clientWidth, not innerWidth: a tablet widens innerWidth to fit the 1280 canvas before we measure.
    // Portrait windows reflow too, since a 16:9 canvas would leave most of the screen empty.
    const d = document.documentElement, w = d.clientWidth, h = d.clientHeight;
    const app = $("#app");
    // a phone (either way up) or a tiny window: no recording view button; a tablet held upright keeps it
    d.classList.toggle("phone", Math.min(w, h) < 600);
    // the recording view: an exact 1280 x 720 frame at the top, the tray in the strip below it
    if (d.classList.contains("present")) {
      d.classList.remove("fluid", "sideways");
      this.s = Math.min(w / 1280, (h - TRAY_MIN) / 720);
      app.style.setProperty("--s", this.s);
      app.style.width = "1280px"; app.style.height = "720px";
      d.style.setProperty("--tray", (h - 720 * this.s) + "px");
      return;
    }
    const fluid = w < 900 || h < 480 || h > w;
    document.documentElement.classList.toggle("fluid", fluid);
    // a touch phone held sideways: no bottom bar; swipe moves between slides, the top bar keeps Home and the count
    document.documentElement.classList.toggle("sideways", fluid && w > h && matchMedia("(pointer:coarse)").matches);
    this.s = fluid ? 1 : Math.min(w / 1280, h / 720);
    // the canvas is at least 1280 x 720 and grows to the window's shape, so it fills the window
    // with no letterbox; a 16:9 window (and every recording) still gets exactly 1280 x 720
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
    $("#navCount").textContent = $("#topCount").textContent = home ? "" : `${this.i - first + 1} / ${last - first + 1}`;
    $("#homeTop").hidden = home;
    $("#progressBar").style.width = home ? "0%" : ((this.i - first + 1) / (last - first + 1) * 100) + "%";
    $("#prevBtn").hidden = home || this.i === first;
    $("#homeBtn").hidden = home;
    const nb = $("#nextBtn");
    nb.hidden = home || this.i === last;
    nb.innerHTML = this.nextLabel(s);
    nb.classList.remove("ready");
    Run.at(s);
    if (this.shown !== s) {
      if (this.shown) this.shown.dispatchEvent(new CustomEvent("slideleave"));
      this.shown = s;
      s.dispatchEvent(new CustomEvent("slideenter"));
      Present.show(s);
      $("#deck").scrollTop = 0;
      if (document.documentElement.classList.contains("fluid")) window.scrollTo({ top: 0 });
      record("view", { topic: TOPIC.id, slide: s.dataset.case || s.dataset.id });
    }
    Present.tray();
    try { history.replaceState(null, "", "#" + (this.i + 1)); } catch (e) {}
    if (PRESENTER) try { localStorage.setItem(`mrcp-slide:${TOPIC.id}`, String(this.i)); } catch (e) {}
  },
  // Practise, or New cases: deal a fresh run and start the score again
  deal(target) {
    Run.start(Quiz.deal());
    Score.reset();
    this.refresh();
    this.shown = null;
    this.go(target === "cases" ? this.slides.findIndex(s => s.classList.contains("case")) : this.firstOf("Practise"));
  },
  // Practise from the title: a run left part-way asks whether to carry on
  practise() {
    const d = Run.resumable();
    if (!d) return this.deal();
    Ask.open(d, () => {
      const at = Run.resume(d);
      this.refresh();
      this.shown = null;
      const k = this.slides.findIndex(s => (s.dataset.case || s.dataset.id) === at);
      this.go(k >= 0 ? k : this.firstOf("Practise"));
    }, () => this.deal());
  }
};

document.addEventListener("DOMContentLoaded", () => {
  Stage.fit();
  window.addEventListener("resize", () => Stage.fit());
  buildVideo();
  buildSpectra();
  buildQuestionFlows();
  buildTrees();
  buildDotPlots();
  buildCurves();
  buildStories();
  buildWorkings();
  buildClueStems();
  buildRevealCards();
  buildSorts();
  Quiz.deal();
  Score.render();
  Deck.refresh();
  // the presenter's deck reopens where it was left (the link's #slide, else the last slide shown);
  // the candidate's page always opens on the title, or on the video after a reload there:
  // its cases are dealt afresh on every visit, so an old place in them means nothing
  let start = parseInt(location.hash.slice(1), 10) - 1;
  if (PRESENTER) {
    if (!Number.isFinite(start)) { try { start = parseInt(localStorage.getItem(`mrcp-slide:${TOPIC.id}`), 10); } catch (e) {} }
  } else {
    if (!(start >= 0 && Deck.slides[start] && Deck.slides[start].dataset.part !== "Practise")) start = 0;
    try { localStorage.removeItem(`mrcp-slide:${TOPIC.id}`); } catch (e) {}  // left by the old page
  }
  // the first slide waits for the embedded fonts, so its entrance is not upset by text
  // swapping from the fallback font halfway through (at most 1.5 s, then it goes anyway)
  const fonts = document.fonts ? Promise.all([...['400 20px "Inter"', '800 20px "Inter"', '500 44px "Outfit"'].map(f => document.fonts.load(f)),
    // a topic with Arabic: Cairo's Arabic letters and its digits (a face loads only for characters it covers, so say which)
    ...(TOPIC.ar ? [document.fonts.load('500 44px "Cairo"', "ع1")] : [])]) : Promise.resolve();
  Promise.race([fonts, new Promise(r => setTimeout(r, 1500))]).catch(() => {}).then(() => requestAnimationFrame(() => {
    Deck.go(Number.isFinite(start) ? start : 0);
    if (PRESENTER && new URLSearchParams(location.search).has("present")) Present.enter(false);
  }));

  $("#nextBtn").addEventListener("click", () => Deck.next());
  $("#prevBtn").addEventListener("click", () => Deck.prev());
  $("#homeBtn").addEventListener("click", () => Deck.go(0));
  $("#homeTop").addEventListener("click", () => Deck.go(0));
  // swipe left for Next, right for Back (any touch screen; a sort chip's drag is left alone)
  let touch = null;
  $("#deck").addEventListener("touchstart", e => {
    // the pen, a resting palm and a pinch never turn the page
    touch = e.touches.length === 1 && e.touches[0].touchType !== "stylus" && !Present.busy() && !e.target.closest(".chip, .spec-bubble") ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null;
  }, { passive: true });
  $("#deck").addEventListener("touchend", e => {
    if (!touch || Present.busy()) { touch = null; return; }
    const dx = e.changedTouches[0].clientX - touch.x, dy = e.changedTouches[0].clientY - touch.y;
    touch = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > 1.6 * Math.abs(dy)) dx < 0 ? Deck.next() : Deck.prev();
  }, { passive: true });
  $$("[data-go]").forEach(b => b.addEventListener("click", () =>
    b.dataset.go === "practise" ? Deck.practise() : Deck.go(Deck.firstOf("Learn"))));
  const restart = $("#restartBtn"), toStart = $("#toStartBtn");
  if (restart) restart.addEventListener("click", () => Deck.deal("cases"));
  if (toStart) toStart.addEventListener("click", () => Deck.go(0));
  document.addEventListener("keydown", e => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === "ArrowRight" || e.key === "PageDown") { e.preventDefault(); Deck.next(); }
    if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); Deck.prev(); }
  });
});
