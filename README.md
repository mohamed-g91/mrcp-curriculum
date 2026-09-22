# mrcp_Gafar

Interactive MRCP revision pages, one per topic. Each page is a short YouTube video deck ("Watch") followed by exam-style practice ("Practise"), built as a single offline HTML file.

## Topics

| Specialty | Topic | Status |
| --- | --- | --- |
| Statistics | Types of data | Draft |
| Statistics | Choosing the right test | Planned (moving over from the first repo) |

The full list and each topic's status live in [curriculum.yaml](curriculum.yaml).

## Build and check

You need Python 3 with PyYAML (`pip install -r requirements.txt`). The check also needs Node 18+ and Google Chrome.

```bash
python build.py
```

```bash
node checks/check.mjs dist/statistics/data-types.html
```

The built pages land in `dist/`: `dist/index.html` is the home page, and each topic is at `dist/<specialty>/<topic>.html`.

## Recording a video

Open the topic page in a full-screen browser window. On any screen of at least 900 × 480 the page is a fixed 16:9 stage, so a 1920 × 1080 recording frames the same every time. Use the arrow keys to move between slides.

Each topic is either horizontal slides (Back / Next) or one fluid page that scrolls vertically, set by `navigation:` in its content file. To preview the other mode, add `?nav=scroll` or `?nav=slides` to the page address.

## Publishing on Cloudflare Pages

Connect this repository in Cloudflare (Workers & Pages → Create → Pages → Connect to Git) with these settings:

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Build command | `pip install -r requirements.txt && python build.py` |
| Build output directory | `dist` |

Every push to `main` then rebuilds and publishes the site.

## Adding a topic

1. Add the topic to `curriculum.yaml` with `status: draft`.
2. Write `content/<specialty>/<slug>.yaml`, starting from an existing topic.
3. Build, run the check, and review the page.

See [CLAUDE.md](CLAUDE.md) for the full workflow and [DESIGN.md](DESIGN.md) for the design rules.

Created by Mohamed Gafar. Not affiliated with the Royal College of Physicians.
