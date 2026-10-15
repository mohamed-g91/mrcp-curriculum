# MRCP curriculum: interactive teaching pages

This repo builds the whole MRCP curriculum as single-file, offline, interactive pages, one per topic. Each topic builds twice from one YAML: the candidate's page (Learn is the recorded YouTube video with a chapter per slide, then Practise, which viewers come back to) and the presenter's deck (the Learn slides, for recording the video; built locally into `presenter/`, never published). Later the same site gains a question bank, video lectures, login, payments and progress tracking; see "Future" below before making choices that would block them.

## Design rules

Follow [DESIGN.md](DESIGN.md) for every page. When the user changes a design rule, update DESIGN.md in the same change. Rules that are easy to miss:

- Minimal text; examples, answers and explanations appear only on tap. No instruction sentences, no eyebrow labels above headings, no sub-labels under circles or choices.
- Clicking anywhere else clears any open item, but never a figure built over several taps (it has small Back and Next buttons instead); drags, the top and bottom bars and near misses clear nothing; tapping an open item again closes it; only the tapped item grows.
- One label, letter and colour per concept everywhere in Learn. Labels come from the topic's `concepts` block, never retyped on a slide. Practise is plain: a case's options are the label alone, with no letter circle and no Arabic.
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
- Arabic (for videos recorded in Arabic): titles and major terms only, never sentences or the page's controls. `title_ar` on the topic and every Learn slide (Practise carries no Arabic), `ar` on every concept, family, spectrum stop and kind, `q_ar` on a tree question; the Arabic title stands at the right edge of the heading line, a term's Arabic is a small tinted capsule to its right, and the ع button in the top bar hides it all. Cairo is embedded (only in a topic with Arabic). Claude drafts the wording and the user reviews it: flag every term as a draft until approved, reuse the approved terms (the list is in DESIGN.md, Arabic) in every lesson, and add new ones there. Built on lessons 1–7 (titles and terms); lesson 8, and the labels inside the story, curve and dot-plot figures, are each their own pass with a mockup first (see DESIGN.md, Arabic).
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
| `art/` | The home page's drawings (see DESIGN.md, Home page): `site/` the approved ones as small WebP (committed; `build.py` copies them to `img/` beside the home page), `make_site_images.py` that makes them, `prompts/` the Codex style and subjects; `make_heart_figures.py` the cardiology heart drawings in `content/figures`; `drafts/` holds Codex's large PNGs, local only |
| `video-studio/` | Produced lesson videos, apart from the recorded decks: the voice is recorded first, Whisper's word timings cue each animation, and Codex (Sol 6.1) draws text-free pictures that Motion Canvas labels on cue (`motion/`, `npm start` from inside it), with HTML demos (`demos/`) and Piper voice tests (`voice/`). It lives here and not in a session's scratch folder because Node tools cannot run from inside the Claude app's storage; its packages and renders stay local (its own `.gitignore`) |
| `archive/` | Old exploration kept for reference and never built (`brand/`: the October 2026 logo, colour and lettering proposals) |
| `engine/vendor/` | Third-party code the pages embed: `three.min.js` (three.js r128, MIT, with its licence), only in a topic with a 3D slide (`heart3d`) |
| `engine/fonts/` | The embedded fonts: Inter and Outfit on every page, Cairo (Arabic letters and Latin part, with its OFL licence) only in a topic with Arabic, and on the home page a small cut of it (`cairo-home*.woff2`, remade by `make_cairo_home.py` when its Arabic changes); `build.py` embeds them as base64 |
| `engine/css/` | `tokens` (colours, sizes), `base`, `stage` (16:9 canvas), `patterns`, `frame` (the lesson's frame: navy top bar, sky, phone dock), `index` (the site's own pages) |
| `engine/js/` | `core` (helpers, theme, score, `record()`, click-away), one file per pattern, `deck` (stage, navigation, start-up), `agent` (the agent tools, below) |
| `build.py` | Checks every topic, then builds the candidate's `dist/<specialty>/<slug>.html`, the site around them (`dist/index.html`, the Start page `dist/start.html` where every Start learning goes, each specialty's `dist/<specialty>/index.html`, with How it works a pop-up on every page; `dist/how-it-works.html` only forwards there), and the presenter's copies in `presenter/` (git-ignored, never published) |
| `checks/check.mjs` | Drives headless Chrome through a built page: layout at six sizes, every case solved, the recording view, and, where a topic has them, the Arabic titles and ع switch and a drill spectrum's cards, kinds and zoom circles, and the agent tools |
| `checks/check-site.mjs` | The same for the site around the lessons (home, the Start page, lessons pages): overflow at six sizes, the home page on one phone screen, the menu, the How it works pop-up, old addresses, missing files |

