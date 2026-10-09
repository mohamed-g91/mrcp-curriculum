// Automated check of the site around the lessons: the home page, each specialty's lessons page and How it works.
//
//   node checks/check-site.mjs [dist] [--shots out-dir]
//
// At each window size (the six the lesson check uses) it loads every page and fails on sideways overflow, on a home
// page that does not fit one screen on a phone or tablet held upright, on a menu that does not open, take focus,
// close on Escape and on the dimmed page, and give focus back, on an old address (/#statistics, #lessons, #how)
// that does not reach its new page, on a lesson link or drawing that points at a missing file, and on any console
// error or request outside the build. --shots saves each page, and each page with its menu open.
import { spawn } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync, readFileSync, existsSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

const CHROME = process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const SIZES = [
  { name: "stage", width: 1280, height: 720 },
  { name: "rec", width: 1920, height: 1080 },
  { name: "browser", width: 1920, height: 940 },
  { name: "tablet", width: 768, height: 1024, mobile: true },
  { name: "tablet-wide", width: 1024, height: 768, mobile: true },
  { name: "phone", width: 375, height: 812, mobile: true },
];

const args = process.argv.slice(2);
const root = resolve(args.find(a => !a.startsWith("--")) || "dist");
const shotsAt = args.indexOf("--shots");
const shotDir = shotsAt >= 0 ? resolve(args[shotsAt + 1]) : null;
if (shotDir) mkdirSync(shotDir, { recursive: true });
const base = pathToFileURL(root).href + "/";
// the pages: home, How it works, and every folder with an index.html (a specialty)
const pages = ["index.html", "how-it-works.html",
  ...readdirSync(root, { withFileTypes: true }).filter(d => d.isDirectory() && existsSync(join(root, d.name, "index.html"))).map(d => d.name + "/index.html")];

const sleep = ms => new Promise(r => setTimeout(r, ms));
const problems = [];
const fail = msg => { problems.push(msg); console.log("  FAIL " + msg); };

// ---------------------------------------------------------------- Chrome and the DevTools protocol
const profile = mkdtempSync(join(tmpdir(), "mrcp-check-"));
const chrome = spawn(CHROME, [
  "--headless=new", "--remote-debugging-port=0", `--user-data-dir=${profile}`,
  "--hide-scrollbars", "--no-first-run", "--no-default-browser-check", "--allow-file-access-from-files",
  ...(process.env.CHROME_FLAGS || "").split(" ").filter(Boolean), "about:blank",
], { stdio: "ignore" });

