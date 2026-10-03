# MRCP Gafar

Interactive MRCP revision pages, one per topic. Each page is the topic's YouTube video with a chapter per slide ("Learn") followed by exam-style practice ("Practise"), built as a single offline HTML file. The slides the video is recorded from build as a separate presenter's deck.

## Topics

| Specialty | Topic | Status |
| --- | --- | --- |
| Statistics | Types of data | Draft |
| Statistics | Choosing the right test | Planned (moving over from the first repo) |

The full list and each topic's status live in [curriculum.yaml](curriculum.yaml).

## Build and check

You need Python 3 with PyYAML (`pip install -r requirements.txt`). The check also needs Node 22+ (for its built-in WebSocket) and Google Chrome.

```bash
python build.py
```

```bash
node checks/check.mjs dist/statistics/data-types.html
```

The built pages land in `dist/`: `dist/index.html` is the home page, and each topic is at `dist/<specialty>/<topic>.html`, and its presenter's deck at `presenter/<specialty>/<topic>.html` (on your computer only; it is never published).

## Recording a video

Run `python build.py`, then open `presenter/index.html` and pick the topic; its deck holds every Learn slide. Use a full-screen browser window, or press P for the tablet recording view. To record on the tablet, copy the topic's one file from `presenter/<specialty>/` to the tablet (USB, Google Drive or Quick Share) and open it in Chrome; it works offline. On any screen of at least 900 × 480 the page is a fixed 16:9 stage, so a 1920 × 1080 recording frames the same every time. Use the arrow keys to move between slides.

## Publishing on Cloudflare Pages

Connect this repository in Cloudflare (Workers & Pages → Create → Pages → Connect to Git) with these settings:

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Build command | `pip install -r requirements.txt && python build.py` |
| Build output directory | `dist` |

Every push to `main` then rebuilds and publishes the site.

After recording a video, put its YouTube ID in the topic's `video:` in `curriculum.yaml` and each Learn slide's start time as `at: "m:ss"` in the topic's YAML.

## Adding a topic

1. Add the topic to `curriculum.yaml` with `status: draft`.
2. Write `content/<specialty>/<slug>.yaml`, starting from an existing topic.
3. Build, run the check, and review the page.

See [CLAUDE.md](CLAUDE.md) for the full workflow and [DESIGN.md](DESIGN.md) for the design rules.

Created by Mohamed Gafar. Not affiliated with the Royal College of Physicians.
