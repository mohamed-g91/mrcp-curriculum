/* ---------- agent tools ----------
   A few small tools over the deck, in the shape WebMCP uses ({ description, inputSchema, execute }),
   so an agent reads the page as JSON instead of screenshots. checks/check.mjs and the QA reviews call
   them through window.MRCP_TOOLS; a browser with WebMCP (document.modelContext) is offered them too:
   the navigation tools on every page, the layout tool only on the presenter's deck.
   No tool ever returns a case's answer, hint or clue: a case gives nothing away, to an agent as to a person. */
// a slide's English title, without its Arabic
const slideTitle = s => {
  const h = $("h1, h2", s);
  if (!h) return s.getAttribute("aria-label") || "";
  const c = h.cloneNode(true); $$(".ar, .ar-title", c).forEach(x => x.remove());
  return c.textContent.replace(/\s+/g, " ").trim();
};
const slidePattern = s => ([...s.classList].find(c => c.startsWith("p-")) || "").slice(2);
const slideBrief = (s, k) => ({ n: k + 1, id: s.dataset.id, part: s.dataset.part || "", pattern: slidePattern(s), title: slideTitle(s) });

const AgentTools = {
  "lesson-outline": {
    description: "Lists this lesson's slides in order: number, id, part (Learn or Practise), pattern and title.",
    inputSchema: { type: "object", properties: {} },
    execute() {
      return { topic: TOPIC.id, title: TOPIC.title, presenter: PRESENTER, slides: Deck.slides.map(slideBrief) };
    }
  },
  "slide-state": {
    description: "Describes the slide on screen: where it is in its part, what is open on it, a case's progress and the score.",
    inputSchema: { type: "object", properties: {} },
    execute() {
      const s = Deck.slides[Deck.i], [first, last] = Deck.range(), root = document.documentElement;
      const state = Object.assign(slideBrief(s, Deck.i), {
        place: `${Deck.i - first + 1} / ${last - first + 1}`,
        view: ["fluid", "phone", "sideways", "present", "ar-off"].filter(c => root.classList.contains(c)),
        theme: root.getAttribute("data-theme") || "light",
        // what is open, by its own label (a figure built over several taps says how far it has got)
        open: $$(".open, .on, .shown.spec-stop, .reveal-item.open", s).map(n => n.getAttribute("aria-label") || enText(n).slice(0, 40)).filter(Boolean).slice(0, 12),
        steps: $(".stepper", s) ? "building" : $(".step-btn", s) ? "built" : ""
      });
      if (s.classList.contains("case")) {
        // the case's progress, never its answer: how many wrong tries, and whether it is solved
        state.case = { solved: !!$(".choice.correct", s), wrong: $$(".choice.wrong", s).length, scored: !s.classList.contains("solved") };
      }
      if (s.dataset.part === "Practise") state.score = { got: Score.got, total: Score.total };
      return state;
    }
  },
  "go-to-slide": {
    description: "Shows a slide of this lesson, by its number (as in the address, from 1) or its id from lesson-outline.",
    inputSchema: { type: "object", properties: { slide: { type: ["integer", "string"], description: "The slide's number from 1, or its id, e.g. \"title\" or \"case-2\"." } }, required: ["slide"] },
    execute({ slide } = {}) {
      const k = /^\d+$/.test(String(slide)) ? Number(slide) - 1 : Deck.byId(String(slide));
      if (!(k >= 0 && k < Deck.slides.length)) return { error: `No slide "${slide}"; lesson-outline lists them (1 to ${Deck.slides.length}).` };
      Deck.go(k);
      return AgentTools["slide-state"].execute();
    }
  },
  "layout-report": {
    dev: true,
    description: "Measures the slide on screen: anything off the screen sideways, the page scrolling sideways, the slide scrolling on the stage, and an open zoom circle's text spilling out of it.",
    inputSchema: { type: "object", properties: { width: { type: "integer", description: "The window's width in CSS pixels; the page's own width if left out." } } },
    execute({ width } = {}) {
      const d = document.documentElement, deck = $("#deck"), W = width || d.clientWidth;
      const fluid = d.classList.contains("fluid"), s = Deck.slides[Deck.i];
      const wide = $$("*", s).filter(n => { const r = n.getBoundingClientRect(); return r.width && (r.right > W + 1 || r.left < -1); })
        .slice(0, 3).map(n => (typeof n.className === "string" ? n.className : n.className.baseVal) || n.tagName);
      // the open zoom circle: its name and every example pill must sit inside the circle (null: none open)
      let spill = null;
      const b = $(".spec-bubble.open", s);
      if (b) {
        const r = b.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, R = r.width / 2 - 4;
        const out = $$(".bubble-label, .bubble-ex li", b).filter(n => {
          const q = n.getBoundingClientRect();
          return [[q.left, q.top], [q.right, q.top], [q.left, q.bottom], [q.right, q.bottom]].some(([x, y]) => Math.hypot(x - cx, y - cy) > R);
        });
        spill = out.length ? b.getAttribute("aria-label") + " spills out of its circle: " + out.slice(0, 3).map(n => n.textContent).join(", ") : "";
      }
      return { id: s.dataset.id, fluid, hscroll: d.scrollWidth > W + 1 || innerWidth > W, wide,
               vscroll: !fluid && deck.scrollHeight > deck.clientHeight + 1, over: deck.scrollHeight - deck.clientHeight, spill };
    }
  }
};
window.MRCP_TOOLS = AgentTools;

// a browser with WebMCP: offer the tools to its agent (the candidate's page keeps to the navigation ones)
document.addEventListener("DOMContentLoaded", () => {
  const mc = document.modelContext;
  if (!mc || typeof mc.registerTool !== "function") return;
  for (const [name, t] of Object.entries(AgentTools)) {
    if (t.dev && !PRESENTER) continue;
    try {
      Promise.resolve(mc.registerTool({ name, description: t.description, inputSchema: t.inputSchema, execute: args => t.execute(args || {}) })).catch(() => {});
    } catch (e) {}
  }
});