async function connect() {
  for (let i = 0; i < 50; i++) {
    try {
      const port = readFileSync(join(profile, "DevToolsActivePort"), "utf8").split(/\s+/)[0].trim();
      const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
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
  const id = nextId++;
  const timer = setTimeout(() => { if (pending.delete(id)) no(new Error(`${method}: no answer from Chrome in 60 s`)); }, 60000);
  pending.set(id, { ok: r => { clearTimeout(timer); ok(r); }, no: e => { clearTimeout(timer); no(e); } });
  ws.send(JSON.stringify({ id, method, params }));
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

let where = "";
listeners.push(m => {
  if (m.method === "Runtime.exceptionThrown") fail(`${where}: console exception: ${m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text}`);
  if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") fail(`${where}: console error: ${m.params.args.map(a => a.value).join(" ")}`);
  if (m.method === "Network.requestWillBeSent") {
    const u = m.params.request.url;
    if (!u.startsWith("data:") && !u.startsWith(base)) fail(`${where}: request outside the build: ${u}`);
  }
  if (m.method === "Network.loadingFailed" && !m.params.canceled) fail(`${where}: a file did not load (${m.params.errorText})`);
});
await send("Runtime.enable");
await send("Page.enable");
await send("Network.enable");

async function go(rel, size) {
  await send("Emulation.setDeviceMetricsOverride", { width: size.width, height: size.height, deviceScaleFactor: 1, mobile: !!size.mobile });
  await send("Page.navigate", { url: base + rel });
  await sleep(500);
  // wait for the fonts and the drawings on show (a hidden lazy drawing never loads, so it is left out)
  await js("document.fonts.ready.then(() => Promise.all([...document.images].filter(i => i.getClientRects().length).map(i => Promise.race([i.decode().catch(() => 0), new Promise(r => setTimeout(r, 3000))])))).then(() => true)");
}

// ---------------------------------------------------------------- every page at every size
for (const size of SIZES) {
  for (const rel of pages) {
    where = `${rel} @ ${size.name}`;
    await go(rel, size);
    const m = await js(`(() => {
      const d = document.documentElement, W = ${size.width};
      const wide = [...document.querySelectorAll("body *")].filter(n => { const r = n.getBoundingClientRect(); return r.width && !n.closest(".menu") && (r.right > W + 1 || r.left < -1); })
        .slice(0, 3).map(n => n.className || n.tagName);
      return { hscroll: d.scrollWidth > W + 1, wide, tall: d.scrollHeight, h: innerHeight };
    })()`);
    if (m.hscroll || m.wide.length) fail(`${where}: sideways overflow (${m.wide.join(", ")})`);
    // the home page is one screen on a phone or tablet held upright
    if (rel === "index.html" && size.width < 1000 && size.height > size.width && m.tall > m.h + 1) fail(`${where}: the home page scrolls (${m.tall} px tall, ${m.h} px screen)`);
    // every link inside the build points at a file that exists; every drawing has loaded
    const links = await js(`[...document.querySelectorAll("a[href]")].map(a => a.href).filter(h => h.startsWith(${JSON.stringify(base)}))`);
    for (const h of links) {
      const p = fileURLToPath(h.split("#")[0]);
      if (!existsSync(p)) fail(`${where}: a link points at a missing file: ${h.slice(base.length)}`);
    }
    const broken = await js(`[...document.images].filter(i => i.getClientRects().length && (!i.currentSrc || !i.naturalWidth)).map(i => i.getAttribute("src"))`);
    if (broken.length) fail(`${where}: drawings did not load: ${broken.join(", ")}`);
    await shot(`${rel.replace(/\//g, "-").replace(".html", "")}-${size.name}`);

    // the menu: opens, takes focus, fills a phone or stands as a panel, closes on Escape and on the page beside it
    const opened = await js(`(async () => {
      const b = document.getElementById("menuBtn"); b.click();
      await new Promise(r => setTimeout(r, 400));
      const m = document.getElementById("menu"), s = m.querySelector(".menu-sheet").getBoundingClientRect();
      return { open: !m.hidden, expanded: b.getAttribute("aria-expanded"), focus: m.contains(document.activeElement),
               left: s.left, width: s.width, locked: getComputedStyle(document.documentElement).overflow === "hidden" };
    })()`);
    if (!opened.open || opened.expanded !== "true") fail(`${where}: the menu did not open`);
    if (!opened.focus) fail(`${where}: the open menu did not take focus`);
    if (!opened.locked) fail(`${where}: the page behind the open menu still scrolls`);
    if (size.width < 600 && (opened.left > 1 || opened.width < size.width - 1)) fail(`${where}: the menu does not fill the phone's screen`);
    if (size.width >= 600 && opened.width > 460) fail(`${where}: the menu hides the whole page (${opened.width} px wide)`);
    await shot(`${rel.replace(/\//g, "-").replace(".html", "")}-${size.name}-menu`);
    const esc = await js(`(async () => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      await new Promise(r => setTimeout(r, 50));
      return { closed: document.getElementById("menu").hidden, back: document.activeElement === document.getElementById("menuBtn") };
    })()`);
    if (!esc.closed) fail(`${where}: Escape did not close the menu`);
    if (!esc.back) fail(`${where}: focus did not return to the menu button`);
    if (size.width >= 600) {
      const scrim = await js(`(async () => {
        document.getElementById("menuBtn").click(); await new Promise(r => setTimeout(r, 350));
        document.querySelector(".menu-scrim").click(); await new Promise(r => setTimeout(r, 50));
        return document.getElementById("menu").hidden;
      })()`);
      if (!scrim) fail(`${where}: a tap on the dimmed page did not close the menu`);
    }
  }
  console.log(`  ok   ${size.name}: ${pages.length} pages, the menu`);
}

// ---------------------------------------------------------------- old addresses reach their new pages
const specs = pages.filter(p => p.endsWith("/index.html")).map(p => p.split("/")[0]);
for (const [hash, want] of [...specs.map(s => [s, s + "/index.html"]), ["lessons", specs[0] + "/index.html"], ["how", "how-it-works.html"]]) {
  where = `index.html#${hash}`;
  await send("Page.navigate", { url: base + "index.html#" + hash });
  await sleep(700);
  const at = await js("location.href");
  if (!at.startsWith(base + want)) fail(`${where}: went to ${at.slice(base.length)}, not ${want}`);
}
console.log("  ok   old addresses");

chrome.kill();
if (problems.length) { console.log(`\n${problems.length} problem(s).`); process.exit(1); }
console.log("\nAll checks passed.");
process.exit(0);
