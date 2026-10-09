# MRCP curriculum: interactive teaching pages

This repo builds the whole MRCP curriculum as single-file, offline, interactive pages, one per topic. Each topic builds twice from one YAML: the candidate's page (Learn is the recorded YouTube video with a chapter per slide, then Practise, which viewers come back to) and the presenter's deck (the Learn slides, for recording the video; built locally into `presenter/`, never published). Later the same site gains a question bank, video lectures, login, payments and progress tracking; see "Future" below before making choices that would block them.

## Design rules

Follow [DESIGN.md](DESIGN.md) for every page. When the user changes a design rule, update DESIGN.md in the same change. Rules that are easy to miss:

- Minimal text; examples, answers and explanations appear only on tap. No instruction sentences, no eyebrow labels above headings, no sub-labels under circles or choices.
- Clicking anywhere else clears any open item, but never a figure built over several taps (it has small Back and Next buttons instead); drags, the top and bottom bars and near misses clear nothing; tapping an open item again closes it; only the tapped item grows.
- One label, letter and colour per concept everywhere. Labels come from the topic's `concepts` block, never retyped on a slide.
- A case gives nothing away: options shuffled per case, no hints until a wrong answer, the clue lit only after a wrong answer.
- Practise deals the cases in a random order (the solved example first) and numbers them by their place in the run.
- A teaching slide fits the 1280 × 720 stage with its answers open.
- Every page is illustrated: minimal figures that picture the topic, fit the space the slide already has and never give an answer away. A new figure starts as three mockups for the user to choose from.
- Every slide entrance uses one timing (0.5 s each, 0.16 s apart), a figure entering with the content it belongs to.
- One set of numbers per topic: an example keeps the same mean, SD and median on every slide and case.
- Order is its own step: data appear in the order they came, and sorting is shown just before the median or quartiles.
- One figure builds in one motion: moving from one view of the same data to another never swaps to a second figure.
- Distribution graphs show both axes (value, and % of people); neutral items stay grey, with no colour flashes.
- Reading order, one control per job, and lines only where they mean something (see DESIGN.md, Behaviour rules).
- Arabic (for videos recorded in Arabic): titles and major terms only, never sentences or the page's controls. `title_ar` on the topic and every slide, `ar` on every concept, family, spectrum stop and kind, `q_ar` on a tree question; the Arabic title stands at the right edge of the heading line, a term's Arabic is a small tinted capsule to its right, and the ع button in the top bar hides it all. Cairo is embedded (only in a topic with Arabic). Claude drafts the wording and the user reviews it: flag every term as a draft until approved, reuse the approved terms (the list is in DESIGN.md, Arabic) in every lesson, and add new ones there. Built on lessons 1–7 (titles and terms); lesson 8, and the labels inside the story, curve and dot-plot figures, are each their own pass with a mockup first (see DESIGN.md, Arabic).
- The logo is the open-book G in one flat finish: `engine/logo.svg` on the pages, `logo/open-knowledge/` for large uses (see DESIGN.md, Brand and Logo sizes).

## How it is built

