/**
 * Generates en/index.html from index.html and the English half of js/i18n.js.
 *
 *   node tools/build-en.js          write en/index.html
 *   node tools/build-en.js --check  fail if what is on disk is not what this
 *                                   would write (used by CI)
 *
 * Why generate rather than keep two files by hand: the English page is the same
 * 2,000 lines of markup with different text in it. Maintained by hand the two
 * drift the first time anyone edits a card, which is exactly how the docs and
 * the metadata went stale twice before.
 *
 * Why this can work at all: every string a visitor reads is already behind a
 * data-i18n key, because the interface has been bilingual from the start. The
 * generator is only doing what i18n.js does at runtime, once, ahead of time.
 *
 * Why node and not Python: js/i18n.js is JavaScript. Running it gives the exact
 * translation table with no parser to get wrong. Nothing is installed — this
 * uses only what ships with node.
 *
 * The output is verified before it is written: if a single Hangul character
 * survives outside the short whitelist below, the build fails rather than
 * publishing a half-translated page.
 */

var fs = require("fs");
var path = require("path");
var vm = require("vm");

var ROOT = path.resolve(__dirname, "..");
var SRC = path.join(ROOT, "index.html");
var OUT_DIR = path.join(ROOT, "en");
var OUT = path.join(OUT_DIR, "index.html");

var SITE = "https://xray.ooguy.com/";

// Korean that is *meant* to survive into the English page. Each entry is
// stripped before the check, so a line carrying one of these plus some other
// untranslated Korean still fails.
var ALLOWED_HANGUL = [
  "용이삭",           // the author's name, as he writes it
  "X선 빔라인 툴킷",  // schema.org alternateName — the app's Korean name is a fact about it
  "한국어",           // the language button names itself, in every language
  "영어"              // ditto, in the contents entry listing both languages
];

// ---------------------------------------------------------------------------
// The English translation table, straight out of i18n.js
// ---------------------------------------------------------------------------
function loadTranslations() {
  var sandbox = {
    window: {},
    document: {
      documentElement: { getAttribute: function () { return "en"; }, setAttribute: function () {} },
      getElementById: function () { return null; },
      querySelectorAll: function () { return []; },
      querySelector: function () { return null; },
      addEventListener: function () {}
    },
    localStorage: { getItem: function () { return null; }, setItem: function () {} },
    navigator: { language: "en" },
    console: console,
    setTimeout: function () {}
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(ROOT, "js", "i18n.js"), "utf8"), sandbox, { filename: "i18n.js" });

  var i18n = sandbox.window.i18n;
  if (!i18n) throw new Error("i18n.js did not expose window.i18n");

  // t() answers in whatever language is active, so activate English and ask.
  i18n.lang = "en";
  return function (key) {
    var v = i18n.t(key);
    return v === key ? null : v;     // t() echoes the key when it has no entry
  };
}

// ---------------------------------------------------------------------------
// Markup rewriting
// ---------------------------------------------------------------------------
function escapeAttr(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// data-i18n sets textContent at runtime, so the element holds text and the
// escaping has to match: & and < become entities, quotes do not.
function escapeText(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

var missing = [];
var applied = 0;

function translateElements(html, t) {
  var TAG = /<([a-zA-Z][\w-]*)\b([^>]*?)(\/?)>/g;
  var out = "";
  var cursor = 0;
  var m;

  while ((m = TAG.exec(html))) {
    var whole = m[0];
    var name = m[1];
    var attrs = m[2];
    var selfClosed = m[3] === "/";

    var keyMatch = /\bdata-i18n(-html)?="([^"]+)"/.exec(attrs);
    if (!keyMatch || selfClosed) continue;

    var isHtml = !!keyMatch[1];
    var key = keyMatch[2];
    var value = t(key);
    if (value === null) { missing.push(key); continue; }

    // Find this element's own closing tag, counting nested ones of the same name.
    var scan = TAG.lastIndex;
    var depth = 1;
    var NEST = new RegExp("<(/?)" + name + "\\b[^>]*?(/?)>", "g");
    NEST.lastIndex = scan;
    var n, closeStart = -1, closeEnd = -1;

    while ((n = NEST.exec(html))) {
      if (n[2] === "/") continue;                  // self-closing, no depth change
      if (n[1] === "/") {
        depth--;
        if (depth === 0) { closeStart = n.index; closeEnd = NEST.lastIndex; break; }
      } else {
        depth++;
      }
    }
    if (closeStart < 0) continue;                  // unbalanced: leave it alone

    out += html.slice(cursor, TAG.lastIndex);
    out += isHtml ? value : escapeText(value);
    out += html.slice(closeStart, closeEnd);
    cursor = closeEnd;
    TAG.lastIndex = closeEnd;
    applied++;
  }

  return out + html.slice(cursor);
}

