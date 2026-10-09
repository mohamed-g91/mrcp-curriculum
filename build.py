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
import shutil
import sys

import yaml

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from engine.patterns import CENTRED, PATTERNS, e, favicon, lockup, p_title, p_video, topic_data, wordmark  # noqa: E402

ROOT = os.path.dirname(os.path.abspath(__file__))
ENGINE = os.path.join(ROOT, "engine")
DIST = os.path.join(ROOT, "dist")
PRESENTER = os.path.join(ROOT, "presenter")  # local only: git ignores it and Cloudflare never sees it
LOCK = os.path.join(ROOT, "content", "ids.lock")
ART = os.path.join(ROOT, "art", "site")  # the home page's drawings, made small by art/make_site_images.py; copied to <build>/img/
CSS_FILES = ["tokens.css", "base.css", "stage.css", "patterns.css", "frame.css"]
JS_FILES = ["core.js", "video.js", "spectrum.js", "flow.js", "clues.js", "reveal.js", "tree.js", "dotplot.js", "curve.js", "story.js", "working.js", "sort.js", "quiz.js", "present.js", "deck.js"]
# the Arabic switch in the top bar: shows or hides every Arabic title and term (engine/js/core.js)
AR_BUTTON = '<button class="icon-btn" id="arBtn" type="button" aria-pressed="true" aria-label="Show or hide the Arabic" lang="ar">ع</button>'
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
    # a topic with title_ar is a topic with Arabic: every shown title and every concept needs its Arabic, so no slide is left half done
    if t.get("title_ar"):
        for k, c in cons.items():
            if not c.get("ar"):
                warns.append(f"concept {k}: no ar (the topic has title_ar)")
        for k in fams:
            if k not in (t.get("families_ar") or {}):
                warns.append(f"family {k}: not in families_ar (the topic has title_ar)")
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
        if t.get("title_ar") and not s.get("title_ar"):
            warns.append(f"{where}: no title_ar (the topic has title_ar)")
        if t.get("title_ar") and s.get("pattern") in ("decision-tree", "question-flow"):
            for k, st in enumerate(s["steps"]):
                if not st.get("q_ar"):
                    warns.append(f"{where}: step {k + 1} has no q_ar (the topic has title_ar)")
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
            if s.get("drill") and (s.get("open") != "zoom" or not s.get("groups")
                                   or sum(g.get("span", 1) for g in s["groups"]) != len(s["stops"])):
                errs.append(f"{where}: drill needs open: zoom and groups whose spans add up to the stops (each family's circles open under its card)")
            if s.get("drill"):
                for st in s["stops"]:
                    for kind in st.get("split") or []:
                        if not (kind.get("icon") and kind.get("family") in fams and kind.get("items")):
                            errs.append(f"{where}: in a drill, each kind of {st.get('concept') or st.get('label')} needs an icon, a family and its items")
                        elif t.get("title_ar") and not kind.get("ar"):
                            warns.append(f"{where}: kind {kind.get('label')!r} has no ar (the topic has title_ar)")
            gs = s.get("groups") or []
            if any(g.get("insert") for g in gs) and not (s.get("drill") and len(gs) == 3 and gs[1].get("insert") and not gs[0].get("insert") and not gs[2].get("insert")):
                errs.append(f"{where}: insert is for the middle card of a three-card drill (it peeks out between the other two)")
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
            if kind not in ("mean", "median", "mode", "iqr", "sampling", "art", "coin", "gap", "line", "slide", "ci", "ncompare", "grid", "samples", "means", "gaps", "twose", "far", "nrows", "runs", "mirror", "cibars", "errgrid", "errbells", "powrows", "plan"):
                errs.append(f"{where}: kind is one of {', '.join(("mean", "median", "mode", "iqr", "sampling", "art", "coin", "gap", "line", "slide", "ci", "ncompare", "grid", "samples", "means", "gaps", "twose", "far", "nrows", "runs", "mirror", "cibars", "errgrid", "errbells", "powrows", "plan"))}, not {kind!r}")
            elif kind == "samples":
                # people's values in two samples: the same SD, the means a little apart
                if not isinstance(s.get("sd"), (int, float)) or len(s.get("means") or []) != 2 or not (s.get("axis") and s.get("y_axis")):
                    errs.append(f"{where}: a samples story needs sd, means (two samples), an axis and a y_axis")
                refs += ["sd"]
            elif kind == "gaps":
                # trials on placebo, one per tap: each [first group's mean, second's]; their gaps must fit the axis of gaps (-6 to 6)
                pairs = s.get("pairs") or []
                if not all(isinstance(s.get(k), (int, float)) for k in ("sd", "n")) or not (s.get("axis") and s.get("y_axis") and s.get("means_axis")) \
                        or not 1 <= len(pairs) <= 5 or not all(len(pr) == 2 and all(isinstance(v, (int, float)) for v in pr) and abs(pr[1] - pr[0]) <= 5.5 for pr in pairs):
                    errs.append(f"{where}: a gaps story needs sd, n, pairs (1 to 5 trials, each [mean, mean], gap within 5.5), a means_axis, an axis and a y_axis")
                refs += ["se"]
            elif kind == "means":
                # the first two samples' means, then many more samples of n: their pile and its bell
                if not all(isinstance(s.get(k), (int, float)) for k in ("sd", "n")) or len(s.get("means") or []) != 2 or not (s.get("axis") and s.get("y_axis")):
                    errs.append(f"{where}: a means story needs sd, n, means (two), an axis and a y_axis")
                elif abs(s["means"][1] - s["means"][0]) > 4 * s["sd"] / s["n"] ** .5:
                    errs.append(f"{where}: the two means must sit within 4 SEM of each other, on the axis of means")
                refs += ["sem"]
            elif kind == "twose":
                # chance's bell in SEs: the cut's share beyond 2 SE either side
                if not (isinstance(s.get("cut"), (int, float)) and 0 < s["cut"] < 1) or not (s.get("axis") and s.get("y_axis")):
                    errs.append(f"{where}: a twose story needs a cut, an axis and a y_axis")
                refs += ["se", "p"]
            elif kind == "far":
                if not all(isinstance(s.get(k), (int, float)) for k in ("sd", "n", "gap")) or not (s.get("axis") and s.get("y_axis")):
                    errs.append(f"{where}: a far story needs sd, n (in each group), gap, an axis and a y_axis")
                elif not 2 * s["sd"] * (2 / s["n"]) ** .5 < s["gap"] < 3 * s["sd"] * (2 / s["n"]) ** .5 or 4 * s["sd"] * (2 / s["n"]) ** .5 > 6.01:
                    errs.append(f"{where}: its axis runs -6 to 6: the gap must land between 2 and 3 SEs, with 4 SEs no more than 6")
                refs += ["se", "p"]
            elif kind == "nrows":
                ns = s.get("ns") or []
                if len(ns) != 2 or not all(isinstance(n, int) and n >= 2 for n in ns) or not all(isinstance(s.get(k), (int, float)) for k in ("sd", "gap"))                         or len(s.get("labels") or []) != 2 or not (s.get("axis") and s.get("y_axis")):
                    errs.append(f"{where}: an nrows story needs sd, gap, ns (two group sizes), two labels, an axis and a y_axis")
                elif 3 * s["sd"] * (2 / min(ns)) ** .5 > 15 or s["gap"] > 15:
                    errs.append(f"{where}: its axis runs -15 to 15: the smaller trial's bell and the gap must fit on it")
                refs += ["se", "p"]
            elif kind == "grid":
                # the trial run 1,000 times with placebo in both groups (25 runs to a column): one trial with its heading and unit,
                # or two side by side with the cut, whose share at each end must fill whole columns (0.05: 25 at each end)
                ns = s.get("ns") or []
                if len(ns) not in (1, 2) or not all(isinstance(n, int) and n >= 2 for n in ns) or not all(isinstance(s.get(k), (int, float)) for k in ("sd", "gap"))                         or len(s.get("labels") or []) != len(ns):
                    errs.append(f"{where}: a grid story needs sd, gap, ns (one or two group sizes) and a label for each")
                elif len(ns) == 1 and not (s.get("heading") and s.get("unit")):
                    errs.append(f"{where}: a grid story of one trial needs a heading and a unit")
                elif len(ns) == 2 and not (isinstance(s.get("cut"), (int, float)) and abs(s["cut"] * 1000 / 2 / 25 - round(s["cut"] * 1000 / 2 / 25)) < 1e-9 and 0 < s["cut"] < 1):
                    errs.append(f"{where}: a grid story of two trials needs a cut whose share at each end is whole columns of 25 runs (0.05, 0.1 …)")
                refs += ["p"] + (["sig", "ns"] if len(ns) == 2 else [])
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
                # each panel: a CI of half-width 2 SE (a difference, with se), of `half`, or from c ÷ factor to c × factor on a log
                # axis (a ratio); two panels each need a label
                panels = s.get("panels") or [None]
                for pn in panels:
                    if not pn or not all(pn.get(k) is not None for k in ("none", "axis", "range", "ticks", "at"))                             or sum(pn.get(k) is not None for k in ("se", "half", "factor")) != 1 or (len(panels) > 1 and not pn.get("label")):
                        errs.append(f"{where}: a slide panel needs none, axis, range, ticks, at, a label when there are two, and se (a difference), half or factor (a ratio)")
                        continue
                    a, b = pn["range"]
                    if pn.get("factor"):
                        ends = lambda c, f=pn["factor"]: (c / f, c * f)
                    else:
                        ends = lambda c, h=2 * pn["se"] if pn.get("se") is not None else pn["half"]: (c - h, c + h)
                    if any(ends(c)[0] < a - 1e-9 or ends(c)[1] > b + 1e-9 for c in pn["at"]):
                        errs.append(f"{where}: panel {pn.get('label') or pn['axis']!r}: every CI must sit inside its range")
                refs += ["ci"]
            elif kind == "runs":
                # repeat trials round a made-up true effect, each CI its centre ± 2 SE; ours first
                cs, rg = s.get("centres") or [], s.get("range") or []
                if not all(isinstance(s.get(k), (int, float)) for k in ("se", "truth")) or not 2 <= len(cs) <= 30 or len(rg) != 2                         or not all(s.get(k) for k in ("axis", "label", "truth_label")):
                    errs.append(f"{where}: a runs story needs se, truth, centres (2 to 30 trials, ours first), a range, an axis, a label and a truth_label")
                elif any(c - 2 * s["se"] < rg[0] or c + 2 * s["se"] > rg[1] for c in cs):
                    errs.append(f"{where}: every trial's CI must sit inside the range")
            elif kind == "mirror":
                # our trial's bell round its gap and chance's round 0, the same SE (two groups of n with the same SD)
                rg = s.get("range") or []
                if not all(isinstance(s.get(k), (int, float)) for k in ("sd", "n", "gap")) or len(rg) != 2 or len(s.get("labels") or []) != 2                         or len(s.get("chips") or []) != 2 or not (s.get("axis") and s.get("y_axis")):
                    errs.append(f"{where}: a mirror story needs sd, n (in each group), gap, a range, two labels, two chips, an axis and a y_axis")
                elif not rg[0] <= -2 * s["sd"] * (2 / s["n"]) ** .5 or s["gap"] + 2 * s["sd"] * (2 / s["n"]) ** .5 > rg[1]:
                    errs.append(f"{where}: both 95% bands must sit inside the range")
            elif kind == "errgrid":
                # the truth across (two columns), the verdict down (sig and ns); the two errors are concepts, each with a note
                er, nt = s.get("errors") or [], s.get("notes") or {}
                if len(s.get("cols") or []) != 2 or len(s.get("heads") or []) != 2 or len(er) != 2 or not all(nt.get(k) for k in er + ["right"]):
                    errs.append(f"{where}: an errgrid story needs two cols, two heads, two errors (concepts) and a note for each error and for right")
                refs += er + ["sig", "ns"]
            elif kind == "errbells":
                # chance's bell round 0 and a truth's bell, SE = SD × √(2 ÷ n); both bells and their 2 SE lines inside the range
                rg, er = s.get("range") or [], s.get("errors") or []
                if not all(isinstance(s.get(k), (int, float)) for k in ("sd", "n", "truth", "ymax")) or len(rg) != 2 or len(er) != 2                         or len(s.get("labels") or []) != 2 or not (s.get("axis") and s.get("y_axis")):
                    errs.append(f"{where}: an errbells story needs sd, n (in each group), truth, ymax, a range, two errors (concepts), two labels, an axis and a y_axis")
                else:
                    se = s["sd"] * (2 / s["n"]) ** .5
                    if not rg[0] < -2 * round(se, 1) < 0 < s["truth"] < 2 * round(se, 1) + s["truth"] < rg[1] + 4 * se:
                        errs.append(f"{where}: the 2 SE lines and the truth must sit inside the range")
                    if 100 / (se * (2 * 3.14159) ** .5) > s["ymax"]:
                        errs.append(f"{where}: ymax must clear the bells' peak ({100 / (se * (2 * 3.14159) ** .5):.0f}%)")
                refs += er + ([s["power"]] if s.get("power") else [])
            elif kind == "powrows":
                # the truth's bell in two rows: each row's SE from its n, or from the power it is planned for (0 to 1)
                rg, rows = s.get("range") or [], s.get("rows") or []
                if not all(isinstance(s.get(k), (int, float)) for k in ("sd", "truth", "ymax")) or len(rg) != 2 or len(s.get("parts") or []) != 2                         or len(rows) != 2 or not all(r.get("label") and (isinstance(r.get("n"), int) or 0 < (r.get("power") or 0) < 1) for r in rows)                         or not (s.get("axis") and s.get("y_axis")):
                    errs.append(f"{where}: a powrows story needs sd, truth, ymax, a range, two parts (β and power concepts), two rows of label and n or power, an axis and a y_axis")
                else:
                    for r in rows:
                        se = s["sd"] * (2 / r["n"]) ** .5 if r.get("n") else None
                        if se and not (rg[0] < s["truth"] - 3 * se and s["truth"] + 3 * se < rg[1] + se):
                            errs.append(f"{where}: row {r['label']!r}: the bell must sit inside the range")
                refs += s.get("parts") or []
            elif kind == "plan":
                # a timeline of three labels, power crossed off the last; rows of a concept and its value; the box's sum
                rows, bx = s.get("rows") or [], s.get("box") or {}
                if len(s.get("labels") or []) != 3 or not s.get("power") or not 1 <= len(rows) <= 4 or not all(r.get("key") and r.get("value") for r in rows)                         or not all(bx.get(k) for k in ("head", "eq", "unknown")):
                    errs.append(f"{where}: a plan story needs three labels, power (a concept), rows (1 to 4) of key and value, and a box of head, eq and unknown")
                refs += [s.get("power")] + [r.get("key") for r in rows] + [k for r in rows for k in re.findall(r"\{(\w+)\}", str(r.get("value", "")) + str(r.get("text", "")))]
            elif kind == "cibars":
                # trials as CI bars: each row's gap ± 2 SE (SD × √(2 ÷ n), in tenths), its p or its verdict and a note
                rows, rg = s.get("rows") or [], s.get("range") or []
                if not isinstance(s.get("sd"), (int, float)) or len(rg) != 2 or not (s.get("axis") and s.get("none_label")) or not 1 <= len(rows) <= 4                         or not all(r.get("label") and isinstance(r.get("n"), int) and isinstance(r.get("gap"), (int, float)) and bool(r.get("verdict")) == bool(r.get("note")) for r in rows):
                    errs.append(f"{where}: a cibars story needs sd, a range, an axis, a none_label and rows (1 to 4) of label, n, gap and, together, verdict and note")
                else:
                    for r in rows:
                        h = 2 * round(s["sd"] * (2 / r["n"]) ** .5, 1)
                        if r["gap"] - h < rg[0] - 1e-9 or r["gap"] + h > rg[1] + 1e-9:
                            errs.append(f"{where}: row {r['label']!r}: its CI must sit inside the range")
                        if r.get("verdict"):
                            refs.append(r["verdict"])
                    if s.get("worth") and not (isinstance(s["worth"].get("at"), (int, float)) and all(s["worth"].get(k) for k in ("label", "below", "above"))):
                        errs.append(f"{where}: worth needs at, a label, and names for the ground below and above it")
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
                if not (ln.get("head") if s.get("rows") else ln.get("text")) or ln.get("family") not in fams:
                    errs.append(f"{where}: each line of working needs its {'head' if s.get('rows') else 'text'} and one of the topic's families")
                if s.get("rows") and len(ln.get("results") or []) != len(s["rows"]):
                    errs.append(f"{where}: with rows, each line of working needs one result per row")
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

