/**
 * BEAMLINE TOOLKIT — RECORD (Logbook Presets & In-Situ Beamtime Snippets)
 *
 * Streamlined for synchrotron & lab beamtime researchers:
 *   1. Logbook Header Presets (Markdown templates for ELN / Notion / Paper)
 *   2. In-Situ Quick Snippets (1-click timestamped event logger with copy)
 *   3. Cumulative Timeline Stream (Persistent local stream + 1-click full export)
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
      window.copyTextToClipboard(text, msg || "클립보드에 복사되었습니다.");
    } else {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        if (window.showToast) window.showToast(msg || "클립보드에 복사되었습니다.", "success");
      } catch (e) {}
      document.body.removeChild(ta);
    }
  }

  // --- 1. Logbook Templates ---
  var currentTab = "standard";

  function getTemplates() {
    var date = getDateStr();
    return {
      standard: [
        "# [Beamtime Logbook] Proposal #_________ (Beamline: _________)",
        "- Date: " + date + " | Shift: [Day / Night / 24h]",
        "- Principal Investigator: [                       ]",
        "- Beamline Scientists / Operators: [              ]",
        "- Storage Ring: 3.0 GeV | Ring Current: ______ mA (Top-up Mode)",
        "- Beam Energy: ______ keV (λ = ______ Å) | Monochromator: Si(111)",
        "- Optical Config: [Focused Beam / Pinhole / CRL / KB Mirrors]",
        "- Experimental Technique: [XRD / SAXS / WAXS / XAFS / XRF / CDI / BCDI]",
        "- Sample System: [                                                   ]",
        "- Sample Environment: [Room Temp / Cryostat / Gas Cell / In-situ Heating]",
        "- Detector: [Dectris EIGER2 / Pilatus / Rayonix] | Distance: ______ mm",
        "- Calibration Standard: [LaB6 / Silver Behenate / CeO2] measured",
        "======================================================================",
        "## Timeline & Run Notes:",
        ""
      ].join("\n"),

      shift: [
        "## [Shift Handover Report] " + date + " (Shift Handover)",
        "- Beamline / Endstation: [                                           ]",
        "- Handover By: [                 ] -> Received By: [                 ]",
        "- Beam Condition: Energy ______ keV | Current ______ mA (Stable)",
        "- Safety & Interlock: Hutch Shutter [Open / Closed] | Interlock Normal",
        "- Current Active Sample: [                                           ]",
        "- Completed Runs: Scan #______ ~ Scan #______",
        "- Scheduled Runs for Next Shift: [                                  ]",
        "- Issues / Special Notes: [None / Detector temperature / Alignment checked]",
        "======================================================================"
      ].join("\n"),

      matrix: [
        "### Sample & Measurement Matrix Table",
        "| Run # | Time | Sample ID | Energy (keV) | Exp. (s) | Det. Dist (mm) | Attn. (dB) | Remarks / Status |",
        "|-------|------|-----------|--------------|----------|----------------|------------|------------------|",
        "| #001  |      | Dark / Air| 10.0         | 1.0      | 500            | 0          | Background check |",
        "| #002  |      | Standard  | 10.0         | 5.0      | 500            | 0          | LaB6 / AgBh cal  |",
        "| #003  |      | Sample 01 | 10.0         | 30.0     | 500            | 0          | Initial scan     |",
        "| #004  |      | Sample 02 | 10.0         | 30.0     | 500            | 0          | Temperature run  |"
      ].join("\n")
    };
  }

  function selectLogbookTab(tabId) {
    currentTab = tabId || "standard";
    var btnStd = document.getElementById("tab-tpl-standard");
    var btnShift = document.getElementById("tab-tpl-shift");
    var btnMatrix = document.getElementById("tab-tpl-matrix");

    if (btnStd) btnStd.className = (currentTab === "standard" ? "btn btn-sm btn-primary" : "btn btn-sm btn-secondary");
    if (btnShift) btnShift.className = (currentTab === "shift" ? "btn btn-sm btn-primary" : "btn btn-sm btn-secondary");
    if (btnMatrix) btnMatrix.className = (currentTab === "matrix" ? "btn btn-sm btn-primary" : "btn btn-sm btn-secondary");

    var previewEl = document.getElementById("logbook-tpl-preview");
    if (previewEl) {
      var tpls = getTemplates();
      previewEl.innerText = tpls[currentTab] || tpls.standard;
    }
  }

  function copyActiveTemplate() {
    var tpls = getTemplates();
    var text = tpls[currentTab] || tpls.standard;
    copyToClipboard(text, "로그북 서식이 클립보드에 복사되었습니다.");
  }

  // --- 2. In-Situ Quick Snippets ---
  var SNIPPET_TEMPLATES = {
    beam_dump: function (ts) {
      return "[" + ts + "] ⚠ BEAM DUMP — Storage ring beam lost (Current: 0 mA). Experiment paused.";
    },
    beam_restored: function (ts) {
      return "[" + ts + "] ✔ BEAM RESTORED — Top-up injected (Current: 300 mA). Hutch shutter opened.";
    },
    sample_mount: function (ts) {
      return "[" + ts + "] 📦 SAMPLE MOUNT — Sample [            ] mounted on stage. Center aligned.";
    },
    beam_align: function (ts) {
      return "[" + ts + "] 🎯 BEAM ALIGNMENT — Direct beam & pinhole/slits centered. Counts: [      ] ph/s.";
    },
    calibration: function (ts) {
      return "[" + ts + "] 📐 CALIBRATION — Standard (LaB6 / AgBh / CeO2) measured for Q-calibration.";
    },
    scan_start: function (ts) {
      return "[" + ts + "] ▶ RUN START — Scan #[    ] started (Exp: [  ] s, Attn: [  ] dB).";
    },
    scan_finish: function (ts) {
      return "[" + ts + "] ⏹ RUN COMPLETE — Scan #[    ] finished. 2D Pattern saved.";
    },
    interlock: function (ts) {
      return "[" + ts + "] 🛑 INTERLOCK / ALARM — Hutch interlock search / Motor error / Temperature warning.";
    }
  };

  function getTimelineLogs() {
    try {
      var data = localStorage.getItem("xray_timeline_logs");
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  function saveTimelineLogs(logs) {
    try {
      localStorage.setItem("xray_timeline_logs", JSON.stringify(logs.slice(0, 300)));
    } catch (e) {}
  }

  function appendTimelineEntry(line, copyMsg) {
    var logs = getTimelineLogs();
    logs.unshift({
      time: getFormattedTimestamp(),
      text: line
    });
    saveTimelineLogs(logs);
    renderTimeline();
    copyToClipboard(line, copyMsg || "스니펫이 클립보드에 복사되었습니다.");
  }

  function triggerSnippet(key) {
    var ts = getFormattedTimestamp();
    var fn = SNIPPET_TEMPLATES[key];
    if (!fn) return;
    var line = fn(ts);
    appendTimelineEntry(line, "이벤트 스니펫이 복사되었습니다: " + line.substring(0, 40) + "...");
  }

  function addCustomNote() {
    var input = document.getElementById("rec-custom-input");
    if (!input || !input.value.trim()) return;
    var text = input.value.trim();
    var ts = getFormattedTimestamp();
    var line = "[" + ts + "] 📝 NOTE — " + text;
    appendTimelineEntry(line, "메모가 복사되고 타임라인에 추가되었습니다.");
    input.value = "";
  }

  function deleteTimelineEntry(index) {
    var logs = getTimelineLogs();
    if (index >= 0 && index < logs.length) {
      logs.splice(index, 1);
      saveTimelineLogs(logs);
      renderTimeline();
    }
  }

  function clearTimelineLogs() {
    if (!confirm("누적된 모든 타임라인 기록을 삭제하시겠습니까?")) return;
    saveTimelineLogs([]);
    renderTimeline();
    if (window.showToast) window.showToast("타임라인이 초기화되었습니다.", "info");
  }

  function copyFullTimeline() {
    var logs = getTimelineLogs();
    if (logs.length === 0) {
      if (window.showToast) window.showToast("누적된 타임라인 기록이 없습니다.", "warning");
      return;
    }
    // Sort chronologically for export
    var lines = [];
    lines.push("### Beamtime Live Timeline Stream (" + getDateStr() + ")");
    lines.push("======================================================================");
    for (var i = logs.length - 1; i >= 0; i--) {
      lines.push(logs[i].text);
    }
    lines.push("======================================================================");
    copyToClipboard(lines.join("\n"), "전체 타임라인 (" + logs.length + "개 항목)이 클립보드에 복사되었습니다.");
  }

  function renderTimeline() {
    var listEl = document.getElementById("rec-timeline-list");
    var countEl = document.getElementById("rec-timeline-count");
    if (!listEl) return;

    var logs = getTimelineLogs();
    if (countEl) countEl.innerText = logs.length + " logs";

    if (logs.length === 0) {
      listEl.innerHTML = '<div class="rec-empty-state">아직 기록된 이벤트가 없습니다. 위의 스니펫 버튼을 누르면 실시간 타임스탬프와 함께 여기에 누적됩니다.</div>';
      return;
    }

    var html = [];
    for (var i = 0; i < logs.length; i++) {
      var item = logs[i];
      var isAlert = item.text.indexOf("⚠") !== -1 || item.text.indexOf("🛑") !== -1;
      var isSuccess = item.text.indexOf("✔") !== -1 || item.text.indexOf("⏹") !== -1;
      var rowClass = "rec-time-item" + (isAlert ? " alert" : (isSuccess ? " success" : ""));

      html.push('<div class="' + rowClass + '">');
      html.push('  <span class="rec-time-text mono">' + escapeHtml(item.text) + '</span>');
      html.push('  <div class="rec-time-actions">');
      html.push('    <button class="btn-snip-copy" onclick="window.copySingleTimelineEntry(' + i + ')" title="단일 항목 복사">📋</button>');
      html.push('    <button class="btn-snip-del" onclick="window.deleteTimelineEntry(' + i + ')" title="삭제">✕</button>');
      html.push('  </div>');
      html.push('</div>');
    }
    listEl.innerHTML = html.join("");
  }

  function copySingleTimelineEntry(index) {
    var logs = getTimelineLogs();
    if (index >= 0 && index < logs.length) {
      copyToClipboard(logs[index].text, "해당 이벤트가 클립보드에 복사되었습니다.");
    }
  }

  function updateLiveTimestampDisplay() {
    var el = document.getElementById("rec-live-timestamp-preview");
    if (el) el.innerText = getFormattedTimestamp();
  }

  function escapeHtml(str) {
    return String(str === undefined || str === null ? "" : str)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // --- Calculation Auto-Recorder Bridge ---
  window.recordCalculation = function (suiteName, inputsStr, resultStr) {
    var ts = getFormattedTimestamp();
    var line = "[" + ts + "] 🔢 CALC — " + suiteName + " (" + inputsStr + ") -> " + resultStr;
    var logs = getTimelineLogs();
    logs.unshift({ time: ts, text: line });
    saveTimelineLogs(logs);
    renderTimeline();
  };

  // Global Exposure
  window.selectLogbookTab = selectLogbookTab;
  window.copyActiveTemplate = copyActiveTemplate;
  window.triggerSnippet = triggerSnippet;
  window.addCustomNote = addCustomNote;
  window.deleteTimelineEntry = deleteTimelineEntry;
  window.clearTimelineLogs = clearTimelineLogs;
  window.copyFullTimeline = copyFullTimeline;
  window.copySingleTimelineEntry = copySingleTimelineEntry;

  function init() {
    selectLogbookTab("standard");
    renderTimeline();
    updateLiveTimestampDisplay();
    setInterval(updateLiveTimestampDisplay, 1000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
