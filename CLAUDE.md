# MRCP curriculum: interactive teaching pages

This repo builds the whole MRCP curriculum as single-file, offline, interactive pages, one per topic. Each page is the visual for a short YouTube video ("Watch") and a practice page viewers come back to ("Practise"). Later the same site gains a question bank, video lectures, login, payments and progress tracking; see "Future" below before making choices that would block them.

## Design rules

Follow [DESIGN.md](DESIGN.md) for every page. When the user changes a design rule, update DESIGN.md in the same change. Rules that are easy to miss:

- Minimal text; examples, answers and explanations appear only on tap. No instruction sentences, no eyebrow labels above headings, no sub-labels under circles or choices.
- Clicking anywhere else clears any open item; tapping an open item again closes it; only the tapped item grows.
- One label, letter and colour per concept everywhere. Labels come from the topic's `concepts` block, never retyped on a slide.
- A case gives nothing away: options shuffled per case, no hints until a wrong answer, the clue lit only after a wrong answer.
- Practise deals the cases in a random order (the solved example first) and numbers them by their place in the run.
- A teaching slide fits the 1280 × 720 stage with its answers open.

## How it is built

| Path | Holds |
| --- | --- |
| `curriculum.yaml` | The spine: site credits, specialties, their topics, status and video IDs |
| `content/<specialty>/<slug>.yaml` | One topic: concepts, the Watch slides, the Practise slides, cases, sources |
| `content/ids.lock` | Every permanent item ID ever built (written by `build.py`) |
| `engine/patterns.py` | One Python function per slide pattern, turning YAML into HTML |
| `engine/shell.html`, `engine/icons.svg` | The page frame and the icon set |
| `engine/css/` | `tokens` (colours, sizes), `base`, `stage` (16:9 canvas), `patterns`, `index` (home page) |
| `engine/js/` | `core` (helpers, theme, score, `record()`, click-away), one file per pattern, `deck` (stage, navigation, start-up) |
| `build.py` | Checks every topic, then builds `dist/<specialty>/<slug>.html` and `dist/index.html` |
| `checks/check.mjs` | Drives headless Chrome through a built page: layout at three sizes, every case solved |

A new slide pattern means: a function in `engine/patterns.py` (added to `PATTERNS`), its CSS in `engine/css/patterns.css`, its behaviour in a new `engine/js/<name>.js` (added to `JS_FILES` in `build.py`), its checks in `build.py`, and a row in the DESIGN.md pattern table.

## Workflow

1. Edit the topic YAML (content) or the engine (behaviour and look). Never edit `dist/`.
2. Build: `python build.py` (or `python build.py --check` to check content only).
3. Check: `node checks/check.mjs dist/<specialty>/<slug>.html --shots <scratchpad>/shots` (add `--nav scroll` for a vertical topic), then look at the screenshots. The check fails on overflow, a slide that scrolls on the stage, a case that does not solve, a wrong score, console errors or network requests.
4. Commit with a short message. Cloudflare Pages builds and publishes from `main`.

## Permanent IDs

- Topic IDs are `<prefix>.<slug>` (e.g. `stats.data-types`); never rename a published slug.
- Every case and practice item has a short ID (`c07`, `w03`), unique within its topic; the full ID is `<topic>.<id>`.
- Never renumber and never reuse. To drop an item, delete it and add its short ID to the topic's `retired` list; `build.py` fails otherwise.
- New items take the next unused number, even if that leaves the list out of order.

## Content

- Most topics are drafted by Claude and reviewed by the user; sometimes the user writes the content and Claude only builds it. A drafted topic stays `status: draft` until the user approves it.
- Topic content must be accurate for the MRCP. List the sources in the topic's `sources`. Flag anything uncertain to the user instead of guessing.
- Question bank items must be original, written from guidelines and textbooks. PassMedicine or Pastest material can guide which topics to cover and their weight, never be copied.
- Before building a new topic, confirm its slide list, steps and cases with the user, and ask whether it should use horizontal slides or vertical scrolling (`navigation: slides | scroll`), with a recommendation: vertical for short topics (about 6–8 slides), horizontal for longer ones.
- British English; plain, short sentences on slides.
- Credits (from `curriculum.yaml`) sit on the title and end slides automatically.

## Delegation

Opus plans the change, reviews what comes back, and lands it.

| Size | Goes to |
| --- | --- |
| Short, self-contained (one file, a search, a mechanical edit, a check script) | A Claude Code subagent on Sonnet |
| Larger (a change across several engine files, a batch of cases, a long repetitive edit) | DeepSeek Harness (`dsh`), through the `dsh-delegate` skill |

- Delegate: typing up agreed content into YAML, mechanical engine edits, check scripts, repetitive fixes already described in full.
- Keep with Opus: planning topics and slides, anything in DESIGN.md, MRCP content and its accuracy (never let a delegate invent clinical content), interaction and state bugs, and reviewing every delegated diff before the commit.
- A delegated task carries its own context: the files, the exact change and the rule it must follow.
- If a delegate is out of reach or misses the point, do the work directly and say so.

## Future (do not block these)

- Hosting: Cloudflare Pages (static now; serverless functions later for payment webhooks).
- Login and results database (e.g. Supabase), payments (Stripe), traffic analytics (cookie-free, e.g. Plausible or Cloudflare Web Analytics). All plug in through `record()` and permanent IDs.
- The full question bank and paid content must not ship inside static files (anyone can read a static file's answers); they will be served after login. Free sample questions can stay static.
- Videos are hosted on YouTube (free) or Cloudflare Stream (paid); only their IDs go in `curriculum.yaml`.
