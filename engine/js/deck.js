
/* ---------- stage: fit the 1280 x 720 canvas to the window, or reflow on small screens ---------- */
const Stage = {
  s: 1,
  fit() {
    const w = window.innerWidth, h = window.innerHeight;
    const fluid = SCROLL || w < 900 || h < 480;  // the scroll page is always fluid
    document.documentElement.classList.toggle("fluid", fluid);
    this.s = fluid ? 1 : Math.min(w / 1280, h / 720);
    $("#app").style.setProperty("--s", this.s);
  },
  get fluid() { return document.documentElement.classList.contains("fluid"); }
};

const REDUCED = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

/* the topic's navigation (slides | scroll); ?nav=scroll or ?nav=slides previews the other one */
(() => {
  const q = new URLSearchParams(location.search).get("nav");
  if (q === "slides" || q === "scroll") document.documentElement.dataset.nav = q;
})();
const SCROLL = document.documentElement.dataset.nav === "scroll";

/* parts of a slide that rise in one after another as the slide appears */
const REVEAL = "h1, h2, .part-card, .scroll-cue, .stem-card, .spec-group, .spec-stop, .qf-chart, .clue-stem, " +
  ".rcard, .next-topic, .pool, .bucket, .sort-actions, .solved-badge, .choice, .end-card, .credits, .feedback.info";

/* ---------- deck ----------
   slides: one slide at a time; Back / Home / Next and the arrow keys move between them. The title
     slide has no buttons; it is left through its Watch and Practise cards.
   scroll: one fluid page. The window scrolls freely; each part rises in as it enters the window
     and fades as it leaves. The current section is the one under the top third of the window;
     the rail of dots jumps to any section, and the left and right arrow keys step between them.
   In both, the wordmark goes back to the first slide. */
