/**
 * BEAMLINE TOOLKIT — Mini visualizers
 *
 * Small inline SVG plots attached to a few calculators, drawn from the same
 * formula the card already evaluates. They answer "how does this behave as I
 * turn the knob" — the shape around the working point, not a publication
 * figure. The current inputs are marked on the curve.
 *
 * SVG is built as a string and dropped in with innerHTML: no canvas, no
 * library, and colours come from CSS classes so all four themes work.
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

  var W = 320, H = 132;
  var PAD_L = 40, PAD_R = 10, PAD_T = 10, PAD_B = 24;

  function esc(str) {
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function tick(v) {
    var a = Math.abs(v);
    if (a === 0) return "0";
    if (a >= 1000 || a < 0.01) return v.toExponential(0);
    if (a >= 100) return v.toFixed(0);
    if (a >= 10) return v.toFixed(1);
    return v.toFixed(2);
  }

  /**
   * points  : [[x, y], ...] already in data units, ascending in x
   * marker  : [x, y] to highlight, or null
   * opts    : { xlabel, ylabel, callout, logY }
   */
  function svgLine(points, marker, opts) {
    opts = opts || {};

    var xs = [], ys = [];
    for (var i = 0; i < points.length; i++) {
      if (!isFinite(points[i][0]) || !isFinite(points[i][1])) continue;
      xs.push(points[i][0]);
      ys.push(points[i][1]);
    }
    if (xs.length < 2) return "";

    var xMin = Math.min.apply(null, xs), xMax = Math.max.apply(null, xs);
    var yMin = Math.min.apply(null, ys), yMax = Math.max.apply(null, ys);

    if (opts.yZero) yMin = Math.min(0, yMin);
    if (yMax === yMin) yMax = yMin + 1;
    if (xMax === xMin) xMax = xMin + 1;

    // A little headroom keeps the curve off the frame.
    var pad = (yMax - yMin) * 0.08;
    yMin -= pad;
    yMax += pad;

    function px(x) { return PAD_L + (x - xMin) / (xMax - xMin) * (W - PAD_L - PAD_R); }
    function py(y) { return H - PAD_B - (y - yMin) / (yMax - yMin) * (H - PAD_T - PAD_B); }

    var d = "";
    for (var p = 0; p < points.length; p++) {
      if (!isFinite(points[p][0]) || !isFinite(points[p][1])) continue;
      d += (d ? " L" : "M") + px(points[p][0]).toFixed(1) + "," + py(points[p][1]).toFixed(1);
    }

    var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet" role="img">';

    // frame + one mid gridline on each axis
    svg += '<path class="miniplot-grid" d="M' + PAD_L + ',' + py((yMin + yMax) / 2).toFixed(1) +
           ' L' + (W - PAD_R) + ',' + py((yMin + yMax) / 2).toFixed(1) + '"/>';
    svg += '<path class="miniplot-axis" d="M' + PAD_L + ',' + PAD_T +
           ' L' + PAD_L + ',' + (H - PAD_B) + ' L' + (W - PAD_R) + ',' + (H - PAD_B) + '"/>';

    svg += '<path class="miniplot-curve" d="' + d + '"/>';

    // y ticks
    svg += '<text class="miniplot-label" x="' + (PAD_L - 4) + '" y="' + (PAD_T + 8) + '" text-anchor="end">' + tick(yMax) + '</text>';
    svg += '<text class="miniplot-label" x="' + (PAD_L - 4) + '" y="' + (H - PAD_B) + '" text-anchor="end">' + tick(yMin) + '</text>';
    // x ticks
    svg += '<text class="miniplot-label" x="' + PAD_L + '" y="' + (H - PAD_B + 12) + '">' + tick(xMin) + '</text>';
    svg += '<text class="miniplot-label" x="' + (W - PAD_R) + '" y="' + (H - PAD_B + 12) + '" text-anchor="end">' + tick(xMax) + '</text>';

    if (opts.xlabel) {
      svg += '<text class="miniplot-label" x="' + ((PAD_L + W - PAD_R) / 2) + '" y="' + (H - 2) +
             '" text-anchor="middle">' + esc(opts.xlabel) + '</text>';
    }
    if (opts.ylabel) {
      svg += '<text class="miniplot-label" transform="translate(9,' + ((PAD_T + H - PAD_B) / 2) +
             ') rotate(-90)" text-anchor="middle">' + esc(opts.ylabel) + '</text>';
    }

    if (marker && isFinite(marker[0]) && isFinite(marker[1]) &&
        marker[0] >= xMin && marker[0] <= xMax && marker[1] >= yMin && marker[1] <= yMax) {
      var mx = px(marker[0]), my = py(marker[1]);
      svg += '<circle class="miniplot-marker" cx="' + mx.toFixed(1) + '" cy="' + my.toFixed(1) + '" r="3.5"/>';
      if (opts.callout) {
        var anchor = mx > (W - PAD_R + PAD_L) / 2 ? "end" : "start";
        var dx = anchor === "end" ? -7 : 7;
        svg += '<text class="miniplot-callout" x="' + (mx + dx).toFixed(1) + '" y="' + (my - 7).toFixed(1) +
               '" text-anchor="' + anchor + '">' + esc(opts.callout) + '</text>';
      }
    }

    svg += '</svg>';
    return svg;
  }

  function draw(cardId, titleKey, html) {
    var card = document.getElementById(cardId);
    if (!card) return;

    var box = document.getElementById(cardId + "-plot");
    if (!box) {
      var body = card.querySelector(".card-body");
      if (!body) return;
      box = document.createElement("div");
      box.id = cardId + "-plot";
      box.className = "miniplot";
      // Sit above the validity panel when both are present.
      var validity = document.getElementById(cardId + "-validity");
      if (validity) body.insertBefore(box, validity);
      else body.appendChild(box);
    }

    box.innerHTML = html
      ? '<div class="miniplot-title">' + t(titleKey) + '</div>' + html
      : '';
  }

  // ------------------------------------------------------------------
  // Beam footprint — L(theta) = V / sin(theta)
  // ------------------------------------------------------------------
  function plotFootprint() {
    var beamV = val("fp-beam-v");          // um
    var angle = val("fp-inc-angle");       // deg
    var sampleL = val("fp-sample-len");    // mm
    if (isNaN(beamV) || beamV <= 0) return draw("card-beamline-footprint", "mp_footprint", "");

    // Sweep a window around the working point rather than the whole 0-90 range,
    // where the 1/sin divergence would flatten everything else to a line.
    var lo = 0.2, hi = 30;
    if (!isNaN(angle) && angle > 0) {
      lo = Math.max(0.05, angle / 6);
      hi = Math.min(90, Math.max(angle * 3, angle + 5));
    }

    var pts = [];
    var steps = 120;
    for (var i = 0; i <= steps; i++) {
      var a = lo + (hi - lo) * i / steps;
      var L = (beamV / 1000) / Math.sin(a * Math.PI / 180);
      pts.push([a, L]);
    }

    var marker = null, callout = "";
    if (!isNaN(angle) && angle > 0) {
      var Lm = (beamV / 1000) / Math.sin(angle * Math.PI / 180);
      marker = [angle, Lm];
      callout = Lm.toFixed(2) + " mm";
    }

    var html = svgLine(pts, marker, {
      xlabel: t("mp_x_angle"),
      ylabel: t("mp_y_footprint"),
      callout: callout
    });

    // Mark where the footprint starts spilling off the sample.
    if (html && !isNaN(sampleL) && sampleL > 0) {
      html = html.replace("</svg>",
        '<text class="miniplot-label" x="' + (W - PAD_R) + '" y="' + (PAD_T + 8) +
        '" text-anchor="end">' + t("mp_sample") + " " + sampleL + ' mm</text></svg>');
    }

    draw("card-beamline-footprint", "mp_footprint", html);
  }

  // ------------------------------------------------------------------
  // Transmittance — T(z) = exp(-mu z), and the working thickness
  // ------------------------------------------------------------------
  function plotTransmittance() {
    var thick = val("refract-thick");      // um
    var energy = val("refract-energy");    // keV
    var sel = document.getElementById("refract-mat");
    if (!sel || isNaN(energy) || energy <= 0) return draw("card-optics-refraction", "mp_transmit", "");

    var mat = MATERIALS_DB[parseInt(sel.value, 10)] || MATERIALS_DB[0];
    if (!mat) return draw("card-optics-refraction", "mp_transmit", "");

    // Same scaling the calculator itself uses.
    var beta = mat.beta_10keV * Math.pow(10.0 / energy, 3.5);
    var lambda_cm = (CONSTANTS.hc_keV_nm * 10 / energy) * 1e-8;
    var mu_cm = (4 * Math.PI * beta) / lambda_cm;
    if (!(mu_cm > 0)) return draw("card-optics-refraction", "mp_transmit", "");

    var attLen_um = (1 / mu_cm) * 1e4;
    var maxThick = isNaN(thick) || thick <= 0 ? attLen_um * 3 : Math.max(thick * 2, attLen_um * 3);

    var pts = [];
    var steps = 120;
    for (var i = 0; i <= steps; i++) {
      var z_um = maxThick * i / steps;
      pts.push([z_um, Math.exp(-mu_cm * z_um * 1e-4) * 100]);
    }

    var marker = null, callout = "";
    if (!isNaN(thick) && thick > 0) {
      var T = Math.exp(-mu_cm * thick * 1e-4) * 100;
      marker = [thick, T];
      callout = T.toFixed(1) + "%";
    }

    draw("card-optics-refraction", "mp_transmit", svgLine(pts, marker, {
      xlabel: t("mp_x_thickness"),
      ylabel: t("mp_y_transmit"),
      callout: callout,
      yZero: true
    }));
  }

  // ------------------------------------------------------------------
  // Bragg angle vs energy for the entered d-spacing
  // ------------------------------------------------------------------
  function plotBragg() {
    var d = val("bragg-r3-d");
    var e = val("bragg-r3-e");
    if (isNaN(d) || d <= 0) return draw("card-optics-bragg", "mp_bragg", "");

    // Only energies where a reflection actually exists: lambda <= 2d.
    var eMin = CONSTANTS.hc_eV_A / (2 * d * 1000);
    var lo = eMin * 1.02;
    var hi = isNaN(e) || e <= 0 ? eMin * 6 : Math.max(e * 1.8, eMin * 3);

    var pts = [];
    var steps = 120;
    for (var i = 0; i <= steps; i++) {
      var energy = lo + (hi - lo) * i / steps;
      var s = CONSTANTS.hc_eV_A / (energy * 1000) / (2 * d);
      if (s > 1) continue;
      pts.push([energy, Math.asin(s) * 180 / Math.PI]);
    }

    var marker = null, callout = "";
    if (!isNaN(e) && e > 0) {
      var sm = CONSTANTS.hc_eV_A / (e * 1000) / (2 * d);
      if (sm <= 1) {
        var th = Math.asin(sm) * 180 / Math.PI;
        marker = [e, th];
        callout = th.toFixed(2) + "°";
      }
    }

    draw("card-optics-bragg", "mp_bragg", svgLine(pts, marker, {
      xlabel: t("mp_x_energy"),
      ylabel: t("mp_y_theta"),
      callout: callout
    }));
  }

  // ------------------------------------------------------------------
  // Slit: beam FWHM growth with distance from the source
  // ------------------------------------------------------------------
  function plotSlit() {
    var source_um = val("slit-source");
    var dist_m = val("slit-dist");
    var div_urad = val("slit-div");
    if (isNaN(source_um) || isNaN(div_urad)) return draw("card-beamline-slit", "mp_slit", "");

    var maxDist = isNaN(dist_m) || dist_m <= 0 ? 40 : dist_m * 2;
    var pts = [];
    var steps = 100;
    for (var i = 0; i <= steps; i++) {
      var L = maxDist * i / steps;
      var expansion_mm = (L * 1000) * (div_urad * 1e-6);
      var fwhm = Math.sqrt(Math.pow(source_um / 1000, 2) + Math.pow(expansion_mm, 2));
      pts.push([L, fwhm]);
    }

    var marker = null, callout = "";
    if (!isNaN(dist_m) && dist_m > 0) {
      var ex = (dist_m * 1000) * (div_urad * 1e-6);
      var f = Math.sqrt(Math.pow(source_um / 1000, 2) + Math.pow(ex, 2));
      marker = [dist_m, f];
      callout = f.toFixed(2) + " mm";
    }

    draw("card-beamline-slit", "mp_slit", svgLine(pts, marker, {
      xlabel: t("mp_x_distance"),
      ylabel: t("mp_y_fwhm"),
      callout: callout,
      yZero: true
    }));
  }

  var PLOTS = [
    { fn: plotFootprint, watch: ["fp-beam-v", "fp-inc-angle", "fp-sample-len"] },
    { fn: plotTransmittance, watch: ["refract-thick", "refract-energy", "refract-mat"] },
    { fn: plotBragg, watch: ["bragg-r3-d", "bragg-r3-e"] },
    { fn: plotSlit, watch: ["slit-source", "slit-dist", "slit-div"] }
  ];

  function renderMiniPlots() {
    for (var i = 0; i < PLOTS.length; i++) {
      var spec = PLOTS[i];

      for (var w = 0; w < spec.watch.length; w++) {
        var el = document.getElementById(spec.watch[w]);
        if (!el || el.getAttribute("data-plot-bound")) continue;
        el.setAttribute("data-plot-bound", "1");
        (function (fn) {
          el.addEventListener("input", fn);
          el.addEventListener("change", fn);
        })(spec.fn);
      }

      try {
        spec.fn();
      } catch (e) {
        console.warn("Mini plot failed:", e);
      }
    }
  }

  window.renderMiniPlots = renderMiniPlots;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderMiniPlots);
  } else {
    renderMiniPlots();
  }
})();