Keep `build.py` and `engine/patterns.py` to syntax older Pythons accept (Cloudflare's Python may be older than the one on the author's machine): no f-string with the same quote inside its braces, no `match`.

A new slide pattern means: a function in `engine/patterns.py` (added to `PATTERNS`), its CSS in `engine/css/patterns.css`, its behaviour in a new `engine/js/<name>.js` (added to `JS_FILES` in `build.py`), its checks in `build.py`, and a row in the DESIGN.md pattern table.

## Workflow

Agree on paper, build once. Lessons 5–8 went in 1–5 commits each because their slide list, numbers and figures were settled before the build; lessons 2–4 took 14–19 because figures and even the lesson's scope changed after it was built.

### A new lesson: three gates

The user decides at three gates; everything between them is batched.

1. **Plan note** (`notes/<slug>-plan.md`, nothing built). The question the lesson answers, its checked numbers, what it leans on from earlier lessons, a slide table (what each shows; each figure reused or new), the cases, and what is left out on purpose. The user marks it up; a change here is cheap, the same change to a built story is not. The note is also the next session's handoff: it ends with a status line ("Agreed", "Mockups sent", "Built", "Approved").
2. **One mockup sheet** (nothing built). Every new figure in the lesson on one PNG, three options each in their states, so the user chooses them all in one reply. A timing or speed question is shown as A, B and C side by side, never tuned across commits.
3. **One review.** The user goes through the built lesson and sends one list; it is fixed in one pass, checked once, committed once.

The same holds for an engine or site change: plan in a few lines, mockups if it changes a look, build, one review.

### Building and checking

1. Edit the topic YAML (content) or the engine (behaviour and look). Never edit `dist/`.
2. Build: `python build.py` (or `python build.py --check` to check content only).
3. Check both builds: `node checks/check.mjs dist/<specialty>/<slug>.html` (the candidate's page) and the same for `presenter/<specialty>/<slug>.html` (the Learn slides and the recording view). The presenter's deck is private, recorded on the user's tablet in landscape (Samsung Galaxy S10 FE) or shown on a desktop, so its check skips the portrait tablet and the phone; phone layout is checked only on what candidates open (the candidate's page with its Practise, the site, and later the practice pathway). While fixing, add `--shots <scratchpad>/shots --shots-on-fail --json <scratchpad>/check.json`: a passing run then leaves no pictures to look at, and a failing one a picture of each failure. Once the lesson or change is done, take the full `--shots` set and look at it. A change to the home page, a lessons page or How it works is checked with `node checks/check-site.mjs dist --shots <scratchpad>/site-shots`. In a cloud container, point it at the browser there and run without the sandbox: `CHROME=/opt/pw-browsers/chromium CHROME_FLAGS=--no-sandbox`. The check fails on overflow, a slide that scrolls on the stage, a case that does not solve, a wrong score, console errors or network requests.
   Run the two checks one after the other, or together only while the machine copes: a check that dies leaves headless Chrome behind (its profile folder starts `mrcp-check-`), and enough of them exhaust the process limit and break the shell; close them before running again.
4. Commit at each gate, not each tweak (about three or four commits a lesson), with a short message. Cloudflare builds and publishes from `main` (the Worker `mrcp-curriculum`, serving the built pages as static assets; its build is set in the Cloudflare dashboard, not in this repo).
5. After recording: put the YouTube ID in the topic's `video:` in `curriculum.yaml`, and each Learn slide's start time as `at: "m:ss"`.

### Editing a lesson video: three gates

The full workflow is [notes/video-workflow-plan.md](notes/video-workflow-plan.md); follow it in order. Recordings go in `art/drafts/youtube/recordings/` (git-ignored); the edit is local (Whisper + ffmpeg, `art/drafts/youtube/work/edit.py`), never Descript.

1. **Transcript review** (nothing rendered). Transcribe, then send the user the transcript review page: every sentence with its time and slide, the proposed cuts marked by kind (long pause, filler, check-in "خلاص؟", restart, repeat), low-confidence words marked, and Claude's suggestions (zooms, other edits) as items to accept or reject, each with its reason. Habit words (يعني, يبقى, مثلا) are never cut automatically. Then stop and wait.
2. **Agreed list.** Claude reads the user's marks and comments, answers each (fine, or risky and why, with a short sound sample where the ear decides) and writes the plan file. Nothing is rendered until the user has agreed every cut, zoom and edit; "edit it" is not a go-ahead to render.
3. **One render, one review.** Render once, check sync, loudness and every zoom's frames, send the preview; the user sends one list, fixed in one more render.

