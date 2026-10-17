"""Make a review page for case explanations: the current wording beside the new, with a verdict and a Comment on each row.

Usage: python notes/review/make_review.py <data.js> <out.html> "<title>" "<heading>" <intro.html>

<data.js> defines `const CASES = [...]` (constants before it are fine). Each case:
  {id, title?, answer, stem (HTML, the clue in <mark>), q, rows: [[key, label, now, new], ...]}
  key "why" is the Why, "tutor" the tutor note, anything else a wrong option's note; new = null means unchanged.
<intro.html> is the paragraph(s) and flags shown above the cases.

Publish the page with the Artifact tool, capabilities {db: {}, user: {}, comments: {composer_only: true}}.
Read the answers back with ArtifactData (collection "reviews", one document per row: {verdict, note})
and ArtifactComments. See CLAUDE.md, Workflow, Case explanations.
"""
import sys, os

here = os.path.dirname(os.path.abspath(__file__))
data, out, title, heading, intro = sys.argv[1:6]
s = open(os.path.join(here, 'template.html'), encoding='utf-8').read()
s = s.replace('{{TITLE}}', title).replace('{{HEADING}}', heading)
s = s.replace('{{INTRO}}', open(intro, encoding='utf-8').read().strip())
s = s.replace('/*DATA*/', open(data, encoding='utf-8').read().strip())
open(out, 'w', encoding='utf-8').write(s)
print('wrote', out)
