"""Slide patterns: each function turns one YAML slide into HTML.

The markup here is only the skeleton; the behaviour lives in engine/js/.
A pattern takes (slide, topic) and returns the inner HTML of its <section>.
Practice patterns (sort, stem-quiz) also hand their data to the page through
topic_data(), because their slides are built in the browser.
"""
import html
import json
import os
import re

ICON = '<svg class="ico" aria-hidden="true"><use href="#i-{}"/></svg>'
FIGURES = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "content", "figures")
CLUE = re.compile(r"\[\[(?:([a-z-]+)\|)?(.+?)\]\]")


def e(text):
    return html.escape(str(text), quote=True)


def icon(name):
    return ICON.format(name)


def wordmark(name):
    """The brand name, with its underscore in the brand blue (mrcp_Gafar)."""
    return e(name).replace("_", '<span class="wm-us">_</span>')


def stem_html(text, cls="clue-mark", lit=False):
    """Escape a stem and turn [[phrase]] or [[type|phrase]] into highlighted marks."""
    out, pos = [], 0
    for m in CLUE.finditer(text):
        out.append(e(text[pos:m.start()]))
        kind, phrase = m.group(1), m.group(2)
        attrs = f' data-type="{e(kind)}"' if kind else ""
        out.append(f'<mark class="{cls}{" lit" if lit else ""}"{attrs}>{e(phrase)}</mark>')
        pos = m.end()
    out.append(e(text[pos:]))
    return "".join(out)


def concept(topic, key):
    return topic["concepts"][key]


def mark(c):
    """What a concept's circle holds: its letter, or its icon when it has no letter."""
    return e(c["letter"]) if c.get("letter") else icon(c["icon"])


def heading(slide):
    return f'<h2>{e(slide["title"])}</h2>'


# ---------------------------------------------------------------- learn patterns

def p_title(slide, topic):
    # on the candidate's page Learn is the video (a play icon); in the presenter's deck, the slides (a book)
    learn = "book" if slide.get("present") else "play"
    cards = "".join(
        f'<button type="button" class="part-card" data-go="{go}">'
        f'<span class="part-ico">{icon(ico)}</span><b>{label}</b>{icon("right")}</button>'
        for go, ico, label in (("learn", learn, "Learn"), ("practise", "pencil", "Practise"))
    )
    # a picture of the whole topic above its name
    # cover: concepts puts each concept's icon, in its family colour, in a row above the name
    # (a concept with cover: false, such as a bucket's name, is left out of the row)
    cover = ""
    if topic.get("cover") == "concepts":
        cover = '<div class="cover" aria-hidden="true">' + "".join(
            f'<span class="f-{c["family"]}" style="--i:{i}">{icon(c["icon"])}</span>'
            for i, c in enumerate(c for c in topic["concepts"].values() if c.get("cover", True))) + "</div>"
    return (f'<div class="title-wrap">{cover}<h1>{e(topic["title"])}</h1>'
            f'<div class="part-cards">{cards}</div></div>{credits(topic)}')


def chapter_seconds(at):
    """'2:15' or '1:02:15' as seconds into the video."""
    secs = 0
    for part in str(at).split(":"):
        secs = secs * 60 + int(part)
    return secs


