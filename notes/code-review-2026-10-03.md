# Focused website code review

Review date: 3 October 2026  
Project: MRCP curriculum  
Purpose: preserve the focused review as a handoff for Opus 5.5 or another reviewer.

This document records findings from the preceding read-only review. It contains recommendations, not implementation changes. Existing working-tree changes were left intact. Only this Markdown report was added in response to the request to save the review.

**Snapshot caveat:** source files have changed since the original review. Re-check each finding against the current source before implementing a fix. Paths below are relative to the repository root; line numbers are navigation aids and may move.

## Overall assessment

The architecture suits the product: YAML holds topic content, Python renders consistent markup, and pattern-specific JavaScript supplies interactions. Shared concepts, reusable figures, and a common source for learner and presenter pages are strong foundations.

Prioritise keyboard accessibility, saved-run integrity, and content validation before expanding the curriculum. Preserve the existing visual identity and single-file offline output.

Indicative interface assessment: **14/20**. This is reviewer judgement, not an accessibility certification or performance benchmark.

| Area | Score | Main observation |
| --- | ---: | --- |
| Accessibility | 2/4 | Confirmed keyboard, accessible-name, and hidden-content issues |
| Performance | 3/4 | Reasonable page sizes; considerable unused JavaScript |
| Responsiveness | 3/4 | Tested layouts fit; small controls merit attention |
| Theming | 2/4 | Good token coverage; dark-mode answer contrast fails |
| Implementation consistency | 4/4 | Coherent, product-specific patterns and design rules |

## Verification and limits

The original review exercised:

- Six topics, in both learner and presenter versions: 12 generated pages.
- 36 viewport passes at 1280 × 720, 375 × 812, and 812 × 375.
- All 52 scored cases, including deliberately wrong first attempts.
- Selected reveal and step states, real keyboard activation, Chrome accessibility-tree inspection, saved-run edge cases, and in-memory validator fixtures.
- Screenshots in light and dark mode.

The page states exercised had no overflow or JavaScript exceptions. Ordinary first-attempt scoring worked correctly. After normalising line endings, the embedded JavaScript in all 12 generated pages matched the source at the time of that review.

These results are not a complete release-workflow pass:

- `python -B build.py --check` could not run because PyYAML was missing from the available Python environments. Validator functions were exercised separately using in-memory fixtures.
- The supplied Chrome checker exited with an unresolved DevTools request. An isolated-port copy also failed. The review therefore used a separate Playwright harness for focused checks.
- The broad layout pass used reduced motion. Full animation timing, every tree branch, actual screen-reader behaviour, stylus interaction, Firefox, and Safari were not comprehensively verified.
- No fresh build was performed, and every MRCP answer was not independently verified against its textbook sources.

Diagnostic scripts, JSON results, logs, and screenshots from the original review are outside the repository at:

`C:/Users/Mohamed Gafar/.codex/visualizations/2026/10/02/01a0fe79-4cf2-7e82-a347-d2b606718dbc/`

The most useful evidence files are `review-results.json`, `focused-results.json`, `validator-review.py`, `check-isolated.log`, and the `review-*.png` screenshots. The focused-results file includes some diagnostic information that was not reported as a defect; for example, Chrome did expose the finished mean calculation's text, so the review does **not** claim that all chart text is inaccessible.

## Strengths to preserve

- Content is separate from rendering and interaction code.
- Concepts centrally define labels, letters, icons, and families.
- Learner pages and presenter decks derive from the same content.
- Embedded fonts, icons, and figures support offline use.
- YouTube loading is deferred until interaction.
- Cases have stable option ordering, shuffled run ordering, an unscored example, and first-attempt scoring.
- The design system and recurring illustrations support the teaching format.
- Permanent IDs and `record()` provide useful foundations for future progress tracking.

## Prioritised findings

P1: significant issue to address before wider release.  
P2: worthwhile next-pass improvement, including authoring and future-state defects.  
P3: lower-impact maintenance.

