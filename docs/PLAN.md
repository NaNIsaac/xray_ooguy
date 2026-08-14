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

## Discoverability

> Make the tools findable through search engines without making the site feel SEO-driven.
> It stays a beamline tool, not a marketing page.

### What the site actually is

One `index.html`. Twenty-one calculators behind `#hash` fragments. No build step, no server,
no framework. The interface renders **Korean by default** — `i18n.js` swaps language on the
client and Korean is what a crawler sees.

That shape decides the whole strategy, and it splits into two very unequal halves.

**Korean is the cheap half.** The rendered body is already Korean, the tool names are already
the words a Korean researcher would type (브래그 각도, 격자면 간격, 산란 벡터, 빔 풋프린트),
and almost nobody competes for them. This side needs no work beyond not breaking it.

**English is the expensive half.** Every English phrase worth ranking for lives in `<head>`,
the `noscript` block and the `sr-only` heading — never in the rendered body. And a fragment
cannot hold its own `<title>`, canonical or schema, so per-tool metadata has nowhere to
attach. English intent is structurally handicapped here, and no amount of metadata polish
changes that on its own.

### Done

Phase one, all of it inside the existing single page:

- **Per-tool structured data.** An `ItemList` of 21 `SoftwareApplication` entries in the
  `@graph`, each with its English name, what it computes, and the fragment that opens it.
  This is where each tool states its English identity — the Korean UI does not have to carry
  English labels to be understood by a crawler.
- **Metadata brought back in line with the site.** Description, keywords, Open Graph, the
  `featureList`, the `noscript` inventory and the `sr-only` heading had all drifted: no
  seven-crystal-system d-spacing, no DATA suite, no XRR stitching. Korean search terms added
  alongside the English ones.
- **An honest sitemap.** Still one URL, with a comment saying why.
- **One URL per language, and the English one is generated.** `/` is Korean, `/en/` is
  English, each declaring its language on `<html lang>`, cross-linked with `hreflang`, each
  with its own canonical. `i18n.js` reads the declared language instead of storage or
  `navigator`, so the URL decides — which is what makes the pair honest to a crawler.

  This replaced a browser-language default that was only ever a trade: whichever language the
  crawler happened to get was the only one indexed. Both are indexed now.

  The objection to two URLs was duplication — a second copy of 2,000 lines of markup drifting
  from the first. `tools/build-en.js` removes it by generating the English page from the
  Korean markup and the English half of the translation table. It works because every visible
  string is already behind a `data-i18n` key, and it stays honest because it refuses to write
  a page with Korean left in it. CI runs it in `--check` mode and fails on a stale page; it
  verifies, it never commits.

### Deliberately not done

- **Fragments are not listed in `sitemap.xml`.** They are not URLs. Claiming them would be a
  lie to the crawler with no upside.
- **No English labels were added back to the Korean UI.** They were removed on purpose —
  a Korean reader gained nothing from "전반사 임계각 (Total External Reflection)". English
  belongs in the metadata layer, not in the interface. Do not undo that for SEO.
- **No hidden keyword text.** One `sr-only` heading naming the page is fair; twenty hidden
  English tool names on cards is cloaking, and it is the kind of thing that gets a small site
  penalised rather than ranked.

### Still to do on the bilingual pair

The pages exist and each is authoritative for its language. What has not caught up is the
metadata *above* the body:

- **`index.html` still has an English `<title>`, description and Open Graph**, while its body
  is Korean. It is now the Korean page and should say so in Korean — that is the half of the
  argument that made two URLs worth building, and it is still unclaimed.
- **`routes` in `js/app.js` carries one English `seoTitle` and `seoDesc` per route** and
  applies it on every navigation, so it overwrites whatever the page started with. It needs a
  Korean side, chosen by the active language, or the Korean page reverts to English titles the
  moment anyone clicks a tab.

Neither is hard; both were left out of the structural change on purpose, so that what shipped
was one coherent thing.

### The open decision — static landing pages

The only remaining way to give English intent a real home is a page per tool:
`/goniometry/q-space`, `/cdi/bcdi-oversampling`, and so on. Each would carry its own title,
`h1`, description, canonical, schema, a short explanation, and a link into the live card.

Worth doing for the handful of queries this site can actually win — the distinctive,
uncontested ones:

```text
bcdi oversampling calculator
xrr segment stitching / xrr data stitching
eulerian cradle chi-phi correction
x-ray beam footprint calculator
x-ray q-space calculator
d-spacing calculator triclinic / monoclinic
```

Not worth doing for `bragg angle calculator`, `wavelength calculator`, `absorption
calculator` — dozens of established pages own those, and a thin page competing for them is
wasted maintenance.

Cost, stated plainly: six or so hand-written files that can drift from the tools they
describe, and each one has to carry real explanation — what it calculates, inputs, output,
experimental use. A page that is a heading and a link is a doorway page and gets treated
as one.

**Do not start this on theory.** Verify the site is indexed and see which queries already
surface it first. If Search Console shows impressions for the niche English phrases against
the single URL, the landing pages have something to build on. If the site is not indexed at
all, that is the problem to fix instead.

### Boundaries

No blog, no generic articles, no ads, no cookie banner, no analytics, no accounts, no
newsletter, no social sections, no fake ratings or reviews or organisations, no keyword
stuffing, no marketing voice. Copy reads like a beamline scientist wrote it: "Calculate Bragg
angle from photon energy and lattice spacing", never "unlock the power of…".

The engineering constraints in [`../CLAUDE.md`](../CLAUDE.md) hold throughout — static, no
build step, no framework, no runtime network, ES5, offline. Any landing pages are hand-written
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
