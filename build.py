"""Build every topic page and the curriculum home page into dist/.

  python build.py            check the content, then build everything
  python build.py --check    only check the content

Each topic in curriculum.yaml has a content file, content/<specialty>/<slug>.yaml,
and builds to two self-contained offline files with the engine's CSS, JavaScript,
icons and fonts embedded:

  dist/<specialty>/<slug>.html          the candidate's page: Learn is the recorded video
                                        with a chapter per slide, then Practise
  presenter/<specialty>/<slug>.html     the presenter's deck: every Learn slide, for
                                        recording. Built beside dist/, never published;
                                        presenter/index.html lists every deck

Permanent IDs: every case and practice item ID ever built is listed in
content/ids.lock. The check fails if a listed ID disappears without being
retired, or if a retired ID comes back, so IDs are never reused.
"""
import base64
import datetime
import json
import os
import re
import sys

import yaml

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from engine.patterns import CENTRED, PATTERNS, e, favicon, lettering, logo_icon, p_title, p_video, topic_data, wordmark  # noqa: E402

ROOT = os.path.dirname(os.path.abspath(__file__))
ENGINE = os.path.join(ROOT, "engine")
DIST = os.path.join(ROOT, "dist")
PRESENTER = os.path.join(ROOT, "presenter")  # local only: git ignores it and Cloudflare never sees it
LOCK = os.path.join(ROOT, "content", "ids.lock")
CSS_FILES = ["tokens.css", "base.css", "stage.css", "patterns.css"]
JS_FILES = ["core.js", "video.js", "spectrum.js", "flow.js", "clues.js", "reveal.js", "tree.js", "dotplot.js", "curve.js", "story.js", "working.js", "sort.js", "quiz.js", "present.js", "deck.js"]
ITEM_ID = re.compile(r"^[a-z]\d{2,3}$")
YOUTUBE_ID = re.compile(r"^[A-Za-z0-9_-]{11}$")
CHAPTER_AT = re.compile(r"^(\d+:)?[0-5]?\d:[0-5]\d$")
INSTRUCTION = re.compile(r"\b(tap|click|drag|press|select)\b", re.I)


def read(*parts):
    with open(os.path.join(*parts), encoding="utf-8") as f:
        return f.read()


class Loader(yaml.SafeLoader):
    """Like safe_load, but only true/false are booleans: yes, no, on and off stay words."""


Loader.yaml_implicit_resolvers = {
    k: [(tag, rx) for tag, rx in v if tag != "tag:yaml.org,2002:bool"]
    for k, v in yaml.SafeLoader.yaml_implicit_resolvers.items()
}
Loader.add_implicit_resolver("tag:yaml.org,2002:bool", re.compile(r"^(?:true|True|TRUE|false|False|FALSE)$"), list("tTfF"))


def load_yaml(path):
    with open(path, encoding="utf-8") as f:
        return yaml.load(f, Loader=Loader)


# ---------------------------------------------------------------- checks

