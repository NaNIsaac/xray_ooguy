/**
 * Generates ko/index.html from index.html and the Korean half of js/i18n.js.
 *
 *   node tools/build-i18n.js          write ko/index.html
 *   node tools/build-i18n.js --check  fail if what is on disk is not what this
 *                                     would write (used by the hook and CI)
 *
 * index.html is the hand-written page and is English: it is what a visitor and
 * a crawler get at /. The Korean page is the same markup with the Korean half
 * of the translation table poured into it.
 *
 * Why generate rather than keep two files by hand: the second page is the same
 * 2,000 lines of markup with different text in it, and maintained by hand the
 * two drift the first time anyone edits a card.
 *
 * Why this works: every string a visitor reads is already behind a data-i18n
 * key, because the interface has been bilingual from the start. The generator
 * only does what i18n.js does at runtime, once, ahead of time.
 *
 * Why node and not Python: js/i18n.js is JavaScript. Running it gives the exact
 * translation table with no parser to get wrong. Nothing is installed.
 *
 * The output is verified before it is written: if it still contains English
 * where a translation was expected, or the wrong canonical, the build fails
 * rather than publishing a half-translated page.
 */

var fs = require("fs");
var path = require("path");
var vm = require("vm");

var ROOT = path.resolve(__dirname, "..");
var SRC = path.join(ROOT, "index.html");
var SITE = "https://xray.ooguy.com/";

// ---------------------------------------------------------------------------
// The translation table, straight out of i18n.js
// ---------------------------------------------------------------------------
function loadTable(lang) {
  var sandbox = {
    window: {},
    document: {
      documentElement: { getAttribute: function () { return lang; }, setAttribute: function () {} },
      getElementById: function () { return null; },
      querySelectorAll: function () { return []; },
      querySelector: function () { return null; },
      addEventListener: function () {}
    },
    localStorage: { getItem: function () { return null; }, setItem: function () {} },
    navigator: { language: lang },
    console: console,
    setTimeout: function () {}
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(ROOT, "js", "i18n.js"), "utf8"), sandbox, { filename: "i18n.js" });

  var i18n = sandbox.window.i18n;
  if (!i18n) throw new Error("i18n.js did not expose window.i18n");
  i18n.lang = lang;

  return function (key) {
    var v = i18n.t(key);
    return v === key ? null : v;      // t() echoes the key when it has no entry
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

function translateElements(html, t, missing) {
  var TAG = /<([a-zA-Z][\w-]*)\b([^>]*?)(\/?)>/g;
  var out = "";
  var cursor = 0;
  var applied = 0;
  var m;

  while ((m = TAG.exec(html))) {
    var name = m[1];
    var attrs = m[2];
    if (m[3] === "/") continue;

    var keyMatch = /\bdata-i18n(-html)?="([^"]+)"/.exec(attrs);
    if (!keyMatch) continue;

    var isHtml = !!keyMatch[1];
    var value = t(keyMatch[2]);
    if (value === null) { missing.push(keyMatch[2]); continue; }

    // This element's own closing tag, counting nested ones of the same name.
    var depth = 1;
    var NEST = new RegExp("<(/?)" + name + "\\b[^>]*?(/?)>", "g");
    NEST.lastIndex = TAG.lastIndex;
    var n, closeStart = -1, closeEnd = -1;

    while ((n = NEST.exec(html))) {
      if (n[2] === "/") continue;
      if (n[1] === "/") {
        if (--depth === 0) { closeStart = n.index; closeEnd = NEST.lastIndex; break; }
      } else {
        depth++;
      }
    }
    if (closeStart < 0) continue;             // unbalanced: leave it alone

    out += html.slice(cursor, TAG.lastIndex);
    out += isHtml ? value : escapeText(value);
    out += html.slice(closeStart, closeEnd);
    cursor = closeEnd;
    TAG.lastIndex = closeEnd;
    applied++;
  }

  return { html: out + html.slice(cursor), applied: applied };
}

// placeholder="" and title="" are written from their own keys.
function translateAttributes(html, t, missing) {
  var applied = 0;

  var out = html.replace(/<([a-zA-Z][\w-]*)\b([^>]*?)(\/?)>/g, function (whole, name, attrs, slash) {
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

      changed = existing.test(changed) ? changed.replace(existing, replacement) : changed + replacement;
      applied++;
    }

    return changed === attrs ? whole : "<" + name + changed + slash + ">";
  });

  return { html: out, applied: applied };
}

/**
 * translate(html, lang, opts)
 *
 *   lang     "ko" | "en"
 *   opts.dir subdirectory the output will live in, or "" for the site root.
 *            Assets are referenced relatively so the page still works opened
 *            straight off disk, which is how this site is developed and how it
 *            runs on a control-room machine with no server.
 */
