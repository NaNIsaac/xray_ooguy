/**
 * XRAY.OOGUY — DATA
 *
 * Reads two-column scan files off the beamline PC and plots them. The three
 * jobs it exists for, in order of how often they come up:
 *
 *   1. "what does this scan look like"     — drop a file, get an XY plot
 *   2. "on a log axis, cropped to the fringes, normalised"
 *   3. "these four XRR segments are one curve" — stitch them
 *
 * Everything is derived, never destructive: the parsed columns are kept as
 * read, and scale / crop / normalisation are applied on the way to the plot.
 * Changing a knob re-derives; nothing has to be re-imported.
 *
 * The name DataView is deliberately avoided — window.DataView is the typed
 * array builtin, and shadowing it breaks anything that later reaches for it.
 *
 * Compatibility: CentOS 7 (Firefox 60 ESR, Chrome 60~70) — ES5 syntax only.
 */

(function () {
  "use strict";

  function t(key) {
    return (window.i18n && window.i18n.t) ? window.i18n.t(key) : key;
  }

  function esc(str) {
    return String(str)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // ------------------------------------------------------------------
  // State
  // ------------------------------------------------------------------
  var traces = [];          // parsed files, in load order
  var nextId = 1;
  var nextColor = 0;        // never reused: removing a trace must not recolour the rest
  var pending = 0;          // FileReaders still running

  var opts = {
    yScale: "linear",       // linear | log
    norm: "none",           // none | max | xrr
    xMin: null,
    xMax: null
  };

  var PALETTE = 6;          // dv-c1 .. dv-c6 in style.css

  // ------------------------------------------------------------------
  // Parsing
  // ------------------------------------------------------------------
  // Anything a beamline control system might leave at the top of a scan file.
  // ';' is only a comment when it opens the line, because it is also a
  // plausible delimiter.
  var COMMENT = /^\s*(#|%|!|\/\/|\*|;)/;

  // Fortran writes 1.0D-3 where C writes 1.0e-3.
  var NUMBER = /^[+-]?(\d+\.?\d*|\.\d+)([eEdDqQ][+-]?\d+)?$/;

  function isComment(line) {
    return COMMENT.test(line);
  }

  function toNumber(token) {
    if (!token) return NaN;
    var s = token.replace(/^["']|["']$/g, "").replace(/[dDqQ]/, "e");
    if (!NUMBER.test(token.replace(/^["']|["']$/g, ""))) return NaN;
    return parseFloat(s);
  }

  function isNumeric(token) {
    return !isNaN(toNumber(token));
  }

  var DELIMS = [
    { name: "tab", re: /\t/ },
    { name: "comma", re: /\s*,\s*/ },
    { name: "semicolon", re: /\s*;\s*/ },
    { name: "whitespace", re: /\s+/ }
  ];

  // A trailing delimiter — "20, 465," — leaves an empty field that is not a
  // column. Instrument exports do this constantly.
  function splitLine(line, delim) {
    var f = line.replace(/^\s+|\s+$/g, "").split(delim.re);
    while (f.length > 2 && f[f.length - 1] === "") f.pop();
    return f;
  }

  function numericFields(fields) {
    var n = 0;
    for (var i = 0; i < fields.length; i++) if (isNumeric(fields[i])) n++;
    return n;
  }

  /**
   * The longest unbroken run of lines that split into the same number of
   * fields, at least two of them numeric.
   *
   * This is what finds the data inside a file that is mostly not data. A
   * Bruker RAW4 export opens with 200-odd lines of "Alpha1=1.5406" before it
   * reaches [Data]; Rigaku, PANalytical and SPEC all have their own preamble.
   * None of them are worth recognising by name — the numbers are always the
   * one long stretch of structurally identical lines, whatever sits above.
   */
  function longestRun(lines, delim) {
    var best = { start: -1, end: -1, ncol: 0, count: 0 };
    var runStart = -1, runCol = -1, runCount = 0;

    for (var i = 0; i < lines.length; i++) {
      var f = splitLine(lines[i], delim);
      var ok = f.length >= 2 && numericFields(f) >= 2;

      if (ok && f.length === runCol) {
        runCount++;
      } else if (ok) {
        runStart = i; runCol = f.length; runCount = 1;
      } else {
        runCount = 0; runCol = -1;
        continue;
      }

      if (runCount > best.count) {
        best = { start: runStart, end: i, ncol: runCol, count: runCount };
      }
    }
    return best;
  }

  /**
   * The delimiter that finds the longest data block wins. Ties go to whichever
   * comes first in DELIMS, so a comma file whose columns are also space-padded
   * is read as comma-separated rather than by its padding.
   */
  function detectDelimiter(lines) {
    var best = null;
    for (var d = 0; d < DELIMS.length; d++) {
      var run = longestRun(lines, DELIMS[d]);
      if (!best || run.count > best.run.count) best = { delim: DELIMS[d], run: run };
    }
    return best;
  }

  function allNumeric(fields) {
    if (!fields.length) return false;
    for (var i = 0; i < fields.length; i++) {
      if (fields[i] !== "" && !isNumeric(fields[i])) return false;
    }
    return true;
  }

  function stripCommentMark(line) {
    return line.replace(/^\s*(#|%|!|\/\/|\*|;)+\s*/, "");
  }

  /**
   * text -> { name, colNames[], cols[][], delimiter, skipped }
   *
   * Column names come from a header row when there is one, and otherwise from
   * the last comment line above the data — "# 2theta  intensity" is the usual
   * way a scan file labels itself.
   */
  function parseText(text, name) {
    var raw = text.split(/\r\n|\r|\n/);
    var lines = [];
    var i, c;

    // Blank lines carry no structure and would otherwise break a run in two.
    for (i = 0; i < raw.length; i++) {
      if (raw[i].replace(/\s+/g, "")) lines.push(raw[i]);
    }
    if (!lines.length) return null;

    var found = detectDelimiter(lines);
    if (!found || found.run.count < 2) return null;

    var delim = found.delim;
    var ncol = found.run.ncol;

    // The run establishes the shape; the block is then every line of that
    // shape from the first to the last, so one corrupt row in the middle of a
    // scan costs that row rather than everything after it.
    var first = -1, last = -1;
    for (i = 0; i < lines.length; i++) {
      var f = splitLine(lines[i], delim);
      if (f.length !== ncol || numericFields(f) < 2) continue;
      if (first < 0) first = i;
      last = i;
    }
    if (first < 0) return null;

    // Column names come from the line directly above the block, whether that
    // is a header row or a comment. It has to have the same number of fields
    // as the data — otherwise it is prose, not labels.
    var colNames = null;
    if (first > 0) {
      var prev = lines[first - 1];
      var cand = splitLine(isComment(prev) ? stripCommentMark(prev) : prev, delim);
      if (cand.length === ncol && !allNumeric(cand)) colNames = cand;
    }

    var cols = [];
    for (c = 0; c < ncol; c++) cols.push([]);
    var skipped = 0;

    for (i = first; i <= last; i++) {
      var row = splitLine(lines[i], delim);
      if (row.length !== ncol || numericFields(row) < 2) { skipped++; continue; }
      for (c = 0; c < ncol; c++) cols[c].push(toNumber(row[c]));
    }
    if (!cols[0].length) return null;

    var names = [];
    for (c = 0; c < ncol; c++) {
      var label = colNames && colNames[c] ? String(colNames[c]).replace(/^["']|["']$/g, "") : "";
      names.push(label || ("col " + (c + 1)));
    }

    return {
      name: name,
      colNames: names,
      cols: cols,
      delimiter: delim.name,
      hasHeader: !!colNames,
      skipped: skipped,
      // Everything above the block: an instrument preamble, not an error.
      preamble: first - (colNames ? 1 : 0)
    };
  }

  // ------------------------------------------------------------------
  // Derived series
  // ------------------------------------------------------------------
  function effScale(tr) {
    return (tr.manualScale !== null && isFinite(tr.manualScale)) ? tr.manualScale : tr.autoScale;
  }

  // Raw (x, y) pairs for a trace, ascending in x, non-finite points dropped.
  function seriesOf(tr) {
    var xs = tr.cols[tr.xcol] || [];
    var ys = tr.cols[tr.ycol] || [];
    var pts = [];
    var n = Math.min(xs.length, ys.length);
    for (var i = 0; i < n; i++) {
      if (isFinite(xs[i]) && isFinite(ys[i])) pts.push([xs[i], ys[i]]);
    }
    pts.sort(function (a, b) { return a[0] - b[0]; });
    return pts;
  }

  function scaledSeries(tr) {
    var pts = seriesOf(tr);
    var s = effScale(tr);
    var out = [];
    for (var i = 0; i < pts.length; i++) out.push([pts[i][0], pts[i][1] * s]);
    return out;
  }

  function inCrop(x) {
    if (opts.xMin !== null && x < opts.xMin) return false;
    if (opts.xMax !== null && x > opts.xMax) return false;
    return true;
  }

  function croppedSeries(tr) {
    var pts = scaledSeries(tr);
    if (opts.xMin === null && opts.xMax === null) return pts;
    var out = [];
    for (var i = 0; i < pts.length; i++) if (inCrop(pts[i][0])) out.push(pts[i]);
    return out;
  }

  function visibleTraces() {
    var out = [];
    for (var i = 0; i < traces.length; i++) if (traces[i].visible) out.push(traces[i]);
    return out;
  }

  function median(arr) {
    if (!arr.length) return NaN;
    var s = arr.slice().sort(function (a, b) { return a - b; });
    var mid = Math.floor(s.length / 2);
    return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
  }

  /**
   * Normalisation is one factor for every trace, not one per trace: after
   * stitching the segments are a single curve, and per-trace factors would
   * pull it apart again.
   *
   *   max  — the largest value in view becomes 1
   *   xrr  — the total-reflection plateau becomes 1. Taken as the median of
   *          the lowest-angle points, so a spike on the first point of the
   *          scan cannot set the scale for the whole curve.
   */
  function normFactor() {
    if (opts.norm === "none") return 1;

    var all = [];
    var vis = visibleTraces();
    for (var i = 0; i < vis.length; i++) {
      var pts = croppedSeries(vis[i]);
      for (var j = 0; j < pts.length; j++) all.push(pts[j]);
    }
    if (!all.length) return 1;

    if (opts.norm === "max") {
      var mx = -Infinity;
      for (i = 0; i < all.length; i++) if (all[i][1] > mx) mx = all[i][1];
      return (isFinite(mx) && mx > 0) ? 1 / mx : 1;
    }

    // xrr
    all.sort(function (a, b) { return a[0] - b[0]; });
    var n = Math.max(3, Math.round(all.length * 0.02));
    n = Math.min(n, all.length);
    var head = [];
    for (i = 0; i < n; i++) head.push(all[i][1]);
    var plateau = median(head);
    return (isFinite(plateau) && plateau > 0) ? 1 / plateau : 1;
  }

  // Everything the plot and the export both need: final points per trace.
  function finalSeries() {
    var f = normFactor();
    var out = [];
    var vis = visibleTraces();
    for (var i = 0; i < vis.length; i++) {
      var pts = croppedSeries(vis[i]);
      var scaled = [];
      for (var j = 0; j < pts.length; j++) scaled.push([pts[j][0], pts[j][1] * f]);
      out.push({ trace: vis[i], points: scaled });
    }
    return out;
  }

  // ------------------------------------------------------------------
  // Stitching
  // ------------------------------------------------------------------
  function interpAt(pts, x) {
    if (!pts.length) return NaN;
    if (x < pts[0][0] || x > pts[pts.length - 1][0]) return NaN;

    var lo = 0, hi = pts.length - 1;
    while (hi - lo > 1) {
      var mid = (lo + hi) >> 1;
      if (pts[mid][0] <= x) lo = mid; else hi = mid;
    }
    var x0 = pts[lo][0], x1 = pts[hi][0];
    if (x1 === x0) return pts[lo][1];
    var f = (x - x0) / (x1 - x0);
    return pts[lo][1] + f * (pts[hi][1] - pts[lo][1]);
  }

  /**
   * XRR is measured in segments, each with a different absorber, so each
   * segment is the true reflectivity times an unknown constant. Where two
   * segments overlap in angle they measure the same thing, so the ratio of
   * their counts across the overlap *is* that constant.
   *
   * The median of the point-by-point ratio is used rather than the mean: the
   * far end of a segment is where counting statistics are worst, and one bad
   * point there would otherwise drag the whole segment.
   *
   * Scales are cumulative — each segment is matched to the curve already
   * assembled, not to its immediate neighbour alone — so an error does not
   * simply repeat down the chain.
   */
  function autoStitch() {
    var vis = visibleTraces();
    if (vis.length < 2) {
      if (window.showToast) window.showToast(t("dv_stitch_need2"), "info");
      return;
    }

    var order = vis.slice().sort(function (a, b) {
      var pa = seriesOf(a), pb = seriesOf(b);
      if (!pa.length) return 1;
      if (!pb.length) return -1;
      return pa[0][0] - pb[0][0];
    });

    var acc = [];
    var noOverlap = 0;

    for (var i = 0; i < order.length; i++) {
      var tr = order[i];
      var pts = seriesOf(tr);
      if (!pts.length) continue;

      if (!acc.length) {
        tr.autoScale = 1;
        tr.overlap = null;
        tr.anchor = true;
      } else {
        tr.anchor = false;
        var accMax = acc[acc.length - 1][0];
        var ratios = [];

        for (var j = 0; j < pts.length; j++) {
          if (pts[j][0] > accMax) break;
          var prev = interpAt(acc, pts[j][0]);
          if (isFinite(prev) && prev > 0 && pts[j][1] > 0) ratios.push(prev / pts[j][1]);
        }

        if (ratios.length >= 2) {
          tr.autoScale = median(ratios);
          tr.overlap = { lo: pts[0][0], hi: accMax, n: ratios.length };
        } else {
          tr.autoScale = 1;
          tr.overlap = null;
          noOverlap++;
        }
      }

      var s = effScale(tr);
      for (j = 0; j < pts.length; j++) acc.push([pts[j][0], pts[j][1] * s]);
      acc.sort(function (a, b) { return a[0] - b[0]; });
    }

    render();

    if (noOverlap) {
      if (window.showToast) window.showToast(t("dv_stitch_gap"), "warning");
    } else if (window.showToast) {
      window.showToast(t("dv_stitch_done"), "success");
    }
  }

  // ------------------------------------------------------------------
  // Plot
  // ------------------------------------------------------------------
  var W = 760, H = 430;
  var PAD_L = 74, PAD_R = 18, PAD_T = 18, PAD_B = 50;

  function fmtTick(v) {
    var a = Math.abs(v);
    if (a === 0) return "0";
    if (a >= 1e5 || a < 1e-3) return v.toExponential(0);
    if (a >= 100) return String(Math.round(v * 100) / 100);
    if (a >= 1) return String(Math.round(v * 1000) / 1000);
    return String(Math.round(v * 1e5) / 1e5);
  }

  // 1, 2, 5, 10 ... steps — the spacings that read as round numbers on an axis.
  function niceTicks(min, max, target) {
    if (!(isFinite(min) && isFinite(max)) || max <= min) return [min];
    var raw = (max - min) / (target || 6);
    var mag = Math.pow(10, Math.floor(Math.log(raw) / Math.LN10));
    var norm = raw / mag;
    var step = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag;

    var out = [];
    var v = Math.ceil(min / step) * step;
    for (; v <= max + step * 0.001 && out.length < 24; v += step) {
      out.push(Math.abs(v) < step * 1e-9 ? 0 : v);
    }
    return out;
  }

  // Decades, thinned when the span is wide, with 2/5 sub-ticks when it is narrow.
  function logTicks(lo, hi) {
    var d0 = Math.floor(lo), d1 = Math.ceil(hi);
    var decades = d1 - d0;
    var out = [];
    var every = decades > 10 ? Math.ceil(decades / 8) : 1;

    for (var d = d0; d <= d1; d += every) {
      var base = Math.pow(10, d);
      if (d >= lo - 1e-9 && d <= hi + 1e-9) out.push(base);
      if (decades <= 3) {
        var subs = [2, 5];
        for (var s = 0; s < subs.length; s++) {
          var lv = Math.log(base * subs[s]) / Math.LN10;
          if (lv >= lo && lv <= hi) out.push(base * subs[s]);
        }
      }
    }
    return out;
  }

  function buildPlot() {
    var series = finalSeries();
    var useLog = opts.yScale === "log";

    var xs = [], ys = [];
    var dropped = 0;
    var i, j;

    for (i = 0; i < series.length; i++) {
      var pts = series[i].points;
      for (j = 0; j < pts.length; j++) {
        if (useLog && pts[j][1] <= 0) { dropped++; continue; }
        xs.push(pts[j][0]);
        ys.push(useLog ? Math.log(pts[j][1]) / Math.LN10 : pts[j][1]);
      }
    }

    if (xs.length < 2) {
      return { svg: "", empty: true, dropped: dropped };
    }

    var xMin = Math.min.apply(null, xs), xMax = Math.max.apply(null, xs);
    var yMin = Math.min.apply(null, ys), yMax = Math.max.apply(null, ys);
    if (xMax === xMin) xMax = xMin + 1;
    if (yMax === yMin) yMax = yMin + 1;

    var padY = (yMax - yMin) * 0.06;
    yMin -= padY;
    yMax += padY;

    function px(x) { return PAD_L + (x - xMin) / (xMax - xMin) * (W - PAD_L - PAD_R); }
    function py(y) { return H - PAD_B - (y - yMin) / (yMax - yMin) * (H - PAD_T - PAD_B); }

    var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet" role="img" class="dv-svg">';

    // Gridlines and their labels
    var yt = useLog ? logTicks(yMin, yMax) : niceTicks(yMin, yMax, 6);
    for (i = 0; i < yt.length; i++) {
      var yv = useLog ? Math.log(yt[i]) / Math.LN10 : yt[i];
      if (yv < yMin || yv > yMax) continue;
      var gy = py(yv).toFixed(1);
      svg += '<path class="dv-grid" d="M' + PAD_L + ',' + gy + ' L' + (W - PAD_R) + ',' + gy + '"/>';
      svg += '<text class="dv-tick" x="' + (PAD_L - 6) + '" y="' + (parseFloat(gy) + 3.5).toFixed(1) +
             '" text-anchor="end">' + esc(fmtTick(yt[i])) + '</text>';
    }

    var xt = niceTicks(xMin, xMax, 7);
    for (i = 0; i < xt.length; i++) {
      if (xt[i] < xMin || xt[i] > xMax) continue;
      var gx = px(xt[i]).toFixed(1);
      svg += '<path class="dv-grid" d="M' + gx + ',' + PAD_T + ' L' + gx + ',' + (H - PAD_B) + '"/>';
      svg += '<text class="dv-tick" x="' + gx + '" y="' + (H - PAD_B + 15) +
             '" text-anchor="middle">' + esc(fmtTick(xt[i])) + '</text>';
    }

    svg += '<path class="dv-axis" d="M' + PAD_L + ',' + PAD_T + ' L' + PAD_L + ',' + (H - PAD_B) +
           ' L' + (W - PAD_R) + ',' + (H - PAD_B) + '"/>';

    // Curves
    for (i = 0; i < series.length; i++) {
      var d = "";
      var open = false;
      var sp = series[i].points;

      for (j = 0; j < sp.length; j++) {
        var yv2 = sp[j][1];
        if (useLog && yv2 <= 0) { open = false; continue; }   // gap, not a jump to zero
        var Y = useLog ? Math.log(yv2) / Math.LN10 : yv2;
        d += (open ? " L" : "M") + px(sp[j][0]).toFixed(1) + "," + py(Y).toFixed(1);
        open = true;
      }
      if (d) {
        svg += '<path class="dv-curve dv-c' + ((series[i].trace.color % PALETTE) + 1) +
               '" d="' + d + '"/>';
      }
    }

    // Axis labels come from the columns actually plotted.
    var first = series.length ? series[0].trace : null;
    var xlabel = first ? first.colNames[first.xcol] : "x";
    var ylabel = first ? first.colNames[first.ycol] : "y";
    if (opts.norm !== "none") ylabel = ylabel + " (" + t("dv_norm_short") + ")";
    if (useLog) ylabel = "log₁₀ " + ylabel;

    svg += '<text class="dv-axis-label" x="' + ((PAD_L + W - PAD_R) / 2) + '" y="' + (H - 8) +
           '" text-anchor="middle">' + esc(xlabel) + '</text>';
    svg += '<text class="dv-axis-label" transform="translate(15,' + ((PAD_T + H - PAD_B) / 2) +
           ') rotate(-90)" text-anchor="middle">' + esc(ylabel) + '</text>';

    svg += '</svg>';
    return { svg: svg, empty: false, dropped: dropped, xMin: xMin, xMax: xMax };
  }

  // ------------------------------------------------------------------
  // Rendering
  // ------------------------------------------------------------------
  function el(id) { return document.getElementById(id); }

  function renderPlot() {
    var box = el("dv-plot");
    if (!box) return;

    var res = buildPlot();
    if (res.empty) {
      box.innerHTML = '<div class="dv-empty">' + esc(t(traces.length ? "dv_empty_series" : "dv_empty_none")) + "</div>";
      return;
    }

    var note = "";
    if (res.dropped) {
      note = '<div class="dv-note mono">' + esc(t("dv_log_dropped").replace("{n}", res.dropped)) + "</div>";
    }
    box.innerHTML = res.svg + note;
  }

  function fmtScale(v) {
    if (!isFinite(v)) return "-";
    if (v === 1) return "1";
    var a = Math.abs(v);
    if (a >= 1e4 || a < 1e-3) return v.toExponential(3);
    return String(Math.round(v * 1e6) / 1e6);
  }

  function renderTraces() {
    var box = el("dv-traces");
    if (!box) return;

    if (!traces.length) {
      box.innerHTML = '<div class="dv-empty">' + esc(t("dv_no_files")) + "</div>";
      return;
    }

    var html = '<table class="lab-table dv-table"><thead><tr>' +
      "<th></th>" +
      "<th>" + esc(t("dv_col_file")) + "</th>" +
      "<th>" + esc(t("dv_col_x")) + "</th>" +
      "<th>" + esc(t("dv_col_y")) + "</th>" +
      '<th class="dv-num">' + esc(t("dv_col_range")) + "</th>" +
      '<th class="dv-num">' + esc(t("dv_col_pts")) + "</th>" +
      '<th class="dv-num">' + esc(t("dv_col_scale")) + "</th>" +
      "<th></th></tr></thead><tbody>";

    for (var i = 0; i < traces.length; i++) {
      var tr = traces[i];
      var pts = seriesOf(tr);
      var range = pts.length
        ? fmtTick(pts[0][0]) + " – " + fmtTick(pts[pts.length - 1][0])
        : "-";

      var colSel = function (which) {
        var sel = '<select class="form-control form-control-xs" onchange="dvSetColumn(' + tr.id + ",'" + which + "',this.value)\">";
        for (var c = 0; c < tr.colNames.length; c++) {
          var on = (which === "x" ? tr.xcol : tr.ycol) === c;
          sel += '<option value="' + c + '"' + (on ? " selected" : "") + ">" + esc(tr.colNames[c]) + "</option>";
        }
        return sel + "</select>";
      };

      var manual = tr.manualScale !== null;
      var scaleCell = '<input type="text" class="form-control form-control-xs mono dv-scale' +
        (manual ? " dv-scale-manual" : "") + '" value="' + esc(fmtScale(effScale(tr))) +
        '" onchange="dvSetScale(' + tr.id + ',this.value)" spellcheck="false">';

      var overlapNote = "";
      if (tr.anchor) {
        overlapNote = '<span class="dv-badge">' + esc(t("dv_anchor")) + "</span>";
      } else if (tr.overlap) {
        overlapNote = '<span class="dv-badge">' + esc(t("dv_overlap")) + " " +
          fmtTick(tr.overlap.lo) + "–" + fmtTick(tr.overlap.hi) + " / " + tr.overlap.n + "</span>";
      } else if (manual) {
        overlapNote = '<span class="dv-badge dv-badge-warn">' + esc(t("dv_manual")) + "</span>";
      }

      html += "<tr" + (tr.visible ? "" : ' class="dv-hidden"') + ">" +
        '<td><span class="dv-swatch dv-c' + ((tr.color % PALETTE) + 1) + '"></span></td>' +
        '<td><label class="dv-file-label"><input type="checkbox"' + (tr.visible ? " checked" : "") +
          ' onchange="dvToggleTrace(' + tr.id + ')"> <span class="mono">' + esc(tr.name) + "</span></label>" +
          '<div class="dv-meta mono">' + esc(tr.delimiter) + " · " +
          esc(t(tr.hasHeader ? "dv_header_yes" : "dv_header_no")) +
          (tr.preamble ? " · " + t("dv_preamble").replace("{n}", tr.preamble) : "") +
          (tr.skipped ? " · " + t("dv_skipped").replace("{n}", tr.skipped) : "") + "</div></td>" +
        "<td>" + colSel("x") + "</td>" +
        "<td>" + colSel("y") + "</td>" +
        '<td class="dv-num mono">' + esc(range) + "</td>" +
        '<td class="dv-num mono">' + pts.length + "</td>" +
        '<td class="dv-num">' + scaleCell + overlapNote + "</td>" +
        '<td><button class="btn btn-xs btn-secondary" onclick="dvRemoveTrace(' + tr.id + ')">×</button></td>' +
        "</tr>";
    }

    box.innerHTML = html + "</tbody></table>";
  }

  function renderSummary() {
    var box = el("dv-summary");
    if (!box) return;

    var series = finalSeries();
    var n = 0;
    for (var i = 0; i < series.length; i++) n += series[i].points.length;

    if (!n) { box.innerHTML = ""; return; }

    var f = normFactor();
    var parts = [
      t("dv_sum_traces") + " " + series.length,
      t("dv_sum_points") + " " + n,
      t("dv_sum_yaxis") + " " + t(opts.yScale === "log" ? "dv_y_log" : "dv_y_linear")
    ];
    if (opts.norm !== "none") {
      parts.push(t("dv_sum_norm") + " ×" + fmtScale(f));
    }
    box.innerHTML = '<span class="mono">' + esc(parts.join("   ·   ")) + "</span>";
  }

  function render() {
    renderTraces();
    renderPlot();
    renderSummary();
  }

  // ------------------------------------------------------------------
  // File input
  // ------------------------------------------------------------------
  // Columns 1 and 2 are the usual answer, but a results table can open with a
  // label column. Default to the first two columns that actually hold numbers.
  function defaultColumns(cols) {
    var usable = [];
    for (var c = 0; c < cols.length; c++) {
      var finite = 0;
      for (var i = 0; i < cols[c].length; i++) if (isFinite(cols[c][i])) finite++;
      if (finite > cols[c].length * 0.9) usable.push(c);
      if (usable.length === 2) break;
    }
    return {
      x: usable.length > 0 ? usable[0] : 0,
      y: usable.length > 1 ? usable[1] : Math.min(1, cols.length - 1)
    };
  }

  function addParsed(parsed) {
    if (!parsed) return;
    var pick = defaultColumns(parsed.cols);
    traces.push({
      id: nextId++,
      name: parsed.name,
      colNames: parsed.colNames,
      cols: parsed.cols,
      delimiter: parsed.delimiter,
      hasHeader: parsed.hasHeader,
      skipped: parsed.skipped,
      preamble: parsed.preamble,
      xcol: pick.x,
      ycol: pick.y,
      autoScale: 1,
      manualScale: null,
      overlap: null,
      anchor: false,
      visible: true,
      color: nextColor++
    });
  }

  function readFiles(fileList) {
    if (!fileList || !fileList.length) return;
    if (typeof FileReader === "undefined") {
      if (window.showToast) window.showToast(t("dv_no_filereader"), "warning");
      return;
    }

    for (var i = 0; i < fileList.length; i++) {
      (function (file) {
        var reader = new FileReader();
        pending++;

        reader.onload = function (e) {
          var text = e.target && e.target.result ? String(e.target.result) : "";
          var parsed = null;
          try {
            parsed = parseText(text, file.name);
          } catch (err) {
            parsed = null;
          }

          if (parsed) addParsed(parsed);
          else if (window.showToast) window.showToast(t("dv_parse_fail") + " " + file.name, "warning");

          pending--;
          if (!pending) render();
        };

        reader.onerror = function () {
          pending--;
          if (window.showToast) window.showToast(t("dv_read_fail") + " " + file.name, "warning");
          if (!pending) render();
        };

        reader.readAsText(file);
      })(fileList[i]);
    }
  }

  // ------------------------------------------------------------------
  // Export
  // ------------------------------------------------------------------
  // One curve out, whatever went in: visible traces, scaled, cropped,
  // normalised, merged and sorted — the thing on screen, as numbers.
  function exportText() {
    var series = finalSeries();
    var all = [];
    for (var i = 0; i < series.length; i++) {
      for (var j = 0; j < series[i].points.length; j++) all.push(series[i].points[j]);
    }
    all.sort(function (a, b) { return a[0] - b[0]; });

    var first = series.length ? series[0].trace : null;
    var head = "# " + (first ? first.colNames[first.xcol] : "x") + "\t" +
               (first ? first.colNames[first.ycol] : "y") + "\n";

    var lines = [];
    for (i = 0; i < all.length; i++) {
      lines.push(all[i][0] + "\t" + all[i][1]);
    }
    return head + lines.join("\n") + "\n";
  }

  // ------------------------------------------------------------------
  // Handlers (global — called from markup)
  // ------------------------------------------------------------------
  window.dvFilesPicked = function (input) {
    readFiles(input.files);
    input.value = "";        // same file twice in a row must still fire change
  };

  window.dvToggleTrace = function (id) {
    for (var i = 0; i < traces.length; i++) {
      if (traces[i].id === id) traces[i].visible = !traces[i].visible;
    }
    render();
  };

  window.dvRemoveTrace = function (id) {
    for (var i = 0; i < traces.length; i++) {
      if (traces[i].id === id) { traces.splice(i, 1); break; }
    }
    render();
  };

  window.dvSetColumn = function (id, which, value) {
    var c = parseInt(value, 10);
    for (var i = 0; i < traces.length; i++) {
      if (traces[i].id !== id) continue;
      if (which === "x") traces[i].xcol = c; else traces[i].ycol = c;
    }
    render();
  };

  // Typing a scale pins it; clearing the box hands the trace back to auto.
  window.dvSetScale = function (id, value) {
    var raw = String(value).replace(/\s+/g, "");
    for (var i = 0; i < traces.length; i++) {
      if (traces[i].id !== id) continue;
      if (!raw) {
        traces[i].manualScale = null;
      } else {
        var v = parseFloat(raw);
        traces[i].manualScale = (isFinite(v) && v !== 0) ? v : null;
      }
    }
    render();
  };

  window.dvSetYScale = function (value) {
    opts.yScale = value === "log" ? "log" : "linear";
    render();
  };

  window.dvSetNorm = function (value) {
    opts.norm = (value === "max" || value === "xrr") ? value : "none";
    render();
  };

  window.dvApplyCrop = function () {
    var lo = el("dv-xmin"), hi = el("dv-xmax");
    var a = lo && lo.value !== "" ? parseFloat(lo.value) : NaN;
    var b = hi && hi.value !== "" ? parseFloat(hi.value) : NaN;

    opts.xMin = isFinite(a) ? a : null;
    opts.xMax = isFinite(b) ? b : null;

    // Entered the other way round: read it as a range rather than as nothing.
    if (opts.xMin !== null && opts.xMax !== null && opts.xMin > opts.xMax) {
      var swap = opts.xMin; opts.xMin = opts.xMax; opts.xMax = swap;
      if (lo) lo.value = opts.xMin;
      if (hi) hi.value = opts.xMax;
    }
    render();
  };

  window.dvResetCrop = function () {
    opts.xMin = null;
    opts.xMax = null;
    var lo = el("dv-xmin"), hi = el("dv-xmax");
    if (lo) lo.value = "";
    if (hi) hi.value = "";
    render();
  };

  window.dvAutoStitch = function () {
    autoStitch();
  };

  window.dvResetScales = function () {
    for (var i = 0; i < traces.length; i++) {
      traces[i].autoScale = 1;
      traces[i].manualScale = null;
      traces[i].overlap = null;
      traces[i].anchor = false;
    }
    render();
  };

  window.dvClearAll = function () {
    traces = [];
    window.dvResetCrop();
  };

  window.dvCopyData = function () {
    if (!traces.length) return;
    if (window.copyTextToClipboard) window.copyTextToClipboard(exportText(), t("dv_copied"));
  };

  window.dvDownloadData = function () {
    if (!traces.length) return;
    var text = exportText();

    try {
      var blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "stitched.txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
    } catch (e) {
      // No Blob, or a browser that refuses the synthetic click: the clipboard
      // still gets the user their numbers.
      if (window.copyTextToClipboard) window.copyTextToClipboard(text, t("dv_copied"));
    }
  };

  // ------------------------------------------------------------------
  // Init
  // ------------------------------------------------------------------
  function bindDropZone() {
    var zone = el("dv-drop");
    if (!zone || zone.getAttribute("data-bound")) return;
    zone.setAttribute("data-bound", "1");

    function stop(e) {
      if (e.preventDefault) e.preventDefault();
      if (e.stopPropagation) e.stopPropagation();
    }

    zone.addEventListener("dragover", function (e) {
      stop(e);
      zone.className = "dv-drop dv-drop-over";
    });
    zone.addEventListener("dragleave", function (e) {
      stop(e);
      zone.className = "dv-drop";
    });
    zone.addEventListener("drop", function (e) {
      stop(e);
      zone.className = "dv-drop";
      if (e.dataTransfer && e.dataTransfer.files) readFiles(e.dataTransfer.files);
    });
  }

  function initDataView() {
    if (!el("view-data")) return;
    bindDropZone();
    render();
  }

  window.initDataView = initDataView;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDataView);
  } else {
    initDataView();
  }
})();
