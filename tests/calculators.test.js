"use strict";

/**
 * Regression checks for the calculators, run against the page's own scripts:
 *
 *   node --test tests/
 *
 * Every expected value here is derived in the test from a formula that does
 * not share code with js/, or is a published constant, so a bug in js/ cannot
 * make its own check pass.
 */

var test = require("node:test");
var assert = require("node:assert/strict");
var fs = require("fs");
var path = require("path");
var loadPage = require("./dom.js").loadPage;
var ROOT = require("./dom.js").ROOT;

var HC_EV_A = 12398.41984;
var DEG = Math.PI / 180;

function number(text) {
  // The page prints a true minus sign in some places and a hyphen in others.
  return parseFloat(String(text).replace(/−/g, "-"));
}

function close(actual, expected, relTol, what) {
  var err = Math.abs(actual - expected) / Math.abs(expected);
  assert.ok(err <= relTol, what + ": got " + actual + ", expected " + expected + " (rel err " + err.toExponential(2) + ")");
}

function markup() {
  return fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
}

// --- lattice: single reflection and reflection list --------------------------

function setCell(page, system, cell, centering, energy_keV) {
  var full = { a: 1, b: 1, c: 1, alpha: 90, beta: 90, gamma: 90 };
  Object.keys(cell).forEach(function (k) { full[k] = cell[k]; });
  page.set("lat-system", system);
  Object.keys(full).forEach(function (k) { page.set("lat-" + k, full[k]); });
  page.set("lat-centering", centering);
  page.set("lat-energy", energy_keV);
}

function singleD(page, hkl) {
  page.set("lat-h", hkl[0]);
  page.set("lat-k", hkl[1]);
  page.set("lat-l", hkl[2]);
  page.win.calcLattice();
  return number(page.html("lat-res-d"));
}

// 1/d^2 for the general (triclinic) cell, written out per component.
function dGeneral(c, h, k, l) {
  var ca = Math.cos(c.alpha * DEG), cb = Math.cos(c.beta * DEG), cg = Math.cos(c.gamma * DEG);
  var sa = Math.sin(c.alpha * DEG), sb = Math.sin(c.beta * DEG), sg = Math.sin(c.gamma * DEG);
  var v2 = 1 - ca * ca - cb * cb - cg * cg + 2 * ca * cb * cg;
  var s = (h * h * sa * sa / (c.a * c.a) + k * k * sb * sb / (c.b * c.b) + l * l * sg * sg / (c.c * c.c) +
    2 * k * l * (cb * cg - ca) / (c.b * c.c) + 2 * l * h * (cg * ca - cb) / (c.c * c.a) +
    2 * h * k * (ca * cb - cg) / (c.a * c.b)) / v2;
  return 1 / Math.sqrt(s);
}

// Rows of the reflection list as [label, d text].
function listedRows(page) {
  var rows = [];
  var re = /<tr><td class='mono'>([^<]*)<\/td><td class='mono dt-val'>([^<]*)<\/td>/g;
  var m;
  var body = page.html("lat-refl-body");
  while ((m = re.exec(body))) rows.push([m[1], m[2]]);
  return rows;
}

// The distinct spacings of a cell, largest first, as the list prints them.
function expectedSpacings(cell, allowed, range, count) {
  var seen = {};
  var out = [];
  for (var h = -range; h <= range; h++) {
    for (var k = -range; k <= range; k++) {
      for (var l = -range; l <= range; l++) {
        if (h === 0 && k === 0 && l === 0) continue;
        if (!allowed(h, k, l)) continue;
        var tag = dGeneral(cell, h, k, l).toFixed(5);
        if (!seen[tag]) { seen[tag] = true; out.push(tag); }
      }
    }
  }
  out.sort(function (p, q) { return parseFloat(q) - parseFloat(p); });
  return out.slice(0, count);
}

function always() { return true; }

