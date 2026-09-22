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
   A click anywhere else closes whatever is open. Each pattern registers its own closer. */
const ClickAway = {
  fns: [],
  add(fn) { this.fns.push(fn); }
};
document.addEventListener("click", e => ClickAway.fns.forEach(f => f(e)));

/* re-entering a slide starts it fresh: patterns listen for "slideenter" on their section */
const onEnter = (node, fn) => { const s = node.closest(".slide"); if (s) s.addEventListener("slideenter", fn); };
