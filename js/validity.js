/**
 * XRAY.OOGUY — Model validity & approximation disclosure
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

  // Reads a field only if it is inside the min/max declared in the markup.
  function readField(id) {
    return window.readField ? window.readField(id) : parseFloat((document.getElementById(id) || {}).value);
  }

  function t(key) {
    if (window.i18n && window.i18n.t) return window.i18n.t(key);
    return key;
  }

  function val(id) {
    var el = document.getElementById(id);
    if (!el) return NaN;
    return readField(el.id);
  }

  function fmt(n, digits) {
    return isNaN(n) ? "-" : n.toFixed(digits === undefined ? 2 : digits);
  }

  // The energy the tabulated delta and beta are measured at. Everything the
  // transmittance card reports is a power-law extrapolation away from here, so
  // it is also the far end of the interval an absorption edge can fall inside.
  var SCALING_ANCHOR_KEV = 10.0;

  // How close to an edge counts as too close, as a fraction of the edge energy.
  // 8% of 11.9 keV is about a keV — roughly the width over which the near-edge
  // structure makes a smooth power law meaningless.
  var EDGE_NEAR_FRACTION = 0.08;

  // The material the transmittance card is set to. Its <select> carries indices
  // into MATERIALS_DB rather than names.
  function selectedMaterial() {
    var el = document.getElementById("refract-mat");
    if (!el || typeof MATERIALS_DB === "undefined") return null;
    var idx = parseInt(el.value, 10);
    if (isNaN(idx)) return null;
    return MATERIALS_DB[idx] || null;
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
      watch: ["refract-energy", "refract-thick", "refract-mat"],
      model: ["vm_refract_scaling", "vm_refract_noedge", "vm_refract_beer"],
      check: function () {
        var out = [];
        var e = val("refract-energy");
        if (isNaN(e) || e <= 0) return out;

        // The old check only asked whether the energy was inside 5–30 keV. That
        // is the wrong question: what breaks the E^-2 / E^-3.5 scaling is not
        // distance from 10 keV, it is an absorption edge in between, and the
        // edges of these very materials sit inside that band. Gold at 12 keV
        // was the worst case — one step above the L3 edge at 11.919 keV, beta
        // several times larger than the power law says, and no warning at all
        // because 12 is comfortably inside 5–30.
        var mat = selectedMaterial();
        var edges = (mat && mat.edges) ? mat.edges : [];

        var lo = Math.min(SCALING_ANCHOR_KEV, e);
        var hi = Math.max(SCALING_ANCHOR_KEV, e);
        var crossed = [];
        var near = null;

        for (var i = 0; i < edges.length; i++) {
          var edge = edges[i];
          if (edge.keV > lo && edge.keV < hi) crossed.push(edge);

          // Close to an edge the smooth model is wrong even on the correct
          // side of it: this is where the fine structure lives.
          var gap = Math.abs(e - edge.keV) / edge.keV;
          if (gap <= EDGE_NEAR_FRACTION && (!near || gap < near.gap)) {
            near = { edge: edge, gap: gap };
          }
        }

        if (crossed.length) {
          var names = [];
          for (var c = 0; c < crossed.length; c++) {
            names.push(crossed[c].n + " " + fmt(crossed[c].keV, 3) + " keV");
          }
          out.push({ key: "vw_refract_edge_crossed", text: names.join(", ") });
        } else if (near) {
          out.push({
            key: "vw_refract_edge_near",
            text: near.edge.n + " " + fmt(near.edge.keV, 3) + " keV"
          });
        }

        // Still worth saying when the extrapolation is stretched a long way,
        // edges or no edges.
        if (e < 1 || e > 60) {
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
      card: "card-rad-scantime",
      watch: ["rad-scan-n1", "rad-scan-n2", "rad-scan-dwell", "rad-scan-overhead", "rad-scan-repeats"],
      model: ["vm_scan_stepping", "vm_scan_overhead"],
      check: function () {
        var out = [];
        var dwell = val("rad-scan-dwell"), over = val("rad-scan-overhead");
        // Worth saying out loud: at this point the scan is a motor exercise and
        // buying statistics by raising the dwell is nearly free.
        if (!isNaN(dwell) && !isNaN(over) && dwell > 0 && over > dwell) {
          out.push({
            key: "vw_scan_overhead_dominant",
            text: fmt(100 * over / (over + dwell), 0) + "%"
          });
        }
        return out;
      }
    },
    {
      card: "card-rad-dose",
      watch: ["rad-dose-energy", "rad-dose-thick", "rad-dose-mat", "rad-dose-flux"],
      model: ["vm_dose_local", "vm_dose_beer", "vm_dose_scaling"],
      check: function () {
        var out = [];
        var t_um = val("rad-dose-thick");
        var e = val("rad-dose-energy");
        // A crude stand-in for the photoelectron range, which grows roughly as
        // E^1.7 and is of order a micron at 10 keV in a solid. Below that the
        // "all energy stays put" assumption starts giving the sample credit for
        // absorbing what actually left it.
        if (!isNaN(t_um) && !isNaN(e) && e > 0) {
          var range_um = 1.0 * Math.pow(e / 10, 1.7);
          if (t_um < range_um) out.push({ key: "vw_dose_thin", text: "~" + fmt(range_um, 2) + " μm" });
        }
        return out;
      }
    },
    {
      card: "card-rad-absorber",
      watch: ["rad-abs-energy", "rad-abs-d-1", "rad-abs-d-2", "rad-abs-d-3", "rad-abs-d-4",
              "rad-abs-mat-1", "rad-abs-mat-2", "rad-abs-mat-3", "rad-abs-mat-4"],
      model: ["vm_abs_beer", "vm_abs_noharm", "vm_refract_scaling"],
      check: function () {
        var out = [];
        var el = document.getElementById("rad-abs-res-factor");
        var txt = el ? (el.textContent || "") : "";
        var factor = parseFloat(txt);
        if (!isNaN(factor) && factor > 1e4) {
          out.push({ key: "vw_abs_hard", text: factor.toExponential(1) + " ×" });
        }
        return out;
      }
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
        // Nanometres, and metres — the field is labelled nm and the calculator
        // reads it as nm, while the detector distance is in m. Read as um and
        // mm this warning fired on every geometry the card was ever shown,
        // because it inflated the Fresnel number by a million.
        var a_nm = val("cdi-sample-size");
        var D_m = val("cdi-dist");
        if (!isNaN(lambda_A) && !isNaN(a_nm) && !isNaN(D_m) && a_nm > 0 && D_m > 0) {
          // Fresnel number F = a^2 / (lambda * D); far field needs F << 1.
          var a_m = a_nm * 1e-9;
          var lambda_m = lambda_A * 1e-10;
          var F = (a_m * a_m) / (lambda_m * D_m);
          if (F > 1) out.push({ key: "vw_cdi_nearfield", text: "F = " + fmt(F, 2) });
        }
        return out;
      }
    },
    {
      card: "card-coh-length",
      watch: ["coh-energy", "coh-bandwidth", "coh-src-h", "coh-src-v", "coh-dist", "coh-sample"],
      model: ["vm_coh_vcz", "vm_coh_long"],
      check: function () {
        var out = [];
        var e = val("coh-energy"), bw = val("coh-bandwidth");
        var sh = val("coh-src-h"), sv = val("coh-src-v");
        var R = val("coh-dist"), sample_nm = val("coh-sample");
        if (isNaN(e) || e <= 0 || isNaN(sample_nm) || sample_nm <= 0) return out;

        var lambda_nm = CONSTANTS.hc_keV_nm / e;

        if (!isNaN(sh) && !isNaN(sv) && !isNaN(R) && sh > 0 && sv > 0 && R > 0) {
          var lambda_m = lambda_nm * 1e-9;
          var tight_um = Math.min(
            (lambda_m * R) / (2 * sh * 1e-6) * 1e6,
            (lambda_m * R) / (2 * sv * 1e-6) * 1e6
          );
          var sample_um = sample_nm / 1000;
          if (tight_um < sample_um) {
            out.push({ key: "vw_coh_undersized", text: fmt(tight_um, 3) + " μm < " + fmt(sample_um, 3) + " μm" });
          }
        }

        if (!isNaN(bw) && bw > 0) {
          var xl_nm = lambda_nm / (2 * bw);
          var path_nm = 2 * sample_nm;
          if (path_nm > xl_nm) {
            out.push({ key: "vw_coh_pathlong", text: fmt(path_nm, 1) + " nm > " + fmt(xl_nm, 1) + " nm" });
          }
        }
        return out;
      }
    },
    {
      card: "card-coh-resolution",
      watch: ["cres-energy", "cres-dist", "cres-pixel", "cres-npix"],
      model: ["vm_cres_farfield", "vm_cres_extent"],
      // Always worth saying: this is a ceiling, not an achievement.
      check: function () { return [{ key: "vw_cres_optimistic" }]; }
    },
    {
      card: "card-opt-calibration",
      watch: ["cal-d", "cal-tth", "cal-nominal"],
      model: ["vm_cal_bragg", "vm_cal_dexact"],
      check: function () {
        var out = [];
        var d = val("cal-d"), tth = val("cal-tth"), nominal = val("cal-nominal");
        if (isNaN(d) || isNaN(tth) || isNaN(nominal) || d <= 0 || nominal <= 0) return out;
        var lambda = 2 * d * Math.sin((tth / 2) * Math.PI / 180);
        if (lambda <= 0) return out;
        var actual = CONSTANTS.hc_eV_A / lambda / 1000;
        // A monochromator that is out by more than a percent is not
        // mis-calibrated, it is measuring something other than what was
        // assumed.
        var rel = Math.abs(actual - nominal) / nominal;
        if (rel > 0.01) out.push({ key: "vw_cal_large", text: fmt(rel * 100, 2) + "%" });
        return out;
      }
    },
    {
      card: "card-geo-strain",
      watch: ["str-d0", "str-energy", "str-tth"],
      model: ["vm_strain_uniform", "vm_strain_nozero"],
      check: function () {
        var out = [];
        var d0 = val("str-d0"), e = val("str-energy"), tth = val("str-tth");
        if (isNaN(d0) || isNaN(e) || isNaN(tth) || d0 <= 0 || e <= 0) return out;
        var lambda = CONSTANTS.hc_eV_A / (e * 1000);
        var s = Math.sin((tth / 2) * Math.PI / 180);
        if (s <= 0) return out;
        var eps = (lambda / (2 * s)) / d0 - 1;
        // A percent of elastic strain is enormous for a crystal; past that the
        // likelier explanations are an angle zero or the wrong reflection.
        if (Math.abs(eps) > 0.01) out.push({ key: "vw_strain_large", text: fmt(eps * 100, 2) + "%" });
        return out;
      }
    },
    {
      card: "card-geo-pixelq",
      watch: ["pxq-energy", "pxq-dist", "pxq-pixel", "pxq-dx", "pxq-dy"],
      model: ["vm_pxq_flat", "vm_pxq_notilt"],
      check: function () {
        var out = [];
        var D = val("pxq-dist"), p = val("pxq-pixel");
        var dx = val("pxq-dx"), dy = val("pxq-dy");
        if (isNaN(D) || isNaN(p) || isNaN(dx) || isNaN(dy) || D <= 0) return out;
        var r_mm = Math.sqrt(dx * dx + dy * dy) * p / 1000;
        var tth = Math.atan2(r_mm, D) * 180 / Math.PI;
        // Out here the flat-and-normal assumption stops being a formality.
        if (tth > 30) out.push({ key: "vw_pxq_wide", text: fmt(tth, 2) + "°" });
        return out;
      }
    },
    {
      card: "card-data-kiessig",
      watch: ["kie-energy", "kie-t1", "kie-t2", "kie-tc"],
      model: ["vm_kie_adjacent", "vm_kie_single"],
      check: function () {
        var out = [];
        var t1 = val("kie-t1"), t2 = val("kie-t2"), tc = val("kie-tc");
        if (isNaN(t1) || isNaN(t2) || t2 <= t1) return out;
        var c = isNaN(tc) ? 0 : tc;

        if (c > 0 && t1 <= c) {
          out.push({ key: "vw_kie_belowc" });
          return out;
        }

        if (c > 0) {
          var rad = Math.PI / 180;
          var corrected = 1 / (Math.sqrt(t2 * t2 - c * c) - Math.sqrt(t1 * t1 - c * c));
          var raw = 1 / (t2 - t1);
          var diff = Math.abs(corrected - raw) / raw;
          if (diff > 0.05) out.push({ key: "vw_kie_corr", text: fmt(diff * 100, 1) + "%" });
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