test("d-spacing: cubic, hexagonal and triclinic cells match independent formulas", function () {
  var page = loadPage();

  setCell(page, "cubic", { a: 5.43102, b: 5.43102, c: 5.43102 }, "diamond", 8.04778);
  close(singleD(page, [1, 1, 1]), 5.43102 / Math.sqrt(3), 1e-5, "Si 111");
  close(singleD(page, [4, 4, 0]), 5.43102 / Math.sqrt(32), 1e-5, "Si 440");

  // Hexagonal: 1/d^2 = 4/3 (h^2 + hk + k^2)/a^2 + l^2/c^2
  setCell(page, "hexagonal", { a: 4.758, b: 4.758, c: 12.991, gamma: 120 }, "P", 8.04778);
  [[0, 0, 6], [1, 1, 0], [0, 1, 2]].forEach(function (hkl) {
    var invD2 = 4 / 3 * (hkl[0] * hkl[0] + hkl[0] * hkl[1] + hkl[1] * hkl[1]) / (4.758 * 4.758) +
      hkl[2] * hkl[2] / (12.991 * 12.991);
    close(singleD(page, hkl), 1 / Math.sqrt(invD2), 1e-5, "sapphire " + hkl.join(""));
  });

  var tri = { a: 5, b: 6, c: 7, alpha: 80, beta: 95, gamma: 105 };
  setCell(page, "triclinic", tri, "P", 8.04778);
  [[1, 2, 3], [1, -2, 3], [-1, 1, 2]].forEach(function (hkl) {
    close(singleD(page, hkl), dGeneral(tri, hkl[0], hkl[1], hkl[2]), 1e-5, "triclinic " + hkl.join(" "));
  });
});

test("reflection list: cubic Si lists the 111, 220, 311 ... family representatives", function () {
  var page = loadPage();
  setCell(page, "cubic", { a: 5.43102, b: 5.43102, c: 5.43102 }, "diamond", 8.04778);
  singleD(page, [1, 1, 1]);

  var rows = listedRows(page);
  var cell = { a: 5.43102, b: 5.43102, c: 5.43102, alpha: 90, beta: 90, gamma: 90 };
  var diamond = function (h, k, l) {
    var odd = h % 2 && k % 2 && l % 2;
    if (odd) return true;
    if (h % 2 || k % 2 || l % 2) return false;
    return (h + k + l) % 4 === 0;
  };
  assert.deepEqual(rows.map(function (r) { return r[1]; }), expectedSpacings(cell, diamond, 6, 12));
  assert.equal(rows[0][0], "1 1 1");
  assert.equal(rows[1][0], "2 2 0");
  assert.equal(rows[2][0], "3 1 1");
});

test("reflection list: monoclinic includes reflections with a negative index (xray_ooguy#5)", function () {
  var page = loadPage();
  var cell = { a: 5, b: 6, c: 7, alpha: 90, beta: 100, gamma: 90 };
  setCell(page, "monoclinic", cell, "P", 8.04778);
  singleD(page, [1, 1, 1]);

  var listed = listedRows(page).map(function (r) { return r[1]; });
  assert.deepEqual(listed, expectedSpacings(cell, always, 6, 12));
  assert.ok(listed.indexOf("4.38297") >= 0, "(1 0 -1) at 4.38297 A is missing");
  assert.ok(listed.indexOf("3.53923") >= 0, "(1 1 -1) at 3.53923 A is missing");
});

test("reflection list: triclinic covers a half space, not one octant (xray_ooguy#5)", function () {
  var page = loadPage();
  var cell = { a: 5, b: 6, c: 7, alpha: 80, beta: 95, gamma: 105 };
  setCell(page, "triclinic", cell, "P", 8.04778);
  singleD(page, [1, 1, 1]);

  assert.deepEqual(listedRows(page).map(function (r) { return r[1]; }), expectedSpacings(cell, always, 6, 12));
});

test("reflection list: centering extinction treats negative indices like positive ones", function () {
  var page = loadPage();
  var cell = { a: 5, b: 6, c: 7, alpha: 90, beta: 100, gamma: 90 };
  // F: all-odd or all-even only. A wrong sign in the parity test would let
  // (1 0 -1)-type mixed triplets through, or drop (1 1 -1).
  setCell(page, "monoclinic", cell, "F", 8.04778);
  singleD(page, [1, 1, 1]);

  var fcc = function (h, k, l) {
    var parity = Math.abs(h % 2) + Math.abs(k % 2) + Math.abs(l % 2);
    return parity === 0 || parity === 3;
  };
  assert.deepEqual(listedRows(page).map(function (r) { return r[1]; }), expectedSpacings(cell, fcc, 6, 12));
});