# Cairo (SIL Open Font License, engine/fonts/cairo-OFL.txt), the Arabic face: its Arabic letters and its Latin part (digits, and the
# letters that sit inside Arabic text), each a variable-weight font used only where its characters appear. Only topics with Arabic carry it.
CAIRO_FACES = (
    ("cairo-arabic.woff2", "U+0600-06FF,U+0750-077F,U+0870-088E,U+0890-0891,U+0897-08E1,U+08E3-08FF,U+200C-200E,U+2010-2011,U+204F,U+2E41,U+FB50-FDFF,U+FE70-FE74,U+FE76-FEFC"),
    ("cairo-latin.woff2", "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD"),
)


def fonts_css(arabic=False):
    b64 = {n: base64.b64encode(open(os.path.join(ENGINE, "fonts", n), "rb").read()).decode("ascii")
           for n in ("inter.woff2", "outfit.woff2")}
    cairo = "".join(
        '@font-face{font-family:"Cairo";src:url(data:font/woff2;base64,%s) format("woff2");font-weight:200 1000;unicode-range:%s;font-display:swap}\n'
        % (base64.b64encode(open(os.path.join(ENGINE, "fonts", n), "rb").read()).decode("ascii"), rng)
        for n, rng in CAIRO_FACES) if arabic else ""
    return cairo + ('@font-face{font-family:"Inter";src:url(data:font/woff2;base64,%s) format("woff2");font-weight:100 900;font-display:swap}\n'
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
    css = fonts_css(bool(t.get("title_ar"))) + "".join(read(ENGINE, "css", f) for f in CSS_FILES)
    # the site's pattern behind the candidate's lesson, embedded so the page stays one offline file
    css = css.replace("url(img/pattern.webp)", "url(" + art_data_uri("pattern.webp") + ")")
    js = "".join(read(ENGINE, "js", f) for f in JS_FILES)
    data = json.dumps(topic_data(t), ensure_ascii=False).replace("</", "<\\/")
    page_title = f'{t["title"]} · {site["title"]}'
    for k, v in {
        "{{PAGE_TITLE}}": e(page_title), "{{DESCRIPTION}}": e(t["description"]), "{{AUTHOR}}": e(site["author"]),
        "{{MODE}}": ("present-deck" if present else "site") + (" has-ar" if t.get("title_ar") else ""),
        "{{ARBTN}}": AR_BUTTON if t.get("title_ar") else "",
        "{{TITLE}}": e(t["title"]), "{{SPECIALTY}}": e(spec["title"]), "{{SPEC_ID}}": e(spec["id"]), "{{SITE}}": e(site["title"]), "{{WORDMARK}}": wordmark(site["title"]), "{{FAVICON}}": favicon(), "{{ICONS}}": read(ENGINE, "icons.svg"),
        "{{SLIDES}}": "\n".join(slides), "{{DATA}}": data, "{{CSS}}": css, "{{JS}}": js,
    }.items():
        shell = shell.replace(k, v)
    return shell


def art_data_uri(rel):
    """A drawing from art/site as a data URI, for a self-contained topic page; empty if it is not drawn yet."""
    path = os.path.join(ART, rel)
    if not os.path.exists(path):
        return ""
    with open(path, "rb") as f:
        return "data:image/webp;base64," + base64.b64encode(f.read()).decode("ascii")


def hook_question(t):
    """A lesson's opening question: its hook slide's title."""
    for s in t.get("learn", []):
        if s.get("pattern") == "hook":
            return s.get("title", "")
    return ""


def case_count(t):
    return sum(len(s.get("cases") or []) for s in t.get("practise", []))


def next_lessons(spec, built):
    """For each built topic in a specialty, the lesson after it, for the end slide's next-lesson card:
    a built lesson (with its picture and opening question), a planned one (title only), or none."""
    out, topics = {}, spec["topics"]
    for k, tp in enumerate(topics):
        if tp["slug"] not in built:
            continue
        nx = {"spec": spec["title"], "all": "index.html"}
        if k + 1 < len(topics):
            n = topics[k + 1]
            nx["title"] = n["title"]
            if n["slug"] in built:
                nx.update(slug=n["slug"], href=n["slug"] + ".html", n=k + 2, question=hook_question(built[n["slug"]]),
                          thumb=art_data_uri(os.path.join("thumbs", n["slug"] + ".webp")))
        out[tp["slug"]] = nx
    return out


HOME_ICONS = {
    "right": "M9 5l7 7-7 7",
    "play": "M4 6.5A1.5 1.5 0 0 1 5.5 5h13A1.5 1.5 0 0 1 20 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5zM10 9.5v5l4-2.5z",
    "cases": "M7 4h9a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zM9 8h5M9 11h5M9 14h3",
    "check": "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM8 12.5l2.8 2.8 5.7-5.8",
    "menu": "M4 7h16M4 12h16M4 17h16",
    "close": "M6 6l12 12M18 6L6 18",
    "email": "M4 6h16v12H4zM4 7l8 6 8-6",
    "youtube": "M3 8.5A3.5 3.5 0 0 1 6.5 5h11A3.5 3.5 0 0 1 21 8.5v7a3.5 3.5 0 0 1-3.5 3.5h-11A3.5 3.5 0 0 1 3 15.5zM10 9.5v5l4.5-2.5z",
    "telegram": "M21 4L3 11l6 2 2 6 3-4 5 4zM9 13l9-7",
    "link": "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1",
}
HOW_PAGE = "how-it-works.html"
# What you get, on the home page's navy band: what the site offers (never "free": it will be paid)
OFFER = [("play", "Short visual lessons", "One idea per chapter, drawn as you watch."),
         ("cases", "Exam-style cases", "A new order every time you practise."),
         ("check", "Explained answers", "Why the right answer is right, and why the others are not.")]


def home_icon(name):
    return ('<svg class="ico" aria-hidden="true" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" '
            'stroke-linecap="round" stroke-linejoin="round" d="' + HOME_ICONS[name] + '"/></svg>')


def img_tag(rel, cls="", eager=False, up=""):
    """A drawing from art/site, served beside the home page as img/<rel>; nothing if it is not drawn yet."""
    if not os.path.exists(os.path.join(ART, rel)):
        return ""
    lazy = "" if eager else ' loading="lazy"'
    c = f' class="{cls}"' if cls else ""
    return f'<img{c} src="{up}img/{rel}" alt=""{lazy} decoding="async">'


def start_href(specs, up=""):
    """Every Start learning opens the way in, never a lesson: the first specialty's lessons until the pathway page exists."""
    return f'{up}{specs[0]["id"]}/index.html' if specs else f"{up}{HOW_PAGE}"


def site_menu(specs, built, coming, up, here):
    """The site's one menu: every specialty (those not started greyed), then How it works. A navy sheet that fills
    a phone's screen and slides in from the right on a tablet or desktop, the page dimmed behind it."""
    items = []
    for spec in specs:
        n = sum(1 for tp in spec["topics"] if tp["slug"] in built)
        cur = ' aria-current="page"' if here == spec["id"] else ""
        items.append(f'<li><a class="mi" href="{up}{e(spec["id"])}/index.html"{cur}><span>{e(spec["title"])}</span>'
                     f'<span class="mi-n">{n}</span>{home_icon("right")}</a></li>')
    for c in coming:
        items.append(f'<li><span class="mi is-soon"><span>{e(c["title"])}</span><span class="mi-soon">Soon</span></span></li>')
    cur = ' aria-current="page"' if here == "how" else ""
    return (f'<div class="menu" id="menu" hidden><div class="menu-scrim" data-close></div>'
            f'<div class="menu-sheet" role="dialog" aria-modal="true" aria-label="Menu"><div class="menu-top">'
            f'<a class="wordmark" href="{up}index.html" aria-label="Home">{lockup("lockup")}</a>'
            f'<button class="menu-close" type="button" data-close aria-label="Close the menu">{home_icon("close")}</button></div>'
            f'<nav aria-label="Lessons"><ul class="mlist">{"".join(items)}</ul>'
            f'<ul class="mlist"><li><a class="mi" href="{up}{HOW_PAGE}"{cur}><span>How it works</span>{home_icon("right")}</a></li></ul></nav>'
            f'</div></div>')


# the menu is a modal: the page behind it goes inert (no focus, no taps) while it is open; Escape, the close button or
# a tap on the dimmed page closes it, and focus goes back to the button
MENU_JS = ("<script>(function(){var b=document.getElementById('menuBtn'),m=document.getElementById('menu');if(!b||!m)return;"
           "var rest=[].filter.call(document.body.children,function(x){return x!==m&&x.tagName!=='SCRIPT'});"
           "function open(){m.hidden=false;b.setAttribute('aria-expanded','true');document.documentElement.classList.add('menu-open');"
           "rest.forEach(function(x){x.inert=true});"
           "requestAnimationFrame(function(){m.classList.add('is-open');var f=m.querySelector('.mi[href]');if(f)f.focus()})}"
           "function close(){m.classList.remove('is-open');b.setAttribute('aria-expanded','false');document.documentElement.classList.remove('menu-open');"
           "rest.forEach(function(x){x.inert=false});m.hidden=true;b.focus()}"
           "b.addEventListener('click',function(){m.hidden?open():close()});"
           "m.addEventListener('click',function(ev){if(ev.target.closest('[data-close]'))close()});"
           "document.addEventListener('keydown',function(ev){if(ev.key==='Escape'&&!m.hidden)close()})})();</script>")

# What you get rises into view once, as it scrolls in (the site's entrance: 0.5 s each, 0.16 s apart); without
# scripts, or for someone who asks for less motion, it simply shows
REVEAL_JS = ("<script>(function(){var els=document.querySelectorAll('.reveal');if(!els.length||!('IntersectionObserver' in window)"
             "||matchMedia('(prefers-reduced-motion: reduce)').matches)return;document.documentElement.classList.add('reveals');"
             "var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){en.target.classList.add('is-in');io.unobserve(en.target)}})},{threshold:.25});"
             "els.forEach(function(x){io.observe(x)})})();</script>")

# the sign-up posts to the mailing-list service named in curriculum.yaml (site: subscribe:); until one is set, it says so
SIGNUP_JS = ("<script>(function(){var f=document.getElementById('signup');if(!f)return;var s=f.querySelector('.signup-status');"
             "f.addEventListener('submit',function(ev){var i=f.querySelector('input');if(!i.checkValidity()){ev.preventDefault();"
             "s.textContent='Enter a full email address, like name@example.com.';s.className='signup-status is-error';i.focus();return}"
             "if(!f.getAttribute('action')){ev.preventDefault();s.textContent='Sign-up opens soon.';s.className='signup-status';return}"
             "s.textContent='Check your inbox to confirm.';s.className='signup-status is-ok'})})();</script>")


def site_page(site, specs, built, coming, title, body, up="", here="", cls="", label="", extra_js=""):
    """A page of the site around the lessons (home, a specialty's lessons, How it works): the top bar with the
    menu, the sky-blue patterned page, and the inline CSS. Drawings are files in img/ beside the home page."""
    css = (fonts_css() + read(ENGINE, "css", "tokens.css") + read(ENGINE, "css", "index.css")).replace("url(img/", f"url({up}img/")
    name = e(site["title"])
    top = (f'<header class="top"><div class="wrap top-row"><a class="wordmark" href="{up}index.html" aria-label="{name}">{lockup("lockup")}</a>'
           f'<nav class="top-nav" aria-label="Site"><a href="{up}{HOW_PAGE}">How it works</a></nav>'
           f'<button class="menu-btn" id="menuBtn" type="button" aria-expanded="false" aria-controls="menu">'
           f'<span class="menu-btn-label">Lessons</span>{home_icon("menu")}<span class="sr">Menu</span></button></div></header>')
    return f"""<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{e(title + label)}</title>{favicon()}<meta name="description" content="Visual MRCP lessons: short videos, then exam-style cases you solve yourself.">
<style>{css}</style></head>
<body class="{cls}">
{top}
{body}
{site_menu(specs, built, coming, up, here)}
{MENU_JS}{extra_js}
</body></html>"""


def site_foot(site):
    return (f'<footer class="foot"><div class="wrap foot-row"><span class="foot-name">{e(site["title"])} · {e(site["author"])}</span>'
            f'<span>{e(site["disclaimer"])}</span></div></footer>')


def signup_form(site):
    """New lessons by email: one field and Subscribe, posting to the mailing-list service in curriculum.yaml."""
    action = site.get("subscribe") or ""
    act = f' action="{e(action)}" method="post" target="_blank"' if action else ""
    return (f'<form class="signup" id="signup"{act} novalidate><p class="signup-label" id="signupLabel">New lessons by email</p>'
            f'<div class="signup-row"><span class="signup-field">{home_icon("email")}<label class="sr" for="signupEmail">Email address</label>'
            f'<input id="signupEmail" name="email" type="email" autocomplete="email" required placeholder="Email address" aria-describedby="signupNote"></span>'
            f'<button class="btn primary" type="submit">Subscribe</button></div>'
            f'<p class="signup-note" id="signupNote">Unsubscribe any time.</p><p class="signup-status" role="status" aria-live="polite"></p></form>')


def about_section(site, up=""):
    """About me and contact, at the end of the home page, from curriculum.yaml (site: about:)."""
    about = site.get("about") or {}
    if not about:
        return ""
    photo = img_tag("about.webp", "about-photo", up=up)
    if not photo:
        initials = "".join(w[0] for w in site["author"].split()[:2])
        photo = f'<span class="about-photo is-initials" aria-hidden="true">{e(initials)}</span>'
    chips = []
    for c in about.get("contacts") or []:
        # an email opens the mail app; anything else opens in a new tab
        out = "" if str(c["href"]).startswith("mailto:") else ' target="_blank" rel="noopener"'
        kind = c.get("kind") if c.get("kind") in HOME_ICONS else "link"
        chips.append(f'<li><a class="chip" href="{e(c["href"])}"{out}>{home_icon(kind)}<span>{e(c["label"])}</span></a></li>')
    chips = "".join(chips)
    role = f'<p class="about-role">{e(about["role"])}</p>' if about.get("role") else ""
    bio = f'<p class="about-bio">{e(about["bio"])}</p>' if about.get("bio") else ""
    return (f'<section class="about" aria-labelledby="aboutTitle"><div class="wrap about-in wash">{photo}'
            f'<h2 id="aboutTitle">About me</h2><p class="about-name">{e(site["author"])}</p>{role}{bio}'
            f'<ul class="chips">{chips}</ul></div></section>')


def render_index(site, specs, built, coming, label=""):
    """The home page: the headline, the drawing, Start learning and the email sign-up; What you get on a navy
    band; About me and contact. The lessons themselves are reached through the menu."""
    pic = ""
    if os.path.exists(os.path.join(ART, "hero-tall.webp")):
        # the tall drawing on phones and tablets, the wide one beside the headline on a desktop
        pic = ('<picture class="hero-art"><source media="(min-width:1000px)" srcset="img/hero-wide.webp">'
               '<img src="img/hero-tall.webp" alt="" decoding="async"></picture>')
    offer = "".join(f'<li class="offer-item reveal" style="--i:{k}"><span class="offer-ico">{home_icon(ic)}</span>'
                    f'<h3>{t}</h3><p>{d}</p></li>' for k, (ic, t, d) in enumerate(OFFER))
    body = (f'<main><section class="hero"><div class="wrap hero-in">'
            f'<div class="hero-text wash"><h1>Learn MRCP <span>one step at a time.</span></h1>'
            f'<p class="hero-sub">Short video lessons, then exam-style cases you solve yourself.</p></div>{pic}'
            f'<div class="hero-foot"><a class="btn primary big" href="{e(start_href(specs))}">Start learning</a>{signup_form(site)}</div>'
            f'</div></section>'
            f'<section class="offer" aria-labelledby="offerTitle"><div class="wrap"><h2 id="offerTitle">What you get</h2>'
            f'<ul class="offer-list">{offer}</ul></div></section>'
            f'{about_section(site)}</main>{site_foot(site)}')
    # old links named a specialty (/#statistics) or a part of the old home page (#lessons, #how): send them on
    ids = json.dumps([s["id"] for s in specs])
    redirect = ("<script>(function(){var h=location.hash.slice(1),ids=" + ids + ";"
                "if(ids.indexOf(h)>=0)location.replace(h+'/index.html');"
                "else if(h==='lessons'&&ids.length)location.replace(ids[0]+'/index.html');"
                "else if(h==='how')location.replace('" + HOW_PAGE + "')})();</script>")
    return site_page(site, specs, built, coming, site["title"], body, cls="home", label=label,
                     extra_js=redirect + REVEAL_JS + SIGNUP_JS)


def availability(spec, built):
    """What a specialty offers today, said plainly: lessons to practise, and how many have their video yet."""
    ready = [tp for tp in spec["topics"] if tp["slug"] in built]
    videos = sum(1 for tp in ready if tp.get("video"))
    n = len(ready)
    if not n:
        return "Lessons coming soon"
    lessons = f'{n} lesson{"" if n == 1 else "s"} to practise'
    if videos == n:
        return f'{n} lesson{"" if n == 1 else "s"}'
    if not videos:
        return lessons + " · videos coming soon"
    return f"{lessons} · {videos} with video"


def render_specialty(site, specs, built, coming, spec, label=""):
    """A specialty's lessons: on the left (above, on a phone) its drawing, title and what is available; then each
    section as a card opened by a navy strip, its lessons in video order. Planned topics fold away below."""
    rows_by_sec, order, planned = {}, [], []
    sections = spec.get("sections") or {}
    some_video = any(tp.get("video") for tp in spec["topics"] if tp["slug"] in built)
    for i, tp in enumerate(spec["topics"]):
        if tp["slug"] not in built:
            planned.append((i, tp))
            continue
        sec = tp.get("section") or ""
        if sec not in rows_by_sec:
            rows_by_sec[sec] = []
            order.append(sec)
        pic = img_tag(f'thumbs/{tp["slug"]}.webp', up="../")
        badge = f'<span class="vid-badge">{home_icon("play")}Video</span>' if tp.get("video") else ""
        # when some lessons have their video and others not, the others say so before they are opened
        soon = '<span class="lesson-soon">Video coming soon</span>' if some_video and not tp.get("video") else ""
        rows_by_sec[sec].append(
            f'<li><a class="lesson" href="{e(tp["slug"])}.html"><span class="lesson-pic">{pic}{badge}</span>'
            f'<span class="lesson-n">{i + 1}</span><span class="lesson-body"><span class="lesson-title">{e(tp["title"])}</span>'
            f'<span class="lesson-q">{e(hook_question(built[tp["slug"]]))}</span>{soon}</span>{home_icon("right")}</a></li>')
    # the next planned topic sits at the end of its section, if that section is already on the page
    if planned and (planned[0][1].get("section") or "") in rows_by_sec:
        i, tp = planned[0]
        rows_by_sec[tp.get("section") or ""].append(
            f'<li><div class="lesson is-planned"><span class="lesson-pic"></span><span class="lesson-n">{i + 1}</span>'
            f'<span class="lesson-body"><span class="lesson-title">{e(tp["title"])}</span><span class="lesson-q">Coming soon</span></span></div></li>')
        planned = planned[1:]
    cards = []
    for sec in order:
        n = sum(1 for tp in spec["topics"] if tp["slug"] in built and (tp.get("section") or "") == sec)
        head = (f'<h2 class="sec-head"><span class="sec-letter">{e(sec)}</span><span class="sec-name">{e(sections.get(sec, ""))}</span>'
                f'<span class="sec-n">{n} lesson{"" if n == 1 else "s"}</span></h2>') if sec else ""
        cards.append(f'<section class="sec-card">{head}<ul class="lessons">{"".join(rows_by_sec[sec])}</ul></section>')
    more = ""
    if planned:
        names = "".join(f'<li>{e(tp["title"])}</li>' for _, tp in planned)
        more = (f'<details class="more"><summary>{len(planned)} more {e(spec["title"].lower())} topics planned</summary>'
                f'<ul>{names}</ul></details>')
    first = next((tp for tp in spec["topics"] if tp["slug"] in built), None)
    start = (f'<a class="btn primary big wide" href="{e(first["slug"])}.html">Start with lesson 1</a>' if first else "")
    blurb = f'<p class="spec-blurb">{e(spec["blurb"])}</p>' if spec.get("blurb") else ""
    body = (f'<main class="wrap spec"><aside class="spec-side">{img_tag("covers/" + spec["id"] + ".webp", "spec-pic", eager=True, up="../")}'
            f'<div class="spec-text wash"><h1>{e(spec["title"])}</h1>{blurb}<p class="spec-meta">{e(availability(spec, built))}</p>'
            f'{start}</div></aside><div class="spec-list">{"".join(cards)}{more}</div></main>')
    return site_page(site, specs, built, coming, f'{spec["title"]} · {site["title"]}', body, up="../", here=spec["id"],
                     cls="spec-page", label=label)


def render_how(site, specs, built, coming, label=""):
    """How it works: the three steps of every lesson, and the way in."""
    steps = [("play", "Watch", "A short video, one idea per chapter."),
             ("cases", "Practise", "Exam-style cases, in a new order each time."),
             ("check", "Check", "Why each answer is right, shown after you choose.")]
    cards = "".join(f'<li class="step"><span class="step-ico">{home_icon(ic)}</span><span class="step-n">{k + 1}</span>'
                    f'<h2>{t}</h2><p>{d}</p></li>' for k, (ic, t, d) in enumerate(steps))
    body = (f'<main class="wrap how"><h1 class="wash">How it works</h1><ol class="steps">{cards}</ol>'
            f'<a class="btn primary big" href="{e(start_href(specs))}">Start learning</a></main>')
    return site_page(site, specs, built, coming, f'How it works · {site["title"]}', body, here="how", cls="how-page", label=label)


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
            stray = set(tp) - {"slug", "title", "status", "section", "video"}
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
    if "TODO" in json.dumps(site.get("about") or {}):
        warnings.append("curriculum.yaml: site.about still has TODO placeholders; fill them in before the site goes live")
    for w in warnings:
        print("warning:", w)
    if errors:
        for x in errors:
            print("error:", x)
        sys.exit(f"{len(errors)} error(s); nothing was built.")
    print(f"Content OK: {len(topics)} topic(s).")
    if only_check:
        return
    built = {tp["slug"]: t for _, tp, t in topics}
    nexts = {}
    for spec in specs:
        nexts.update(next_lessons(spec, built))
    for spec, tp, t in topics:
        t["_next"] = nexts.get(tp["slug"])
        for present, out in ((False, os.path.join(DIST, spec["id"], tp["slug"] + ".html")),
                             (True, os.path.join(PRESENTER, spec["id"], tp["slug"] + ".html"))):
            os.makedirs(os.path.dirname(out), exist_ok=True)
            with open(out, "w", encoding="utf-8", newline="\n") as f:
                f.write(render_topic(t, spec, site, present))
            print(f"Built {os.path.relpath(out, ROOT)} ({os.path.getsize(out):,} bytes)")
    # the site around the lessons: the home page, each specialty's lessons and How it works; the presenter's copies
    # are the same pages, their lessons opening the decks
    coming = cur.get("coming") or []
    for out, label in ((DIST, ""), (PRESENTER, " · presenter")):
        pages = {"index.html": render_index(site, specs, built, coming, label),
                 HOW_PAGE: render_how(site, specs, built, coming, label)}
        for spec in specs:
            pages[spec["id"] + "/index.html"] = render_specialty(site, specs, built, coming, spec, label)
        for rel, text in pages.items():
            os.makedirs(os.path.dirname(os.path.join(out, rel)), exist_ok=True)
            with open(os.path.join(out, rel), "w", encoding="utf-8", newline="\n") as f:
                f.write(text)
    # the home page's drawings sit beside it as files
    for out in (DIST, PRESENTER):
        if os.path.isdir(ART):
            shutil.rmtree(os.path.join(out, "img"), ignore_errors=True)
            shutil.copytree(ART, os.path.join(out, "img"))
    with open(LOCK, "w", encoding="utf-8", newline="\n") as f:
        f.write("# Every permanent item ID ever built. Maintained by build.py; do not edit by hand.\n")
        f.write("\n".join(lock_ids) + "\n")
    print("Built the home page, How it works and each specialty's lessons page")


if __name__ == "__main__":
    main()
