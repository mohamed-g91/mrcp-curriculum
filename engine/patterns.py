"""Slide patterns: each function turns one YAML slide into HTML.

The markup here is only the skeleton; the behaviour lives in engine/js/.
A pattern takes (slide, topic) and returns the inner HTML of its <section>.
Practice patterns (sort, stem-quiz) also hand their data to the page through
topic_data(), because their slides are built in the browser.
"""
import html
import re

ICON = '<svg class="ico" aria-hidden="true"><use href="#i-{}"/></svg>'
CLUE = re.compile(r"\[\[(?:([a-z-]+)\|)?(.+?)\]\]")


def e(text):
    return html.escape(str(text), quote=True)


def icon(name):
    return ICON.format(name)


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


def heading(slide):
    return f'<h2>{e(slide["title"])}</h2>'


# ---------------------------------------------------------------- watch patterns

def p_title(slide, topic):
    cards = "".join(
        f'<button type="button" class="part-card" data-go="{go}">'
        f'<span class="part-ico">{icon(ico)}</span><b>{label}</b>{icon("right")}</button>'
        for go, ico, label in (("watch", "play", "Watch"), ("practise", "pencil", "Practise"))
    )
    return (f'<div class="title-wrap"><h1>{e(topic["title"])}</h1>'
            f'<div class="part-cards">{cards}</div></div>{credits(topic)}')


def p_hook(slide, topic):
    return (heading(slide) + '<div class="center-body"><div class="stem-card hook">'
            f'<p class="stem-text">{stem_html(slide["stem"])}</p>'
            f'<p class="stem-q">{e(slide["question"])}</p></div></div>')


def _examples(items, start=0):
    return "".join(f'<li style="--i:{start + i}">{e(x)}</li>' for i, x in enumerate(items))


def p_spectrum(slide, topic):
    stops = slide["stops"]
    groups = ""
    if slide.get("groups"):
        groups = '<div class="spec-groups">' + "".join(
            f'<div class="spec-group f-{g["family"]}" style="grid-column:span {g.get("span", 1)}">'
            f'{e(topic["families"][g["family"]])}</div>' for g in slide["groups"]) + "</div>"
    html_stops = []
    for s in stops:
        c = concept(topic, s["concept"]) if s.get("concept") else {}
        label, fam, letter = s.get("label", c.get("label")), s.get("family", c.get("family")), s.get("letter", c.get("letter"))
        if s.get("split"):
            n, subs = 0, []
            for sub in s["split"]:
                subs.append(f'<ul class="spec-sub f-{sub["family"]}"><li class="spec-sub-h" style="--i:{n}">{e(sub["label"])}</li>'
                            f'{_examples(sub["items"], n + 1)}</ul>')
                n += len(sub["items"]) + 1
            body = f'<div class="spec-ex spec-split">{"".join(subs)}</div>'
        else:
            body = f'<ul class="spec-ex">{_examples(s["examples"])}</ul>'
        html_stops.append(
            f'<div class="spec-stop f-{fam}"><button class="spec-dot" type="button" aria-expanded="false" '
            f'aria-label="Show {e(label)} examples">{e(letter)}</button><b>{e(label)}</b>{body}</div>')
    return (heading(slide) + f'<div class="spec" style="--n:{len(stops)}">{groups}'
            f'<div class="spec-line">{"".join(html_stops)}</div></div>')


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


def p_clue_stem(slide, topic):
    stops = []
    for key, clues in slide["clues"].items():
        c = concept(topic, key)
        stops.append(
            f'<div class="spec-stop f-{c["family"]}" data-type="{e(key)}"><button class="spec-dot" type="button" '
            f'aria-expanded="false" aria-label="Show {e(c["label"])} clues">{e(c["letter"])}</button>'
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
        cards.append(
            f'<div class="rcard f-{fam} reveal-item" role="button" tabindex="0" aria-expanded="false">'
            f'<span class="rcard-ico">{icon(ico)}</span><b class="rcard-label">{e(label)}</b>'
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
    "clue-stem": p_clue_stem,
    "reveal-cards": p_reveal_cards,
    "sort": p_sort,
    "stem-quiz": p_stem_quiz,
    "end": p_end,
}

# patterns whose slides are centred in the space under the heading
CENTRED = {"hook", "question-flow", "reveal-cards", "end"}


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
                           "hint": c["hint"], "why": c["why"], "tutor": c.get("tutor", "")}
                          for c in s["cases"]]}
    return data