def check_topic(t, expected_id):
    errs, warns = [], []
    if t.get("id") != expected_id:
        errs.append(f"id is {t.get('id')!r}, curriculum.yaml expects {expected_id!r}")
    for key in ("title", "description", "updated", "concepts", "families", "learn", "practise"):
        if key not in t:
            errs.append(f"missing '{key}'")
    if errs:
        return errs, warns
    fams, cons = t["families"], t["concepts"]
    if t.get("cover", "concepts") != "concepts":
        errs.append(f"cover is {t['cover']!r}: the only cover is concepts (each concept's icon in a row)")
    for k, c in cons.items():
        if c.get("family") not in fams:
            errs.append(f"concept {k}: unknown family {c.get('family')!r}")
    seen = set()
    for s in t["learn"] + t["practise"]:
        sid = s.get("id")
        where = f"slide {sid or '?'}"
        if not sid:
            errs.append("a slide has no id")
        elif sid in seen or sid == "title":
            errs.append(f"{where}: duplicate id")
        seen.add(sid)
        if s.get("pattern") not in PATTERNS:
            errs.append(f"{where}: unknown pattern {s.get('pattern')!r}")
            continue
        if s.get("at") is not None and not CHAPTER_AT.match(str(s["at"])):
            errs.append(f"{where}: at is {s['at']!r}: write where its chapter starts in the video as m:ss (2:15)")
        if INSTRUCTION.search(s.get("title", "")):
            warns.append(f"{where}: title reads like an instruction ({s['title']!r})")
        refs = []
        p = s["pattern"]
        drawings = [s.get("figure"), s.get("scene")] + list((s.get("charts") or {}).values()) + list(s.get("side") or [])
        drawings += [st.get("figure") for st in s.get("steps") or []] + [g.get("figure") for g in s.get("groups") or []]
        for name in filter(None, drawings):
            if not os.path.exists(os.path.join(ROOT, "content", "figures", name + ".svg")):
                errs.append(f"{where}: no drawing at content/figures/{name}.svg")
        if p == "spectrum":
            refs += [st["concept"] for st in s["stops"] if st.get("concept")]
            if s.get("open", "list") not in ("list", "zoom"):
                errs.append(f"{where}: open is {s['open']!r}: use list (bullets under the circle) or zoom (a large centred circle)")
        if p == "question-flow":
            refs += [st["no"] for st in s["steps"]] + [s["end"]]
        if p == "decision-tree":
            ends = {st[a] for st in s["steps"] for a in ("yes", "no") if isinstance(st.get(a), str)} | {s["end"]}
            refs += list(ends)
            n = len(s["steps"])
            for k, st in enumerate(s["steps"]):
                for a in ("yes", "no"):
                    if isinstance(st.get(a), dict) and not (k + 2 <= st[a].get("to", 0) <= n):
                        errs.append(f"{where}: step {k + 1} can only skip ahead, to a later step")
            if any(st.get("at") for st in s["steps"]) and not all(st.get("at") for st in s["steps"]):
                errs.append(f"{where}: in a tree laid out in rows, every step needs its place (at: [row, column])")
            for k in list(s.get("examples") or {}) + list(s.get("charts") or {}):
                if k not in ends:
                    errs.append(f"{where}: examples or a chart for {k!r}, which is not an answer in this tree")
            path = s.get("path") or []
            if any(a not in ("yes", "no") for a in path) or len(path) > len(s["steps"]):
                errs.append(f"{where}: path must be yes/no answers, one per step at most")
            if path and len(s.get("wrong") or []) != len(path):
                errs.append(f"{where}: give one 'wrong' line for each step in the path")
        if p == "dot-plot":
            refs += s["measures"]
            vals = s.get("values") or []
            if len(vals) < 3 or not all(isinstance(v, (int, float)) for v in vals):
                errs.append(f"{where}: give three or more numbers in values")
            if any(m not in ("mean", "median", "mode") for m in s["measures"]):
                errs.append(f"{where}: measures are mean, median and mode (concept keys of those names)")
            if s.get("swap") and s["swap"].get("from") not in vals:
                errs.append(f"{where}: swap.from must be one of the values")
            if any(v != int(v) or v < 0 for v in vals):
                errs.append(f"{where}: values are whole numbers of 0 or more (one slot per value on the axis)")
        if p == "curve":
            if s.get("steps"):
                refs += [st["concept"] for st in s["steps"]] + ["mean", "median", "mode"]
                for st in s["steps"]:
                    # a skewed step is drawn either from its people (values) or from a curve alone (median, range)
                    skew = ("values", "sigma") if st.get("values") else ("median", "sigma", "range")
                    need = {"normal": ("mean", "sd"), "positive": skew,
                            "negative": ("ceiling",) + skew}.get(st.get("shape"))
                    if need is None:
                        errs.append(f"{where}: shape is normal, positive or negative, not {st.get('shape')!r}")
                    elif any(k not in st for k in need):
                        errs.append(f"{where}: a {st['shape']} step needs {', '.join(need)}")
                    if st.get("summary") and st["summary"].get("family") not in fams:
                        errs.append(f"{where}: step {st.get('concept')!r} summary needs a family")
            else:
                for pn in s.get("panels") or []:
                    if "summary" in pn and pn["summary"].get("family") not in fams:
                        errs.append(f"{where}: panel {pn.get('title')!r} summary needs a family")
                    if pn.get("kind") not in ("sd", "dots", "sem"):
                        errs.append(f"{where}: a panel's kind is sd, dots or sem, not {pn.get('kind')!r}")
                    if pn.get("kind") == "sd" and len(pn.get("pct") or []) != len(pn.get("chips") or []):
                        errs.append(f"{where}: an sd panel gives one pct per chip")
                    if pn.get("kind") == "sd" and pn.get("tags") and len(pn["tags"]) != len(pn["chips"]):
                        errs.append(f"{where}: an sd panel gives one tag per chip")
                    if pn.get("kind") == "sd" and any("SEM" in ch for ch in pn.get("chips") or []) and not pn.get("sem"):
                        errs.append(f"{where}: an SEM chip needs the panel's sem")
                    if pn.get("kind") == "sem":
                        # each chip names a sample size (n = 49); the SEM for it is worked out in the browser
                        if not all(re.fullmatch(r"n = \d+", str(ch)) for ch in pn.get("chips") or []) or not pn.get("chips"):
                            errs.append(f"{where}: an sem panel's chips are sample sizes, written n = 49")
                        if any(k not in pn for k in ("mean", "sd", "unit", "axis", "means_axis")):
                            errs.append(f"{where}: an sem panel needs mean, sd, unit, axis and means_axis")
                    if pn.get("kind") == "dots" and len(pn.get("chips") or []) != 3:
                        errs.append(f"{where}: a dots panel has three chips: IQR, range, mean ± 2 SD")
                if not s.get("panels"):
                    errs.append(f"{where}: a curve slide has steps or panels")
        if p == "story" and s.get("panel") and s["panel"].get("summary", {}).get("family") not in fams:
            errs.append(f"{where}: its panel's summary needs a family")
        if p == "story":
            # the numbers are worked out in the browser; only the data each kind draws from is given here
            kind = s.get("kind")
            nums = lambda xs: bool(xs) and all(isinstance(v, int) for v in xs)
            if kind not in ("mean", "median", "mode", "iqr", "sampling", "art", "coin", "gap", "line", "slide", "ci", "ncompare"):
                errs.append(f"{where}: kind is mean, median, mode, iqr, sampling, art, coin, gap, line, slide, ci or ncompare, not {kind!r}")
            elif kind == "ncompare":
                # the same gap in two trials: `ns` people in each group of each, the same SD
                ns = s.get("ns") or []
                if len(ns) != 2 or not all(isinstance(n, int) and n >= 2 for n in ns) or not all(isinstance(s.get(k), (int, float)) for k in ("sd", "gap")) \
                        or len(s.get("labels") or []) != 2 or not (s.get("axis") and s.get("y_axis")):
                    errs.append(f"{where}: an ncompare story needs sd, gap, ns (two group sizes), two labels, an axis and a y_axis")
                refs += ["ci", "p"]
            elif kind == "ci":
                # our trial's gap ± 2 SE of the difference (two groups of n with the same SD), beside chance's bell round 0
                if not all(isinstance(s.get(k), (int, float)) for k in ("sd", "n", "gap")) or len(s.get("labels") or []) != 2 or not (s.get("axis") and s.get("y_axis")):
                    errs.append(f"{where}: a ci story needs sd, n (in each group), gap, two labels, an axis and a y_axis")
                refs += ["ci"]
            elif kind == "slide":
                # each panel: a CI of half-width 2 SE (a difference, with se) or `half` (a ratio), at each place in `at`
                for pn in s.get("panels") or [None]:
                    if not pn or not all(pn.get(k) is not None for k in ("label", "none", "axis", "range", "ticks", "at")) or (pn.get("se") is None) == (pn.get("half") is None):
                        errs.append(f"{where}: a slide panel needs label, none, axis, range, ticks, at, and se (a difference) or half (a ratio)")
                        continue
                    h, (a, b) = 2 * pn["se"] if pn.get("se") is not None else pn["half"], pn["range"]
                    if any(c - h < a or c + h > b for c in pn["at"]):
                        errs.append(f"{where}: panel {pn['label']!r}: every CI must sit inside its range")
            elif kind == "line":
                # the ruler runs from p = 1 down to 0.001
                ok = lambda v: isinstance(v, (int, float)) and .001 <= v <= 1
                if not ok(s.get("cut")) or not s.get("trials") or not all(t.get("label") and ok(t.get("p")) for t in s["trials"]):
                    errs.append(f"{where}: a line story needs a cut and trials [{{label, p}}], every p from 0.001 to 1")
                refs += ["sig", "ns"]
            elif kind == "gap":
                # two groups of n with the same SD, and the gap between their means; SEs and p are worked out in the browser
                if not all(isinstance(s.get(k), (int, float)) for k in ("sd", "n", "gap")) or len(s.get("labels") or []) != 3 or not (s.get("axis") and s.get("y_axis")):
                    errs.append(f"{where}: a gap story needs sd, n (in each group), gap, three labels, an axis and a y_axis")
                means = s.get("means") or []
                if len(means) != 2 or not s.get("means_axis") or not all(isinstance(m, (int, float)) for m in means) or abs(means[0] - means[1] - s.get("gap", 0)) > 1e-9:
                    errs.append(f"{where}: a gap story needs means: [placebo, drug], each group's mean blood pressure, the drug's the gap lower, and a means_axis")
                elif not 0 < s["gap"] <= 3 * s["sd"] * (2 / s["n"]) ** .5 + 1e-9 or 4 * s["sd"] * (2 / s["n"]) ** .5 > 6.01:
                    errs.append(f"{where}: its axis runs 0 to 6: the gap must sit inside it, within 3 SEs, with 4 SEs no more than 6")
                refs += ["p", s.get("family", "ci")]
            elif kind == "coin":
                # all heads in `tosses` tosses of a fair coin: p = 2 ÷ 2^tosses, worked out in the browser
                if not isinstance(s.get("tosses"), int) or not 3 <= s["tosses"] <= 11 or not s.get("claim"):
                    errs.append(f"{where}: a coin story needs tosses (3 to 11) and a claim (H₀ as {{h0}}: …)")
                else:
                    refs += re.findall(r"\{(\w+)\}", s["claim"]) + ["p"]
            elif kind == "art":
                # a drawing whose parts join beat by beat; its words come from slots, H₀ and the like from {concept}
                path = os.path.join(ROOT, "content", "figures", f"{s.get('art')}.svg")
                if not s.get("art") or not os.path.exists(path):
                    errs.append(f"{where}: an art story needs art: a drawing in content/figures")
                else:
                    drawing = open(path, encoding="utf-8").read()
                    want, slots = set(re.findall(r'data-slot="([^"]+)"', drawing)), s.get("slots") or {}
                    if want != set(slots):
                        errs.append(f"{where}: its slots must be exactly {sorted(want)}, the ones its drawing has")
                    if not re.search(r'data-beat="\d+"', drawing):
                        errs.append(f"{where}: its drawing has no data-beat parts to build")
                    for text in slots.values():
                        refs += re.findall(r"\{(\w+)\}", str(text))
            elif kind == "sampling":
                # samples of n drawn from a population (a bell, or a skew against a wall at 0): their means pile up
                pop = s.get("population") or {}
                if pop.get("shape") not in ("normal", "positive") or not all(isinstance(pop.get(k), (int, float)) for k in ("mean", "sd")):
                    errs.append(f"{where}: a sampling story needs population: {{shape: normal or positive, mean, sd}}")
                if not isinstance(s.get("n"), int) or s["n"] < 2 or any(not s.get(k) for k in ("unit", "axis", "means_axis")):
                    errs.append(f"{where}: a sampling story needs a sample size n (2 or more), a unit, an axis and a means_axis")
            elif kind == "iqr" and (not nums(s.get("values")) or len(s["values"]) % 4 != 3 or not s.get("unit")):
                # 3, 7, 11 … values: the median and both quartiles each land on one person
                errs.append(f"{where}: an iqr story needs 4k + 3 whole-number values and a unit")
            elif kind in ("mean", "median") and (not nums(s.get("values")) or len(s["values"]) % 2 == 0):
                errs.append(f"{where}: a {kind} story needs an odd number of whole-number values")
            elif kind == "median" and (s.get("outlier", {}).get("from") not in s["values"] or len(s["outlier"].get("to") or []) != 2):
                errs.append(f"{where}: a median story needs outlier: {{from: one of the values, to: [far, farther]}}")
            elif kind == "mode" and not (s.get("counts") and s.get("categories") and s.get("unit") and s.get("categories_unit")):
                errs.append(f"{where}: a mode story needs counts, unit, categories and categories_unit")
            if kind == "iqr":
                refs += ["median"]
            if kind == "sampling":
                refs += ["mean", "sd", "sem"]
            if kind in ("mean", "median", "mode"):
                refs += [kind] + (["mean"] if kind != "mean" else []) + (["median"] if kind == "mode" else [])
        if p == "clue-stem":
            refs += list(s["clues"])
        if p == "reveal-cards":
            refs += [c["concept"] for c in s["cards"] if c.get("concept")]
            for c in s["cards"]:
                if not c.get("concept") and c.get("family") not in fams:
                    errs.append(f"{where}: a card with no concept needs one of the topic's families")
        if p == "working":
            if "[[" not in s.get("stem", "") or not s.get("answer") or not s.get("lines"):
                errs.append(f"{where}: a working slide needs a stem with a [[clue]], its lines and the answer")
            if not s.get("question") and not any(h.get("pattern") == "hook" and h.get("question") for h in t["learn"]):
                errs.append(f"{where}: a working slide needs a question, its own or the hook's")
            for ln in s.get("lines") or []:
                if not ln.get("text") or ln.get("family") not in fams:
                    errs.append(f"{where}: each line of working needs its text and one of the topic's families")
        if p == "sort":
            refs += s["buckets"] + [it["answer"] for it in s["items"]]
        if p == "stem-quiz":
            refs += s["options"]
            for c in s["cases"]:
                # a case may bring its own options: concept keys, or plain text for choices that are not concepts
                opts = c.get("options") or s["options"]
                if c.get("options"):
                    refs += [o for o in c["options"] if o in cons]
                    if len(set(opts)) != len(opts) or len(opts) < 2:
                        errs.append(f"{where}: case {c['id']} needs two or more different options")
                if c["answer"] not in opts:
                    errs.append(f"{where}: case {c['id']} answer {c['answer']!r} is not an option")
                if "[[" not in c["stem"]:
                    errs.append(f"{where}: case {c['id']} has no [[clue]] in its stem")
                if c.get("scene") and not os.path.exists(os.path.join(ROOT, "content", "figures", c["scene"] + ".svg")):
                    errs.append(f"{where}: case {c['id']} has no drawing at content/figures/{c['scene']}.svg")
                for key in ("question", "hint", "why"):
                    if not c.get(key):
                        errs.append(f"{where}: case {c['id']} has no {key}")
            if not s["cases"] or not s["cases"][0].get("solved"):
                errs.append(f"{where}: the first case must be the solved example")
        for r in refs:
            if r not in cons:
                errs.append(f"{where}: unknown concept {r!r}")
    return errs, warns


