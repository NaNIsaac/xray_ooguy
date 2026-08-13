# PLAN

Product direction and backlog. For engineering constraints see [`../CLAUDE.md`](../CLAUDE.md);
for what the site contains see [`../README.md`](../README.md).

Last reviewed: 2026-08-12.

---

## Identity

> An offline-first calculation and record surface for synchrotron beamtime.

Two things it is:

- **A calculator you trust at 3am in the control room.** Fast, offline, states its own
  assumptions, prints to A4.
- **A formatter for the notebook you already keep.** RECORD produces headers and timestamped
  snippets to paste elsewhere.

Two things it is deliberately not:

- **Not an ELN / LIMS.** No experiment database, no sample inventory, no project management,
  no rich-text editor, no forced metadata.
- **Not a replacement for Google Docs / paper notes.** It feeds them.

---

## Where it landed

The site went through an "experiment-centered workspace" design round. That direction was
**not** adopted, and the earlier planning docs describing it have been removed. What actually
shipped is flatter and lighter:

- Navigation reorganised by **physics**, not by feature type:
  `SPECTROSCOPY` (energy, matter interaction) and `GONIOMETRY` (angle, geometry).
- `EXPERIMENT` as a top-level concept was **dropped entirely** — no session objects, no
  experiment-scoped storage, no "save to experiment" workflow. RECORD is text generation only.
- Dropped along the way: kanban board, sample inventory table, DAQ storage estimator,
  general unit converter, facility link list, global calculation history as a main view.
- Added since: metric-tensor d-spacing for all seven crystal systems (`lattice.js`),
  per-card model validity disclosure (`validity.js`), inline SVG mini plots (`miniplot.js`),
  sidebar tree with search (`nav.js`), eight themes.
- **DATA** (`dataview.js`) closes the loop the other three suites open: calculate, record,
  then look at what came back. Two-column scan files are read in the browser, plotted on a
  linear or log axis, normalised, cropped, and — for XRR — stitched across their overlaps.
  It reads files; it does not manage them. No project, no dataset, no library.

The lesson worth keeping: **features that do not survive contact with a real beamtime get cut.**
Adding a calculator is cheap; adding a data model is not.

---

## Backlog

Unordered — priority is the maintainer's call, not the document's.

### Known deviations

- `.rec-memo-grid` (`style.css:2528`) uses CSS Grid; `.tab-pill` (`style.css:807`) uses flex
  `gap`. Both are unsupported on the CentOS 7 target. Migrate to the percentage-column +
  negative-margin pattern used everywhere else.
- No automated check enforces the ES5 / no-grid / no-gap rules. A grep-based lint script run
  before commit would stop regressions that `node --check` cannot see.

### Candidates

- **DATA: read the cursor off the plot** — an x/y readout on hover would answer "where is
  that fringe" without exporting. Needs a hit-test against the drawn points, not a library.
- **DATA: fringe spacing → thickness** — Kiessig fringe period on a stitched XRR curve gives
  the film thickness directly. The suite already has the curve; this is the calculation the
  user is doing on paper afterwards.
- **DATA: remember the last import** — parsed traces vanish on reload. Keeping them in
  `localStorage` would need a size cap and a place in the backup JSON.

- **Reflection list depth** — the Bragg suite now lists allowed reflections for a cell at a
  given energy. Structure-factor-based intensity ordering is the obvious next step.
- **RECORD snippet customisation** — user-defined snippet text in `localStorage`, still with
  no session concept.
- **Backup coverage audit** — confirm every `bl_toolkit_*` key round-trips through the
  Settings export/import JSON. Silent gaps here lose real data.
- **i18n coverage check** — a script that diffs `data-i18n` keys in `index.html` against the
  `ko`/`en` tables in `i18n.js` and reports keys missing from either.
- **Attenuation data range** — `data.js` covers a limited element and energy set; extending it
  widens the transmission and critical-angle calculators.

### Explicitly out of scope

Server, accounts, database, build step, framework rewrite, external API integration,
runtime `fetch`. Each of these has been considered and rejected — reopening one needs a
concrete beamtime problem it solves, not a general improvement argument.
