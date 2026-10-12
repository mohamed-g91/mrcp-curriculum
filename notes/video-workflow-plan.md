# Lesson videos: the workflow from recording to YouTube

The question: how does each recorded lesson become an upload-ready YouTube video with the least work for the presenter and the fewest tokens?

Lesson 1 took one long session: Descript (credits, watermark, paid export), then a local ffmpeg edit built from scratch, five renders to fix the picture, the zooms and the sound, and three rounds of thumbnails. Most of that was one-off; this plan makes the rest repeatable.

## What we learnt on lesson 1

- Descript's free plan cannot carry the series (AI credits, watermark, timeline export are paid). The local edit costs nothing per video.
- The tablet's recorder writes a frame only when the screen changes and records at about 8 frames a second when things move. The edit makes a steady 60 fps copy first. Recording at 60 fps, highest quality, makes animations and pen strokes smooth too.
- The voice must stay natural: no noise filter, compressor or limiter ("sick or robotic"). One steady volume change to about -14 LUFS, 0.5 s pauses, 15 ms soft joins.
- Pauses are found from the sound (ffmpeg), not from Whisper's word times (they run over the pauses). A filler ("آآ") takes the whole gap around it.
- Habit words (يعني, يبقى, مثلا) are part of the sentences; they are listed for review, never cut automatically. A check-in "خلاص؟" at the end of a phrase cuts cleanly when the cut sits at the quietest point either side of the word (approved on a sample, lesson 1: six cut, two kept that carry meaning). Restarts ("الضغط … الضغط") are cut only when the presenter agrees.
- A zoom follows what is being explained and never cuts through text at the frame edge.
- Thumbnails are picture-led: the Arabic title and MRCP as large as it, the logo alone in the corner (navy, I2).

## The workflow (per lesson)

Two stages: first the words are agreed on paper (a transcript review), then the video is rendered once.