def p_video(slide, topic):
    """Learn on the candidate's page: the recorded video, and a chapter for each Learn slide.
    Nothing loads from YouTube until the poster or a chapter is tapped, so the page stays offline
    and cookie-free until then. With no video yet, the poster says so and the chapters show what is coming."""
    vid = topic.get("_video") or ""
    cover = "".join(f'<span class="f-{c["family"]}">{icon(c["icon"])}</span>' for c in topic["concepts"].values() if c.get("cover", True))
    face = f'<span class="vid-cover" aria-hidden="true">{cover}</span><b class="vid-title">{e(topic["title"])}</b>'
    if vid:
        poster = (f'<button type="button" class="vid-poster" aria-label="Play the video: {e(topic["title"])}">{face}'
                  f'<span class="vid-play">{icon("play")}</span></button>')
    else:
        poster = f'<div class="vid-poster vid-soon">{face}<span class="vid-note">Video coming soon</span></div>'
    rows = []
    for k, s in enumerate(x for x in topic["learn"] if not x.get("hidden")):
        at = s.get("at")
        stamp = f'<span class="vid-at">{e(at) if at is not None else k + 1}</span><span class="vid-name">{e(s["title"])}</span>'
        rows.append(f'<li><button type="button" class="vid-ch" data-at="{chapter_seconds(at)}">{stamp}</button></li>'
                    if vid and at is not None else f'<li><span class="vid-ch">{stamp}</span></li>')
    return (f'<div class="vid-wrap"><div class="vid-player" data-video="{e(vid)}">{poster}</div>'
            f'<ol class="vid-chapters" aria-label="Chapters">{"".join(rows)}</ol></div>{credits(topic)}')


def svg(name):
    """An SVG drawing from content/figures, inlined so the page stays one offline file.
    Drawings colour themselves from the page's tokens (see Figures in patterns.css)."""
    with open(os.path.join(FIGURES, name + ".svg"), encoding="utf-8") as f:
        return f.read().strip()


def figure(name, cls=""):
    return f'<figure class="fig fig-{e(name)}{" " + cls if cls else ""}">{svg(name)}</figure>'


def p_hook(slide, topic):
    fig = figure(slide["figure"]) if slide.get("figure") else ""
    card = (f'<div class="stem-card hook"><p class="stem-text">{stem_html(slide["stem"])}</p>{fig}'
            f'<p class="stem-q">{e(slide["question"])}</p></div>')
    if slide.get("scene"):  # a cartoon scene beside the card (above it on phones)
        card = f'<div class="hook-row">{card}{figure(slide["scene"])}</div>'
    return heading(slide) + f'<div class="center-body">{card}</div>'


def _examples(items, start=0):
    return "".join(f'<li style="--i:{start + i}">{e(x)}</li>' for i, x in enumerate(items))


def _examples_body(ex, hidden=False):
    """Examples as a list, or, given a list of {label, family, items}, as labelled sub-lists."""
    attr = " hidden" if hidden else ""
    if ex and isinstance(ex[0], dict):
        n, subs = 0, []
        for sub in ex:
            subs.append(f'<ul class="spec-sub f-{sub["family"]}"><li class="spec-sub-h" style="--i:{n}">{e(sub["label"])}</li>'
                        f'{_examples(sub["items"], n + 1)}</ul>')
            n += len(sub["items"]) + 1
        return f'<div class="spec-ex spec-split"{attr}>{"".join(subs)}</div>'
    return f'<ul class="spec-ex"{attr}>{_examples(ex)}</ul>'


def p_spectrum(slide, topic):
    stops = slide["stops"]
    groups = ""
    if slide.get("groups"):
        groups = '<div class="spec-groups">' + "".join(
            f'<div class="spec-group f-{g["family"]}" style="grid-column:span {g.get("span", 1)};--g:{i}">'
            # a small picture of what the family means, above its name
            + (f'<div class="spec-fig">{svg(g["figure"])}</div>' if g.get("figure") else "")
            + f'{e(topic["families"][g["family"]])}</div>' for i, g in enumerate(slide["groups"])) + "</div>"
    # each stop enters with the group above it: --g is that group's place, found from the group spans
    owner = [i for i, g in enumerate(slide.get("groups") or []) for _ in range(g.get("span", 1))]
    html_stops = []
    for j, s in enumerate(stops):
        c = concept(topic, s["concept"]) if s.get("concept") else {}
        label, fam, letter = s.get("label", c.get("label")), s.get("family", c.get("family")), (e(s["letter"]) if s.get("letter") else mark(c))
        body = _examples_body(s.get("split") or s["examples"])
        html_stops.append(
            f'<div class="spec-stop f-{fam}" style="--g:{owner[j] if j < len(owner) else j}"><button class="spec-dot" type="button" aria-expanded="false" '
            f'aria-label="Show {e(label)} examples">{letter}</button><b>{e(label)}</b>{body}</div>')
    zoom = slide.get("open") == "zoom"
    spec = (f'<div class="spec{" spec-zoom" if zoom else ""}" style="--n:{len(stops)}">{groups}'
            f'<div class="spec-line">{"".join(html_stops)}</div></div>')
    # a zoom spectrum never grows, so it sits centred under the heading
    return heading(slide) + (f'<div class="center-body">{spec}</div>' if zoom else spec)


