
/* ---------- zoom circle ----------
   A large circle in the middle of the slide that grows out of a small dot and shrinks back into it,
   holding a letter, a name and examples. The rest of the slide fades back while it is open.
   Used by zoom spectra (from a circle) and by decision trees (from a final answer). */
function makeZoom(slide) {
  let bubble = null;
  // where the dot sits relative to the slide, in unscaled stage pixels
  const geometry = dot => {
    const s = Stage.s || 1, sr = slide.getBoundingClientRect(), dr = dot.getBoundingClientRect();
    const w = sr.width / s, h = sr.height / s;
    const D = Math.round(Math.min(500, w * .9, Math.max(h * .94, 320)));
    return { D, cx: w / 2, cy: Math.max(h / 2, D / 2 + 8),
      dx: (dr.left - sr.left + dr.width / 2) / s, dy: (dr.top - sr.top + dr.height / 2) / s, d: dr.width / s };
  };
  const atDot = g => `translate(${g.dx - g.cx}px, ${g.dy - g.cy}px) scale(${g.d / g.D})`;
  const grow = ({ dot, fam, letter, label, ar, ex }) => {
    const g = geometry(dot);
    // a long name or a long list takes a smaller size, so everything stays inside the circle
    const n = $$("li", ex).length;
    const b = el("div", { class: `spec-bubble ${fam}${label.length > 10 ? " long-label" : ""}${n > 5 ? " many" : ""}`,
      role: "dialog", "aria-label": `${label} examples` });
    b.innerHTML = `<div class="bubble-body"><span class="bubble-letter">${letter}</span>` +
      `<b class="bubble-label"><span class="en">${esc(label)}</span>${arTail(ar)}</b></div>`;
    const list = ex.cloneNode(true);
    list.hidden = false;
    list.className = list.classList.contains("spec-split") ? "bubble-ex bubble-split" : "bubble-ex";
    $(".bubble-body", b).appendChild(list);
    Object.assign(b.style, { width: g.D + "px", height: g.D + "px", left: g.cx - g.D / 2 + "px", top: g.cy - g.D / 2 + "px" });
    b.style.transform = atDot(g);
    b._geo = g;
    slide.appendChild(b);
    void b.offsetWidth;
    b.classList.add("open");
    b.style.transform = "none";
    return b;
  };
  const shrink = (b, instant) => {
    if (!b) return;
    b.classList.remove("open");
    if (instant || REDUCED_MOTION) return b.remove();
    b.classList.add("closing");
    b.style.transform = atDot(b._geo);
    setTimeout(() => b.remove(), 480);
  };
  return {
    get open() { return !!bubble; },
    // show({dot, fam, letter, label, ex}) opens (or swaps to) a circle; show(null) closes it
    show(opts, instant) {
      shrink(bubble, instant);
      bubble = opts ? grow(opts) : null;
      slide.classList.toggle("focusing", !!opts);
    }
  };
}
const famClass = node => [...node.classList].find(c => c.startsWith("f-")) || "";

/* ---------- spectrum (tap-to-reveal circles) ----------
   Tapping a circle opens it and closes its neighbour; tapping it again or anywhere else closes it.
   List spectra show the examples as bullets under the circle.
   Zoom spectra (.spec-zoom) open the examples in a zoom circle instead.
   Drill spectra (.spec-drill) show the families as cards first: a tap opens that family's circles in one tray under
   the cards (one family at a time, a tap on it again closes it); then a circle opens its zoom circle as above.
   A parent circle in the tray (.spec-parent, such as Ordinal) opens its kinds instead: the circle steps aside, an arrow
   points to the kinds, and each kind opens its own zoom circle; a tap on the parent again closes them.
   A click elsewhere closes the deepest open thing first (the zoom circle, then the kinds, then the family).
   An insert card (.spec-insert, Ranked) starts as a tab peeking out between its neighbours (.spec.peek): a tap lets it in,
   and it stays in until the slide is entered again. */
