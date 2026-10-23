"use strict";

/**
 * Runs the page's own scripts in a node vm against a stub DOM built from
 * index.html, so a test sets input values, calls a calc* function and reads
 * back what the card would have shown. Nothing here ships to the browser, so
 * it may use any syntax node supports.
 *
 * The stub knows only what the calculators touch: elements by id with their
 * markup default value, select options, and min/max. It is not a browser;
 * layout, CSS and the translation pass are out of its reach.
 */

var fs = require("fs");
var path = require("path");
var vm = require("vm");

var ROOT = path.resolve(__dirname, "..");
var SCRIPTS = ["data.js", "optics.js", "lattice.js", "beamline.js"];

function makeElement(els, id, tag) {
  var node = {
    id: id,
    tagName: tag,
    value: "",
    innerHTML: "",
    textContent: "",
    checked: false,
    disabled: false,
    style: {},
    dataset: {},
    children: [],
    options: [],
    min: "",
    max: "",
    parentNode: null,
    classList: { add: nop, remove: nop, toggle: nop, contains: function () { return false; } },
    addEventListener: nop,
    setAttribute: nop,
    removeAttribute: nop,
    getAttribute: function () { return null; },
    querySelector: function () { return null; },
    querySelectorAll: function () { return []; },
    appendChild: function (child) { node.children.push(child); return child; },
    focus: nop,
    closest: function () { return null; }
  };
  if (id) els[id] = node;
  return node;
}

function nop() {}

function parseMarkup(html, els) {
  var tagRe = /<([a-z][a-z0-9]*)\b([^>]*)>/g;
  var m;
  while ((m = tagRe.exec(html))) {
    var attrs = m[2];
    var idm = /\bid="([^"]+)"/.exec(attrs);
    if (!idm) continue;

    var node = makeElement(els, idm[1], m[1]);
    var value = /\bvalue="([^"]*)"/.exec(attrs);
    if (value) node.value = value[1];
    var min = /\bmin="([^"]*)"/.exec(attrs);
    var max = /\bmax="([^"]*)"/.exec(attrs);
    if (min) node.min = min[1];
    if (max) node.max = max[1];

    if (m[1] === "select") {
      var rest = html.slice(m.index + m[0].length);
      var body = rest.slice(0, rest.indexOf("</select>"));
      var optRe = /<option\b([^>]*)>/g;
      var o;
      while ((o = optRe.exec(body))) {
        var ov = /value="([^"]*)"/.exec(o[1]);
        node.options.push({ value: ov ? ov[1] : "", selected: /\bselected\b/.test(o[1]) });
      }
      var chosen = node.options.filter(function (x) { return x.selected; })[0] || node.options[0];
      node.value = chosen ? chosen.value : "";
    }
  }
}

/** A fresh page: the markup defaults, the scripts run once, in page order. */
function loadPage() {
  var html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
  var els = {};
  parseMarkup(html, els);

  var doc = {
    getElementById: function (id) { return els[id] || null; },
    querySelector: function () { return null; },
    querySelectorAll: function () { return []; },
    addEventListener: nop,
    createElement: function (tag) { return makeElement(els, null, tag); },
    body: makeElement(els, null, "body"),
    documentElement: makeElement(els, null, "html")
  };
  var storage = { getItem: function () { return null; }, setItem: nop };
  var win = {
    document: doc,
    addEventListener: nop,
    localStorage: storage,
    location: { hash: "" },
    navigator: {}
  };
  win.window = win;

  var ctx = vm.createContext({
    window: win,
    document: doc,
    console: console,
    localStorage: storage,
    navigator: win.navigator,
    location: win.location,
    setTimeout: nop
  });
  SCRIPTS.forEach(function (file) {
    vm.runInContext(fs.readFileSync(path.join(ROOT, "js", file), "utf8"), ctx, { filename: file });
  });

  return {
    win: win,
    els: els,
    set: function (id, value) {
      if (!els[id]) throw new Error("no element with id " + id + " in index.html");
      els[id].value = String(value);
    },
    html: function (id) {
      if (!els[id]) throw new Error("no element with id " + id + " in index.html");
      return els[id].innerHTML;
    },
    /** A page global from data.js, which declares them with var. */
    data: function (name) { return vm.runInContext(name, ctx); }
  };
}

module.exports = { loadPage: loadPage, ROOT: ROOT };