def _result(topic, key, extra=""):
    c = concept(topic, key)
    return f'<div class="qf-res f-{c["family"]}{extra}" data-type="{e(key)}"><b>{e(c["label"])}</b></div>'


def p_question_flow(slide, topic):
    steps = slide["steps"]
    path = slide.get("path")
    parts = []
    for i, st in enumerate(steps):
        parts.append(
            f'<div class="qf-step" data-step="{i}"><button class="qf-q" type="button" aria-expanded="false">'
            f'<span class="qf-n">{i + 1}</span><b>{e(st["q"])}</b></button>'
            f'<div class="qf-no"><span class="qf-lab">No</span>{_result(topic, st["no"])}</div></div>'
            f'<div class="qf-yes" data-step="{i}"><span class="qf-lab">Yes</span></div>')
    parts.append(f'<div class="qf-step qf-end" data-step="{len(steps)}">{_result(topic, slide["end"])}</div>')
    stem = ""
    if slide.get("stem"):
        stem = f'<div class="stem-card compact"><p class="stem-text">{stem_html(slide["stem"], lit=True)}</p></div>'
    data_path = f' data-path="{",".join(path)}"' if path else ""
    return (heading(slide) + f'<div class="center-body">{stem}<div class="qf">'
            f'<div class="qf-chart"{data_path}>{"".join(parts)}</div></div></div>')


def _tree_final(topic, key, examples, charts):
    """The answer at the end of a branch: a solid family card, unlike the step pills.
    With examples, tapping it zooms them open in a large circle. With a chart, the chart
    for that type of data is drawn beside the card when it appears."""
    c = concept(topic, key)
    ex = examples.get(key)
    tap = (f' role="button" tabindex="0" aria-expanded="false" aria-label="Show {e(c["label"])} examples"' if ex else "")
    chart = f'<div class="tree-chart f-{c["family"]}">{svg(charts[key])}</div>' if charts.get(key) else ""
    return (f'<div class="tree-final f-{c["family"]}{" zoomable" if ex else ""}" data-type="{e(key)}"{tap}>'
            f'<span class="tree-dot">{mark(c)}</span><b class="tree-label">{e(c["label"])}</b>'
            f'{_examples_body(ex, hidden=True) if ex else ""}</div>{chart}')


def tree_rule(slide, i, a):
    """Where answer a of step i leads: {"step": j} (the next one by default, or a skip with {to: n}),
    or {"final": key} (a concept at the end of the branch; the last step's Yes ends on the tree's end)."""
    steps, r = slide["steps"], slide["steps"][i].get(a)
    if isinstance(r, dict):
        return {"step": r["to"] - 1}
    if r:
        return {"final": r}
    return {"step": i + 1} if i + 1 < len(steps) else {"final": slide["end"]}


def _tree_grid(slide, topic, levels_html, examples, charts):
    """The tree laid out in rows: each step sits at its `at` [row, column]; a final sits in the cell under
    the step it ends. The links between them are drawn in the browser along the answers chosen."""
    steps, cells = slide["steps"], []
    for i, st in enumerate(steps):
        r, c = st["at"]
        cells.append(levels_html[i].replace('class="tree-level"', f'class="tree-level" style="--gr:{2 * r - 1};--gc:{c}"', 1))
        for a in ("yes", "no"):
            rule = tree_rule(slide, i, a)
            if "final" in rule:
                cells.append(f'<div class="tg-final" data-from="{i}" data-a="{a}" style="--gr:{2 * r};--gc:{c}">'
                             f'{_tree_final(topic, rule["final"], examples, charts)}</div>')
    rules = [{a: tree_rule(slide, i, a) for a in ("yes", "no")} for i in range(len(steps))]
    return cells, e(json.dumps(rules))