function buildSpectra() {
  $$(".spec").forEach(spec => {
    const zoom = spec.classList.contains("spec-zoom") ? makeZoom(spec.closest(".slide")) : null;
    const drill = spec.classList.contains("spec-drill"), cards = $$(".spec-card", spec), tray = $(".spec-line", spec);
    let group = null;
    const set = (stop, instant) => {
      $$(".spec-stop", spec).forEach(s => {
        s.classList.toggle("on", s === stop);
        if (!s.classList.contains("spec-parent")) $(".spec-dot", s).setAttribute("aria-expanded", String(s === stop));
      });
      if (zoom) zoom.show(stop && { dot: $(".spec-dot", stop), fam: famClass(stop), letter: $(".spec-dot", stop).innerHTML,
        label: enText($(":scope > b", stop)), ar: arText($(":scope > b", stop)), ex: $(".spec-ex", stop) }, instant);
      spec.dispatchEvent(new CustomEvent("specchange", { detail: stop ? stop.dataset.type : null }));
    };
    // a parent's kinds open beside it, and it steps left to make room (the same circle, moved, never swapped)
    const kidsOf = parent => $$(`.spec-kid[data-parent="${parent.dataset.id}"], .spec-arrow[data-parent="${parent.dataset.id}"]`, spec);
    const toggleKids = (parent, on, instant) => {
      if (parent.classList.contains("open") === on) return;
      const before = parent.getBoundingClientRect().left;
      parent.classList.toggle("open", on);
      $(".spec-dot", parent).setAttribute("aria-expanded", String(on));
      kidsOf(parent).forEach(k => k.classList.toggle("shown", on));
      tray.classList.toggle("kids", !!$(".spec-parent.open", spec));
      const dx = (before - parent.getBoundingClientRect().left) / (Stage.s || 1);
      if (dx && !instant && !REDUCED_MOTION) {
        parent.style.transition = "none";
        parent.style.transform = `translateX(${dx}px)`;
        void parent.offsetWidth;
        parent.style.transition = "transform .5s var(--ease)";
        parent.style.transform = "";
        setTimeout(() => { parent.style.transition = ""; }, 540);
      }
    };
    const closeKids = instant => { set(null, instant); $$(".spec-parent.open", spec).forEach(p => toggleKids(p, false, instant)); };
    // the pointer on the tray points up at the open card's middle
    // (from the boxes as drawn, so a card shifted aside while the insert peeks is pointed at where it is)
    const place = () => {
      if (!group) return;
      const g = group.getBoundingClientRect(), t = tray.getBoundingClientRect(), k = tray.offsetWidth / t.width || 1;
      tray.style.setProperty("--px", (g.left + g.width / 2 - t.left) * k + "px");
    };
    // the insert card peeks again (instantly) when the slide is entered, and comes in on a tap
    const peek = on => {
      if (!$(".spec-insert", spec)) return;
      spec.classList.add("still");
      spec.classList.toggle("peek", on);
      void spec.offsetWidth;
      spec.classList.remove("still");
    };
    const openGroup = (card, instant) => {
      closeKids(true);  // a zoom circle and any open kinds go with their family
      group = card;
      cards.forEach(c => { c.classList.toggle("on", c === card); c.setAttribute("aria-expanded", String(c === card)); });
      $$(".spec-stop", spec).forEach(s => s.classList.toggle("shown", !!card && s.dataset.group === card.dataset.group && !s.dataset.parent));
      tray.className = "spec-line" + (card ? ` open ${famClass(card)}` : "");
      place();
    };
    cards.forEach(card => card.addEventListener("click", () => {
      if (spec.classList.contains("peek")) {
        if (!card.classList.contains("spec-insert")) return openGroup(card === group ? null : card);
        openGroup(null);
        return spec.classList.remove("peek");
      }
      openGroup(card === group ? null : card);
    }));
    window.addEventListener("resize", place);
    $$(".spec-dot", spec).forEach(dot => dot.addEventListener("click", () => {
      const stop = dot.closest(".spec-stop");
      if (stop.classList.contains("spec-parent")) { set(null); toggleKids(stop, !stop.classList.contains("open")); return; }
      set(stop.classList.contains("on") ? null : stop);
    }));
    ClickAway.add(e => {
      if (e.target.closest(".spec-dot, .spec-ex, .spec-bubble, mark.clue")) return;
      if ($(".spec-stop.on", spec)) return set(null);
      if (e.target.closest(".spec-card, .spec-line")) return;
      if ($(".spec-parent.open", spec)) closeKids();
      else if (drill && group) openGroup(null);
    });
    document.addEventListener("keydown", e => {
      if (e.key !== "Escape") return;
      if ($(".spec-stop.on", spec)) set(null);
      else if ($(".spec-parent.open", spec)) closeKids();
      else if (drill && group) openGroup(null);
    });
    onEnter(spec, () => { if (drill) { peek(true); openGroup(null, true); } else set(null, true); });
  });
}
const REDUCED_MOTION = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