| Path | Holds |
| --- | --- |
| `curriculum.yaml` | The spine: site credits, specialties, their topics, status and video IDs (`video:` the YouTube ID once recorded) |
| `content/<specialty>/<slug>.yaml` | One topic: concepts, the Learn slides (each with `at: "m:ss"`, its chapter's start in the video, once recorded), the Practise slides, cases, sources |
| `content/ids.lock` | Every permanent item ID ever built (written by `build.py`) |
| `engine/patterns.py` | One Python function per slide pattern, turning YAML into HTML |
| `engine/shell.html`, `engine/icons.svg` | The page frame and the icon set |
| `engine/logo.svg`, `logo/` | The logo: the icon the pages use, and in `logo/open-knowledge/` the full artwork (avatar, lockups, exports) for YouTube and social posts |
| `art/` | The home page's drawings (see DESIGN.md, Home page): `site/` the approved ones as small WebP (committed; `build.py` copies them to `img/` beside the home page), `make_site_images.py` that makes them, `prompts/` the Codex style and subjects; `drafts/` holds Codex's large PNGs, local only |
| `engine/fonts/` | The embedded fonts: Inter and Outfit on every page, Cairo (Arabic letters and Latin part, with its OFL licence) only in a topic with Arabic; `build.py` embeds them as base64 |
| `engine/css/` | `tokens` (colours, sizes), `base`, `stage` (16:9 canvas), `patterns`, `index` (home page) |
| `engine/js/` | `core` (helpers, theme, score, `record()`, click-away), one file per pattern, `deck` (stage, navigation, start-up) |
| `build.py` | Checks every topic, then builds the candidate's `dist/<specialty>/<slug>.html`, `dist/index.html`, and the presenter's `presenter/<specialty>/<slug>.html` and `presenter/index.html` (git-ignored, never published) |
| `checks/check.mjs` | Drives headless Chrome through a built page: layout at six sizes, every case solved, the recording view, and, where a topic has them, the Arabic titles and ع switch and a drill spectrum's cards, kinds and zoom circles |

Keep `build.py` and `engine/patterns.py` to syntax older Pythons accept (Cloudflare's Python may be older than the one on the author's machine): no f-string with the same quote inside its braces, no `match`.

A new slide pattern means: a function in `engine/patterns.py` (added to `PATTERNS`), its CSS in `engine/css/patterns.css`, its behaviour in a new `engine/js/<name>.js` (added to `JS_FILES` in `build.py`), its checks in `build.py`, and a row in the DESIGN.md pattern table.

## Workflow

1. Edit the topic YAML (content) or the engine (behaviour and look). Never edit `dist/`.
2. Build: `python build.py` (or `python build.py --check` to check content only).
3. Check both builds: `node checks/check.mjs dist/<specialty>/<slug>.html --shots <scratchpad>/shots` (the candidate's page) and the same for `presenter/<specialty>/<slug>.html` (the Learn slides and the recording view), then look at the screenshots. In a cloud container, point it at the browser there and run without the sandbox: `CHROME=/opt/pw-browsers/chromium CHROME_FLAGS=--no-sandbox`. The check fails on overflow, a slide that scrolls on the stage, a case that does not solve, a wrong score, console errors or network requests.
   Run the two checks one after the other, or together only while the machine copes: a check that dies leaves headless Chrome behind (its profile folder starts `mrcp-check-`), and enough of them exhaust the process limit and break the shell; close them before running again.
4. Commit with a short message. Cloudflare Pages builds and publishes from `main`.
5. After recording: put the YouTube ID in the topic's `video:` in `curriculum.yaml`, and each Learn slide's start time as `at: "m:ss"`.

Draw a mockup on the real slide, so it looks like the page: crop the page's own screenshot (the check's `--shots`) into the SVG, reuse the drawings in `content/figures` and the embedded fonts (`engine/fonts`), and redraw only what changes. A change to a pattern's look or behaviour is shown as three mockups first, each in its two or three states (first, then after a tap), and built only once one is chosen.

Mockups go to the user as a picture: write a static SVG (no scripts), render it to PNG with headless Chrome (`chrome --headless=new --screenshot=<png> --window-size=W,H file:///<svg>`) and send the PNG. Inline widgets and HTML pages with scripts do not show for them.

## Permanent IDs

- Topic IDs are `<prefix>.<slug>` (e.g. `stats.data-types`); never rename a published slug.
- Every case and practice item has a short ID (`c07`, `w03`), unique within its topic; the full ID is `<topic>.<id>`.
- Never renumber and never reuse. To drop an item, delete it and add its short ID to the topic's `retired` list; `build.py` fails otherwise.
- New items take the next unused number, even if that leaves the list out of order.

## Content

- Most topics are drafted by Claude and reviewed by the user; sometimes the user writes the content and Claude only builds it. A drafted topic stays `status: draft` until the user approves it.
- Topic content must be accurate for the MRCP. List the sources in the topic's `sources`. Flag anything uncertain to the user instead of guessing.
- If the user asks for a number that the data on screen cannot give, show the arithmetic and say so; if they keep it, note the choice in a YAML comment beside it.
- Question bank items must be original, written from guidelines and textbooks. PassMedicine or Pastest material can guide which topics to cover and their weight, never be copied.
- Before building a new topic, confirm its slide list, steps and cases with the user.
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
- Videos are hosted on YouTube (free) or Cloudflare Stream (paid); only their IDs go in `curriculum.yaml`. The player lives in `engine/js/video.js`; another host changes only that file and the poster, not the chapters.
