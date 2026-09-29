// Automated page check: drives headless Chrome through a built topic page.
//
//   node checks/check.mjs dist/statistics/data-types.html [--shots out-dir]
//
// For each window size (1280 x 720 stage, 1920 x 1080 recording, 1920 x 940 browser, 768 x 1024 and 1024 x 768 tablet, 375 x 812 phone) it visits
// every slide, opens every reveal on it, and checks there is no sideways overflow and, on the
// stage, no vertical scrolling. Then it solves every case, sorts the warm-up, tries the recording
// view's pen and zoom on a 16:10 tablet, and fails on any
// console error or network request. --shots saves a screenshot of every slide and open state.
import { spawn } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const CHROME = process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9333;
const SIZES = [
  { name: "stage", width: 1280, height: 720 },
  { name: "rec", width: 1920, height: 1080 },
  { name: "browser", width: 1920, height: 940 },  // a full-screen browser window, wider than 16:9
  { name: "tablet", width: 768, height: 1024, mobile: true },
  { name: "tablet-wide", width: 1024, height: 768, mobile: true },
  { name: "phone", width: 375, height: 812, mobile: true },
];

const args = process.argv.slice(2);
const page = args.find(a => !a.startsWith("--"));
const shotsAt = args.indexOf("--shots");
const shotDir = shotsAt >= 0 ? resolve(args[shotsAt + 1]) : null;
if (!page) { console.error("usage: node checks/check.mjs <page.html> [--shots dir]"); process.exit(2); }
if (shotDir) mkdirSync(shotDir, { recursive: true });
const url = pathToFileURL(resolve(page)).href;

const sleep = ms => new Promise(r => setTimeout(r, ms));
const problems = [];
const fail = msg => { problems.push(msg); console.log("  FAIL " + msg); };