def p_decision_tree(slide, topic):
    """Top-down yes/no tree. The chosen answer slides onto the centre line; Yes opens the next
    question below it, No drops to the final answer. With a stem, the stem sits beside the tree.
    With a path (the right answers) and wrong (why, for each step), a wrong answer says why and goes no further."""
    steps = slide["steps"]
    examples, charts = slide.get("examples") or {}, slide.get("charts") or {}
    path, wrong = slide.get("path"), slide.get("wrong") or []
    grid = all(st.get("at") for st in steps)
    levels = []
    for i, st in enumerate(steps):
        why = (f'<div class="feedback bad tree-why" aria-live="polite">{icon("cross")}'
               f'<span><b>Not quite.</b> {e(wrong[i])}</span></div>' if i < len(wrong) else "")
        # a small picture of what the question means, beside its pill
        fig = f'<span class="tree-fig">{svg(st["figure"])}</span>' if st.get("figure") else ""
        levels.append(
            f'<div class="tree-level" data-step="{i}">'
            f'<div class="tree-q">{fig}<span class="tree-n">{i + 1}</span><b>{e(st["q"])}</b></div>'
            f'<div class="tree-answers">'
            f'<button class="tree-a yes" type="button" data-a="yes" aria-pressed="false">Yes</button>'
            f'<button class="tree-a no" type="button" data-a="no" aria-pressed="false">No</button></div>{why}'
            + ("" if grid else f'<div class="tree-out">{_tree_final(topic, st["no"], examples, charts)}</div>') + '</div>')
    data_path = f' data-path="{",".join(path)}"' if path else ""
    if grid:
        cells, rules = _tree_grid(slide, topic, levels, examples, charts)
        tree = f'<div class="tree tree-grid"{data_path} data-steps="{rules}">{"".join(cells)}</div>'
    else:
        levels.append(f'<div class="tree-level tree-end" data-step="{len(steps)}">{_tree_final(topic, slide["end"], examples, charts)}</div>')
        tree = f'<div class="tree"{data_path}>{"".join(levels)}</div>'
    if slide.get("stem"):
        stem = f'<div class="stem-card compact"><p class="stem-text">{stem_html(slide["stem"], lit=True)}</p></div>'
        # side figures under the stem: the k-th shows once k questions are answered (the last one stays)
        side = "".join(figure(n, "side-fig") for n in slide.get("side") or [])
        # or, with no side figures, a cartoon scene under the stem
        if not side and slide.get("scene"):
            side = figure(slide["scene"], "stem-scene")
        side = f'<div class="tree-side">{side}</div>' if side else ""
        return heading(slide) + f'<div class="tree-case"><div class="tree-stem">{stem}{side}</div>{tree}</div>'
    # a cartoon scene in the free corner beside the tree (above it on phones)
    scene = figure(slide["scene"], "tree-scene") if slide.get("scene") else ""
    return heading(slide) + scene + tree


def _measure_dots(topic, keys, cls):
    """Concept circles that open one measure or one step each (the spectrum's circles, reused)."""
    out = []
    for i, key in enumerate(keys):
        c = concept(topic, key)
        out.append(f'<div class="spec-stop {cls} f-{c["family"]}" data-key="{e(key)}" style="--g:{i}">'
                   f'<button class="spec-dot" type="button" aria-expanded="false" aria-label="Show the {e(c["label"])}">'
                   f'{mark(c)}</button><b>{e(c["label"])}</b></div>')
    return "".join(out)