### 1. [P1] Keyboard Back can advance a working or story

**Locations:** `engine/js/working.js:25`; the stepper keydown handler near the end of `engine/js/story.js` (currently around line 1321).

The parent stepper handles Enter and Space regardless of which descendant received the event. Events from its Back and Next buttons bubble to this handler, which advances the parent and prevents native button activation.

**Reproduction:** open the confidence-interval working, reveal two lines, focus its Back step button, and press Enter. The original test showed three lines instead of one. Clicking Back then returned to two. A story mid-sequence exhibited the same direction error.

**Recommendation:** handle the parent shortcut only when `event.target === event.currentTarget`, and leave child buttons to their native keyboard behaviour. Review the nested button-role structure as well.

**Acceptance check:** Enter and Space on Back decrement exactly one step; the same keys on Next increment exactly one step; activation on the parent stepper advances exactly once. Use real keyboard input, not only `.click()`.

### 2. [P1] The resume dialog does not contain keyboard interaction

**Locations:** `engine/js/core.js:91` (`Ask`); `engine/shell.html:50`; deck-level keyboard handling in `engine/js/deck.js`.

The dialog declares `aria-modal="true"` and initially focuses Continue, but focus can leave it. Global deck shortcuts remain active, and dismissal does not restore focus to the opener.

**Reproduction:** leave an unfinished run, return to the title, and open Practise. Two Tab presses moved focus outside the dialog; ArrowRight changed the underlying deck from the title to Learn. Escape left focus on the body.

**Recommendation:** contain Tab navigation, make background content inert, suspend deck shortcuts while the dialog is open, and restore focus to Practise when dismissed. Consider native `<dialog>` while preserving the current appearance and click-away behaviour.

**Acceptance check:** Tab and Shift+Tab cycle within the dialog, navigation shortcuts cannot move the background deck, and Escape restores focus to the opener.

Reference: [WAI modal-dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).

### 3. [P1] The phone Back button loses its accessible name

**Locations:** `engine/shell.html:42`; `engine/css/base.css:64`.

At narrow widths, `.nav-label` becomes `display:none`. The icon is `aria-hidden`, and the Back button has no independent accessible label.

**Evidence:** at 375 px, after layout settled, Chrome's accessibility tree exposed an unnamed button. The visible Back label's computed display was `none`.

**Recommendation:** add persistent accessible labels to navigation controls, independent of visible text.

**Acceptance check:** Back has the same meaningful accessible name at desktop and phone widths.

### 4. [P1] Unrevealed teaching content remains in the accessibility tree

**Locations:** `engine/css/patterns.css:663`; the `art` story implementation in `engine/js/story.js`; opacity-based results such as `.qf-no` in the pattern CSS.

Future illustration beats are hidden visually with opacity rather than being withheld from assistive technology.

**Reproduction:** enter the court story before any tap. All four beats had opacity zero, but the accessibility tree exposed H₀, the evidence, `p = 0.008`, “Guilty”, and “Reject H₀”. The conclusion was available before the intended teaching sequence.

**Recommendation:** synchronise visual and accessibility visibility. Unrevealed content should remain out of the accessibility tree until its beat opens. Review opacity-only question-flow results for the same issue. Preserve the intended animations when content becomes available.

**Acceptance check:** future beats are unavailable before activation, revealed beats become accessible, and stepping back hides later beats again.

### 5. [P1] Dark-mode answer pills have insufficient contrast

**Locations:** `engine/css/patterns.css:889`; family solid colours in `engine/css/tokens.css`.

Working results use white text on family solids. Measured dark-mode combinations were:

| Combination | Contrast |
| --- | ---: |
| White on teal `#35B5CC` | 2.43:1 |
| White on olive `#A9BC3C` | 2.11:1 |

Both fail even the 3:1 threshold for qualifying large text.

**Recommendation:** introduce foreground tokens for text on family-solid fills. Dark ink will suit several bright dark-mode fills. Check working pills, selected circles, tree answers, and other solid-filled states together. Preserve each concept's identity.