The sound stays natural (no noise filter, compressor or limiter); a zoom follows what is being explained and never cuts text at the frame edge; a new kind of edit (card, spotlight, caption) starts as three mockups.

### Saving tokens

- One lesson, or one engine change, per session. Start from the plan note and `git log -5`; open YAML and engine files only where the work touches them.
- Read DESIGN.md by section, not whole (about 19k tokens): its contents list says which section a task needs; `grep -n "^## " DESIGN.md` gives where each starts.
- Read a page's state through the agent tools (below) before taking a screenshot.
- A bug on a device (pen, tablet, phone): first a readout the user runs once and sends back, then the fix. Not fixed in two rounds: park it and say so, rather than ship guesses.
- Codex QA runs once per change, after the review's fixes, not after each tweak.

Draw a mockup on the real slide, so it looks like the page: crop the page's own screenshot (the check's `--shots`) into the SVG, reuse the drawings in `content/figures` and the embedded fonts (`engine/fonts`), and redraw only what changes. A change to a pattern's look or behaviour is shown as three mockups first, each in its two or three states (first, then after a tap), and built only once one is chosen.

Mockups go to the user as a picture: write a static SVG (no scripts), render it to PNG with headless Chrome (`chrome --headless=new --screenshot=<png> --window-size=W,H file:///<svg>`) and send the PNG. Inline widgets and HTML pages with scripts do not show for them.

## Agent tools

Every page carries a few tools in WebMCP's shape (`engine/js/agent.js`): `lesson-outline`, `slide-state`, `go-to-slide` and `layout-report`. An agent reads the page through them as JSON instead of screenshots: `window.MRCP_TOOLS["slide-state"].execute()` through the DevTools protocol, as `checks/check.mjs` does, or `document.modelContext` in a browser with WebMCP, which is offered the navigation tools on every page and `layout-report` only on the presenter's deck.

- No tool ever returns a case's answer, hint or explanation, nor anything that points to them; the check fails if one does.
- A measurement the checks need goes in `layout-report` (or a new tool), not inline in the check, so agents get it too.
- Keep the tools few and their descriptions short: every tool costs tokens in an agent's prompt.

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
- Before building a new topic, the user approves its plan note (Workflow, gate 1): slide list, steps, numbers and cases.
- British English; plain, short sentences on slides.
- Credits (from `curriculum.yaml`) sit on the end slide only, automatically; on the site, the footer is on the home page only.

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

### Independent QA review by Codex (Sol 6.1)

Every major code change (several engine files, `build.py`, a new pattern) and every layout change to the web pages (home page or lesson pages) is tested by Codex on `gpt-6.1-sol` after it is built and committed locally, and before it is pushed.

- Use Codex 0.162 or newer (`codex --version`): the npm global install, updated with `npm install -g @openai/codex@latest`. An older copy is refused `gpt-6.1-sol` on the user's plan with a misleading "not supported with a ChatGPT account" error; the old standalone install was taken off PATH on 9 October 2026 because its updater fails. Never use `gpt-6-astra`.
- The brief gives context only: the commit to test, what the project is, how to build, where DESIGN.md, CLAUDE.md and `checks/check.mjs` are, and that the page's agent tools (CLAUDE.md, Agent tools) read its state as JSON. It does not list tests; Codex decides what to test and tests everything it thinks matters.
- It reports and never fixes: no file in the repository is edited, created or committed (building into `dist/` and `presenter/` is allowed); scratch work goes to a temp folder. Its final message is the findings, most severe first, then what passed.
- Its Windows sandbox fails on this machine, so it runs without it (`codex exec -m gpt-6.1-sol --dangerously-bypass-approvals-and-sandbox -o <report> - < <brief>`), approved by the user on 9 October 2026. Afterwards confirm with `git status` that nothing tracked changed.
- Opus verifies every finding against the code, says which are worth fixing, and discusses them with the user before fixing; the fixes are rebuilt, checked and committed before the push.

## Future (do not block these)

- Hosting: a Cloudflare Worker with static assets on `mrcp-gafar.com`, the only address (the workers.dev and preview addresses are off, `www` and `http` redirect to it). Static now; the same Worker can take server code later for payment webhooks.
- Login and results database (e.g. Supabase), payments (Stripe), traffic analytics (cookie-free, e.g. Plausible or Cloudflare Web Analytics). All plug in through `record()` and permanent IDs.
- The full question bank and paid content must not ship inside static files (anyone can read a static file's answers); they will be served after login. Free sample questions can stay static.
- Videos are hosted on YouTube (free) or Cloudflare Stream (paid); only their IDs go in `curriculum.yaml`. The player lives in `engine/js/video.js`; another host changes only that file and the poster, not the chapters.