| Step | Who | Tokens |
| --- | --- | --- |
| 1. Record in the presenter deck's recording view at 60 fps, highest quality. The deck saves a slide log as you go (each slide's start and each tap, with the layout of what opened). | Presenter | None |
| 2. Put the file in `art/drafts/youtube/recordings/<slug>.mp4`. | Presenter | None |
| 3. `python video/make.py <slug> --review`: transcribes (Whisper), finds the pauses, fillers, check-in "خلاص؟", restarts and repeats, and writes the **transcript review page** (below) with every proposed cut already marked. | The computer (about 10 min) | None |
| 4. Claude adds its suggestions to the page: where to zoom (from the slide log and what is being explained) and other edits (list below), each one a mark the presenter can accept or reject. | Claude | Low: the slide log and a summary of the transcript, not the whole page |
| 5. **Review gate.** The presenter goes through the page: accepts or rejects each proposed cut, marks any other word or sentence to remove, accepts or rejects each zoom and edit, and comments where unsure. | Presenter | None |
| 6. Claude reads only the marks and comments and answers each one: acceptable, or risky and why (a cut mid-sentence that would jump, a zoom that would hide the pen), with a short sound sample where the ear has to decide. The agreed list becomes the lesson's plan file. | Claude | Low to medium: the marks, comments and samples only |
| 7. `python video/make.py <slug>` renders once: cuts and soft joins, crop, zooms and the other edits, cards, 1080p60, -14 LUFS, subtitles and chapters, and checks sync and loudness before it finishes. | The computer (about 30 min) | None |
| 8. Watch the preview once; send one list. Claude applies it and renders once. | Presenter, then Claude | Low |
| 9. Subtitles: the script applies `video/glossary.json` (Whisper's spellings of English terms, e.g. البلاد جروب -> blood group), which grows each lesson; Claude reads only the lines with English terms or low confidence. | Claude | Medium, falling each lesson |
| 10. Thumbnail from the series template: new title and picture; the picture from Codex only if the lesson has none. | Claude / Codex | Low (Codex uses its own quota) |
| 11. Upload; send the video ID. Claude puts it and the chapter times (from the slide log) in `curriculum.yaml` and the lesson's `at:` fields, builds, checks, commits. | Presenter, then Claude | Low |

The gates: the plan (this note, once), the transcript review (step 5), one preview (step 8).

### The transcript review page

A private Artifact, opened on the phone or the computer:

- The transcript, sentence by sentence, each with its time; one line per slide change ("Slide 3: Three quick questions").
- Proposed cuts shown struck through in colour, by kind: filler, long pause, check-in "خلاص؟", restart, repeat. A tap on a struck word keeps it; a tap on any other word or a long press on a sentence marks it for removal.
- Proposed zooms and edits as cards in the margin beside the sentences they cover, each with Accept / Reject and a comment box.
- A comment on any sentence.
- The marks and comments are saved in the page's shared database (Artifact `db`), so Claude reads them as a short list of word times and notes, not by reading the page; the presenter's choices survive closing the page.

Recommended over a shared document because a tap on a word carries its exact time, which a comment in a document does not, and because Claude reads a few lines of choices instead of the whole transcript back.

### Edits that break the monotony (suggested per lesson, each accepted or rejected in the review)

Kept within DESIGN.md's minimal style; no stickers, sound effects or music under the voice.

| Edit | When | Effect |
| --- | --- | --- |
| Zoom, and a glide between two parts of a slide | While one part is being explained | Readable on a phone; follows the explanation |
| Spotlight | When one item on a busy slide is the subject | The rest of the slide dims for a few seconds |
| Chapter card | Between slides | 1.5 s navy card with the next slide's title (Arabic); gives the lesson a rhythm and marks the YouTube chapters |
| "Pause and think" card | Just before an answer is revealed (e.g. before "Ordinal") | 3 s card ("فكّر قبل الإجابة") so the viewer answers first |
| Key-term caption | When a concept is named for the first time | The term in Arabic and English for 3 s in the lower corner, the site's term capsule style |
| Recap card | Before the end card | The lesson's three quick questions on one card for 5 s |
| Pace | Long builds and pen work | Speed up silent pen writing (1.5x) instead of cutting it |
| Picture-in-picture (later) | Whole lesson | The presenter's face in a small circle; the biggest single help against monotony in lectures, but needs a camera at recording time |

## Where the tokens went on lesson 1, and the fix for each

| Cost | Why it was expensive | Fix |
| --- | --- | --- |
| Pictures read into the conversation (frames, contact sheets, mockup sheets) | Each image is thousands of tokens; we read about 25 | The slide log replaces frame-hunting; the report gives numbers; at most one contact sheet per review |
| Printed transcripts and subtitle files | 225 segments and a 114-cue SRT, read whole | The script scans the transcript; only flagged lines are read |
| Renders redone to fix framing, sync and sound (five) | Problems found one at a time after each 15-minute render | Zooms framed from the page's own layout (the agent tools' `layout-report`), sync and loudness checked by the script before it finishes |
| Descript's agent round trips | Each edit request and its long reply | Not used any more |
| Thumbnail rounds (three) | Words, then crowding, then picture | Rules saved (picture-led, title + MRCP, logo alone); one template |
| Waiting and status questions | Each check is a turn | The script prints its own progress; the presenter can run it without Claude |
| Cuts and zooms discovered after rendering | Each discovery cost a render and a look at frames | Agreed in the transcript review before the first render |
| The transcript review itself | A 10-minute lesson is about 1,500 words | The script writes the page; Claude writes only its suggestions and reads only the marks and comments |

## What has to be built (one engine change, one script)

1. **Slide log in the recording view** (`engine/js/present.js`): while recording, keep each slide change and each tap's opened element with its box (from the same layout data `layout-report` uses); a button saves it as `<slug>-log.json` beside the recording. No change for candidates. Needs the usual check run and DESIGN.md's recording-view section updated.
2. **`video/make.py`** (from `art/drafts/youtube/work/edit.py`, committed; recordings and renders stay git-ignored): one command per lesson, steps 3 and 6 above, plus a `--from` option to redo only the later steps. Plans per lesson in `video/plans/<slug>.json`.
3. **`video/glossary.json`**: the subtitle fixes, growing each lesson.
4. **The transcript review page**: one Artifact template the script fills per lesson (transcript, proposed cuts, Claude's suggestions), with a shared database for the marks and comments; the script reads the marks back into the plan file.
5. **The extra edits** in `video/make.py`: spotlight, chapter card, "pause and think" card, key-term caption, recap card, speed-up. Each new card is drawn as three mockups first (DESIGN.md).

Left out on purpose: automatic removal of habit words (sentences break; the review page lets the presenter choose), music, burned-in captions, any paid service.

Status: Agreed (12 October 2026). Next: build the slide log, `video/make.py`, the review page and the glossary, as their own change; lesson 1 is being finished with the draft script in `art/drafts/youtube/work/`.