// --- thermal drift ------------------------------------------------------------

var MONO = {
  si: { alpha: 2.6e-6, d: 3.1356 },
  diamond: { alpha: 1.0e-6, d: 2.0594 },
  ge: { alpha: 5.9e-6, d: 3.2664 }
};

function drift(page, material, deltaT, energy_keV) {
  page.set("therm-mat", material);
  page.set("therm-temp", deltaT);
  page.set("therm-energy", energy_keV);
  page.win.calcThermalShift();
  return {
    urad: number(page.html("therm-res-urad")),
    eV: number(page.html("therm-res-de"))
  };
}

test("thermal drift: Si, +10 K, 8 keV gives -6.631 urad at fixed energy and -0.208 eV at fixed angle (xray_ooguy#6)", function () {
  var page = loadPage();
  var r = drift(page, "si", 10, 8);
  close(r.urad, -6.631, 1e-3, "angle drift");
  close(r.eV, -0.208, 2e-3, "energy shift");
});

test("thermal drift: heating lowers both the Bragg angle and the energy, cooling raises both (xray_ooguy#6)", function () {
  var page = loadPage();
  Object.keys(MONO).forEach(function (mat) {
    [[10, 8], [-25, 12], [3, 6]].forEach(function (c) {
      var dT = c[0], E = c[1];
      var m = MONO[mat];
      var r = drift(page, mat, dT, E);

      // Fixed angle: E ~ 1/d, so dE/E = -alpha dT.
      // The card prints eV to three decimals, so allow half a unit of the last digit.
      assert.ok(Math.abs(r.eV - (-m.alpha * dT * E * 1000)) <= 5.01e-4, mat + " dE at " + dT + " K, " + E + " keV: got " + r.eV);
      // Fixed energy: dtheta = -alpha dT tan(theta).
      var theta = Math.asin(HC_EV_A / (E * 1000) / (2 * m.d));
      close(r.urad, -m.alpha * dT * Math.tan(theta) * 1e6, 2e-3, mat + " dtheta at " + dT + " K, " + E + " keV");
      assert.equal(Math.sign(r.eV), Math.sign(r.urad), mat + ": dE and dtheta must have the same sign for the same expansion");
    });
  });
});

test("thermal drift: result labels say which of angle and energy is held fixed (xray_ooguy#6)", function () {
  var html = markup();
  var theta = /<div class="result-label"[^>]*>([\s\S]*?)<\/div>\s*<div id="therm-res-urad"/.exec(html);
  var energy = /<div class="result-label"[^>]*>([\s\S]*?)<\/div>\s*<div id="therm-res-de"/.exec(html);
  assert.ok(theta && energy, "drift result labels not found");
  assert.match(theta[1], /energy fixed/i);
  assert.match(energy[1], /angle fixed/i);
});

// --- critical angle -----------------------------------------------------------

function refractionCriticalDeg(page, materialIndex, energy_keV) {
  page.set("refract-mat", materialIndex);
  page.set("refract-thick", 10);
  page.set("refract-energy", energy_keV);
  page.win.calcRefractive();
  return number(page.html("refract-res-crit"));
}

// delta = r_e lambda^2 n_e / 2 pi with n_e = N_A rho (Z/A), from CODATA constants.
function freeElectronCriticalDeg(rho_g_cm3, zOverA, energy_keV) {
  var r_e = 2.8179403262e-15, N_A = 6.02214076e23;
  var lambda = HC_EV_A / (energy_keV * 1000) * 1e-10;
  var n_e = N_A * rho_g_cm3 * 1e6 * zOverA;
  var delta = r_e * lambda * lambda * n_e / (2 * Math.PI);
  return Math.sqrt(2 * delta) / DEG;
}

function indexOfMaterial(page, symbol) {
  var db = page.data("MATERIALS_DB");
  for (var i = 0; i < db.length; i++) if (db[i].symbol === symbol) return i;
  throw new Error("no material " + symbol);
}

