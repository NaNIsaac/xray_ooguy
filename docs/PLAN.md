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

## Next version — discoverability

> Make the existing tools findable through search engines without making the site feel
> SEO-driven. It stays a beamline tool, not a marketing page.

The strategy is **tool intent, not topic**: someone searching "bcdi oversampling calculator"
or "eulerian cradle correction" should land on the thing that does it. The homepage
establishes the category; the individual tools carry the niche queries.

### Already true — do not redo

- Navigation says INDEX, not CONTENTS, and the INDEX control has no dotted border
  (`border: none !important` on `.tab-pill-index`).
- `js/app.js` already carries `seoTitle` / `seoDesc` per route and rewrites the document
  title and meta description on navigation.
- `index.html` already has canonical, Open Graph, a `WebApplication` block with a
  `featureList`, an English `<h1 class="sr-only">`, and an English `<noscript>` tool list.
- `robots.txt` allows everything and points at the sitemap.

### The decision this rests on

**English search intent currently has no rendered home.**

The page is served as `<html lang="ko">` with Korean body text, and `i18n.js` swaps language
client-side with Korean as the default. A crawler that renders the page sees Korean. Every
English phrase the plan targets exists only in `<head>`, the `noscript` block and the
`sr-only` heading — never in the rendered body unless a visitor has chosen English.

Compounding it: hash routes are not URLs. `#goniometry/card-optics-bragg` cannot hold its own
`<title>`, canonical or schema, so per-tool metadata has nothing to attach to.

Two ways out:

**A. Hash-only.** Keep one page; strengthen metadata, anchor text, internal links and the
INDEX. Cheapest, nothing new to maintain. Ceiling: one URL competes for every query, and the
per-tool titles the plan asks for cannot exist.

**B. Thin static landing pages — recommended.** One small hand-written English page per Tier 1
and Tier 2 tool at a descriptive path (`/goniometry/q-space`, `/cdi/bcdi-oversampling`, …),
each with its own title, `h1`, description, canonical, `WebApplication` schema, the
explanation block below, links to related tools, and a prominent link into the live card
(`/#goniometry/card-optics-bragg`). Solves the language problem and the URL problem together,
needs no build step, and leaves the SPA untouched.

Cost of B is honest: ~15 files that can drift from the tools they describe. They are only
worth building if each carries real explanation — a page that is a title and a link is a
doorway page, and search engines treat it as one. Every page gets:

```text
What this calculates
Inputs
Output
Experimental use
```

Existing URLs must not break either way.

### Priority tiers

**Tier 1** — strongest metadata, own page, internal links pointing in:
X-ray Beamline Calculator · X-ray Goniometry Calculator · BCDI Oversampling Calculator ·
X-ray Q-space Calculator · Eulerian Cradle / Chi–Phi Correction · X-Ray Beamline Toolkit

Add to Tier 1: **XRR segment stitching / reflectivity data viewer**. The plan predates the
DATA suite. It is distinctive, barely contested, and nothing else on the site is as unusual.

**Tier 2** — optimise naturally: Bragg angle · d-spacing · energy–wavelength · beam footprint ·
detector angular resolution · slit acceptance · photon flux · energy resolution.

**Tier 3** — do not chase, do not stuff into the UI: "x-ray calculator", "diffraction
calculator", "bragg law calculator", "wavelength calculator", "absorption calculator".

### Naming

Search-intent wording, not in-house shorthand: *X-ray Q-space Calculator* over *Reciprocal
Space*; *BCDI Oversampling Calculator* over *Oversampling*; *Eulerian Cradle / Chi–Phi
Correction* over *Cradle*. The visible UI can stay compact — this governs titles, headings,
descriptions and anchor text.

### INDEX as the tool directory

Grouped by search intent and usefulness rather than by the suite a card happens to live in —
INDEX is a directory, not a second copy of the navigation, so the grouping is allowed to cut
across SPECTROSCOPY and GONIOMETRY:

```text
X-RAY BASICS   Energy ↔ Wavelength · Bragg Angle · d-spacing / Miller Index ·
               Critical Angle · Transmission / Absorption
GONIOMETRY     Q-space · Energy Scaling · Beam Footprint · Detector Angular Resolution ·
               Slit Acceptance · Chi–Phi / Eulerian Cradle
CDI / BCDI     BCDI Oversampling
BEAMLINE       Photon Flux · Energy Resolution · Thermal Drift
DATA           XRR Segment Stitching · Scan File Viewer
RECORD         Beamtime Header · In-Situ Event Snippets
```

Internal links should follow the order of a real calculation, so the graph a crawler reads is
the workflow a user walks: Bragg → d-spacing → energy/wavelength → Q-space → footprint, and
Bragg → Q-space → BCDI oversampling → detector angular resolution.

### Conflicts to settle first

- The source plan lists RECORD as six tools (Experiment Log, Beam Status, Sample / Alignment,
  Calibration, Scan Record). RECORD has two cards. Either build them or leave them out —
  listing tools that do not exist in INDEX and the sitemap is worse than a short list.
- The source plan has no DATA section; it was written before that suite shipped.
- "CDI / BCDI" as an INDEX group holds one item. Fine as a heading, not worth a page of its own
  beyond the oversampling tool.

### Order of work

1. INDEX regrouping and ordering, tool naming, homepage title and description,
   per-tool headings, internal links. *No architectural commitment — safe to do first.*
2. Tier 1 entries: BCDI oversampling, Q-space, Chi–Phi, beam footprint, goniometry, XRR.
3. `sitemap.xml` (currently one URL), canonical URLs, per-tool structured data.
   **Depends on the A/B decision above.**
4. Verify by query, not by deploy date. Crawling and indexing take weeks.

### Boundaries

No blog, no generic articles, no ads, no cookie banner, no analytics, no accounts, no
newsletter, no social sections, no fake ratings or reviews or organisations, no keyword
stuffing, no marketing voice. Copy reads like a beamline scientist wrote it: "Calculate Bragg
angle from photon energy and lattice spacing", never "unlock the power of…".

The engineering constraints in [`../CLAUDE.md`](../CLAUDE.md) hold throughout — static, no
build step, no framework, no runtime network, ES5, offline. Landing pages are hand-written
HTML for the same reason everything else is.

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