// placeholder="" and title="" are written from their own keys.
function translateAttributes(html, t) {
  return html.replace(/<([a-zA-Z][\w-]*)\b([^>]*?)(\/?)>/g, function (whole, name, attrs, slash) {
    var pairs = [["data-i18n-placeholder", "placeholder"], ["data-i18n-title", "title"]];
    var changed = attrs;

    for (var i = 0; i < pairs.length; i++) {
      var km = new RegExp("\\b" + pairs[i][0] + '="([^"]+)"').exec(changed);
      if (!km) continue;
      var value = t(km[1]);
      if (value === null) { missing.push(km[1]); continue; }

      var target = pairs[i][1];
      var existing = new RegExp("\\s" + target + '="[^"]*"');
      var replacement = " " + target + '="' + escapeAttr(value) + '"';

      changed = existing.test(changed)
        ? changed.replace(existing, replacement)
        : changed + replacement;
      applied++;
    }

    return changed === attrs ? whole : "<" + name + changed + slash + ">";
  });
}

// ---------------------------------------------------------------------------
// Head: the parts that are not driven by data-i18n
// ---------------------------------------------------------------------------
function rewriteHead(html) {
  // Language of the document itself.
  html = html.replace(/<html lang="ko">/, '<html lang="en">');

  // The page now lives one directory down.
  html = html.replace(/(\s(?:href|src)=")(?!https?:|\/|\.\.\/|#|data:|mailto:)/g, "$1../");

  // Its own canonical; the hreflang set stays identical on both versions.
  html = html.replace(
    /<link rel="canonical" href="https:\/\/xray\.ooguy\.com\/">/,
    '<link rel="canonical" href="' + SITE + 'en/">'
  );
  html = html.replace(
    /<meta property="og:url" content="https:\/\/xray\.ooguy\.com\/">/,
    '<meta property="og:url" content="' + SITE + 'en/">'
  );

  // Structured data describes this URL, not the Korean one.
  html = html.replace(/(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/,
    function (whole, open, json, close) {
      return open + json.split(SITE).join(SITE + "en/") + close;
    });

  // Korean search terms belong on the Korean page.
  html = html.replace(/(<meta name="keywords" content=")([^"]*)(">)/, function (whole, a, content, c) {
    var english = content.split(",")
      .map(function (s) { return s.replace(/^\s+|\s+$/g, ""); })
      .filter(function (s) { return s && !/[\uAC00-\uD7A3]/.test(s); })
      .join(", ");
    return a + english + c;
  });

  // The no-JavaScript notice.
  html = html.replace(
    /\[안내\][^<]*/,
    "Enable JavaScript to use these calculators. Everything is computed inside your browser; nothing is uploaded."
  );

  return html;
}

var BANNER = "<!--\n" +
  "  GENERATED FILE — do not edit.\n" +
  "\n" +
  "  Written by tools/build-en.js from index.html and the English half of\n" +
  "  js/i18n.js. Any edit here is lost on the next build. Change index.html\n" +
  "  or the translation table, then run:\n" +
  "\n" +
  "      node tools/build-en.js\n" +
  "-->\n";

function build() {
  var t = loadTranslations();
  var html = fs.readFileSync(SRC, "utf8");

  html = translateElements(html, t);
  html = translateAttributes(html, t);
  html = rewriteHead(html);
  html = html.replace(/^<!DOCTYPE html>\s*/i, "<!DOCTYPE html>\n" + BANNER);

  return html;
}

function verify(html) {
  var problems = [];

  if (missing.length) {
    var uniq = missing.filter(function (k, i) { return missing.indexOf(k) === i; });
    problems.push("no English entry for: " + uniq.join(", "));
  }

  // The real check: nothing Korean may survive.
  var stripped = html;
  ALLOWED_HANGUL.forEach(function (word) { stripped = stripped.split(word).join(""); });

  var lines = stripped.split("\n");
  for (var i = 0; i < lines.length; i++) {
    if (/[\uAC00-\uD7A3]/.test(lines[i])) {
      problems.push("Korean left on line " + (i + 1) + ": " + lines[i].replace(/\s+/g, " ").trim().slice(0, 100));
    }
  }

  if (!/<html lang="en">/.test(html)) problems.push('<html lang="en"> not set');
  if (html.indexOf('href="' + SITE + 'en/"') < 0) problems.push("canonical not repointed");
  if (/\s(?:href|src)="(?:style\.css|js\/)/.test(html)) problems.push("asset path not rebased to ../");

  return problems;
}

var out = build();
var problems = verify(out);

if (problems.length) {
  console.error("build-en: FAILED\n");
  problems.slice(0, 25).forEach(function (p) { console.error("  " + p); });
  if (problems.length > 25) console.error("  ... and " + (problems.length - 25) + " more");
  process.exit(1);
}

if (process.argv.indexOf("--check") >= 0) {
  var current = fs.existsSync(OUT) ? fs.readFileSync(OUT, "utf8") : null;
  if (current === out) {
    console.log("build-en: en/index.html is up to date (" + applied + " strings)");
    process.exit(0);
  }
  console.error("build-en: en/index.html is STALE — run `node tools/build-en.js` and commit the result");
  process.exit(1);
}

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR);
fs.writeFileSync(OUT, out);
console.log("build-en: wrote en/index.html — " + applied + " strings translated");
