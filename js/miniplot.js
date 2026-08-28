/**
 * XRAY.OOGUY — Mini visualizers
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

    // A little headroom keeps the curve off the frame — but the headroom must
    // not invent values the quantity cannot take. None of these curves goes
    // negative, and a transmittance cannot pass 100%, so the axis was reading
    // "-4.37 mm" of footprint and "108 %" of transmittance.
    var dataMin = Math.min.apply(null, ys);
    var dataMax = Math.max.apply(null, ys);
    var pad = (yMax - yMin) * 0.08;
    yMin -= pad;
    yMax += pad;
    if (dataMin >= 0 && yMin < 0) yMin = 0;
    if (opts.yCap !== undefined && dataMax <= opts.yCap && yMax > opts.yCap) yMax = opts.yCap;

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
  // Gauge — one number against the limit that decides it
  // ------------------------------------------------------------------
  // Not a plot. Several cards end in a comparison rather than a curve: does the
  // scan fit in the time left, is the beam coherent across the feature. Both
  // numbers are already printed, and the reader still has to divide them in
  // their head to get the only answer they wanted — which side of the limit
  // they are on, and by how much. A bar against a tick answers that at a
  // glance and costs one row.
  //
  // Two separate facts, and they were one flag until the shading went on the
  // wrong side of an over-long scan: goodBelow is which side of the tick the
  // card wants to be on, which the physics fixes — under the limit for a scan
  // that has to finish, over it for a coherence length that has to reach
  // across the sample. pass is whether this particular number got there.
  //
  //   spec = { value, limit, pass, goodBelow, valueText, limitText, ratioText }
  function gauge(cardId, titleKey, spec) {
    if (!spec || !isFinite(spec.value) || !isFinite(spec.limit) || spec.limit <= 0 || spec.value < 0) {
      return draw(cardId, titleKey, "");
    }

    var GW = 320, GH = 44;
    var X0 = 8, X1 = GW - 8, BAR_Y = 16, BAR_H = 11;
    var span = X1 - X0;

    // Full scale is the limit plus headroom, so the tick sits well inside the
    // track and an overrun is visibly an overrun rather than a full bar.
    var ratio = spec.value / spec.limit;
    var full = Math.max(1.3, Math.min(ratio * 1.2, 4));
    var tickX = X0 + (1 / full) * span;
    var fillW = Math.max(0, Math.min(ratio / full, 1)) * span;

    var svg = '<svg viewBox="0 0 ' + GW + ' ' + GH + '" preserveAspectRatio="xMidYMid meet" role="img">';

    // Track, then the side of it that is the good side, then the fill.
    var goodBelow = spec.goodBelow !== false;
    svg += '<rect class="gauge-band" x="' + (goodBelow ? X0 : tickX).toFixed(1) + '" y="' + BAR_Y +
           '" width="' + (goodBelow ? tickX - X0 : X1 - tickX).toFixed(1) +
           '" height="' + BAR_H + '"/>';
    svg += '<rect class="gauge-track" x="' + X0 + '" y="' + BAR_Y +
           '" width="' + span + '" height="' + BAR_H + '"/>';
    svg += '<rect class="' + (spec.pass ? "gauge-fill" : "gauge-fill-over") + '" x="' + X0 +
           '" y="' + BAR_Y + '" width="' + fillW.toFixed(1) + '" height="' + BAR_H + '"/>';
    svg += '<path class="miniplot-threshold" d="M' + tickX.toFixed(1) + ',' + (BAR_Y - 3) +
           ' L' + tickX.toFixed(1) + ',' + (BAR_Y + BAR_H + 3) + '"/>';

    // Both sides are handed in already formatted: the card knows whether its
    // number is seconds, microns or a count, and this does not.
    svg += '<text class="miniplot-callout" x="' + X0 + '" y="' + (BAR_Y - 5) + '">' +
           esc(spec.valueText || "") + '</text>';
    svg += '<text class="miniplot-label" x="' + X1 + '" y="' + (BAR_Y - 5) + '" text-anchor="end">' +
           esc(spec.limitText || "") + '</text>';

    // The ratio is the sentence the whole row exists to say.
    svg += '<text class="' + (spec.pass ? "miniplot-callout" : "miniplot-label") + '" x="' + X0 +
           '" y="' + (BAR_Y + BAR_H + 13) + '">' +
           esc(spec.ratioText || (ratio < 0.01 ? "×0.01" : "×" + ratio.toFixed(2))) + '</text>';

    svg += "</svg>";
    draw(cardId, titleKey, svg);
  }

  window.renderGauge = gauge;

  // ------------------------------------------------------------------
  // Transmittance vs photon energy, over the range the model is valid in
  // ------------------------------------------------------------------
  // This used to be T against thickness, which is exp(-mu z): the attenuation
  // length printed on the card is the whole curve, and nobody needs a picture
  // of an exponential they can already read off a number.
  //
  // Against energy it says two things a number does not. How much transmission
  // another keV actually buys, which is a decision at the mono. And where the
  // model stops: beta is scaled from the tabulated 10 keV value by a power law,
  // and an absorption edge breaks it, so the curve ends at the edge instead of
  // drawing a smooth line through a step several times its own height. The
  // validity panel says the same thing in words; this makes it a wall.
  var SCALING_ANCHOR_KEV = 10;

  function plotTransmittance() {
    var thick = val("refract-thick");      // um
    var energy = val("refract-energy");    // keV
    var sel = document.getElementById("refract-mat");
    if (!sel || isNaN(thick) || thick <= 0) return draw("card-optics-refraction", "mp_transmit", "");

    var mat = MATERIALS_DB[parseInt(sel.value, 10)] || MATERIALS_DB[0];
    if (!mat || !window.muOf) return draw("card-optics-refraction", "mp_transmit", "");

    // The edge-free interval containing the anchor is where the power law is
    // the material's own curve rather than an extrapolation across a step.
    var edges = mat.edges || [];
    var lo = 1, hi = 60, loEdge = null, hiEdge = null;

    for (var i = 0; i < edges.length; i++) {
      var keV = edges[i].keV;
      if (keV < SCALING_ANCHOR_KEV && keV > lo) { lo = keV; loEdge = edges[i]; }
      if (keV > SCALING_ANCHOR_KEV && keV < hi) { hi = keV; hiEdge = edges[i]; }
    }
    if (!(hi > lo)) return draw("card-optics-refraction", "mp_transmit", "");

    // Beryllium is edge-free from 1 to 60 keV, and 50 of those keV are a flat
    // line at 100%. Zoom to a factor of three either side of where the card is
    // working — but never past an edge, which is the one boundary that means
    // something. An end that is still an edge keeps its label; one the zoom
    // pulled inwards does not, or the plot would name an edge that is not there.
    if (!isNaN(energy) && energy > 0) {
      var zoomLo = Math.max(lo, energy / 3);
      var zoomHi = Math.min(hi, energy * 3);
      if (zoomHi > zoomLo) {
        if (zoomLo > lo) { lo = zoomLo; loEdge = null; }
        if (zoomHi < hi) { hi = zoomHi; hiEdge = null; }
      }
    }

    var pts = [];
    for (i = 0; i <= 120; i++) {
      var E = lo + (hi - lo) * i / 120;
      var mu_cm = window.muOf(mat, E);
      if (!(mu_cm > 0)) continue;
      pts.push([E, Math.exp(-mu_cm * thick * 1e-4) * 100]);
    }

    var marker = null, callout = "";
    if (!isNaN(energy) && energy > lo && energy < hi) {
      var muHere = window.muOf(mat, energy);
      if (muHere > 0) {
        var T = Math.exp(-muHere * thick * 1e-4) * 100;
        marker = [energy, T];
        callout = T.toFixed(1) + "%";
      }
    }

    var html = svgLine(pts, marker, {
      xlabel: t("mp_x_energy"),
      ylabel: t("mp_y_transmit"),
      callout: callout,
      yZero: true,
      yCap: 100        // per cent
    });

    // The ends of the axis are the edges themselves, so they are named there.
    if (html) {
      var edgeText = "";
      if (loEdge) {
        edgeText += '<text class="miniplot-label" x="' + (PAD_L + 2) + '" y="' + (PAD_T + 8) + '">' +
          esc(loEdge.n + " " + loEdge.keV.toFixed(3)) + "</text>";
      }
      if (hiEdge) {
        edgeText += '<text class="miniplot-label" x="' + (W - PAD_R - 2) + '" y="' + (PAD_T + 8) +
          '" text-anchor="end">' + esc(hiEdge.n + " " + hiEdge.keV.toFixed(3)) + "</text>";
      }
      if (edgeText) html = html.replace("</svg>", edgeText + "</svg>");
    }

    draw("card-optics-refraction", "mp_transmit", html);
  }

  // ------------------------------------------------------------------
  // CDI / BCDI: where the oversampling condition starts being met
  // ------------------------------------------------------------------
  // sigma = lambda D / (S p) is linear in the detector distance, so the line
  // itself says little. The useful part is where it crosses 2: that reads off
  // as "move the detector to at least this far", which is the decision being
  // made at the instrument. The pass and caution bands are drawn behind it and
  // the required distance is stated outright.
  function plotCDI() {
    var energy = val("cdi-energy");        // keV
    var dist = val("cdi-dist");            // m
    var pixel = val("cdi-pixel");          // um
    var sample = val("cdi-sample-size");   // nm

    if (isNaN(energy) || energy <= 0 || isNaN(pixel) || pixel <= 0 || isNaN(sample) || sample <= 0) {
      return draw("card-beamline-cdi", "mp_cdi", "");
    }

    var lambda_nm = CONSTANTS.hc_keV_nm / energy;

    // sigma at a detector distance in metres.
    function sigmaAt(D_m) {
      var speckle_um = ((lambda_nm * (D_m * 1e9)) / sample) / 1000;
      return speckle_um / pixel;
    }

    var needed = sigmaAt(1) > 0 ? 2 / sigmaAt(1) : NaN;   // metres for sigma = 2
    if (!isFinite(needed) || needed <= 0) return draw("card-beamline-cdi", "mp_cdi", "");

    // Show the crossing whether or not the current distance reaches it.
    var hi = Math.max(needed * 1.8, isNaN(dist) ? 0 : dist * 1.4);
    var pts = [];
    for (var i = 0; i <= 100; i++) {
      var D = hi * i / 100;
      pts.push([D, sigmaAt(D)]);
    }

    var marker = null, callout = "";
    if (!isNaN(dist) && dist > 0) {
      marker = [dist, sigmaAt(dist)];
      callout = "σ " + sigmaAt(dist).toFixed(2);
    }

    var html = svgLine(pts, marker, {
      xlabel: t("mp_x_det_distance"),
      ylabel: t("mp_y_sigma"),
      callout: callout,
      yZero: true
    });

    if (html) {
      var yMax = sigmaAt(hi) * 1.08;
      var top = PAD_T, bottom = H - PAD_B;
      function py(v) { return bottom - (v / yMax) * (bottom - top); }
      function px(D) { return PAD_L + (D / hi) * (W - PAD_L - PAD_R); }

      var bands =
        '<rect class="miniplot-band-ok" x="' + PAD_L + '" y="' + py(yMax).toFixed(1) +
          '" width="' + (W - PAD_L - PAD_R) + '" height="' + (py(2) - py(yMax)).toFixed(1) + '"/>' +
        '<rect class="miniplot-band-warn" x="' + PAD_L + '" y="' + py(2).toFixed(1) +
          '" width="' + (W - PAD_L - PAD_R) + '" height="' + (py(1.5) - py(2)).toFixed(1) + '"/>' +
        '<path class="miniplot-threshold" d="M' + PAD_L + ',' + py(2).toFixed(1) +
          ' L' + (W - PAD_R) + ',' + py(2).toFixed(1) + '"/>' +
        '<text class="miniplot-label" x="' + (PAD_L + 3) + '" y="' + (py(2) - 3).toFixed(1) + '">σ = 2</text>';

      // Bands go behind the curve.
      html = html.replace('<path class="miniplot-curve"', bands + '<path class="miniplot-curve"');

      html = html.replace("</svg>",
        '<text class="miniplot-callout" x="' + (W - PAD_R) + '" y="' + (H - PAD_B - 6) +
        '" text-anchor="end">' + esc(t("mp_cdi_needs") + " " + needed.toFixed(2) + " m") + "</text></svg>");
    }

    draw("card-beamline-cdi", "mp_cdi", html);
  }

  // ------------------------------------------------------------------
  // Lattice: where this cell puts its reflections
  // ------------------------------------------------------------------
  // Not a curve — a stick at every accessible reflection, which is what the
  // detector will actually see. Called by lattice.js, which owns the rows.
  function plotReflections(rows) {
    if (!rows || !rows.length) return draw("card-lattice-dspacing", "mp_refl", "");

    var sticks = [];
    for (var i = 0; i < rows.length; i++) {
      if (isFinite(rows[i].twoTheta)) sticks.push(rows[i]);
    }
    if (sticks.length < 2) return draw("card-lattice-dspacing", "mp_refl", "");

    var maxTT = sticks[0].twoTheta;
    for (i = 0; i < sticks.length; i++) maxTT = Math.max(maxTT, sticks[i].twoTheta);
    var hi = Math.min(180, Math.ceil(maxTT / 10) * 10 + 10);

    function px(tt) { return PAD_L + (tt / hi) * (W - PAD_L - PAD_R); }

    var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet" role="img">';
    svg += '<path class="miniplot-axis" d="M' + PAD_L + ',' + (H - PAD_B) +
           ' L' + (W - PAD_R) + ',' + (H - PAD_B) + '"/>';

    // Low-angle reflections are the strong ones in practice, so height carries
    // d-spacing rank rather than a structure factor this page does not compute.
    for (i = 0; i < sticks.length; i++) {
      var frac = 1 - (i / sticks.length) * 0.55;
      var x = px(sticks[i].twoTheta).toFixed(1);
      var top = (H - PAD_B) - frac * (H - PAD_B - PAD_T - 12);
      svg += '<path class="miniplot-stick" d="M' + x + ',' + (H - PAD_B) + ' L' + x + ',' + top.toFixed(1) + '"/>';
      if (i < 4) {
        svg += '<text class="miniplot-label" x="' + x + '" y="' + (top - 3).toFixed(1) +
               '" text-anchor="middle">' +
               esc(sticks[i].h + "" + sticks[i].k + "" + sticks[i].l) + "</text>";
      }
    }

    for (var tick = 0; tick <= hi; tick += (hi > 120 ? 30 : 20)) {
      svg += '<text class="miniplot-label" x="' + px(tick).toFixed(1) + '" y="' + (H - PAD_B + 12) +
             '" text-anchor="middle">' + tick + "</text>";
    }

    svg += '<text class="miniplot-label" x="' + ((PAD_L + W - PAD_R) / 2) + '" y="' + (H - 2) +
           '" text-anchor="middle">' + esc(t("mp_x_twotheta")) + "</text>";
    svg += "</svg>";

    draw("card-lattice-dspacing", "mp_refl", svg);
  }

  window.renderReflectionPlot = plotReflections;

  // Three plots left, and each is here because it answers something the numbers
  // beside it do not: where the material stops transmitting, how far the
  // detector has to go, and which reflections land in the range being scanned.
  //
  // Two were dropped. Bragg angle against energy is a monotone curve with no
  // threshold on it, and the angle the card prints was the only part anyone
  // read. Footprint against angle sat under a scale drawing of the same beam
  // hitting the same sample — the schematic shows the geometry better than a
  // 1/sin curve does, and the one thing the curve knew that the drawing did
  // not is the shallowest angle that still fits, which is a number, so it is
  // printed as one.
  var PLOTS = [
    { fn: plotTransmittance, watch: ["refract-thick", "refract-energy", "refract-mat"] },
    { fn: plotCDI, watch: ["cdi-energy", "cdi-dist", "cdi-pixel", "cdi-sample-size"] }
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