**Acceptance check:** active text states meet the applicable 4.5:1 or 3:1 threshold in both themes.

Reference: [WCAG contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

### 6. [P2] Resuming after content changes can alter the score

**Location:** `engine/js/quiz.js:88` (`Run`), particularly `resumable()` and `resume()`.

Saved runs have no schema version or practice-content revision. During replay, picks whose options no longer exist are skipped, which can erase a wrong first attempt.

**Controlled reproduction:** a saved sequence contained an obsolete wrong option followed by the current correct answer. The resume prompt calculated `0/1`, but replay restored `1/1`.

**Recommendation:** version saved runs, associate them with the relevant content revision, validate orders and picks, and preserve first-attempt correctness explicitly. Restart incompatible runs with a clear explanation where migration is unsafe.

**Acceptance check:** removed options, changed answers, malformed saved data, and changed case sets cannot silently change the score or break Practise.

### 7. [P2] Validation accepts inputs that rendering cannot handle

**Locations:** `build.py:68` (`check_topic`); the output-writing loop around `build.py:545`.

The validator checks many useful relationships but does not establish a complete input schema. In isolated fixtures it accepted a slide without a title, a concept without a label or icon, duplicate inherited quiz options, the reserved generated `video` slide ID, and a topic without sources. A story with sample size zero raised `ZeroDivisionError` inside validation.

**Recommendation:** validate types and required fields before pattern-specific logic. Cover numerical bounds, supported family tokens and icons, reserved IDs, option uniqueness, valid dates, and sources. Return contextual validation errors rather than Python exceptions.

The build also opens an output file before calling `render_topic()`. A render exception can leave a truncated local output.

**Recommendation:** render successfully before replacing a destination. Prefer staging all outputs before replacing the build and its lock file.

**Acceptance check:** malformed content yields clear errors before output replacement; the previous successful build remains intact on failure.

### 8. [P2] The ID lock does not preserve retirement history

**Location:** `build.py:401` (`check_ids`).

The lock records IDs that existed, but not their retired state. Reuse is rejected only while an ID remains in the current YAML `retired` list. Removing that entry and restoring the item is accepted.

**Recommendation:** preserve permanent retirement tombstones alongside ID history, independent of later topic edits.

**Acceptance check:** build an item, retire it, then remove its retirement entry and attempt to reuse its ID. Validation must still reject reuse.

### 9. [P2] Hidden practice quizzes remain in runtime data

**Locations:** `engine/patterns.py:533` (`topic_data`); `engine/js/quiz.js:97` (`Run.resumable`).

Rendering skips hidden slides, but runtime data generation still includes hidden practice quizzes. Resume logic therefore counts cases the learner cannot reach.

**Controlled reproduction:** adding runtime data equivalent to a hidden quiz caused a run to remain resumable after all visible cases were completed. This is a latent authoring defect; the review did not find a currently hidden practice quiz in the topic files.

**Recommendation:** derive rendering, runtime data, and completion counts from one consistent visible practice set. Continue validating hidden content separately.

**Acceptance check:** hidden quizzes do not enter learner completion calculations or runtime payloads; visible completion ends the run normally.

### 10. [P2] Final feedback can overstate completion

**Location:** `engine/js/core.js:52` (`Score.render`).

The final assessment considers accuracy among completed cases without considering how much of the topic was completed.

**Reproduction:** answer one of ten cases correctly, skip the rest, and reach the end. The message says “Excellent. You're ready for exam stems.” Lower-score messages also refer to “the three questions” across topics where that wording does not fit.

**Recommendation:** distinguish completion from accuracy, display completed versus available cases, and reserve completion feedback for finished runs. Use topic-specific or broadly applicable revision advice. Keep navigation available rather than forcing every case to be answered.

**Acceptance check:** an incomplete run is labelled incomplete, even when all completed answers were correct.

### 11. [P2] The testing workflow needs a stronger release gate

**Locations:** `checks/check.mjs:16`, `:60`, and `:72`; `README.md:16`; repository CI configuration.

The checker provides useful coverage, but:

- README states Node 18+, while the checker uses global `WebSocket`, added later and available without its experimental flag in Node 22.
- The fixed debugging port can collide with concurrent runs.
- DevTools requests lack timeouts and comprehensive connection-failure handling.
- Startup happens before the cleanup `try/finally`.
- Case-solving checks assume the first quiz block.
- No tracked CI configuration runs browser checks before deployment.
- Learner-only checks omit most teaching slides, which live in presenter decks.

The observed checker failure is an environment/tooling result; its exact root cause was not established.

**Recommendation:** document and pin the tested runtime, allocate an available port, bound connection and request failures, and cover startup with cleanup. Run checks against every learner and presenter page in CI. Add targeted keyboard, accessibility, saved-run, and malformed-content regression checks.

Reference: [Node WebSocket history](https://nodejs.org/download/release/v22.15.0/docs/api/globals.html#websocket).

### 12. [P2] Pattern growth concentrates complexity and payload

**Locations:** `engine/js/story.js`; `build.py:38` (`JS_FILES`); `engine/patterns.py:387` (`p_story`).

At the original review snapshot, JavaScript source totalled about 200 KB, including about 89 KB in `story.js`. The data-types learner page was about 449 KB uncompressed, although it omitted Learn slides needing much of that JavaScript. Every page includes every module.

Story additions also require coordinated changes to the Python field whitelist, validation logic, JavaScript, and CSS.

**Recommendation:** preserve single-file outputs while splitting story implementations into smaller groups, extracting shared maths/SVG helpers, and defining pattern metadata for validation and asset dependencies. Include only the modules each generated page needs, with explicit dependencies.

This is a maintainability and payload opportunity, not an observed performance failure. Avoid a broad framework rewrite solely to address it.

**Acceptance check:** generated pages retain offline behaviour and the same design; required helper dependencies are included; unused pattern code is omitted; existing topic checks pass.

### 13. [P3] Warm-up resets retain obsolete callbacks

**Location:** `engine/js/sort.js:19` and sorter reset handling.

Each rebuild adds a closure to global `chipDeselectors`, but removing the old DOM does not remove that closure. Twenty resets increased the set from one entry to 21.

**Recommendation:** unregister the previous callback or store the current deselector with its host. Also replace random-comparator sorting with the Fisher–Yates approach already used for cases.

**Acceptance check:** repeated resets leave callback count and retained sorter state bounded.

## Further improvements to plan

- **Publication control:** distinguish preview from release output. Draft and reviewed topics currently become public links; make approval status operationally meaningful if public drafts are not intended.
- **Editorial traceability:** validate sources and consider reviewer/date metadata. A compact sources disclosure could support learner trust without cluttering slides.
- **Touch targets:** consider larger invisible hit areas for 34 px step controls and 38 px header controls. These sizes alone do not establish a WCAG failure.
- **Progress events:** retain `record()` but define a consistent event schema before connecting a service, including run IDs, attempt sequence, content revisions, and first-attempt correctness.
- **Paid questions:** retain the current free offline model; serve paid content through authenticated server endpoints when introduced, as AGENTS.md requires.
- **Documentation:** update or generate the README topic list, which describes fewer topics than are implemented.

## Suggested implementation sequence

1. Fix findings 1–5 as a focused accessibility batch, preserving the design rules.
2. Fix saved-run compatibility, visible-item completion, and final score messaging (6, 9, 10).
3. Strengthen schema validation, build replacement safety, and permanent retirement enforcement (7, 8).
4. Establish reliable automated checks for learner and presenter pages (11), including regression tests for the preceding fixes.
5. Refactor module organisation and address lower-impact maintenance (12, 13).

Read `AGENTS.md` and `DESIGN.md` before implementation. Preserve existing user changes and permanent IDs. Reproduce each finding on current source, implement only authorised work, and review the resulting diff and screenshots before any commit or publication.
