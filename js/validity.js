/**
 * BEAMLINE TOOLKIT — Model validity & approximation disclosure
 *
 * Every calculator here is a closed-form model, and every closed-form model is
 * only true inside a domain. This module states, on the card itself:
 *
 *   MODEL   — the assumption the formula rests on (small-angle, kinematic,
 *             Gaussian profile, far-from-edge scaling, …)
 *   RANGE   — the inputs the model is defined for, checked live
 *
 * Warnings are advisory, never blocking: the number still appears, but the
 * researcher can see at a glance whether it is trustworthy.
 *
 * Compatibility: CentOS 7 (Firefox 60 ESR, Chrome 60~70) — ES5 syntax only.
 */

(function () {
  "use strict";

  function t(key) {
    if (window.i18n && window.i18n.t) return window.i18n.t(key);
    return key;
  }

  function val(id) {
    var el = document.getElementById(id);
    if (!el) return NaN;
    return parseFloat(el.value);
  }

  function fmt(n, digits) {
    return isNaN(n) ? "-" : n.toFixed(digits === undefined ? 2 : digits);
  }

  // ------------------------------------------------------------------
  // Per-calculator model declarations
  // ------------------------------------------------------------------
  // `model`  — i18n keys, always shown.
  // `check`  — returns i18n keys (optionally with a `text` suffix) for inputs
  //            that have left the model's domain.
  var MODELS = [
    {
      card: "card-optics-bragg",
      watch: ["bragg-r1-d", "bragg-r1-tth", "bragg-r2-tth", "bragg-r2-e", "bragg-r3-d", "bragg-r3-e"],
      model: ["vm_bragg_kinematic", "vm_bragg_norefract"],
      check: function () {
        var out = [];
        // n = 1 is implied; sinθ > 1 has no solution at all.
        var d1 = val("bragg-r3-d"), e1 = val("bragg-r3-e");
        if (!isNaN(d1) && !isNaN(e1) && d1 > 0 && e1 > 0) {
          var lambda = CONSTANTS.hc_eV_A / (e1 * 1000);
          if (lambda / (2 * d1) > 1) out.push({ key: "vw_bragg_nosolution" });
        }
        var tth = val("bragg-r1-tth");
        if (!isNaN(tth) && tth > 0 && tth < 1) out.push({ key: "vw_bragg_smallangle" });
        return out;
      }
    },
    {
      card: "card-optics-qspace",
      watch: ["q-energy", "q-theta", "q-twotheta"],
      model: ["vm_q_elastic"],
      check: function () { return []; }
    },
    {
      card: "card-optics-scaling",
      watch: ["ea-e1", "ea-th1", "ea-e2"],
      model: ["vm_scaling_samed", "vm_scaling_norefract"],
      check: function () {
        var out = [];
        var e1 = val("ea-e1"), e2 = val("ea-e2"), th1 = val("ea-th1");
        if (!isNaN(e1) && !isNaN(e2) && !isNaN(th1) && e2 > 0) {
          var s = Math.sin(th1 * Math.PI / 180) * (e1 / e2);
          if (s > 1) out.push({ key: "vw_scaling_nosolution" });
        }
        return out;
      }
    },
    {
      card: "card-beamline-footprint",
      watch: ["fp-inc-angle", "fp-beam-v", "fp-sample-len"],
      model: ["vm_fp_flat", "vm_fp_nodiv"],
      check: function () {
        var out = [];
        var a = val("fp-inc-angle");
        if (!isNaN(a)) {
          if (a <= 0 || a > 90) out.push({ key: "vw_fp_angle_domain" });
          // Below roughly half a degree the penumbra from beam divergence is
          // comparable to the footprint itself, so 1/sin(theta) overstates it.
          else if (a < 0.5) out.push({ key: "vw_fp_grazing", text: fmt(a, 3) + "°" });
        }
        return out;
      }
    },
    {
      card: "card-beamline-detector",
      watch: ["ang-pixel", "ang-dist"],
      model: ["vm_ang_smallangle", "vm_ang_normal"],
      check: function () {
        var out = [];
        var p = val("ang-pixel"), d = val("ang-dist");
        if (!isNaN(p) && !isNaN(d) && d > 0) {
          var ratio = (p / 1000) / d;   // radians, small-angle
          // tan(x) ~ x carries a relative error of about x^2/3.
          var err = (ratio * ratio / 3) * 100;
          if (err > 0.1) out.push({ key: "vw_ang_smallangle_break", text: fmt(err, 2) + "%" });
        }
        return out;
      }
    },
    {
      card: "card-beamline-slit",
      watch: ["slit-source", "slit-dist", "slit-div", "slit-sig-mult"],
      model: ["vm_slit_gaussian", "vm_slit_quadrature", "vm_slit_nooptics"],
      check: function () {
        var out = [];
        var d = val("slit-dist");
        if (!isNaN(d) && d <= 0) out.push({ key: "vw_slit_distance" });
        return out;
      }
    },
    {
      card: "card-optics-refraction",
      watch: ["refract-energy", "refract-thick"],
      model: ["vm_refract_scaling", "vm_refract_noedge", "vm_refract_beer"],
      check: function () {
        var out = [];
        var e = val("refract-energy");
        // delta and beta are scaled from tabulated 10 keV values as E^-2 and
        // E^-3.5; that power law only holds well away from absorption edges.
        if (!isNaN(e) && e > 0 && (e < 5 || e > 30)) {
          out.push({ key: "vw_refract_range", text: fmt(e, 2) + " keV" });
        }
        return out;
      }
    },
    {
      card: "card-optics-reflection",
      watch: ["crit-energy", "crit-density", "crit-z-over-a"],
      model: ["vm_crit_smallangle", "vm_crit_noabs"],
      check: function () { return []; }
    },
    {
      card: "card-optics-grating",
      watch: ["grating-lines", "grating-energy", "grating-alpha", "grating-order"],
      model: ["vm_grating_equation"],
      check: function () { return []; }
    },
    {
      card: "card-beamline-resolution",
      watch: ["res-energy", "res-div"],
      model: ["vm_res_darwin", "vm_res_perfect"],
      check: function () { return []; }
    },
    {
      card: "card-beamline-flux",
      watch: ["flux-current", "flux-source-base"],
      model: ["vm_flux_linear", "vm_flux_estimate"],
      check: function () { return []; }
    },
    {
      card: "card-beamline-drift",
      watch: ["therm-temp", "therm-energy"],
      model: ["vm_drift_linear"],
      check: function () {
        var out = [];
        var dT = val("therm-temp");
        // A single linear expansion coefficient stops describing the lattice
        // once the temperature swing is large.
        if (!isNaN(dT) && Math.abs(dT) > 100) {
          out.push({ key: "vw_drift_range", text: fmt(dT, 1) + " K" });
        }
        return out;
      }
    },
    {
      card: "card-beamline-cdi",
      watch: ["cdi-energy", "cdi-dist", "cdi-pixel", "cdi-sample-size"],
      model: ["vm_cdi_farfield", "vm_cdi_coherent"],
      check: function () {
        var out = [];
        var lambda_A = CONSTANTS.hc_eV_A / (val("cdi-energy") * 1000);
        var a_um = val("cdi-sample-size");
        var D_mm = val("cdi-dist");
        if (!isNaN(lambda_A) && !isNaN(a_um) && !isNaN(D_mm) && a_um > 0 && D_mm > 0) {
          // Fresnel number F = a^2 / (lambda * D); far field needs F << 1.
          var a_m = a_um * 1e-6;
          var lambda_m = lambda_A * 1e-10;
          var D_m = D_mm * 1e-3;
          var F = (a_m * a_m) / (lambda_m * D_m);
          if (F > 1) out.push({ key: "vw_cdi_nearfield", text: "F = " + fmt(F, 2) });
        }
        return out;
      }
    },
    {
      card: "card-lattice-dspacing",
      watch: ["lat-a", "lat-b", "lat-c", "lat-alpha", "lat-beta", "lat-gamma",
              "lat-h", "lat-k", "lat-l", "lat-energy"],
      model: ["vm_lat_exact", "vm_lat_nosymmetry"],
      check: function () { return []; }
    },
    {
      card: "card-optics-euler",
      watch: ["chiphi-theta", "chiphi-chi"],
      model: ["vm_euler_rigid"],
      check: function () { return []; }
    },
    {
      card: "card-optics-energy",
      watch: ["optics-conv-kev"],
      model: ["vm_energy_exact"],
      check: function () { return []; }
    }
  ];

  // ------------------------------------------------------------------
  // Rendering
  // ------------------------------------------------------------------
  function panelId(card) { return card + "-validity"; }

  function renderPanel(spec) {
    var panel = document.getElementById(panelId(spec.card));
    if (!panel) return;

    var warnings = [];
    try {
      warnings = spec.check() || [];
    } catch (e) {
      warnings = [];
    }

    var html = '<div class="validity-model">' +
      '<span class="validity-tag">' + t("validity_model") + '</span>';
    for (var i = 0; i < spec.model.length; i++) {
      html += '<span class="validity-item">' + t(spec.model[i]) + '</span>';
    }
    html += '</div>';

    if (warnings.length) {
      html += '<div class="validity-warn">';
      for (var w = 0; w < warnings.length; w++) {
        html += '<span class="validity-warn-item">' + t(warnings[w].key) +
          (warnings[w].text ? ' <span class="mono">(' + warnings[w].text + ')</span>' : '') +
          '</span>';
      }
      html += '</div>';
    }

    panel.innerHTML = html;
    panel.className = warnings.length ? "validity validity-alert" : "validity";
  }

  function mountPanel(spec) {
    var card = document.getElementById(spec.card);
    if (!card) return false;
    if (document.getElementById(panelId(spec.card))) return true;

    var body = card.querySelector(".card-body");
    if (!body) return false;

    var panel = document.createElement("div");
    panel.id = panelId(spec.card);
    panel.className = "validity";
    body.appendChild(panel);
    return true;
  }

  function bind(spec) {
    for (var i = 0; i < spec.watch.length; i++) {
      var el = document.getElementById(spec.watch[i]);
      if (!el || el.getAttribute("data-validity-bound")) continue;
      el.setAttribute("data-validity-bound", "1");
      (function (s) {
        el.addEventListener("input", function () { renderPanel(s); });
        el.addEventListener("change", function () { renderPanel(s); });
      })(spec);
    }
  }

  function renderValidity() {
    for (var i = 0; i < MODELS.length; i++) {
      if (!mountPanel(MODELS[i])) continue;
      bind(MODELS[i]);
      renderPanel(MODELS[i]);
    }
  }

  window.renderValidity = renderValidity;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderValidity);
  } else {
    renderValidity();
  }
})();
