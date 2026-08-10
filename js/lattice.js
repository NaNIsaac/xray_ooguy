/**
 * BEAMLINE TOOLKIT — Lattice parameters + Miller indices → d-spacing
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
    { name: "Si", system: "cubic", a: 5.43102 },
    { name: "Ge", system: "cubic", a: 5.65750 },
    { name: "Diamond", system: "cubic", a: 3.56700 },
    { name: "GaAs", system: "cubic", a: 5.65320 },
    { name: "InP", system: "cubic", a: 5.86870 },
    { name: "Cu", system: "cubic", a: 3.61500 },
    { name: "Au", system: "cubic", a: 4.07820 },
    { name: "Al2O3", system: "hexagonal", a: 4.75800, c: 12.99100 },
    { name: "SiO2", system: "hexagonal", a: 4.91340, c: 5.40520 },
    { name: "SrTiO3", system: "cubic", a: 3.90500 }
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
  window.applyLatticeSystem = applyLatticeSystem;
  window.applyLatticePreset = applyLatticePreset;
  window.initLattice = initLattice;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initLattice);
  } else {
    initLattice();
  }
})();