function translate(html, lang, opts) {
  opts = opts || {};
  var dir = opts.dir || "";
  var missing = [];
  var t = loadTable(lang);

  var a = translateElements(html, t, missing);
  var b = translateAttributes(a.html, t, missing);
  html = b.html;

  // The head is the one part of the page no data-i18n attribute can reach —
  // there is no element to set the textContent of. These four strings are what
  // a search result and a shared link show, so an untranslated head means a
  // Korean page listed under an English title.
  var HEAD = [
    [/(<title>)[\s\S]*?(<\/title>)/, "meta_title", escapeText],
    [/(<meta name="description" content=")[^"]*(")/, "meta_description", escapeAttr],
    [/(<meta property="og:title" content=")[^"]*(")/, "meta_og_title", escapeAttr],
    [/(<meta property="og:description" content=")[^"]*(")/, "meta_og_description", escapeAttr]
  ];

  for (var i = 0; i < HEAD.length; i++) {
    var value = t(HEAD[i][1]);
    if (value === null) { missing.push(HEAD[i][1]); continue; }
    html = html.replace(HEAD[i][0], "$1" + HEAD[i][2](value).replace(/\$/g, "$$$$") + "$2");
    b.applied++;
  }

  html = html.replace(/<html lang="[^"]*">/, '<html lang="' + lang + '">');

  if (dir) {
    html = html.replace(/(\s(?:href|src)=")(?!https?:|\/|\.\.\/|#|data:|mailto:)/g, "$1../");
  }

  // The language toggle points at the *other* language, so it is the one link
  // that must not be rebased along with everything else — "ko/" carried into
  // /ko/ would become "../ko/", which is the page you are already on.
  html = html.replace(/(<a[^>]*\bid="lang-toggle"[^>]*\bhref=")[^"]*(")/,
    "$1" + (dir ? "../" : "ko/") + "$2");

  var self = SITE + (dir ? dir + "/" : "");

  html = html.replace(/<link rel="canonical" href="[^"]*">/,
    '<link rel="canonical" href="' + self + '">');
  html = html.replace(/<meta property="og:url" content="[^"]*">/,
    '<meta property="og:url" content="' + self + '">');

  // Structured data describes this URL, not the other language's.
  html = html.replace(/(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/,
    function (whole, open, json, close) {
      return open + json.split('"' + SITE).join('"' + self).split('"' + SITE + "#").join('"' + self + "#") + close;
    });

  return { html: html, missing: missing, applied: a.applied + b.applied };
}

// ---------------------------------------------------------------------------
// CLI: build the Korean page
// ---------------------------------------------------------------------------
var OUT_DIR = path.join(ROOT, "ko");
var OUT = path.join(OUT_DIR, "index.html");

var BANNER = "<!--\n" +
  "  GENERATED FILE — do not edit.\n" +
  "\n" +
  "  Written by tools/build-i18n.js from index.html and the Korean half of\n" +
  "  js/i18n.js. Any edit here is lost on the next build. Change index.html\n" +
  "  or the translation table, then run:\n" +
  "\n" +
  "      node tools/build-i18n.js\n" +
  "-->\n";

function pad2(n) { return (n < 10 ? "0" : "") + n; }

// The sitemap's lastmod is a claim about when these two pages last changed,
// and the only thing that changes them is this build. Kept by hand it says
// whatever it said the last time someone remembered, which is worse than
// saying nothing: a crawler that trusts a stale date has no reason to come
// back for what was just published.
function stampSitemap() {
  var file = path.join(ROOT, "sitemap.xml");
  if (!fs.existsSync(file)) return null;

  // Local date, not toISOString(): UTC is a day behind for most of the working
  // day in Seoul, and a lastmod dated yesterday for something published today
  // is the same stale claim in a smaller size.
  var now = new Date();
  var today = now.getFullYear() + "-" + pad2(now.getMonth() + 1) + "-" + pad2(now.getDate());
  var xml = fs.readFileSync(file, "utf8");
  var stamped = xml.replace(/<lastmod>[^<]*<\/lastmod>/g, "<lastmod>" + today + "</lastmod>");

  if (stamped === xml) return null;
  fs.writeFileSync(file, stamped);
  return today;
}

function build() {
  var res = translate(fs.readFileSync(SRC, "utf8"), "ko", { dir: "ko" });
  res.html = res.html.replace(/^<!DOCTYPE html>\s*/i, "<!DOCTYPE html>\n" + BANNER);
  return res;
}

function verify(res) {
  var problems = [];
  var html = res.html;

  if (res.missing.length) {
    var uniq = res.missing.filter(function (k, i) { return res.missing.indexOf(k) === i; });
    problems.push("no Korean entry for: " + uniq.join(", "));
  }

  if (!/<html lang="ko">/.test(html)) problems.push('<html lang="ko"> not set');
  if (!/<title>[^<]*[가-힣]/.test(html)) problems.push("<title> is not Korean");
  if (!/<meta name="description" content="[^"]*[가-힣]/.test(html)) problems.push("meta description is not Korean");
  if (html.indexOf('href="' + SITE + 'ko/"') < 0) problems.push("canonical not repointed to /ko/");
  if (/\s(?:href|src)="(?:style\.css|js\/)/.test(html)) problems.push("asset path not rebased to ../");

  // The page must actually be Korean. The banner, the code font stacks and the
  // formulas are Latin by nature, so this checks the strings that carry meaning.
  var bannerless = html.replace(/<!--[\s\S]*?-->/g, "");
  if (!/[\uAC00-\uD7A3]/.test(bannerless)) problems.push("no Korean text in the output at all");

  return problems;
}

if (require.main === module) {
  var res = build();
  var problems = verify(res);

  if (problems.length) {
    console.error("build-i18n: FAILED\n");
    problems.slice(0, 25).forEach(function (p) { console.error("  " + p); });
    process.exit(1);
  }

  if (process.argv.indexOf("--check") >= 0) {
    var current = fs.existsSync(OUT) ? fs.readFileSync(OUT, "utf8") : null;
    if (current === res.html) {
      console.log("build-i18n: ko/index.html is up to date (" + res.applied + " strings)");
      process.exit(0);
    }
    console.error("build-i18n: ko/index.html is STALE — run `node tools/build-i18n.js` and commit the result");
    process.exit(1);
  }

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR);
  fs.writeFileSync(OUT, res.html);
  console.log("build-i18n: wrote ko/index.html — " + res.applied + " strings translated");

  var stamped = stampSitemap();
  if (stamped) console.log("build-i18n: sitemap lastmod → " + stamped);
}

module.exports = { translate: translate };