def item_ids(t):
    """(full id, where) for every permanent item ID in a topic."""
    out = []
    for s in t["practise"]:
        for it in s.get("items", []) + s.get("cases", []):
            out.append((f"{t['id']}.{it.get('id')}", it.get("id")))
    return out


def check_ids(topics):
    errs = []
    locked = set()
    if os.path.exists(LOCK):
        locked = {ln.strip() for ln in read(LOCK).splitlines() if ln.strip() and not ln.startswith("#")}
    current, retired = set(), set()
    for t in topics:
        retired |= {f"{t['id']}.{r}" for r in t.get("retired", [])}
        for full, short in item_ids(t):
            if not short or not ITEM_ID.match(str(short)):
                errs.append(f"{t['id']}: bad item id {short!r} (use a letter and 2-3 digits, e.g. c07)")
            elif full in current:
                errs.append(f"{full}: used twice")
            current.add(full)
    for gone in sorted(locked - current - retired):
        errs.append(f"{gone}: was published but is missing. Put it back, or add it to the topic's 'retired' list")
    for back in sorted(current & retired):
        errs.append(f"{back}: is retired and cannot be reused. Give the item a new ID")
    return errs, sorted(locked | current)


# ---------------------------------------------------------------- build

def fonts_css():
    b64 = {n: base64.b64encode(open(os.path.join(ENGINE, "fonts", n), "rb").read()).decode("ascii")
           for n in ("inter.woff2", "outfit.woff2")}
    return ('@font-face{font-family:"Inter";src:url(data:font/woff2;base64,%s) format("woff2");font-weight:100 900;font-display:swap}\n'
            # Outfit is a variable font; declaring it at 500 alone pins every heading to Medium
            '@font-face{font-family:"Outfit";src:url(data:font/woff2;base64,%s) format("woff2");font-weight:500;font-display:swap}\n'
            % (b64["inter.woff2"], b64["outfit.woff2"]))


