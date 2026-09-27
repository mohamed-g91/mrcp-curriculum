/* ---------- helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const el = (tag, attrs = {}, html = "") => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") n.className = v;
    else n.setAttribute(k, v);
  }
  if (html) n.innerHTML = html;
  return n;
};
const icon = id => `<svg class="ico" aria-hidden="true"><use href="#i-${id}"/></svg>`;
const shake = n => { n.classList.remove("shake"); void n.offsetWidth; n.classList.add("shake"); };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const concept = key => TOPIC.concepts[key];
// what a concept's circle holds: its letter, or its icon when it has no letter
const conceptMark = c => c.letter ? esc(c.letter) : c.icon ? icon(c.icon) : "";

/* ---------- record ----------
   Every learner event passes through here: slide views and answers, keyed by permanent IDs.
   It does nothing yet. Later it will send events to the traffic analytics and the results database. */
function record(event, data) {}

/* ---------- theme ---------- */
(function theme() {
  const root = document.documentElement;
  let saved = null;
  try { saved = localStorage.getItem("mrcp-theme"); } catch (e) {}
  const set = t => {
    root.setAttribute("data-theme", t);
    $("#themeBtn use").setAttribute("href", t === "dark" ? "#i-sun" : "#i-moon");
    try { localStorage.setItem("mrcp-theme", t); } catch (e) {}
  };
  set(saved || "light");
  $("#themeBtn").addEventListener("click", () => set(root.getAttribute("data-theme") === "dark" ? "light" : "dark"));
})();

/* ---------- score: correct at the first attempt, each case counted once ---------- */
const Score = {
  got: 0, total: 0, seen: new Set(),
  add(id, firstTry) {
    if (this.seen.has(id)) return;
    this.seen.add(id); this.total++; if (firstTry) this.got++;
    this.render();
  },
  reset() { this.got = 0; this.total = 0; this.seen.clear(); this.render(); },
  render() {
    $("#scorePill").textContent = `Score ${this.got} / ${this.total}`;
    const fs = $("#finalScore"), fm = $("#finalMsg");
    if (!fs) return;
    fs.textContent = `${this.got} / ${this.total}`;
    const pct = this.total ? this.got / this.total : 0;
    fm.textContent = !this.total ? "Work through the cases to build your score." :
      pct >= .85 ? "Excellent. You're ready for exam stems." :
      pct >= .6 ? "Good. Go back over the three questions for the ones you missed." :
      "Go back over the three questions, then deal new cases.";
  }
};

/* ---------- click away ----------
   A click anywhere else closes whatever is open. Each pattern registers its own closer.
   Not every click counts: a drag or scroll, a click on the top or bottom bar, and a near miss
   (just beside a control on the slide) close nothing. */
const ClickAway = {
  fns: [],
  add(fn) { this.fns.push(fn); }
};
const TAPPABLE = "button, a, [role=button], .reveal-item, .cv-chip, .spec-dot, .tree-a, .tree-final, .qf-q, .chip, .bucket, .dp-swap";
let downAt = null;
document.addEventListener("pointerdown", e => { downAt = [e.clientX, e.clientY]; }, true);
const strayClick = e => {
  if (e.target.closest(".topbar, .navbar")) return true;
  if (!e.detail) return false;  // from the keyboard: no place to judge
  if (downAt && Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 10) return true;
  if (e.target.closest(TAPPABLE)) return false;
  const slide = $(".slide.active"), M = 24;
  return !!slide && $$(TAPPABLE, slide).some(el => {
    const r = el.getBoundingClientRect();
    return r.width && e.clientX > r.left - M && e.clientX < r.right + M && e.clientY > r.top - M && e.clientY < r.bottom + M;
  });
};
document.addEventListener("click", e => { if (!strayClick(e)) ClickAway.fns.forEach(f => f(e)); });

/* small Back and Next buttons in the corner of a figure built step by step (a story, a worked sum):
   a stray click never undoes the steps, and these move one step either way */
function stepButtons(host, back, next) {
  const box = document.createElement("div");
  box.className = "step-ctl";
  box.innerHTML = ["left:Previous step", "right:Next step"].map(s => {
    const [ico, label] = s.split(":");
    return `<button type="button" class="step-btn" aria-label="${label}"><svg class="ico" aria-hidden="true"><use href="#i-${ico}"/></svg></button>`;
  }).join("");
  const [b, n] = box.children;
  b.addEventListener("click", e => { e.stopPropagation(); back(); });
  n.addEventListener("click", e => { e.stopPropagation(); next(); });
  host.appendChild(box);
  return (canBack, canNext) => { b.disabled = !canBack; n.disabled = !canNext; };
}

/* re-entering a slide starts it fresh: patterns listen for "slideenter" on their section */
const onEnter = (node, fn) => { const s = node.closest(".slide"); if (s) s.addEventListener("slideenter", fn); };