// Z/A as electrons per formula unit over formula mass, from the chemical formula.
var ELECTRON_RATIO = {
  Si: 14 / 28.0855,
  Ge: 32 / 72.63,
  Au: 79 / 196.966,
  Pt: 78 / 195.084,
  Rh: 45 / 102.905,
  Ni: 28 / 58.693,
  Cu: 29 / 63.546,
  Al: 13 / 26.9815,
  Be: 4 / 9.0121,
  C: 6 / 12.011,
  C22H10N2O5: (22 * 6 + 10 + 2 * 7 + 5 * 8) / 382.32,
  C10H8O4: (10 * 6 + 8 + 4 * 8) / 192.17,
  SiO2: (14 + 2 * 8) / 60.084,
  H2O: 10 / 18.015
};

test("materials: every entry carries an electron-based Z/A, not a mean Z over a formula mass (xray_ooguy#8)", function () {
  var page = loadPage();
  var db = page.data("MATERIALS_DB");
  db.forEach(function (m) {
    if (m.symbol === "Air") {
      // Dry air, N2 78 %, O2 21 %, Ar 1 % by volume: 0.4992 mol electrons per gram.
      assert.ok(typeof m.z_over_a === "number", "Air has no z_over_a");
      close(m.z_over_a, 0.4992, 2e-3, "Air Z/A");
      return;
    }
    assert.ok(ELECTRON_RATIO[m.symbol] !== undefined, "test has no reference for " + m.symbol);
    assert.ok(typeof m.z_over_a === "number", m.symbol + " has no z_over_a");
    close(m.z_over_a, ELECTRON_RATIO[m.symbol], 1e-3, m.symbol + " Z/A");
  });
});

test("total external reflection: picking a material fills density and Z/A and gives the free-electron theta_c (xray_ooguy#8)", function () {
  var page = loadPage();
  assert.ok(page.els["crit-mat"], "total-reflection card has no material picker (crit-mat)");

  var au = indexOfMaterial(page, "Au");
  page.set("crit-mat", au);
  page.set("crit-energy", 10);
  page.win.applyCriticalMaterial();

  close(number(page.els["crit-density"].value), 19.32, 1e-9, "density");
  close(number(page.els["crit-z-over-a"].value), 79 / 196.966, 1e-3, "Z/A");
  var shown = number(page.html("crit-res-deg"));
  close(shown, 0.4596, 2e-3, "Au theta_c at 10 keV");
  close(shown, freeElectronCriticalDeg(19.32, 79 / 196.966, 10), 1e-3, "Au theta_c against r_e lambda^2 n_e / 2 pi");
});

test("total external reflection: a compound gets its electron ratio, so water is not off by a factor of 3 (xray_ooguy#8)", function () {
  var page = loadPage();
  assert.ok(page.els["crit-mat"], "total-reflection card has no material picker (crit-mat)");
  page.set("crit-mat", indexOfMaterial(page, "H2O"));
  page.set("crit-energy", 10);
  page.win.applyCriticalMaterial();

  close(number(page.html("crit-res-deg")), freeElectronCriticalDeg(1.0, 10 / 18.015, 10), 1e-3, "water theta_c");
});

test("critical angle: the two cards agree to within 10 % for every element at 10 keV, and the cards say why they differ (xray_ooguy#8)", function () {
  var page = loadPage();
  assert.ok(page.els["crit-mat"], "total-reflection card has no material picker (crit-mat)");
  var elements = ["Si", "Ge", "Au", "Pt", "Rh", "Ni", "Cu", "Al", "Be", "C"];

  elements.forEach(function (symbol) {
    var i = indexOfMaterial(page, symbol);
    page.set("crit-mat", i);
    page.set("crit-energy", 10);
    page.win.applyCriticalMaterial();
    var ter = number(page.html("crit-res-deg"));
    var tab = refractionCriticalDeg(page, i, 10);
    close(ter, tab, 0.10, symbol + " theta_c, total-reflection card against refraction card");
  });

  var html = markup();
  var note = /id="crit-model-note"[^>]*>([\s\S]*?)<\/(?:div|p|span)>/.exec(html);
  assert.ok(note, "total-reflection card has no crit-model-note");
  assert.match(note[1], /free-electron/i);
  assert.match(note[1], /edge/i);

  var label = /<div class="result-label"[^>]*>([\s\S]*?)<\/div>\s*<div id="refract-res-crit"/.exec(html);
  assert.ok(label, "refraction card critical-angle label not found");
  assert.match(label[1], /tabulated/i);
});