def section(slide, part, inner):
    centred = slide["pattern"] in CENTRED or (slide["pattern"] == "spectrum" and slide.get("open") == "zoom")
    cls = "slide" + (" slide-center" if centred else "")
    return (f'<section class="{cls} p-{slide["pattern"]}" data-id="{e(slide["id"])}" data-part="{part}" '
            f'aria-label="{e(slide["title"])}">{inner}</section>')


def render_topic(t, spec, site, present=False):
    """The candidate's page, or with present=True the presenter's deck (every Learn slide)."""
    slides = [section({"id": "title", "pattern": "title", "title": "Title"}, "", p_title({"present": present}, t))]
    if not present:
        slides.append(section({"id": "video", "pattern": "video", "title": "Video"}, "Learn", p_video({}, t)))
    for part, key in (("Learn", "learn"), ("Practise", "practise")):
        if part == "Learn" and not present:
            continue
        for s in t[key]:
            if s.get("hidden"):  # kept in the YAML and checked, but left out of the page
                continue
            inner = PATTERNS[s["pattern"]](s, t)
            if inner is None:  # dealt in the browser
                slides.append(f'<div class="case-anchor" data-quiz="{e(s["id"])}" hidden></div>')
            else:
                slides.append(section(s, part, inner))
    shell = read(ENGINE, "shell.html")
    css = fonts_css() + "".join(read(ENGINE, "css", f) for f in CSS_FILES)
    js = "".join(read(ENGINE, "js", f) for f in JS_FILES)
    data = json.dumps(topic_data(t), ensure_ascii=False).replace("</", "<\\/")
    page_title = f'{t["title"]} · {site["title"]}'
    for k, v in {
        "{{PAGE_TITLE}}": e(page_title), "{{DESCRIPTION}}": e(t["description"]), "{{AUTHOR}}": e(site["author"]),
        "{{MODE}}": "present-deck" if present else "site",
        "{{TITLE}}": e(t["title"]), "{{SPECIALTY}}": e(spec["title"]), "{{SITE}}": e(site["title"]), "{{WORDMARK}}": wordmark(site["title"]), "{{FAVICON}}": favicon(), "{{ICONS}}": read(ENGINE, "icons.svg"),
        "{{SLIDES}}": "\n".join(slides), "{{DATA}}": data, "{{CSS}}": css, "{{JS}}": js,
    }.items():
        shell = shell.replace(k, v)
    return shell


