
/* ---------- drag to bucket: pointer drag, tap-then-bucket, or keyboard ---------- */
const chipDeselectors = new Set();
ClickAway.add(e => { if (!e.target.closest(".chip, .bucket")) chipDeselectors.forEach(f => f()); });

function makeSorter(buckets, onDrop) {
  let selected = null;
  const bucketAt = (x, y) => buckets.find(b => {
    const r = b.el.getBoundingClientRect();
    return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  });
  const clearOver = () => buckets.forEach(b => b.el.classList.remove("over"));
  const select = chip => {
    if (selected) selected.classList.remove("selected");
    selected = chip && chip !== selected ? chip : null;
    if (selected) selected.classList.add("selected");
    buckets.forEach(b => b.el.classList.toggle("clickable", !!selected));
  };
  // a sorter rebuilt by Reset leaves its old buckets behind: their deselectors go before the new one joins
  chipDeselectors.forEach(f => { if (!f.alive()) chipDeselectors.delete(f); });
  const deselect = () => { if (selected) select(null); };
  deselect.alive = () => buckets[0].el.isConnected;
  chipDeselectors.add(deselect);
  const attempt = (chip, bucket) => {
    select(null);
    if (onDrop(chip, bucket.key)) {
      chip.classList.add("correct", "snap");
      chip.setAttribute("aria-disabled", "true");
      chip.tabIndex = -1;
      $(".bucket-items", bucket.el).appendChild(chip);
      bucket.el.classList.remove("caught"); void bucket.el.offsetWidth; bucket.el.classList.add("caught");
    } else {
      chip.classList.add("wrong"); shake(chip);
      setTimeout(() => chip.classList.remove("wrong"), 700);
    }
  };
  buckets.forEach(b => {
    b.el.addEventListener("click", () => { if (selected) attempt(selected, b); });
    b.el.addEventListener("keydown", e => { if ((e.key === "Enter" || e.key === " ") && selected) { e.preventDefault(); attempt(selected, b); } });
  });

  return function wire(chip) {
    chip.tabIndex = 0;
    chip.setAttribute("role", "button");
    chip.addEventListener("keydown", e => {
      if (chip.classList.contains("correct")) return;
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(chip); if (selected) buckets[0].el.focus(); }
    });
    chip.addEventListener("pointerdown", e => {
      if (chip.classList.contains("correct") || e.button > 0) return;
      const sx = e.clientX, sy = e.clientY, rect = chip.getBoundingClientRect();
      const offX = sx - rect.left, offY = sy - rect.top;
      let dragging = false, clone = null;
      chip.setPointerCapture(e.pointerId);
      const move = ev => {
        if (!dragging && Math.hypot(ev.clientX - sx, ev.clientY - sy) > 6) {
          dragging = true;
          // the clone lives outside the scaled stage, so it is scaled to match
          clone = chip.cloneNode(true);
          clone.classList.add("dragging");
          clone.style.width = rect.width / Stage.s + "px";
          clone.style.transform = `scale(${Stage.s}) rotate(-2deg)`;
          document.body.appendChild(clone);
          chip.classList.add("ghost");
        }
        if (dragging) {
          clone.style.left = ev.clientX - offX + "px";
          clone.style.top = ev.clientY - offY + "px";
          clearOver();
          const b = bucketAt(ev.clientX, ev.clientY);
          if (b) b.el.classList.add("over");
        }
      };
      const up = ev => {
        chip.removeEventListener("pointermove", move);
        chip.removeEventListener("pointerup", up);
        chip.removeEventListener("pointercancel", up);
        clearOver();
        if (dragging) {
          clone.remove(); chip.classList.remove("ghost");
          const b = bucketAt(ev.clientX, ev.clientY);
          if (b) attempt(chip, b);
        } else select(chip);
      };
      chip.addEventListener("pointermove", move);
      chip.addEventListener("pointerup", up);
      chip.addEventListener("pointercancel", up);
    });
  };
}

/* ---------- sort: variables into the topic's buckets (warm-up, not scored) ---------- */
function buildSort(host) {
  const S = TOPIC.sorts[host.dataset.sort];
  host.innerHTML = "";
  const pool = el("div", { class: "pool", "aria-label": "Items to sort" });
  const wrap = el("div", { class: "buckets" });
  const buckets = S.buckets.map(key => {
    const c = concept(key);
    const b = el("div", { class: `bucket f-${c.family}`, tabindex: "0", "data-key": key, "aria-label": `${c.label} bucket` },
      // a pail: a raised handle, an open rim, a tapered body; chips land inside, the name sits low on its side
      `<span class="pail-handle" aria-hidden="true"></span><svg class="pail-body" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">` +
      `<path d="M1 3 L99 3 L90 97 Q50 100 10 97 Z"/></svg><span class="pail-rim" aria-hidden="true"></span>` +
      `<div class="bucket-items"></div><div class="bucket-head"><span class="bucket-letter">${conceptMark(c)}</span><span>${esc(c.label)}${arTail(c.ar)}</span></div>`);
    wrap.appendChild(b);
    return { key, el: b };
  });
  const fb = el("div", { class: "feedback", "aria-live": "polite" });
  const firstTry = new Map();
  let placed = 0;
  const wire = makeSorter(buckets, (chip, key) => {
    const item = S.items[+chip.dataset.i];
    const ok = item.answer === key;
    if (!firstTry.has(item.id)) firstTry.set(item.id, ok);
    record("answer", { id: item.id, choice: key, correct: ok });
    fb.className = "feedback show " + (ok ? "ok" : "bad");
    fb.innerHTML = ok ? `${icon("check")}<span><b>${esc(item.label)}</b>: correct. ${esc(item.why)}</span>`
      : `${icon("cross")}<span><b>${esc(item.label)}</b> isn't ${esc(concept(key).label)}. ${esc(S.retry)}</span>`;
    if (ok && ++placed === S.items.length) {
      const n = [...firstTry.values()].filter(Boolean).length;
      fb.innerHTML = `${icon("check")}<span>All sorted: ${n} of ${S.items.length} right first time. ${esc(S.done)}</span>`;
    }
    return ok;
  });
  const order = [...S.items.keys()];
  for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  order.forEach(i => {
    const c = el("div", { class: "chip", "data-i": String(i) }, esc(S.items[i].label));
    wire(c); pool.appendChild(c);
  });
  const reset = el("button", { class: "btn", type: "button" }, `${icon("refresh")}Reset`);
  reset.addEventListener("click", () => buildSort(host));
  const actions = el("div", { class: "sort-actions" });
  actions.appendChild(reset);
  host.append(pool, wrap, fb, actions);
}

function buildSorts() { $$(".sort").forEach(buildSort); }