def p_dot_plot(slide, topic):
    """The same few values as stacked dots on an axis. Each measure's circle shows how it is found,
    on the dots; one dot (swap) can be tapped to move, and the open measure moves with it."""
    swap = slide.get("swap")
    attrs = (f' data-values="{",".join(str(v) for v in slide["values"])}"'
             f' data-unit="{e(slide.get("unit", ""))}"' + (f' data-swap="{swap["from"]},{swap["to"]}"' if swap else ""))
    return (heading(slide) + f'<div class="dotplot"{attrs}><div class="dp-chart"></div>'
            f'<div class="dp-measures">{_measure_dots(topic, slide["measures"], "dp-m")}</div></div>')


def spread_panel(pn, i=0, extra=""):
    """One spread panel: its figure, a chip per spread and the summary card (engine/js/curve.js draws it)."""
    sm = pn.get("summary")
    # a chip for the SEM is teal, whichever panel it sits on
    chips = "".join(f'<button class="cv-chip{" f-se" if "SEM" in str(ch) else ""}" type="button" aria-pressed="false" data-k="{e(ch)}">{e(ch)}</button>'
                    for ch in pn["chips"])
    # the panel takes its colour from its summary, else from the spread it shows (SD purple, SEM teal)
    fam = sm["family"] if sm else ("se" if pn["kind"] == "sem" else "par")
    card = f'<div class="cv-sum"><b>{e(sm["label"])}</b><span>{e(sm["note"])}</span></div>' if sm else ""
    # a dots panel writes its values on the figure; an sd panel reads them out below
    read = '<div class="cv-read" aria-live="polite"></div>' if pn["kind"] == "sd" else ""
    title = f'<h3 class="cv-title">{e(pn["title"])}</h3>' if pn.get("title") else ""
    return (f'<div class="cv-panel cv-k-{pn["kind"]} f-{fam}{extra}" style="--g:{i}" data-panel="{e(json.dumps(pn, ensure_ascii=False))}">'
            f'{title}<div class="cv-chart"></div><div class="cv-chips">{chips}</div>'
            f'{read}{card}</div>')


def p_curve(slide, topic):
    """Shapes of data drawn as curves. With steps: one graph, each concept's circle draws its shape,
    its wall (if any) and where the mean, median and mode land. With panels: side by side, each with
    chips that shade a spread (SD bands on a bell, IQR, range or mean +/- 2 SD on a handful of values)."""
    if slide.get("steps"):
        steps = [{k: v for k, v in st.items()} for st in slide["steps"]]
        data = e(json.dumps(steps, ensure_ascii=False))
        return (heading(slide) + f'<div class="curve cv-steps-mode" data-steps="{data}">'
                f'<div class="cv-steps">{_measure_dots(topic, [st["concept"] for st in steps], "cv-s")}</div>'
                f'<div class="cv-stage"><div class="cv-chart"></div><div class="cv-order" aria-live="polite"></div>'
                f'<ul class="cv-ex"></ul></div></div>')
    panels = [spread_panel(pn, i) for i, pn in enumerate(slide["panels"])]
    one = " cv-one" if len(panels) == 1 else ""
    return heading(slide) + f'<div class="curve cv-panels{one}">{"".join(panels)}</div>'


