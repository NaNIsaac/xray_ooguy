# CLAUDE.md

Constraints for anyone — human or agent — editing this repo. These are not style preferences.
Breaking them breaks the site on the machines it was built for: old beamline control-room PCs.

## What this is

A static single-page X-ray calculator toolkit. No build step, no bundler, no dependencies,
no server, no package.json. `index.html` loads `style.css` and the `js/*.js` files directly,
in order, as classic scripts. Deployed by pushing `main` to GitHub Pages.

Editing means: change the file, reload the browser. That is the whole loop.

## Hard constraints

### 1. ES5 JavaScript only

Target is Firefox 60 ESR / Chrome 60–70 on CentOS 7. Modern syntax is a **parse error** there,
which kills the entire file, not just the feature.

Banned: `let`, `const`, arrow functions, template literals, `class`, `async`/`await`,
optional chaining `?.`, nullish coalescing `??`, destructuring, default/rest params, spread.

Use: `var`, `function`, IIFE modules (`(function () { "use strict"; ... })();`),
`if (obj && obj.prop)` instead of `obj?.prop`.

The current `js/` tree is clean ES5 — keep it that way. Verify with the one command that
checks everything:

```powershell
node .\tools\check.js
```

It parses every script, greps `js/` for syntax the target browsers cannot parse, and confirms
the generated Korean page is current. `node --check` alone would not catch the second one:
node parses `let` and arrow functions happily, and Firefox 60 does not.

Also avoid the modern builtins the tripwire cannot see — `String.prototype.padStart`,
`Promise`, `fetch`, `URLSearchParams` — unless you ship a fallback.

Run it before committing, or install the hook once per clone so it runs itself:

```powershell
git config core.hooksPath .githooks
```

### 2. No network at runtime

Zero `fetch` / `XMLHttpRequest`. Every physical constant, d-spacing table and attenuation
dataset lives as a JS object literal in `js/data.js`. No CDNs, no web fonts, no analytics.
The site must work with the network cable pulled.

### 3. No CSS Grid, no flex `gap`

Layout is Flexbox with percentage columns (`.col-12`, `.col-8`, `.col-6`, `.col-4`).
Gutters are negative margin on the row plus padding on the columns — `gap` is unsupported
in the target browsers and silently collapses spacing.

Two known deviations exist and should be migrated, not copied:
`.rec-memo-grid` (`style.css:2528`) and `.tab-pill` (`style.css:807`).

### 4. Storage is localStorage, prefixed

All persisted state uses the `bl_toolkit_` prefix (see `js/app.js:20`, `js/i18n.js:718`).
No accounts, no upload, no IndexedDB. Anything persisted must be covered by the
Settings backup/restore JSON.

### 5. Bilingual or it does not ship

Every user-visible string needs a `data-i18n` key (or `data-i18n-html` for markup),
with entries added to **both** `ko` and `en` in `js/i18n.js`. Untranslated keys fall back
to Korean, then render the raw key — both look like bugs.

Strings built in JS (result text, status labels) must go through `I18n.t(key)`, because
`setLang` re-runs the calculators to re-render them.

This is now load-bearing beyond the interface: `ko/index.html` is **generated** from the
markup and the Korean table, so a string that is not behind a key cannot be translated and
stays English on the Korean page. The build fails on a key with no entry.

### 6. `ko/index.html` is generated — never edit it

Two URLs, one per language:

| URL | File | Language |
|:---|:---|:---|
| `/` | `index.html` | English, hand-written |
| `/ko/` | `ko/index.html` | Korean, **generated** |

English is the default because it is the site root. Each page declares its language on
`<html lang>`, and `i18n.js` reads that rather than storage or `navigator` — the URL is what
decides, which is what makes the `hreflang` pair honest and lets both languages be indexed.

The header globe switches between them. It is a real `<a href>`, so it works without
JavaScript; the hops are relative (`ko/` and `../`) so they also work opened straight off
disk. `tools/build-i18n.js` rewrites that one link explicitly — it is the only link that must
not be rebased with the rest, since `ko/` carried into `/ko/` would point at itself.

After changing anything in `index.html` or the translation table:

```powershell
node tools/build-i18n.js
```

and commit the result. CI runs `node tools/build-i18n.js --check`, which fails if the Korean
page is stale. It verifies, never writes — nothing commits on your behalf.

Inline text in `index.html` is only a pre-JavaScript fallback; `i18n.js` overwrites it on
load and the generator ignores it. Keep it English and roughly accurate, but the `en` entry
in `js/i18n.js` is the real string.

### 7. Print output is a feature

`@media print` hides the sidebar, header, tab strip, toasts and buttons, and forces black
on white. New cards need `break-inside: avoid; page-break-inside: avoid;` so formulas and
tables do not split across A4 pages.

## Design system

Academic print aesthetic. Themed via `[data-theme=...]` on `<html>`:
`light`/`paper`, `parchment`, `crt`, `dark`/`tokyo`, `datasheet`, `blueprint`, `console`.

- **Never hardcode a color.** Use the CSS custom properties (`--bg-paper`, `--ink-primary`,
  `--ink-muted`, `--accent-ink`, …). A literal hex breaks every theme but one.
- **One accent** — `--accent-ink`, reserved for links, the active tab and result values.
- **No emoji anywhere in the UI.** Use section marks (`§ 1.1`), symbols, or text labels.
- **No `border-radius`, no `box-shadow`, no gradients.** Square edges, hairline rules
  (0.75–1.5px), LaTeX booktabs-style separators instead of cards-with-shadows.
