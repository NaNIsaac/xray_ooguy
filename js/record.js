/**
 * BEAMLINE TOOLKIT — RECORD
 *
 * Plain-text logbook headers and one-click in-situ timestamped event snippets.
 * Zero emojis, plain text formatting, English snippets.
 *
 * Compatibility: CentOS 7 (Firefox 60 ESR, Chrome 60~70) — ES5 syntax only.
 */

(function () {
  "use strict";

  function pad2(n) {
    var s = String(n);
    return s.length === 1 ? "0" + s : s;
  }

  function getFormattedTimestamp() {
    var d = new Date();
    return d.getFullYear() + "-" +
      pad2(d.getMonth() + 1) + "-" +
      pad2(d.getDate()) + " " +
      pad2(d.getHours()) + ":" +
      pad2(d.getMinutes()) + ":" +
      pad2(d.getSeconds());
  }

  function getDateStr() {
    var d = new Date();
    return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
  }

  function copyToClipboard(text, msg) {
    if (window.copyTextToClipboard) {
      window.copyTextToClipboard(text, msg || "Copied to clipboard.");
    } else {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        if (window.showToast) window.showToast(msg || "Copied to clipboard.", "success");
      } catch (e) {}
      document.body.removeChild(ta);
    }
  }

  // --- 1. Plain Text Logbook Templates ---
  var currentTab = "standard";

  function getTemplates() {
    var date = getDateStr();
    return {
      standard: [
        "======================================================================",
        "BEAMTIME LOGBOOK",
        "Proposal No  : ",
        "Beamline     : ",
        "Date / Shift : " + date + " (Day / Night)",
        "PI / Users   : ",
        "----------------------------------------------------------------------",
        "Beam Energy  :       keV (lambda =       A) | Current:       mA",
        "Optics Mode  : Monochromatic / Si(111)",
        "Technique    : XRD / SAXS / WAXS / XAFS / XRF / CDI / BCDI",
        "Sample System: ",
        "Environment  : Room Temp / Cryostat / Gas Flow / In-Situ Heating",
        "Detector     : Dectris EIGER2 / Pilatus / Rayonix (Distance:       mm)",
        "Calibration  : LaB6 / AgBh / CeO2",
        "======================================================================",
        "TIMELINE & RUN NOTES:",
        ""
      ].join("\n"),

      shift: [
        "======================================================================",
        "SHIFT HANDOVER REPORT : " + date,
        "Beamline / Station    : ",
        "Handover By / To      :                 -> ",
        "Ring Condition        :       mA @       keV (Stable)",
        "Hutch Shutter         : Open / Closed",
        "Current Sample        : ",
        "Completed Runs        : Scan #       ~ #",
        "Next Scheduled Runs   : ",
        "Issues / Remarks      : None",
        "======================================================================"
      ].join("\n"),

      runs: [
        "----------------------------------------------------------------------------------------------------",
        "Run     Time      Sample_ID         Energy(keV)   Exp(s)   DetDist(mm)   Attn(dB)   Remarks",
        "----------------------------------------------------------------------------------------------------",
        "#001              Blank_Air         10.0          1.0      500           0          Background",
        "#002              Standard_LaB6     10.0          5.0      500           0          Calibration",
        "#003              Sample_01         10.0          30.0     500           0          Initial scan",
        "#004              Sample_02         10.0          30.0     500           0          Temp series",
        "----------------------------------------------------------------------------------------------------"
      ].join("\n")
    };
  }

  function selectLogbookTab(tabId) {
    currentTab = tabId || "standard";
    var btnStd = document.getElementById("tab-tpl-standard");
    var btnShift = document.getElementById("tab-tpl-shift");
    var btnRuns = document.getElementById("tab-tpl-runs");

    if (btnStd) btnStd.className = (currentTab === "standard" ? "btn btn-sm btn-primary" : "btn btn-sm btn-secondary");
    if (btnShift) btnShift.className = (currentTab === "shift" ? "btn btn-sm btn-primary" : "btn btn-sm btn-secondary");
    if (btnRuns) btnRuns.className = (currentTab === "runs" ? "btn btn-sm btn-primary" : "btn btn-sm btn-secondary");

    var previewEl = document.getElementById("logbook-tpl-preview");
    if (previewEl) {
      var tpls = getTemplates();
      previewEl.innerText = tpls[currentTab] || tpls.standard;
    }
  }

  function copyActiveTemplate() {
    var tpls = getTemplates();
    var text = tpls[currentTab] || tpls.standard;
    copyToClipboard(text, "Logbook header copied to clipboard.");
  }

  // --- 2. In-Situ Quick Snippets ---
  var SNIPPET_TEMPLATES = {
    beam_dump: function (ts) {
      return "[" + ts + "] BEAM DUMP: Storage ring beam lost (0 mA). Beamline standby.";
    },
    beam_restored: function (ts) {
      return "[" + ts + "] BEAM RESTORED: Top-up injection nominal (300 mA). Hutch shutter opened.";
    },
    sample_mount: function (ts) {
      return "[" + ts + "] SAMPLE MOUNT: Sample mounted and centered on stage.";
    },
    beam_align: function (ts) {
      return "[" + ts + "] ALIGNMENT: Direct beam, pinhole, and slits centered.";
    },
    calibration: function (ts) {
      return "[" + ts + "] CALIBRATION: Standard (LaB6 / AgBh / CeO2) calibration measured.";
    },
    scan_start: function (ts) {
      return "[" + ts + "] SCAN START: Data acquisition run initiated.";
    },
    scan_finish: function (ts) {
      return "[" + ts + "] SCAN FINISH: Data acquisition run completed. 2D frames saved.";
    },
    interlock: function (ts) {
      return "[" + ts + "] INTERLOCK: Hutch search / Interlock / Motor error / Alarm triggered.";
    }
  };

  function triggerSnippet(key) {
    var ts = getFormattedTimestamp();
    var fn = SNIPPET_TEMPLATES[key];
    if (!fn) return;
    var line = fn(ts);
    copyToClipboard(line, "Copied: " + line);
  }

  function addCustomNote() {
    var input = document.getElementById("rec-custom-input");
    if (!input || !input.value.trim()) return;
    var text = input.value.trim();
    var ts = getFormattedTimestamp();
    var line = "[" + ts + "] " + text;
    copyToClipboard(line, "Copied: " + line);
    input.value = "";
  }

  // Global Exposure
  window.selectLogbookTab = selectLogbookTab;
  window.copyActiveTemplate = copyActiveTemplate;
  window.triggerSnippet = triggerSnippet;
  window.addCustomNote = addCustomNote;

  function init() {
    selectLogbookTab("standard");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