def p_story(slide, topic):
    """A scene beside one figure that builds a beat per tap (the story is told in the video).
    The figure is drawn in the browser from the slide's numbers (engine/js/story.js)."""
    data = {k: slide[k] for k in ("kind", "values", "outlier", "counts", "unit", "categories", "categories_unit",
                                  "population", "n", "axis", "means_axis", "wall_label", "slots", "tosses", "claim", "sd", "gap", "labels", "y_axis", "family", "cut", "trials", "panels") if k in slide}
    if slide.get("panel"):
        data["panel"] = slide["panel"]
    scene = figure(slide["scene"], "st-scene") if slide.get("scene") else ""
    # a story can end on a spread graph: its chips and summary card wait under the figure for the last beat
    panel = ""
    if slide.get("panel"):
        pn, sm = slide["panel"], slide["panel"]["summary"]
        chips = "".join(f'<button class="cv-chip" type="button" aria-pressed="false">{e(ch)}</button>' for ch in pn["chips"])
        panel = (f'<div hidden class="st-tools f-{sm["family"]}"><div class="cv-chips">{chips}</div>'
                 f'<div class="cv-sum"><b>{e(sm["label"])}</b><span>{e(sm["note"])}</span></div></div>')
    # an art story's drawing waits in a template; engine/js/story.js copies it into the figure
    art = f'<template class="st-art">{svg(slide["art"])}</template>' if slide.get("art") else ""
    solo = "" if scene else " st-solo"
    return (heading(slide) + f'<div class="story{solo}" data-story="{e(json.dumps(data, ensure_ascii=False))}">'
            f'{scene}<div class="st-chart"></div>{panel}{art}</div>')


def p_working(slide, topic):
    """Solving the hook with a sum: the stem beside the working, one line per tap (engine/js/working.js).
    The hook's question heads the working from the start, so the part to tap is never empty.
    A line's result sits on a pill in its family colour; the answer to the hook follows the last line."""
    hook = next((s for s in topic.get("learn", []) if s.get("pattern") == "hook"), {})
    question = slide.get("question") or hook.get("question", "")
    lines = []
    for i, ln in enumerate(slide["lines"]):
        res = f'<span class="wk-res">{e(ln["result"])}</span>' if ln.get("result") else ""
        lines.append(f'<li class="wk-line f-{ln["family"]}"><span class="wk-text">{e(ln["text"])}</span>{res}</li>')
    stem = f'<div class="stem-card compact"><p class="stem-text">{stem_html(slide["stem"], lit=True)}</p></div>'
    scene = figure(slide["scene"], "stem-scene") if slide.get("scene") else ""
    return (heading(slide) + f'<div class="center-body"><div class="working"><div class="wk-side">{stem}{scene}</div>'
            f'<div class="wk-steps"><p class="stem-q wk-q">{e(question)}</p><ol class="wk-lines">{"".join(lines)}</ol>'
            f'<p class="wk-answer">{e(slide["answer"])}</p></div></div></div>')


def p_clue_stem(slide, topic):
    stops = []
    for key, clues in slide["clues"].items():
        c = concept(topic, key)
        stops.append(
            f'<div class="spec-stop f-{c["family"]}" data-type="{e(key)}"><button class="spec-dot" type="button" '
            f'aria-expanded="false" aria-label="Show {e(c["label"])} clues">{mark(c)}</button>'
            f'<b>{e(c["label"])}</b><ul class="spec-ex{" long" if len(clues) > 4 else ""}">{_examples(clues)}</ul></div>')
    marks = CLUE.sub(lambda m: "\0{}\1{}\2".format(m.group(1), m.group(2)), slide["stem"])
    text = e(marks)
    for kind, phrase in re.findall("\0(.*?)\1(.*?)\2", text):
        c = concept(topic, kind)
        text = text.replace(f"\0{kind}\1{phrase}\2",
                            f'<mark class="clue f-{c["family"]}" data-type="{kind}">{phrase}'
                            f'<span class="clue-tag">{e(c["label"])}</span></mark>', 1)
    return (heading(slide) + f'<div class="clue-stem" id="clueStem-{e(slide["id"])}"><p>{text}</p></div>'
            f'<div class="spec clue-spec" style="--n:{len(stops)}"><div class="spec-line">{"".join(stops)}</div></div>')


