/**
 * Everything that must be true before a commit. One entry point, so the git
 * hook, CI and a human all check the same things:
 *
 *   node tools/check.js
 *
 *   1. every script parses as ES5-era syntax node can load
 *   2. no modern syntax that is a parse error on the CentOS 7 browsers
 *   3. en/index.html is in step with index.html and the translation table
 *
 * Exits non-zero on the first category that fails, with the fix printed.
 */

var fs = require("fs");
var path = require("path");
var cp = require("child_process");

var ROOT = path.resolve(__dirname, "..");
var failures = [];

function listScripts() {
  var out = [];
  ["js", "tools"].forEach(function (dir) {
    var full = path.join(ROOT, dir);
    if (!fs.existsSync(full)) return;
    fs.readdirSync(full).forEach(function (f) {
      if (/\.js$/.test(f)) out.push(path.join(dir, f));
    });
  });
  return out;
}

// ---------------------------------------------------------------------------
// 1. Syntax
// ---------------------------------------------------------------------------
var scripts = listScripts();
scripts.forEach(function (rel) {
  try {
    cp.execFileSync(process.execPath, ["--check", path.join(ROOT, rel)], { stdio: "pipe" });
  } catch (e) {
    failures.push(rel + " does not parse:\n" + String(e.stderr || e.message).trim());
  }
});

