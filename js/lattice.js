/**
 * XRAY.OOGUY — Lattice parameters + Miller indices → d-spacing
 *
 * One code path covers all seven crystal systems: build the direct metric
 * tensor G from (a, b, c, alpha, beta, gamma), invert it to the reciprocal
 * metric tensor G*, and read the plane spacing off
 *
 *     1/d² = [h k l] · G* · [h k l]ᵀ
 *
 * The system selector only constrains which cell parameters the user may edit
 * and mirrors the dependent ones — it never changes the formula. That keeps
 * hexagonal, rhombohedral, monoclinic and triclinic exact instead of needing a
 * hand-written closed form each.
 *
 * Compatibility: CentOS 7 (Firefox 60 ESR, Chrome 60~70) — ES5 syntax only.
 */

(function () {
  "use strict";

  // Reads a field only if it is inside the min/max declared in the markup.
  function readField(id) {
    return window.readField ? window.readField(id) : parseFloat((document.getElementById(id) || {}).value);
  }

  function t(key) {
    if (window.i18n && window.i18n.t) return window.i18n.t(key);
    return key;
  }

  var DEG = Math.PI / 180;

  // Standard room-temperature cell parameters. Trigonal entries use the
  // hexagonal setting, which is how beamline software usually reports them.
  var LATTICE_PRESETS = [
    { name: "Si", system: "cubic", a: 5.43102, centering: "diamond" },
    { name: "Ge", system: "cubic", a: 5.65750, centering: "diamond" },
    { name: "Diamond", system: "cubic", a: 3.56700, centering: "diamond" },
    { name: "GaAs", system: "cubic", a: 5.65320, centering: "F" },
    { name: "InP", system: "cubic", a: 5.86870, centering: "F" },
    { name: "Cu", system: "cubic", a: 3.61500, centering: "F" },
    { name: "Au", system: "cubic", a: 4.07820, centering: "F" },
    { name: "Al2O3", system: "hexagonal", a: 4.75800, c: 12.99100, centering: "R" },
    { name: "SiO2", system: "hexagonal", a: 4.91340, c: 5.40520, centering: "P" },
    { name: "SrTiO3", system: "cubic", a: 3.90500, centering: "P" }
  ];

  // Which cell parameters a system lets the user set; the rest are mirrored.
  var SYSTEMS = {
    cubic:        { edit: ["a"],                          angles: [90, 90, 90] },
    tetragonal:   { edit: ["a", "c"],                     angles: [90, 90, 90] },
    orthorhombic: { edit: ["a", "b", "c"],                angles: [90, 90, 90] },
    hexagonal:    { edit: ["a", "c"],                     angles: [90, 90, 120] },
    rhombohedral: { edit: ["a", "alpha"],                 angles: null },
    monoclinic:   { edit: ["a", "b", "c", "beta"],        angles: [90, null, 90] },
    triclinic:    { edit: ["a", "b", "c", "alpha", "beta", "gamma"], angles: null }
  };

  var CELL_IDS = ["a", "b", "c", "alpha", "beta", "gamma"];

  function el(id) { return document.getElementById("lat-" + id); }

  // An empty field falls back to its neutral default; a field that holds a
  // value outside the domain declared in the markup returns NaN, so the caller
  // reports the range error instead of quietly computing with the default.
  function num(id, fallback) {
    var node = el(id);
    if (!node) return fallback;
    if (node.value === "") return fallback;
    return readField(node.id);
  }

  function setVal(id, value) {
    var node = el(id);
    if (node) node.value = value;
  }

  function currentSystem() {
    var node = el("system");
    var key = node ? node.value : "cubic";
    return SYSTEMS[key] ? key : "cubic";
  }

  // Mirror the dependent cell parameters and grey out what cannot be edited.
  function applyLatticeSystem() {
    var key = currentSystem();
    var spec = SYSTEMS[key];

    var editable = {};
    for (var e = 0; e < spec.edit.length; e++) editable[spec.edit[e]] = true;

    var a = num("a", 5.43102);

    if (key === "cubic" || key === "rhombohedral") {
      setVal("b", a);
      setVal("c", a);
    } else if (key === "tetragonal" || key === "hexagonal") {
      setVal("b", a);
    }

    if (spec.angles) {
      if (spec.angles[0] !== null) setVal("alpha", spec.angles[0]);
      if (spec.angles[1] !== null) setVal("beta", spec.angles[1]);
      if (spec.angles[2] !== null) setVal("gamma", spec.angles[2]);
    } else if (key === "rhombohedral") {
      var alpha = num("alpha", 90);
      setVal("beta", alpha);
      setVal("gamma", alpha);
    }

    for (var i = 0; i < CELL_IDS.length; i++) {
      var node = el(CELL_IDS[i]);
      if (!node) continue;
      var on = !!editable[CELL_IDS[i]];
      node.disabled = !on;
      node.style.opacity = on ? "" : "0.55";
    }

    calcLattice();
  }

  // Direct metric tensor of the unit cell.
  function metricTensor(a, b, c, alpha, beta, gamma) {
    var ca = Math.cos(alpha * DEG);
    var cb = Math.cos(beta * DEG);
    var cg = Math.cos(gamma * DEG);
    return [
      [a * a, a * b * cg, a * c * cb],
      [a * b * cg, b * b, b * c * ca],
      [a * c * cb, b * c * ca, c * c]
    ];
  }

  function det3(m) {
    return m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1])
         - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0])
         + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
  }

  function invert3(m, d) {
    return [
      [(m[1][1] * m[2][2] - m[1][2] * m[2][1]) / d,
       (m[0][2] * m[2][1] - m[0][1] * m[2][2]) / d,
       (m[0][1] * m[1][2] - m[0][2] * m[1][1]) / d],
      [(m[1][2] * m[2][0] - m[1][0] * m[2][2]) / d,
       (m[0][0] * m[2][2] - m[0][2] * m[2][0]) / d,
       (m[0][2] * m[1][0] - m[0][0] * m[1][2]) / d],
      [(m[1][0] * m[2][1] - m[1][1] * m[2][0]) / d,
       (m[0][1] * m[2][0] - m[0][0] * m[2][1]) / d,
       (m[0][0] * m[1][1] - m[0][1] * m[1][0]) / d]
    ];
  }

  // ------------------------------------------------------------------
  // Which reflections exist, and which are reachable
  // ------------------------------------------------------------------
  // The metric tensor gives d for any (hkl), but most of those planes do not
  // diffract: the lattice centring extinguishes whole families, and Bragg's law
  // rules out everything with 2d < lambda. Listing what survives both is the
  // question actually asked when planning a scan, and every input it needs is
  // already on this card.
  //
  // Rules are the standard centring conditions. Diamond (Fd-3m, the setting Si,
  // Ge and diamond use) is F plus the glide condition that extinguishes 222.
  var CENTERINGS = {
    P: function () { return true; },
    F: function (h, k, l) {
      var eo = (h % 2) + (k % 2) + (l % 2);
      return eo === 0 || eo === 3;
    },
    I: function (h, k, l) { return (h + k + l) % 2 === 0; },
    A: function (h, k, l) { return (k + l) % 2 === 0; },
    B: function (h, k, l) { return (h + l) % 2 === 0; },
    C: function (h, k, l) { return (h + k) % 2 === 0; },
    R: function (h, k, l) { return (((-h + k + l) % 3) + 3) % 3 === 0; },
    diamond: function (h, k, l) {
      var odd = (h % 2) && (k % 2) && (l % 2);
      if (odd) return true;
      if ((h % 2) || (k % 2) || (l % 2)) return false;   // mixed parity
      return (h + k + l) % 4 === 0;
    }
  };

  var MAX_INDEX = 6;
  var MAX_ROWS = 12;

  function currentCentering() {
    var node = el("centering");
    var key = node ? node.value : "P";
    return CENTERINGS[key] ? key : "P";
  }

  function dFromGstar(Gstar, h, k, l) {
    var hkl = [h, k, l];
    var invD2 = 0;
    for (var i = 0; i < 3; i++) {
      for (var j = 0; j < 3; j++) invD2 += hkl[i] * Gstar[i][j] * hkl[j];
    }
    return invD2 > 0 ? 1 / Math.sqrt(invD2) : NaN;
  }

  // Reference tables write the equivalent planes of a family under one
  // representative — 220, not 022 — so of the triplets sharing a spacing, keep
  // the one in descending order, and the largest of those. Enumeration order
  // would otherwise decide it, and the list would not match the tables the
  // numbers are being checked against.
  function preferred(a, b) {
    var aDesc = (a.h >= a.k && a.k >= a.l) ? 1 : 0;
    var bDesc = (b.h >= b.k && b.k >= b.l) ? 1 : 0;
    if (aDesc !== bDesc) return aDesc ? a : b;
    if (a.h !== b.h) return a.h > b.h ? a : b;
    if (a.k !== b.k) return a.k > b.k ? a : b;
    return a.l >= b.l ? a : b;
  }

  // One row per distinct spacing: different index triplets that share a d are
  // the same ring, so listing them all would just pad the table.
  function reflectionList(Gstar, lambda) {
    var allowed = CENTERINGS[currentCentering()];
    var byD = {};
    var order = [];
    var extinct = 0;

    for (var h = 0; h <= MAX_INDEX; h++) {
      for (var k = 0; k <= MAX_INDEX; k++) {
        for (var l = 0; l <= MAX_INDEX; l++) {
          if (h === 0 && k === 0 && l === 0) continue;
          if (!allowed(h, k, l)) { extinct++; continue; }

          var d = dFromGstar(Gstar, h, k, l);
          if (!isFinite(d) || d <= 0) continue;

          var row = { h: h, k: k, l: l, d: d, twoTheta: NaN };
          if (lambda > 0 && lambda / (2 * d) <= 1) {
            row.twoTheta = 2 * Math.asin(lambda / (2 * d)) / DEG;
          }

          var tag = d.toFixed(5);
          if (byD[tag]) {
            byD[tag] = preferred(byD[tag], row);
          } else {
            byD[tag] = row;
            order.push(tag);
          }
        }
      }
    }

    var rows = [];
    for (var i = 0; i < order.length; i++) rows.push(byD[order[i]]);
    rows.sort(function (p, q) { return q.d - p.d; });
    return { rows: rows, extinct: extinct };
  }

  // The list runs a dozen rows, which is longer than the card it hangs off, so
  // it stays folded and announces its own size on the fold. Open state is kept
  // for the session rather than reset on every keystroke.
  var reflOpen = false;

  function applyReflOpen() {
    var panel = document.getElementById("lat-refl-panel");
    var caret = document.getElementById("lat-refl-caret");
    var toggle = document.getElementById("lat-refl-toggle");

    if (panel) panel.style.display = reflOpen ? "block" : "none";
    if (caret) caret.innerHTML = reflOpen ? "&#9662;" : "&#9656;";
    if (toggle) toggle.setAttribute("aria-expanded", reflOpen ? "true" : "false");
  }

  function toggleReflections() {
    reflOpen = !reflOpen;
    applyReflOpen();
  }

  function renderReflections(Gstar, lambda) {
    var body = document.getElementById("lat-refl-body");
    var note = document.getElementById("lat-refl-note");
    if (!body) return;

    var list = reflectionList(Gstar, lambda);
    var html = "";
    var shown = 0;

    for (var i = 0; i < list.rows.length && shown < MAX_ROWS; i++) {
      var r = list.rows[i];
      if (isNaN(r.twoTheta)) continue;          // beyond the Bragg limit
      shown++;
      html += "<tr><td class='mono'>" + r.h + " " + r.k + " " + r.l + "</td>" +
        "<td class='mono dt-val'>" + r.d.toFixed(5) + "</td>" +
        "<td class='mono dt-val'>" + r.twoTheta.toFixed(3) + "</td>" +
        "<td class='mono dt-val'>" + (2 * Math.PI / r.d).toFixed(4) + "</td></tr>";
    }

    body.innerHTML = html || "<tr><td colspan='4'>" + t("lat_refl_none") + "</td></tr>";

    // The count is the part worth seeing while folded.
    var count = document.getElementById("lat-refl-count");
    if (count) count.textContent = shown ? String(shown) : "0";
    applyReflOpen();

    if (note) {
      note.textContent = shown
        ? t("lat_refl_note").replace("{shown}", shown).replace("{extinct}", list.extinct)
        : "";
    }

    // The table answers "where is each reflection"; the stick plot answers
    // "where are they all", which is the question you actually have when
    // deciding a scan range. Drawing lives in miniplot.js, the rows live here.
    if (window.renderReflectionPlot) window.renderReflectionPlot(list.rows);
  }

  function setText(id, value) {
    var node = document.getElementById("lat-res-" + id);
    if (node) node.innerHTML = value;
  }

  function clearResults(message) {
    setText("d", "-");
    setText("q", "-");
    setText("theta", "-");
    setText("vol", "-");
    var note = document.getElementById("lat-res-note");
    if (note) note.textContent = message || "";

    // The reflection list is read off the same cell, so it cannot outlive it.
    var body = document.getElementById("lat-refl-body");
    if (body) body.innerHTML = "";
    var reflNote = document.getElementById("lat-refl-note");
    if (reflNote) reflNote.textContent = "";
  }

  function calcLattice() {
    var key = currentSystem();

    // Keep the mirrored parameters in step while the user types.
    var a = num("a", 0);
    if (key === "cubic" || key === "rhombohedral") {
      setVal("b", a);
      setVal("c", a);
    } else if (key === "tetragonal" || key === "hexagonal") {
      setVal("b", a);
    }
    if (key === "rhombohedral") {
      var al = num("alpha", 90);
      setVal("beta", al);
      setVal("gamma", al);
    }

    var b = num("b", 0);
    var c = num("c", 0);
    var alpha = num("alpha", 90);
    var beta = num("beta", 90);
    var gamma = num("gamma", 90);

    var h = num("h", 0);
    var k = num("k", 0);
    var l = num("l", 0);

    if (isNaN(a) || isNaN(b) || isNaN(c) ||
        isNaN(alpha) || isNaN(beta) || isNaN(gamma) ||
        isNaN(h) || isNaN(k) || isNaN(l)) {
      clearResults(t("lat_err_range"));
      return;
    }
    if (a <= 0 || b <= 0 || c <= 0) {
      clearResults(t("lat_err_cell"));
      return;
    }
    if (h === 0 && k === 0 && l === 0) {
      clearResults(t("lat_err_hkl"));
      return;
    }

    var G = metricTensor(a, b, c, alpha, beta, gamma);
    var detG = det3(G);

    // A non-positive determinant means the three angles cannot close a cell.
    if (detG <= 0) {
      clearResults(t("lat_err_angles"));
      return;
    }

    var Gstar = invert3(G, detG);
    var invD2 = 0;
    var hkl = [h, k, l];
    for (var i = 0; i < 3; i++) {
      for (var j = 0; j < 3; j++) {
        invD2 += hkl[i] * Gstar[i][j] * hkl[j];
      }
    }

    if (invD2 <= 0) {
      clearResults(t("lat_err_angles"));
      return;
    }

    var d = 1 / Math.sqrt(invD2);
    var Q = 2 * Math.PI / d;
    var volume = Math.sqrt(detG);

    var listEnergy = num("energy", 0);
    renderReflections(Gstar, (!isNaN(listEnergy) && listEnergy > 0)
      ? CONSTANTS.hc_eV_A / (listEnergy * 1000)
      : 0);

    setText("d", d.toFixed(5) + " Å");
    setText("q", Q.toFixed(4) + " Å<sup>-1</sup>");
    setText("vol", volume.toFixed(3) + " Å<sup>3</sup>");

    var note = document.getElementById("lat-res-note");
    var energy = num("energy", 0);

    if (isNaN(energy)) {
      setText("theta", "-");
      if (note) note.textContent = t("lat_err_range");
    } else if (energy > 0) {
      var lambda = CONSTANTS.hc_eV_A / (energy * 1000);   // Å
      var sinTheta = lambda / (2 * d);

      if (sinTheta > 1) {
        setText("theta", t("lat_no_bragg"));
        if (note) {
          note.textContent = "λ = " + (lambda / 10).toFixed(5) + " nm  ·  λ/2d = " +
            sinTheta.toFixed(4) + " > 1";
        }
      } else {
        var theta = Math.asin(sinTheta) / DEG;
        setText("theta", theta.toFixed(4) + "° (2θ = " + (2 * theta).toFixed(4) + "°)");
        if (note) {
          note.textContent = "λ = " + (lambda / 10).toFixed(5) + " nm  ·  " + hklLabel(h, k, l) +
            "  ·  " + key;
        }

        if (window.recordCalculation) {
          window.recordCalculation(
            "Lattice d-spacing",
            hklLabel(h, k, l) + ", a = " + a + " Å, " + energy + " keV",
            "d = " + d.toFixed(5) + " Å, θ = " + theta.toFixed(4) + "°"
          );
        }
      }
    } else {
      setText("theta", "-");
      if (note) note.textContent = hklLabel(h, k, l) + "  ·  " + key;
    }
  }

  function hklLabel(h, k, l) {
    function part(n) {
      // Bar notation is what a diffraction paper prints for a negative index.
      return n < 0 ? "-" + Math.abs(n) : String(n);
    }
    return "(" + part(h) + " " + part(k) + " " + part(l) + ")";
  }

  function applyLatticePreset(index) {
    var preset = LATTICE_PRESETS[index];
    if (!preset) return;

    var systemEl = el("system");
    if (systemEl) systemEl.value = preset.system;

    var centeringEl = el("centering");
    if (centeringEl && preset.centering) centeringEl.value = preset.centering;

    setVal("a", preset.a);
    setVal("b", preset.b !== undefined ? preset.b : preset.a);
    setVal("c", preset.c !== undefined ? preset.c : preset.a);
    setVal("alpha", 90);
    setVal("beta", 90);
    setVal("gamma", preset.system === "hexagonal" ? 120 : 90);

    applyLatticeSystem();
  }

  function renderLatticePresets() {
    var box = document.getElementById("lattice-presets");
    if (!box || box.children.length) return;

    for (var i = 0; i < LATTICE_PRESETS.length; i++) {
      var chip = document.createElement("span");
      chip.className = "preset-chip";
      chip.textContent = LATTICE_PRESETS[i].name;
      (function (index) {
        chip.onclick = function () { applyLatticePreset(index); };
      })(i);
      box.appendChild(chip);
    }
  }

  function initLattice() {
    renderLatticePresets();
    applyLatticeSystem();
  }

  window.calcLattice = calcLattice;
  window.toggleReflections = toggleReflections;
  // Search offers the presets as results, so it needs to see them.
  window.LATTICE_PRESETS = LATTICE_PRESETS;
  window.applyLatticeSystem = applyLatticeSystem;
  window.applyLatticePreset = applyLatticePreset;
  window.initLattice = initLattice;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initLattice);
  } else {
    initLattice();
  }
})();
