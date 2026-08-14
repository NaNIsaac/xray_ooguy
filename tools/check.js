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
if (failures.length) {
  console.error("\ncheck: " + failures.length + " problem" + (failures.length === 1 ? "" : "s") + "\n");
  failures.forEach(function (f) { console.error("  " + f + "\n"); });
  process.exit(1);
}

console.log("check: " + scripts.length + " scripts parse, no modern syntax, ko/index.html in step");