// ---------------------------------------------------------------------------
// 2. Syntax the target browsers cannot parse
// ---------------------------------------------------------------------------
// node parses these happily; Firefox 60 ESR and Chrome 60 do not, and a parse
// error takes the whole file with it. Only js/ ships to the browser — tools/
// runs in node and may use anything.
var MODERN = [
  { re: /(^|[^\w.$])(let|const)\s+[\w$]/, what: "let / const" },
  { re: /=>/, what: "arrow function" },
  { re: /`/, what: "template literal" },
  { re: /\?\./, what: "optional chaining" },
  { re: /\?\?/, what: "nullish coalescing" },
  { re: /(^|[^\w.$])class\s+[\w$]/, what: "class" },
  { re: /(^|[^\w.$])(async|await)\s/, what: "async / await" },
  { re: /\.includes\(/, what: ".includes()" },
  { re: /\.startsWith\(|\.endsWith\(/, what: ".startsWith() / .endsWith()" },
  { re: /Object\.assign/, what: "Object.assign" },
  { re: /Number\.isFinite|Number\.isInteger/, what: "Number.isFinite / isInteger" }
];

// A match inside a comment or a string is not code. Strip the obvious cases
// rather than pretend to be a parser: this is a tripwire, not a linter.
function stripCommentsAndStrings(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/[^\n]*/g, "$1")
    .replace(/"(?:[^"\\\n]|\\.)*"/g, '""')
    .replace(/'(?:[^'\\\n]|\\.)*'/g, "''");
}

scripts.filter(function (rel) { return rel.indexOf("js" + path.sep) === 0 || rel.indexOf("js/") === 0; })
  .forEach(function (rel) {
    var src = stripCommentsAndStrings(fs.readFileSync(path.join(ROOT, rel), "utf8"));
    var lines = src.split("\n");

    MODERN.forEach(function (rule) {
      for (var i = 0; i < lines.length; i++) {
        if (rule.re.test(lines[i])) {
          failures.push(rel + ":" + (i + 1) + " uses " + rule.what +
            " — a parse error on Firefox 60 ESR / Chrome 60\n    " + lines[i].trim().slice(0, 90));
          break;                       // one report per rule per file is enough
        }
      }
    });
  });

// ---------------------------------------------------------------------------
// 3. The generated English page
// ---------------------------------------------------------------------------
try {
  cp.execFileSync(process.execPath, [path.join(ROOT, "tools", "build-i18n.js"), "--check"], { stdio: "pipe" });
} catch (e) {
  var msg = String(e.stdout || "") + String(e.stderr || "");
  failures.push("ko/index.html is out of step:\n    " + msg.trim().split("\n").join("\n    ") +
    "\n    fix: node tools/build-i18n.js");
}

// ---------------------------------------------------------------------------
// 4. Every <label> has a control for linkLabels to name
// ---------------------------------------------------------------------------
// linkLabels() in app.js pairs each label with the first control that follows
// it and writes the for="". That is positional, so it holds only while the
// markup keeps the shape — label, then its input, before the next label. A
// label with nothing to point at is an unnamed field for a screen reader, and
// it is not the sort of thing anyone notices by looking at the page.
var page = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
var LABEL = /<label\b[^>]*>/g;
var hit;

while ((hit = LABEL.exec(page))) {
  var rest = page.slice(LABEL.lastIndex);
  var nextLabel = rest.search(/<label\b/);
  var scope = nextLabel < 0 ? rest : rest.slice(0, nextLabel);

  if (!/<(?:input|select|textarea)\b[^>]*\bid="/.test(scope)) {
    failures.push("index.html:" + page.slice(0, hit.index).split("\n").length +
      " <label> has no control with an id before the next label, so linkLabels\n" +
      "    cannot name it — give the control an id, or use <div class=\"form-label\">\n" +
      "    if it heads a group of buttons rather than a field");
  }
}

// ---------------------------------------------------------------------------
// 5. The small-screen drawer is wired end to end
// ---------------------------------------------------------------------------
// The drawer is the only way to reach search below 900px, and it is spread
// across three files that agree only by name: the button and backdrop in the
// markup, the drawer-open rules in the stylesheet, the handlers in nav.js.
// Any one of them renamed or dropped leaves a phone with no search and no
// error — the button is simply inert.
var css = fs.readFileSync(path.join(ROOT, "style.css"), "utf8");
var nav = fs.readFileSync(path.join(ROOT, "js", "nav.js"), "utf8");

[
  [page, /id="nav-drawer-toggle"/, "index.html has no #nav-drawer-toggle button"],
  [page, /id="nav-backdrop"/, "index.html has no #nav-backdrop"],
  [css, /body\.drawer-open #sidebar/, "style.css never opens the sidebar for body.drawer-open"],
  [css, /body\.drawer-open #nav-backdrop/, "style.css never shows the backdrop"],
  [nav, /window\.toggleNavDrawer\s*=/, "nav.js does not expose toggleNavDrawer, so the button's onclick is dead"],
  [nav, /window\.closeNavDrawer\s*=/, "nav.js does not expose closeNavDrawer, so the backdrop's onclick is dead"]
].forEach(function (rule) {
  if (!rule[1].test(rule[0])) failures.push(rule[2]);
});

// ---------------------------------------------------------------------------
// 6. The gauge draws inside its own track
// ---------------------------------------------------------------------------
// The gauge turns two numbers into a bar against a tick, and the arithmetic
// that places them has no visible failure mode: a fill wider than the track,
// a tick outside it or a NaN in an attribute all render as a bar that simply
// looks wrong, on a page nobody checks with a ruler. miniplot.js is run here
// against a DOM stub thin enough to fit in this file, and the SVG it produces
// is measured.
var vm = require("vm");

function renderGauge(spec) {
  var box = { id: "", className: "", innerHTML: "" };
  var body = { appendChild: function () {}, insertBefore: function () {} };
  var card = { querySelector: function () { return body; } };

  var sandbox = {
    window: {},
    console: { warn: function () {} },
    document: {
      readyState: "complete",
      getElementById: function (id) {
        if (/-plot$/.test(id)) return box;
        if (/^card-/.test(id)) return card;
        return null;
      },
      createElement: function () { return box; },
      querySelectorAll: function () { return []; },
      addEventListener: function () {}
    }
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(ROOT, "js", "miniplot.js"), "utf8"), sandbox, { filename: "miniplot.js" });

  sandbox.window.renderGauge("card-test", "gauge_scan", spec);
  return box.innerHTML;
}

[
  { name: "under the limit", spec: { value: 30, limit: 100, pass: true } },
  { name: "at the limit", spec: { value: 100, limit: 100, pass: true } },
  { name: "way over", spec: { value: 4000, limit: 100, pass: false } },
  { name: "a rounding error over", spec: { value: 100.0001, limit: 100, pass: false } },
  { name: "zero", spec: { value: 0, limit: 100, pass: true } },
  { name: "good side above, failing", spec: { value: 0.4, limit: 1, pass: false, goodBelow: false } },
  { name: "good side above, passing", spec: { value: 6, limit: 1, pass: true, goodBelow: false } }
].forEach(function (c) {
  var svg = renderGauge(c.spec);
  if (!svg || svg.indexOf("<svg") < 0) { failures.push("gauge (" + c.name + ") drew nothing"); return; }
  if (/NaN|Infinity|undefined/.test(svg)) { failures.push("gauge (" + c.name + ") emitted NaN/Infinity/undefined"); return; }

  // Track is x=8 width=304, so nothing the gauge draws may leave 8..312.
  var widths = svg.match(/width="([\d.]+)"/g) || [];
  for (var w = 0; w < widths.length; w++) {
    var val = parseFloat(widths[w].slice(7));
    if (val > 304.001) failures.push("gauge (" + c.name + ") drew a " + val + "px bar in a 304px track");
  }
  var tick = /d="M([\d.]+),/.exec(svg);
  if (tick && (parseFloat(tick[1]) < 8 || parseFloat(tick[1]) > 312)) {
    failures.push("gauge (" + c.name + ") put the limit tick at x=" + tick[1] + ", outside the track");
  }

  // The shaded side is the side the card wants to be on, whatever the verdict.
  // Shading it by the verdict instead is how it read backwards for an
  // over-long scan: the good side does not move when you fail to reach it.
  var band = /class="gauge-band" x="([\d.]+)"[^>]*width="([\d.]+)"/.exec(svg);
  if (band && tick) {
    var bandStart = parseFloat(band[1]), bandEnd = bandStart + parseFloat(band[2]);
    var at = parseFloat(tick[1]);
    var below = c.spec.goodBelow !== false;
    if (Math.abs((below ? bandEnd : bandStart) - at) > 0.5) {
      failures.push("gauge (" + c.name + ") shaded " + bandStart + ".." + bandEnd +
        " but the tick is at " + at + " and the good side is " + (below ? "below" : "above") + " it");
    }
  }
});

// An unusable comparison draws nothing rather than a bar of a made-up length.
[null, { value: NaN, limit: 10 }, { value: 5, limit: 0 }].forEach(function (spec, i) {
  if (renderGauge(spec)) failures.push("gauge drew something for unusable input #" + (i + 1));
});

// ---------------------------------------------------------------------------
if (failures.length) {
  console.error("\ncheck: " + failures.length + " problem" + (failures.length === 1 ? "" : "s") + "\n");
  failures.forEach(function (f) { console.error("  " + f + "\n"); });
  process.exit(1);
}

console.log("check: " + scripts.length + " scripts parse, no modern syntax, ko/index.html in step");
