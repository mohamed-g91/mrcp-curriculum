# MRCP curriculum: interactive teaching pages

The project's rules live in one place, so they never drift apart: read [CLAUDE.md](CLAUDE.md) (what the project is, how it is built and checked, permanent IDs, content) and the sections of [DESIGN.md](DESIGN.md) your task needs (its contents list says which).

For reviewing a page: every built page has `window.MRCP_TOOLS` (`engine/js/agent.js`): `lesson-outline`, `slide-state`, `go-to-slide` and `layout-report`, each `{ description, inputSchema, execute(args) }`. Read a page's state through them (with the DevTools protocol's `Runtime.evaluate`) as JSON before reaching for screenshots. `checks/check.mjs` shows how to drive a page.