- **Superscripts use `<sup>`**, never Unicode `⁻¹` / `²` — the target fonts render them
  inconsistently. Formulas are italic: `<i class="formula">nλ = 2d sin θ</i>`.
- `--font-serif` is a **sans-serif** system stack despite the name; `--font-mono` is for
  every number, input, result and timestamp.
- Buttons invert on hover (ink background, paper text).

## Navigation

Dual navigation, kept in sync by `navigateTo(route)` in `js/app.js`:
the sidebar (`.nav-item`) and the independent top tab strip (`.tab-pill`).

The tab strip is its own sticky layer **below** the 48px header — not inside it. It was
inside the header once, and narrow viewports clipped it away entirely under
`overflow: hidden`. Keep `#top-tab-strip` separate, keep `.tab-strip-scroll` on
`overflow-x: auto; white-space: nowrap`, keep `.tab-pill { flex-shrink: 0 }`, and keep
`#content-area` on `overflow-x: hidden`.

`js/nav.js` builds the sidebar tree and its search index by **reading the in-page table of
contents markup** — the section list is not duplicated in JS. A new calculator added to the
contents block appears in the sidebar automatically. `js/dashboard.js` reads the same
markup for the same reason: it holds card ids and nothing else, and takes every label,
href and formula from the contents at render time.

Four ways in, for four kinds of arrival, and none of them a second copy of the tool list:

| Route | What it answers |
|:---|:---|
| `#dashboard` | "I don't know what this is called" — 30 tools under four jobs, three shown per group |
| `#index` | "show me everything" — the full contents by suite, with formulas |
| sidebar | "I know the discipline" — the suites and their sections |
| search | "I know the name" |

`dashboard` is the landing route: an address with no fragment, and any unknown one, ends
up there. It deliberately carries no `seoTitle`/`seoDesc` — `applyRouteMeta` restores the
head the page was authored with, which is already in the page's own language. Every other
route's strings are English literals, so a route that overwrites the head renames the
Korean page in English.

Routes, in the order a beamtime runs: `radiometry`, `optics`, `geometry`, `coherence`,
`data`, `record`, then `settings`, `about`, `dashboard`, `index` (`Alt`+`1`–`9`, `Alt`+`0`).
One route per view section, no aliases. Adding a route means touching four places: `routes`
and the `Alt` keymap in `app.js`, the sidebar item and tab pill in `index.html`, the roman
numerals on every later suite, and the shortcut table in Settings.

Retiring or renaming a route means adding it to `LEGACY_ROUTES` in `app.js`, mapping each
card to the suite it moved to. A `#route/card` fragment is the only address a card has
ever had, so a rename without that entry breaks every saved and published link.
`handleHashChange` rewrites the address bar on arrival.

**Nothing positional in a key or a label.** Section numbers come from the card's position
in its view (`renumberCards` in `app.js`, drawn by `.card-title[data-num]::before`);
contents and shortcut keys are named after their route and destination, not their
position; the breadcrumb reads `nav_<route>`. This is not tidiness — the previous scheme
had four hand-kept copies of the § number, and twelve of the thirteen labels stored
alongside past calculations had drifted out of step with the interface.

## Physics

- Do not "clean up" a formula or a constant without a source. `js/data.js` follows CODATA;
  `hc = 12398.41984 eV·Å`.
- `js/lattice.js` handles all seven crystal systems through one metric-tensor path
  (`1/d² = [hkl]·G*·[hkl]ᵀ`). Do not add per-system special cases.
- Every calculator states its model assumptions and validity domain via `js/validity.js`.
  A new calculator needs a validity entry — an undisclosed approximation is a wrong answer
  waiting to happen.
- `js/miniplot.js` draws inline SVG from the same expression the card evaluates. If you
  change a formula, the plot must follow, or it will quietly disagree with the number.
- `js/dataview.js` is the exception to all of the above: it plots measured numbers rather
  than a model, so it has no validity entry. It keeps parsed columns exactly as read and
  applies scale, crop and normalisation on the way to the plot — never in place. Its
  namespace is `dv*`, never `DataView`, which is the typed-array builtin.

## Adding a calculator

1. Markup in the relevant `<section id="view-...">` of `index.html`. **Do not write a
   `§ N.` into the title** — the number is derived from the card's position in the view.
2. Add the entry to that suite's table of contents block, in the same order as the cards
   (sidebar + search come free). The literal `§ N.` there is a pre-JavaScript fallback and
   is overwritten on load; contents order and card order disagreeing is a visible bug.
3. Compute in `js/optics.js` or `js/beamline.js` — engines are keyed off DOM ids. Expose
   the function on `window` and call it from `initOpticsView` / `initBeamlineView`.
4. `ko` + `en` keys in `js/i18n.js` for every string.
5. Validity entry in `js/validity.js`. Attenuation goes through `muOf` in `beamline.js`,
   so a new card cannot disagree with the transmittance card about how much a material
   absorbs.
6. Call `recordCalculation(cardId)` — never a printed label. It feeds the dashboard's
   recently-used line, which resolves the number and the wording at render time. The
   engines still pass inputs and result after the id; those arguments are ignored, left
   in place so removing them was not an edit to forty-eight call sites.
7. Put the card id in a group in `GROUPS` (`js/dashboard.js`) and add its
   `dash_act_<card_id>` action label — the verb, "Find a Bragg angle", not the name.
   `tools/check.js` fails if the contents and the dashboard disagree about which tools
   exist, in either direction.
8. Publish it: a `ListItem` in the `ItemList` structured data, and keep `numberOfItems`,
   the `MODULES:` value in the masthead and the actual card count agreeing.
9. Check: both languages, several themes, print preview, narrow viewport, `node tools/check.js`.