def p_reveal_cards(slide, topic):
    cards = []
    for cd in slide["cards"]:
        if cd.get("concept"):
            c = concept(topic, cd["concept"])
            label, fam, ico = c["label"], c["family"], c.get("icon", "tag")
        else:
            fam = cd["family"]
            label, ico = cd.get("label", topic["families"][fam]), cd.get("icon", "ruler")
        # a picture of the idea above its name, in place of the icon
        top = figure(cd["figure"], "rcard-fig") if cd.get("figure") else f'<span class="rcard-ico">{icon(ico)}</span>'
        cards.append(
            f'<div class="rcard f-{fam} reveal-item" role="button" tabindex="0" aria-expanded="false">'
            f'{top}<b class="rcard-label">{e(label)}</b>'
            f'<span class="rcard-answer">{e(cd["answer"])}</span></div>')
    nxt = ""
    if slide.get("next"):
        n = slide["next"]
        href = topic["_links"].get(n["topic"])
        inner = f'<span class="next-k">Next topic</span><b>{e(n["label"])}</b>'
        nxt = (f'<a class="next-topic" href="{e(href)}">{inner}{icon("right")}</a>' if href
               else f'<div class="next-topic soon">{inner}<span class="soon-tag">Coming soon</span></div>')
    return heading(slide) + f'<div class="center-body"><div class="reveal-grid">{"".join(cards)}</div>{nxt}</div>'


# ---------------------------------------------------------------- practise patterns

def p_sort(slide, topic):
    return heading(slide) + f'<div class="sort" data-sort="{e(slide["id"])}"></div>'


def p_stem_quiz(slide, topic):
    # the case slides are dealt in the browser, in a fresh random order each run
    return None


def p_end(slide, topic):
    return (heading(slide) +
            '<div class="center-body"><div class="end-card">'
            '<div class="final-score" id="finalScore">0 / 0</div><p class="final-msg" id="finalMsg"></p>'
            f'<div class="end-actions"><button class="btn primary" type="button" id="restartBtn">{icon("refresh")}New cases</button>'
            f'<button class="btn" type="button" id="toStartBtn">{icon("home")}Back to start</button></div>'
            f'</div></div>{credits(topic)}')


def credits(topic):
    site = topic["_site"]
    return (f'<p class="credits"><span>Created by {e(site["author"])}</span><span>{e(site["disclaimer"])}</span>'
            f'<span>Last updated {e(topic["_updated_text"])}</span></p>')


PATTERNS = {
    "title": p_title,
    "hook": p_hook,
    "spectrum": p_spectrum,
    "question-flow": p_question_flow,
    "decision-tree": p_decision_tree,
    "dot-plot": p_dot_plot,
    "curve": p_curve,
    "story": p_story,
    "working": p_working,
    "clue-stem": p_clue_stem,
    "reveal-cards": p_reveal_cards,
    "sort": p_sort,
    "stem-quiz": p_stem_quiz,
    "end": p_end,
}

# patterns whose slides are centred in the space under the heading
CENTRED = {"hook", "question-flow", "reveal-cards", "working", "end"}


def topic_data(topic):
    """The data the browser needs to build the practice slides."""
    data = {"id": topic["id"], "title": topic["title"], "concepts": topic["concepts"], "sorts": {}, "quizzes": {}}
    for s in topic["practise"]:
        if s["pattern"] == "sort":
            data["sorts"][s["id"]] = {
                "buckets": s["buckets"], "done": s.get("done", ""), "retry": s.get("retry", ""),
                "items": [{"id": f'{topic["id"]}.{it["id"]}', "label": it["label"], "answer": it["answer"], "why": it["why"]}
                          for it in s["items"]]}
        elif s["pattern"] == "stem-quiz":
            data["quizzes"][s["id"]] = {
                "title": s["title"], "options": s["options"],
                "cases": [{"id": f'{topic["id"]}.{c["id"]}', "solved": bool(c.get("solved")), "twist": bool(c.get("twist")),
                           "stem": stem_html(c["stem"]), "question": c["question"], "answer": c["answer"],
                           "options": c.get("options"),
                           "hint": c["hint"], "why": c["why"], "tutor": c.get("tutor", ""),
                           # a cast member with a prop for the case's subject, beside the stem
                           "scene": svg(c["scene"]) if c.get("scene") else ""}
                          for c in s["cases"]]}
    return data