// ---------------------------------------------------------------- Chrome and the DevTools protocol
const profile = mkdtempSync(join(tmpdir(), "mrcp-check-"));
const chrome = spawn(CHROME, [
  "--headless=new", `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
  "--hide-scrollbars", "--no-first-run", "--no-default-browser-check", "--allow-file-access-from-files",
  // extra flags from the environment, e.g. CHROME_FLAGS=--no-sandbox in a container running as root
  ...(process.env.CHROME_FLAGS || "").split(" ").filter(Boolean), "about:blank",
], { stdio: "ignore" });

async function connect() {
  for (let i = 0; i < 50; i++) {
    try {
      const targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      const t = targets.find(x => x.type === "page");
      if (t) return t.webSocketDebuggerUrl;
    } catch (e) {}
    await sleep(200);
  }
  throw new Error("Chrome did not start");
}

const ws = new WebSocket(await connect());
await new Promise(r => ws.addEventListener("open", r, { once: true }));
let nextId = 1;
const pending = new Map();
const listeners = [];
ws.addEventListener("message", ev => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) {
    const { ok, no } = pending.get(m.id); pending.delete(m.id);
    m.error ? no(new Error(m.error.message)) : ok(m.result);
  } else if (m.method) listeners.forEach(f => f(m));
});
const send = (method, params = {}) => new Promise((ok, no) => {
  const id = nextId++; pending.set(id, { ok, no }); ws.send(JSON.stringify({ id, method, params }));
});
const js = async expr => {
  const r = await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error(`page error in: ${expr.slice(0, 80)}\n${r.exceptionDetails.exception?.description || r.exceptionDetails.text}`);
  return r.result.value;
};
const shot = async name => {
  if (!shotDir) return;
  const { data } = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(join(shotDir, name + ".png"), Buffer.from(data, "base64"));
};

listeners.push(m => {
  if (m.method === "Runtime.exceptionThrown") fail(`console exception: ${m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text}`);
  if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") fail(`console error: ${m.params.args.map(a => a.value).join(" ")}`);
  if (m.method === "Network.requestWillBeSent") {
    const u = m.params.request.url;
    if (!u.startsWith("data:") && !u.startsWith(url.split("#")[0])) fail(`network request: ${u}`);
  }
});
await send("Runtime.enable");
await send("Page.enable");
await send("Network.enable");

async function load(size) {
  await send("Emulation.setDeviceMetricsOverride", { width: size.width, height: size.height, deviceScaleFactor: 1, mobile: !!size.mobile });
  await send("Page.navigate", { url: url + "#1" });
  await sleep(700);
  await js("localStorage.clear(), true");
  await send("Page.reload", {});
  await sleep(700);
}

// ---------------------------------------------------------------- layout checks
const MEASURE = W => `(() => {
  const d = document.documentElement, deck = document.getElementById("deck");
  const fluid = d.classList.contains("fluid");
  const s = Deck.slides[Deck.i];
  // anything poking out of the screen sideways
  const wide = [...s.querySelectorAll("*")].filter(n => { const r = n.getBoundingClientRect(); return r.width && (r.right > ${W} + 1 || r.left < -1); })
    .slice(0, 3).map(n => n.className || n.tagName);
  return { id: s.dataset.id, fluid, hscroll: d.scrollWidth > ${W} + 1 || innerWidth > ${W}, wide,
           vscroll: !fluid && deck.scrollHeight > deck.clientHeight + 1, over: deck.scrollHeight - deck.clientHeight };
})()`;

async function measure(size, label) {
  const m = await js(MEASURE(size.width));
  const where = `${size.name} ${label}`;
  if (m.hscroll) fail(`${where}: page scrolls sideways`);
  if (m.wide.length) fail(`${where}: off screen: ${m.wide.join(", ")}`);
  if (m.vscroll && !/^(warmup|end)$/.test(m.id)) fail(`${where}: slide scrolls by ${m.over}px`);
  return m;
}

// the open zoom circle: its name and every example pill must sit inside the circle
const BUBBLE_SPILL = `s => {
  const b = s.querySelector(".spec-bubble.open");
  if (!b) return "no zoom circle opened";
  const r = b.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, R = r.width / 2 - 4;
  const out = [...b.querySelectorAll(".bubble-label, .bubble-ex li")].filter(n => {
    const q = n.getBoundingClientRect();
    return [[q.left, q.top], [q.right, q.top], [q.left, q.bottom], [q.right, q.bottom]].some(([x, y]) => Math.hypot(x - cx, y - cy) > R);
  });
  return out.length ? b.getAttribute("aria-label") + " spills out of its circle: " + out.slice(0, 3).map(n => n.textContent).join(", ") : "";
}`;

// open every reveal on the current slide, one at a time, measuring each state
const REVEALS = `(() => {
  const s = Deck.slides[Deck.i];
  return { dots: s.querySelectorAll(".spec-dot").length, cards: s.querySelectorAll(".reveal-item").length, qf: s.querySelectorAll(".qf-q").length,
           chips: s.querySelectorAll(".cv-chip").length, swap: s.querySelectorAll(".dp-swap").length,
           tree: s.querySelectorAll(".tree-level").length };
})()`;

async function layoutPass(size) {
  console.log(`\n${size.name} ${size.width}x${size.height}`);
  await load(size);
  const n = await js("Deck.slides.length");
  for (let i = 0; i < n; i++) {
    await js(`Deck.go(${i}), true`);
    await sleep(550);
    const m = await measure(size, `slide ${i + 1}`);
    const tag = `${size.name}-${String(i + 1).padStart(2, "0")}-${m.id}`;
    await shot(tag);
    // a story or a working: tap it through every beat, measuring each
    if (await js(`!!Deck.slides[Deck.i].querySelector(".stepper")`)) {
      for (let n = 0; n < 8 && await js(`!!Deck.slides[Deck.i].querySelector(".stepper")`); n++) {
        await js(`Deck.slides[Deck.i].querySelector(".stepper").click(), true`);
        await sleep(1400);
        await measure(size, `slide ${i + 1} beat ${n + 1}`);
        await shot(`${tag}-beat${n + 1}`);
      }
      if (await js(`!!Deck.slides[Deck.i].querySelector(".stepper")`)) fail(`${size.name} slide ${i + 1}: the story did not finish`);
      // a stray click leaves it built; Back steps it back one; Next finishes it again
      await js(`document.querySelector(".slide-title, .slide.active h2")?.click(), true`);
      if (await js(`!!Deck.slides[Deck.i].querySelector(".stepper")`)) fail(`${size.name} slide ${i + 1}: a stray click undid the steps`);
      await js(`Deck.slides[Deck.i].querySelector(".step-btn").click(), true`);
      await sleep(300);
      if (!await js(`!!Deck.slides[Deck.i].querySelector(".stepper")`)) fail(`${size.name} slide ${i + 1}: Back did not step back`);
      await measure(size, `slide ${i + 1} back`);
      await js(`Deck.slides[Deck.i].querySelectorAll(".step-btn")[1].click(), true`);
      await sleep(1400);
      if (await js(`!!Deck.slides[Deck.i].querySelector(".stepper")`)) fail(`${size.name} slide ${i + 1}: Next did not finish it again`);
    }
    const r = await js(REVEALS);
    for (let k = 0; k < r.dots; k++) {
      await js(`Deck.slides[Deck.i].querySelectorAll(".spec-dot")[${k}].click(), true`);
      const zoomed = await js(`!!Deck.slides[Deck.i].querySelector(".spec-zoom")`);
      await sleep(zoomed || k === 2 || k === r.dots - 1 ? 1600 : 250);
      await measure(size, `slide ${i + 1} circle ${k + 1}`);
      // a shape whose people drop in: wait for the last to land and the curve, middles and examples to follow
      if (await js(`!!Deck.slides[Deck.i].querySelector(".cv-drop")`)) {
        await sleep(5600);
        await measure(size, `slide ${i + 1} circle ${k + 1} built`);
        await shot(`${tag}-built${k + 1}`);
      }
      if (zoomed) { const out = await js(`(${BUBBLE_SPILL})(Deck.slides[Deck.i])`); if (out) fail(`${size.name} slide ${i + 1}: ${out}`); }
      if (k === 2 || k === r.dots - 1) await shot(`${tag}-open${k + 1}`);
    }
    for (let k = 0; k < r.cards; k++) {
      await js(`Deck.slides[Deck.i].querySelectorAll(".reveal-item")[${k}].click(), true`);
      await sleep(350);
      await measure(size, `slide ${i + 1} card ${k + 1}`);
    }
    if (r.cards) await shot(`${tag}-open`);
    // spread chips: each one shades its band and shows its summary
    for (let k = 0; k < r.chips; k++) {
      await js(`Deck.slides[Deck.i].querySelectorAll(".cv-chip")[${k}].click(), true`);
      await sleep(450);
      await measure(size, `slide ${i + 1} chip ${k + 1}`);
      const on = await js(`(() => { const c = Deck.slides[Deck.i].querySelectorAll(".cv-chip")[${k}]; return c.classList.contains("on") && c.closest(".cv-panel, .st-tools").classList.contains("open"); })()`);
      if (!on) fail(`${size.name} slide ${i + 1}: chip ${k + 1} did not open`);
      if (k % 3 === 2) await shot(`${tag}-chip${k + 1}`);
    }
    if (r.swap) {
      // the movable dot moves, and the open measure follows it
      await js(`Deck.slides[Deck.i].querySelector(".dp-m .spec-dot").click(), true`);
      await sleep(900);
      const before = await js(`Deck.slides[Deck.i].querySelector(".dp-mk text")?.textContent || ""`);
      await js(`Deck.slides[Deck.i].querySelector(".dp-swap").dispatchEvent(new MouseEvent("click", { bubbles: true })), true`);
      await sleep(900);
      const after = await js(`Deck.slides[Deck.i].querySelector(".dp-mk text")?.textContent || ""`);
      await measure(size, `slide ${i + 1} swapped`);
      if (!before || before === after) fail(`${size.name} slide ${i + 1}: moving the dot did not move the mean (${before} → ${after})`);
      await shot(`${tag}-swap`);
      await js(`document.body.click(), true`);
      await sleep(300);
    }
    if (r.qf) {
      for (let k = 0; k < r.qf; k++) {
        await js(`(() => { const q = Deck.slides[Deck.i].querySelectorAll(".qf-q")[${k}]; if (!q.disabled) q.click(); return true; })()`);
        await sleep(350);
      }
      await measure(size, `slide ${i + 1} flow answered`);
      await shot(`${tag}-open`);
    }
    const path = r.tree ? await js(`Deck.slides[Deck.i].querySelector(".tree").dataset.path || ""`) : "";
    if (path) {
      // a worked tree: each wrong answer says why and stops; the right answers reach the end of the path
      const steps = path.split(",");
      for (let k = 0; k < steps.length; k++) {
        const bad = steps[k] === "yes" ? "no" : "yes";
        await js(`Deck.slides[Deck.i].querySelectorAll(".tree-level")[${k}].querySelector(".tree-a.${bad}").click(), true`);
        await sleep(500);
        await measure(size, `slide ${i + 1} tree wrong at ${k + 1}`);
        const w = await js(`(() => { const lv = Deck.slides[Deck.i].querySelectorAll(".tree-level"); const why = lv[${k}].querySelector(".tree-why"); return { why: !!why && getComputedStyle(why).display !== "none", stopped: !lv[${k}].classList.contains("answered") }; })()`);
        if (!w.why || !w.stopped) fail(`${size.name} slide ${i + 1}: a wrong answer at step ${k + 1} did not say why and stop`);
        if (k === steps.length - 1) await shot(`${tag}-wrong`);
        await js(`Deck.slides[Deck.i].querySelectorAll(".tree-level")[${k}].querySelector(".tree-a.${steps[k]}").click(), true`);
        await sleep(400);
      }
      await sleep(700);
      await measure(size, `slide ${i + 1} tree solved`);
      // a path ending in No lands on that step's answer; one ending in Yes lands on the end card
      const grid = await js(`!!Deck.slides[Deck.i].querySelector(".tree-grid")`);
      const res = grid ? ".tg-final.shown" : steps[steps.length - 1] === "no" ? ".tree-level.no:not(.missed)" : ".tree-end.shown";
      const done = await js(`!!Deck.slides[Deck.i].querySelector("${res}") && !Deck.slides[Deck.i].querySelector(".tree-level.missed")`);
      if (!done) fail(`${size.name} slide ${i + 1}: the right answers did not reach the result`);
      await shot(`${tag}-solved`);
      const fin = `${res.replace(":not(.missed)", "")} .tree-final.zoomable`;
      if (await js(`!!Deck.slides[Deck.i].querySelector("${fin}")`)) {
        await js(`Deck.slides[Deck.i].querySelector("${fin}").click(), true`);
        await sleep(2200);
        const out = await js(`(${BUBBLE_SPILL})(Deck.slides[Deck.i])`);
        if (out) fail(`${size.name} slide ${i + 1}: ${out}`);
        await shot(`${tag}-zoom`);
        await js(`document.body.click(), true`);
        await sleep(600);
      }
    }
    const gridTree = r.tree ? await js(`!!Deck.slides[Deck.i].querySelector(".tree-grid")`) : false;
    if (r.tree && !path && gridTree) {
      // a tree in rows: Yes, Yes ends early; a No at step 1 skips step 2; then on to an end at step 4
      const tap = (k, a) => js(`Deck.slides[Deck.i].querySelectorAll(".tree-level")[${k}].querySelector(".tree-a.${a}").click(), true`);
      const shown = k => js(`Deck.slides[Deck.i].querySelectorAll(".tree-level")[${k}].classList.contains("shown")`);
      await tap(0, "yes"); await sleep(300); await tap(1, "yes"); await sleep(900);
      await measure(size, `slide ${i + 1} tree yes yes`);
      if (!await js(`!!Deck.slides[Deck.i].querySelector(".tg-final.shown")`)) fail(`${size.name} slide ${i + 1}: Yes, Yes did not reach an answer`);
      await shot(`${tag}-yes`);
      await tap(0, "no"); await sleep(900);
      await measure(size, `slide ${i + 1} tree skip`);
      if (await shown(1) || !await shown(2)) fail(`${size.name} slide ${i + 1}: a No at step 1 did not skip to step 3`);
      await tap(2, "yes"); await sleep(300); await tap(3, "no"); await sleep(900);
      await measure(size, `slide ${i + 1} tree to step 4`);
      if (!await js(`!!Deck.slides[Deck.i].querySelector(".tg-final.shown")`)) fail(`${size.name} slide ${i + 1}: step 4 did not reach an answer`);
      await shot(`${tag}-no`);
      await js(`Deck.slides[Deck.i].querySelector(".tg-final.shown .tree-final.zoomable").click(), true`);
      await sleep(1400);
      const z = await js(`(() => { const s = Deck.slides[Deck.i]; return { bubble: !!s.querySelector(".spec-bubble.open"), kept: !!s.querySelector(".tg-final.shown") }; })()`);
      if (!z.bubble) fail(`${size.name} slide ${i + 1}: tapping the final answer did not open its examples`);
      if (!z.kept) fail(`${size.name} slide ${i + 1}: tapping the final answer reset the tree`);
      const out = await js(`(${BUBBLE_SPILL})(Deck.slides[Deck.i])`);
      if (out) fail(`${size.name} slide ${i + 1}: ${out}`);
      await shot(`${tag}-zoom`);
      await js(`document.body.click(), true`);
      await sleep(600);
    }
    if (r.tree && !path && !gridTree) {
      // every Yes down to the end, then a No part-way
      for (let k = 0; k < r.tree - 1; k++) {
        await js(`Deck.slides[Deck.i].querySelectorAll(".tree-level")[${k}].querySelector(".tree-a.yes").click(), true`);
        await sleep(300);
      }
      await sleep(700);
      await measure(size, `slide ${i + 1} tree all yes`);
      const end = await js(`Deck.slides[Deck.i].querySelector(".tree-end").classList.contains("shown")`);
      if (!end) fail(`${size.name} slide ${i + 1}: the tree did not reach its end`);
      await shot(`${tag}-yes`);
      await js(`Deck.slides[Deck.i].querySelectorAll(".tree-level")[1].querySelector(".tree-a.no").click(), true`);
      await sleep(900);
      await measure(size, `slide ${i + 1} tree no`);
      const cut = await js(`(() => { const lv = Deck.slides[Deck.i].querySelectorAll(".tree-level"); return !lv[2].classList.contains("shown") && lv[1].classList.contains("no"); })()`);
      if (!cut) fail(`${size.name} slide ${i + 1}: a No did not close the branch below it`);
      await shot(`${tag}-no`);
      // a final answer with examples zooms them open, and the tree stays as it was underneath
      const zoomable = await js(`!!Deck.slides[Deck.i].querySelector(".tree-level.no .tree-final.zoomable")`);
      if (zoomable) {
        await js(`Deck.slides[Deck.i].querySelector(".tree-level.no .tree-final.zoomable").click(), true`);
        await sleep(1400);
        const z = await js(`(() => { const s = Deck.slides[Deck.i]; return { bubble: !!s.querySelector(".spec-bubble.open"), pills: s.querySelectorAll(".spec-bubble .bubble-ex li").length, kept: !!s.querySelector(".tree-level.no") }; })()`);
        if (!z.bubble || !z.pills) fail(`${size.name} slide ${i + 1}: tapping the final answer did not open its examples`);
        if (!z.kept) fail(`${size.name} slide ${i + 1}: tapping the final answer reset the tree`);
        await shot(`${tag}-zoom`);
        await js(`document.body.click(), true`);
        await sleep(600);
        const after = await js(`(() => { const s = Deck.slides[Deck.i]; return !s.querySelector(".spec-bubble") && !!s.querySelector(".tree-level.no"); })()`);
        if (!after) fail(`${size.name} slide ${i + 1}: a click away should close the circle and keep the tree`);
        // every answer's circle holds its name and examples inside the circle
        const finals = await js(`Deck.slides[Deck.i].querySelectorAll(".tree-final.zoomable").length`);
        for (let k = 0; k < finals; k++) {
          await js(`Deck.slides[Deck.i].querySelectorAll(".tree-final.zoomable")[${k}].click(), true`);
          await sleep(2200);
          const out = await js(`(${BUBBLE_SPILL})(Deck.slides[Deck.i])`);
          if (out) fail(`${size.name} slide ${i + 1}: ${out}`);
          await js(`document.body.click(), true`);
          await sleep(600);
        }
      }
    }
    await js(`document.body.click(), true`);
  }
}

// ---------------------------------------------------------------- behaviour checks
async function solvePass() {
  console.log("\ncases and warm-up");
  await load(SIZES[0]);
  await js(`document.querySelector('[data-go="practise"]').click(), true`);
  await sleep(400);
  // warm-up: tap each chip, then its right bucket
  const sorted = await js(`(async () => {
    const S = TOPIC.sorts.warmup, wait = ms => new Promise(r => setTimeout(r, ms));
    for (const chip of [...document.querySelectorAll(".pool .chip")]) {
      const item = S.items[+chip.dataset.i];
      chip.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
      document.querySelector('.bucket[data-key="' + item.answer + '"]').click();
      await wait(50);
    }
    return { left: document.querySelectorAll(".pool .chip").length, msg: document.querySelector(".sort .feedback").textContent };
  })()`);
  if (sorted.left) fail(`warm-up: ${sorted.left} chip(s) could not be placed`);
  else console.log("  ok   warm-up sorts: " + sorted.msg);
  // cases: the first practice case gets one wrong answer, then every case is solved
  const res = await js(`(async () => {
    const wait = ms => new Promise(r => setTimeout(r, ms)), out = [];
    const cases = [...document.querySelectorAll(".slide.case")];
    const all = Object.values(TOPIC.quizzes)[0].cases;
    for (const [pos, sec] of cases.entries()) {
      Deck.go(Deck.slides.indexOf(sec)); await wait(80);
      const c = all.find(x => x.id === sec.dataset.case);
      if (pos === 1) {
        const wrong = [...sec.querySelectorAll(".choice")].find(b => b.dataset.key !== c.answer);
        wrong.click(); await wait(80);
        out.push({ id: c.id, wrongLit: !!sec.querySelector("mark.lit"), wrongFb: sec.querySelector(".feedback.bad") !== null });
      }
      const right = sec.querySelector('.choice[data-key="' + c.answer + '"]');
      if (!right) { out.push({ id: c.id, missing: true }); continue; }
      right.click(); await wait(80);
      out.push({ id: c.id, ok: right.classList.contains("correct"), next: document.getElementById("nextBtn").classList.contains("ready") && /Next case|See your score/.test(document.getElementById("nextBtn").textContent), title: sec.querySelector("h2").textContent,
                 order: [...sec.querySelectorAll(".choice")].map(b => b.dataset.key).join(",") });
    }
    return { out, score: document.getElementById("scorePill").textContent, n: cases.length, total: all.length };
  })()`);
  if (res.n !== res.total) fail(`cases: ${res.n} dealt, ${res.total} written`);
  for (const r of res.out) {
    if (r.missing) fail(`${r.id}: the answer is not among the options`);
    else if ("wrongLit" in r) { if (!r.wrongLit || !r.wrongFb) fail(`${r.id}: a wrong answer did not hint and light the clue`); }
    else if (!r.ok || !r.next) fail(`${r.id}: did not solve cleanly`);
    else console.log(`  ok   ${r.title.padEnd(15)} ${r.id}  options ${r.order}`);
  }
  const want = `Score ${res.total - 2} / ${res.total - 1}`;  // solved example unscored, one wrong on purpose
  if (res.score !== want) fail(`score reads "${res.score}", expected "${want}"`);
  else console.log(`  ok   ${res.score}`);
  const firstIsSolved = await js(`document.querySelector(".slide.case").classList.contains("solved")`);
  if (!firstIsSolved) fail("the first case is not the solved example");
  await js(`Deck.go(Deck.slides.length - 1), true`);
  await sleep(400);
  await shot("stage-end-scored");
}

// the recording view on a 16:10 tablet (Galaxy Tab S10 FE): the frame sits at the top with the
// tray below; the pen writes without opening anything, the highlighter and undo work, ink
// belongs to its slide, two fingers zoom without turning the page, and a resting palm taps nothing
async function presentPass() {
  const TAB = { name: "present", width: 1152, height: 720, mobile: true };
  await load(TAB);
  await send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
  const tap = ".spec-dot, .reveal-item, .qf-q, .tree-a";
  const i = await js(`Deck.slides.findIndex(s => s.dataset.part === "Learn" && s.querySelector("${tap}"))`);
  if (i < 0) { console.log("  --   recording view: no Learn slide with a tappable item"); return; }
  await js(`Deck.go(${i}), Present.enter(false), true`);
  await sleep(700);
  const box = await js(`(() => { const a = document.getElementById("app").getBoundingClientRect(), t = document.getElementById("tray").getBoundingClientRect();
    return { top: a.top, h: a.height, w: a.width, tray: t.height, bar: getComputedStyle(document.querySelector(".topbar")).display }; })()`);
  if (Math.abs(box.top) > 1 || Math.abs(box.w / box.h - 16 / 9) > .01) fail(`recording view: the frame is not 16:9 at the top (${JSON.stringify(box)})`);
  if (box.tray < 55) fail(`recording view: the tray is only ${box.tray}px tall`);
  if (box.bar === "none") fail("recording view: the top bar is hidden");
  // every Learn slide still fits the frame, lowered under the top bar
  const over = await js(`(async () => { const out = [], deck = document.getElementById("deck");
    for (const [k, s] of Deck.slides.entries()) { if (s.dataset.part !== "Learn") continue;
      Deck.go(k); await new Promise(r => setTimeout(r, 150));
      if (deck.scrollHeight > deck.clientHeight + 1) out.push(s.dataset.id + " by " + (deck.scrollHeight - deck.clientHeight) + "px"); }
    return out; })()`);
  if (over.length) fail(`recording view: slides scroll: ${over.join(", ")}`);
  await js(`Deck.go(${i}), true`);
  await sleep(700);
  const open = `document.querySelectorAll(".slide.active .open, .slide.active .on, .slide.active [aria-expanded=true], .slide.active [aria-pressed=true]").length`;
  const target = await js(`(() => { const r = Deck.slides[Deck.i].querySelector("${tap}").getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; })()`);
  const pen = async (pts, button = "left") => {
    const ev = (type, [x, y]) => send("Input.dispatchMouseEvent", { type, x, y, button, buttons: type === "mouseReleased" ? 0 : 1, clickCount: 1, pointerType: "pen" });
    await ev("mousePressed", pts[0]);
    for (const p of pts.slice(1)) await ev("mouseMoved", p);
    await ev("mouseReleased", pts[pts.length - 1]);
    await sleep(100);
  };
  const before = await js(open);
  await pen([target, [target[0] + 40, target[1] + 10], [target[0] + 80, target[1] - 10]]);
  await pen([target]);  // a pen tap on the item itself
  await sleep(400);
  if (await js(open) !== before) fail("recording view: the pen opened an item on the slide");
  if (await js(`document.querySelectorAll("#inkPen path").length`) !== 2) fail("recording view: the pen did not draw two strokes");
  await js(`document.querySelector("[data-tool=marker]").click(), true`);
  await pen([[300, 200], [500, 205]]);
  if (await js(`document.querySelectorAll("#inkMarker path").length`) !== 1) fail("recording view: the highlighter did not draw");
  await shot("present-ink");
  await js(`document.getElementById("inkUndo").click(), true`);
  if (await js(`document.querySelectorAll("#inkMarker path").length`) !== 0) fail("recording view: undo left the highlighter stroke");
  await js(`document.getElementById("trayNext").click(), true`);
  await sleep(300);
  if (await js(`document.querySelectorAll("#inkPen path").length`) !== 0) fail("recording view: ink followed onto the next slide");
  await js(`document.getElementById("trayPrev").click(), true`);
  await sleep(300);
  if (await js(`document.querySelectorAll("#inkPen path").length`) !== 2) fail("recording view: the slide's ink did not come back");
  // a long press on the pen opens its sizes; the thick one draws a thick line
  const penAt = await js(`(() => { const r = document.querySelector("[data-tool=pen]").getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; })()`);
  await send("Input.dispatchMouseEvent", { type: "mousePressed", x: penAt[0], y: penAt[1], button: "left", buttons: 1, clickCount: 1 });
  await sleep(700);
  await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: penAt[0], y: penAt[1], button: "left", buttons: 0, clickCount: 1 });
  if (await js(`document.getElementById("sizePanel").hidden`)) fail("recording view: a long press on the pen did not open its sizes");
  await js(`document.querySelector("[data-size='2']").click(), true`);
  if (!(await js(`document.getElementById("sizePanel").hidden`))) fail("recording view: choosing a size did not close the panel");
  await pen([target, [target[0] + 40, target[1] + 10], [target[0] + 80, target[1] - 10]]);
  if (await js(`document.querySelector("#inkPen path:last-child").getAttribute("stroke-width")`) !== "7") fail("recording view: the thick pen did not draw a thick line");
  await js(`Present.size = 1, true`);
  // the side button pressed mid-stroke turns the pen into the eraser: it rubs out all the ink it passes
  const side = (type, [x, y], buttons) => send("Input.dispatchMouseEvent", { type, x, y, button: "left", buttons, clickCount: 1, pointerType: "pen" });
  await side("mousePressed", [target[0] - 150, target[1]], 1);
  await side("mouseMoved", [target[0] - 100, target[1]], 1);
  for (const dx of [-100, -50, 0, 40, 80]) await side("mouseMoved", [target[0] + dx, target[1] + (dx === 40 ? 10 : dx === 80 ? -10 : 0)], 3);
  await side("mouseReleased", [target[0] + 80, target[1] - 10], 0);
  await sleep(100);
  if (await js(`document.querySelectorAll("#inkPen path").length`) !== 0) fail("recording view: the side button did not rub the ink out");
  await js(`document.getElementById("inkUndo").click(), document.getElementById("inkUndo").click(), document.getElementById("inkUndo").click(), document.getElementById("inkUndo").click(), document.getElementById("inkUndo").click(), true`);
  await sleep(700);  // past the palm window, so the fingers below are not taken for a resting hand
  await sleep(700);  // past the palm window, so the fingers below are not taken for a resting hand
  // two fingers pinch out: the slide zooms and stays put
  const touch = (type, pts) => send("Input.dispatchTouchEvent", { type, touchPoints: pts.map(([x, y], id) => ({ x, y, id })) });
  await touch("touchStart", [[520, 300]]);
  await touch("touchStart", [[520, 300], [620, 300]]);
  for (let k = 1; k <= 6; k++) await touch("touchMove", [[520 - k * 20, 300], [620 + k * 20, 300]]);
  await touch("touchEnd", []);
  await sleep(400);
  const z = await js(`[Present.z, Deck.i]`);
  if (!(z[0] > 1.5)) fail(`recording view: the pinch zoomed only to ${z[0]}`);
  if (z[1] !== i) fail("recording view: the pinch turned the page");
  if (await js(open) !== before) fail("recording view: the pinch opened an item on the slide");
  await shot("present-zoom");
  await js(`document.getElementById("zoomReset").click(), true`);
  if (await js(`Present.z`) !== 1) fail("recording view: the whole-slide button did not reset the zoom");
  // a palm resting while the pen hovers taps nothing
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 600, y: 400, pointerType: "pen", buttons: 0 });
  await touch("touchStart", [target]);
  await touch("touchEnd", []);
  await sleep(400);
  if (await js(open) !== before) fail("recording view: a palm near the pen opened an item");
  // a finger on its own still works the slide
  await sleep(700);
  await touch("touchStart", [target]);
  await touch("touchEnd", []);
  await sleep(400);
  if (await js(open) === before) fail("recording view: a finger tap no longer opens an item");
  // one finger dragged up scrolls a long slide (the browser may not pan, so the page does it);
  // a tall spacer makes the slide long when none is
  await js(`(() => { const d = document.createElement("div"); d.id = "tallSpacer"; d.style.height = "1400px";
    Deck.slides[Deck.i].appendChild(d); return true; })()`);
  await sleep(700);
  await js(`document.getElementById("deck").scrollTop = 0, true`);
  await touch("touchStart", [[640, 500]]);
  for (let k = 1; k <= 8; k++) await touch("touchMove", [[640, 500 - k * 25]]);
  await touch("touchEnd", []);
  await sleep(300);
  const sc = await js(`[document.getElementById("deck").scrollTop, Deck.i]`);
  if (!(sc[0] > 50)) fail(`recording view: a finger drag scrolled the slide only ${sc[0]}px`);
  if (sc[1] !== i) fail("recording view: a finger drag turned the page");
  await js(`document.getElementById("tallSpacer").remove(), true`);
  await js(`Present.leave(), true`);
  await send("Emulation.setTouchEmulationEnabled", { enabled: false });
  if (!problems.some(p => p.startsWith("recording view"))) console.log("  ok   recording view: pen, sizes panel, side button, highlighter, undo, ink per slide, pinch zoom, palm, finger scroll");
}

// dark mode: screenshots of every slide on the stage, for a look (layout is the same as light)
async function darkPass() {
  if (!shotDir) return;
  await load(SIZES[0]);
  await js(`document.getElementById("themeBtn").click(), true`);
  const n = await js("Deck.slides.length");
  for (let i = 0; i < n; i++) {
    await js(`Deck.go(${i}), true`);
    await sleep(500);
    const id = await js(`Deck.slides[Deck.i].dataset.id`);
    await js(`(() => { const d = Deck.slides[Deck.i].querySelector(".spec-dot, .reveal-item"); if (d) d.click(); return true; })()`);
    await sleep(900);
    await shot(`dark-${String(i + 1).padStart(2, "0")}-${id}`);
    await js(`document.body.click(), true`);
  }
  await js(`localStorage.removeItem("mrcp-theme"), true`);
}

try {
  for (const size of SIZES) await layoutPass(size);
  await solvePass();
  await presentPass();
  await darkPass();
} catch (e) {
  fail(e.message);
} finally {
  ws.close();
  chrome.kill();
  await sleep(300);
  try { rmSync(profile, { recursive: true, force: true }); } catch (e) {}
}
console.log(problems.length ? `\n${problems.length} problem(s).` : "\nAll checks passed.");
process.exit(problems.length ? 1 : 0);