def render_index(site, specs, label=""):
    rows = []
    for spec in specs:
        items = []
        for tp in spec["topics"]:
            status = tp.get("status", "planned")
            name = e(tp["title"])
            # the whole row is the button, not just the name; a planned topic has nowhere to go yet
            inner = f'<span class="topic-name">{name}</span><span class="status">{status}</span>'
            row = (f'<a class="topic-row" href="{spec["id"]}/{tp["slug"]}.html">{inner}</a>' if status != "planned"
                   else f'<div class="topic-row">{inner}</div>')
            items.append(f'<li class="topic s-{status}">{row}</li>')
        rows.append(f'<section class="spec-block"><h2>{e(spec["title"])}</h2><ul class="topics">{"".join(items)}</ul></section>')
    css = fonts_css() + read(ENGINE, "css", "tokens.css") + read(ENGINE, "css", "index.css")
    d = datetime.date.today()
    today = f"{d.day} {d.strftime('%B %Y')}"
    return f"""<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{e(site["title"] + label)}</title>{favicon()}<meta name="description" content="Interactive MRCP revision pages, one per topic.">
<style>{css}</style></head>
<body><main class="index"><header class="masthead">{logo_icon()}<h1 aria-label="{e(site["title"])}">{lettering(site["title"])}</h1><p class="tagline">{e(site["tagline"])}</p></header>{"".join(rows)}
<p class="credits"><span>Created by {e(site["author"])}</span><span>{e(site["disclaimer"])}</span><span>Last updated {today}</span></p>
</main></body></html>"""