const Deck = {
  i: -1, slides: [], shown: null, target: null, targetUntil: 0, io: null,
  refresh() {
    this.slides = $$(".slide");
    this.slides.forEach(s => $$(REVEAL, s).forEach((n, k) => { n.classList.add("rv"); n.style.setProperty("--rv", k); }));
    if (SCROLL) { this.watchParts(); this.buildRail(); this.update(); }
  },
  byId(id) { return this.slides.findIndex(s => s.dataset.id === id); },
  firstOf(part) { return this.slides.findIndex(s => s.dataset.part === part); },
  go(i, smooth = true) {
    i = Math.max(0, Math.min(this.slides.length - 1, i));
    if (SCROLL) {
      // while a smooth scroll runs, the slides it passes are not "current"
      this.target = i; this.targetUntil = Date.now() + 1200;
      this.slides[i].scrollIntoView({ behavior: smooth && !REDUCED ? "smooth" : "instant", block: "start" });
      this.setCurrent(i);
      if (!smooth) requestAnimationFrame(() => this.update());
    } else {
      this.setCurrent(i);
    }
  },
  next() { this.go(this.i + 1); },
  prev() { this.go(this.i - 1); },
  // the button that ends a case does what Next (or scrolling on) would do
  caseNextLabel(sec) {
    const after = sec.nextElementSibling, arrow = icon(SCROLL ? "down" : "right");
    return after && after.classList.contains("case") ? `Next case${arrow}` : `See your score${arrow}`;
  },
  // scroll mode: every part fades up as it enters the window and away as it leaves;
  // parts that arrive together come in one after another
  watchParts() {
    if (this.io) this.io.disconnect();
    this.io = new IntersectionObserver(entries => {
      let k = 0;
      entries.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top).forEach(en => {
        const n = en.target;
        if (en.isIntersecting) {
          n.style.transitionDelay = `${Math.min(k++, 6) * 80}ms`;
          n.classList.add("in"); n.classList.remove("above");
        } else {
          n.style.transitionDelay = "0ms";
          n.classList.remove("in");
          n.classList.toggle("above", en.boundingClientRect.top < (en.rootBounds ? en.rootBounds.top : 0));
        }
      });
    }, { rootMargin: "-5% 0px -5% 0px", threshold: 0.1 });
    $$(".rv").forEach(n => this.io.observe(n));
  },
  // scroll mode: the current section is the last one whose top has passed a third of the way down
  update() {
    const top = $(".topbar").offsetHeight + $(".progress").offsetHeight;
    const line = top + (window.innerHeight - top) * .33;
    let best = 0;
    this.slides.forEach((s, k) => { if (s.getBoundingClientRect().top <= line) best = k; });
    const room = document.documentElement.scrollHeight - window.innerHeight;
    if (room - window.scrollY < 4) best = this.slides.length - 1;  // the bottom of the page is the last section
    $("#progressBar").style.width = (room > 0 ? Math.min(1, window.scrollY / room) * 100 : 0) + "%";
    if (this.target !== null) {
      if (best === this.target || Date.now() > this.targetUntil) this.target = null;
      else return;
    }
    this.setCurrent(best);
  },
  setCurrent(i) {
    const s = this.slides[i];
    if (!s || (i === this.i && this.shown === s)) return;
    this.i = i;
    const label = s.getAttribute("aria-label") || "";
    $("#partLabel").textContent = s.dataset.part ? `${s.dataset.part} · ${label}` : "";
    const len = this.slides.length - 1;  // the title slide is not counted
    if (!SCROLL) $("#progressBar").style.width = (i / len * 100) + "%";
    if (SCROLL) {
      $$(".rail-dot").forEach((d, k) => { d.classList.toggle("on", k === i); if (k === i) d.setAttribute("aria-current", "step"); else d.removeAttribute("aria-current"); });
    } else {
      this.slides.forEach((x, k) => { x.classList.toggle("active", k === i); if (k !== i) x.classList.remove("in"); });
      // the new slide plays its motion once it is on screen
      requestAnimationFrame(() => requestAnimationFrame(() => s.classList.add("in")));
      $("#navCount").textContent = i ? `${i} / ${len}` : "";
      const home = i === 0, end = i === this.slides.length - 1;
      $("#prevBtn").hidden = home;
      $("#homeNavBtn").hidden = home;
      $("#nextBtn").hidden = home || end;
      $("#deck").scrollTop = 0;
      if (Stage.fluid) window.scrollTo({ top: 0 });
    }
    if (this.shown !== s) {
      this.shown = s;
      s.dispatchEvent(new CustomEvent("slideenter"));
      record("view", { topic: TOPIC.id, slide: s.dataset.case || s.dataset.id });
    }
    try { history.replaceState(null, "", location.search + "#" + (i + 1)); } catch (e) {}
    try { localStorage.setItem(`mrcp-slide:${TOPIC.id}`, String(i)); } catch (e) {}
  },
  buildRail() {
    const rail = $("#rail");
    rail.innerHTML = "";
    this.slides.forEach((s, k) => {
      const prev = this.slides[k - 1];
      const d = el("button", { class: "rail-dot" + (prev && prev.dataset.part !== s.dataset.part ? " part-start" : ""),
        type: "button", "aria-label": s.getAttribute("aria-label") || `Slide ${k + 1}` });
      d.addEventListener("click", () => this.go(k));
      rail.appendChild(d);
    });
    this.shown = null;
    if (this.i >= 0) this.setCurrent(Math.min(this.i, this.slides.length - 1));
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
  Deck.go(Number.isFinite(start) ? start : 0, false);

  if (SCROLL) {
    let ticking = false;
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; Deck.update(); }); } };
    $("#deck").addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
  }
  window.addEventListener("resize", () => { const i = Deck.i; Stage.fit(); if (SCROLL) Deck.go(i, false); });

  $("#homeBtn").addEventListener("click", () => Deck.go(0));
  $("#homeNavBtn").addEventListener("click", () => Deck.go(0));
  $("#nextBtn").addEventListener("click", () => Deck.next());
  $("#prevBtn").addEventListener("click", () => Deck.prev());
  $$(".scroll-cue").forEach(b => b.addEventListener("click", () => Deck.next()));
  $$("[data-go]").forEach(b => b.addEventListener("click", () =>
    b.dataset.go === "practise" ? Deck.deal() : Deck.go(Deck.firstOf("Watch"))));
  const restart = $("#restartBtn"), toStart = $("#toStartBtn");
  if (restart) restart.addEventListener("click", () => Deck.deal("cases"));
  if (toStart) toStart.addEventListener("click", () => Deck.go(0));
  document.addEventListener("keydown", e => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const onControl = e.target.closest && e.target.closest("button, [role=button], input, textarea");
    // on the scroll page, up, down, Page Up/Down and Space scroll the page as usual
    const fwd = SCROLL ? ["ArrowRight"] : ["ArrowRight", "PageDown"];
    const back = SCROLL ? ["ArrowLeft"] : ["ArrowLeft", "PageUp"];
    if (onControl && e.key.startsWith("Arrow") && e.target.closest(".chip, .bucket")) return;
    if (fwd.includes(e.key)) { e.preventDefault(); Deck.next(); }
    else if (back.includes(e.key)) { e.preventDefault(); Deck.prev(); }
  });
});