def main():
    only_check = "--check" in sys.argv
    cur = load_yaml(os.path.join(ROOT, "curriculum.yaml"))
    site, specs = cur["site"], cur["specialties"]
    topics, errors, warnings, links = [], [], [], {}
    for spec in specs:
        for tp in spec["topics"]:
            tid = f'{spec["prefix"]}.{tp["slug"]}'
            if tp.get("status") in ("draft", "reviewed", "published"):
                links[tid] = f'../{spec["id"]}/{tp["slug"]}.html'
    for spec in specs:
        for tp in spec["topics"]:
            # an unquoted comma in a { } line splits the title into stray keys ("Centre, shape and spread")
            stray = set(tp) - {"slug", "title", "status", "video"}
            if stray:
                errors.append(f'{spec["prefix"]}.{tp.get("slug")}: unknown keys {sorted(stray)} in curriculum.yaml; quote a title that has a comma')
            if tp.get("status", "planned") == "planned":
                continue
            tid = f'{spec["prefix"]}.{tp["slug"]}'
            path = os.path.join(ROOT, "content", spec["id"], tp["slug"] + ".yaml")
            if not os.path.exists(path):
                errors.append(f"{tid}: no content file at {os.path.relpath(path, ROOT)}")
                continue
            t = load_yaml(path)
            errs, warns = check_topic(t, tid)
            errors += [f"{tid}: {x}" for x in errs]
            warnings += [f"{tid}: {x}" for x in warns]
            if tp.get("video") is not None and not YOUTUBE_ID.match(str(tp["video"])):
                errors.append(f"{tid}: video is {tp['video']!r}: give the YouTube video ID (11 letters, digits, - or _)")
            t["_site"], t["_links"], t["_video"] = site, links, tp.get("video")
            d = t["updated"] if isinstance(t["updated"], datetime.date) else datetime.date.fromisoformat(str(t["updated"]))
            t["_updated_text"] = f"{d.day} {d.strftime('%B %Y')}"
            topics.append((spec, tp, t))
    if not errors:
        id_errs, lock_ids = check_ids([t for _, _, t in topics])
        errors += id_errs
    for w in warnings:
        print("warning:", w)
    if errors:
        for x in errors:
            print("error:", x)
        sys.exit(f"{len(errors)} error(s); nothing was built.")
    print(f"Content OK: {len(topics)} topic(s).")
    if only_check:
        return
    for spec, tp, t in topics:
        for present, out in ((False, os.path.join(DIST, spec["id"], tp["slug"] + ".html")),
                             (True, os.path.join(PRESENTER, spec["id"], tp["slug"] + ".html"))):
            os.makedirs(os.path.dirname(out), exist_ok=True)
            with open(out, "w", encoding="utf-8", newline="\n") as f:
                f.write(render_topic(t, spec, site, present))
            print(f"Built {os.path.relpath(out, ROOT)} ({os.path.getsize(out):,} bytes)")
    # the presenter's home page: the same list of topics, each opening its deck
    with open(os.path.join(PRESENTER, "index.html"), "w", encoding="utf-8", newline="\n") as f:
        f.write(render_index(site, specs, " · presenter"))
    with open(os.path.join(DIST, "index.html"), "w", encoding="utf-8", newline="\n") as f:
        f.write(render_index(site, specs))
    with open(LOCK, "w", encoding="utf-8", newline="\n") as f:
        f.write("# Every permanent item ID ever built. Maintained by build.py; do not edit by hand.\n")
        f.write("\n".join(lock_ids) + "\n")
    print("Built dist/index.html")


if __name__ == "__main__":
    main()
