/**
 * BEAMLINE TOOLKIT — Settings, Calculation History & Storage Management
 * Academic Print Specification: Consolas font, booktabs table layout, zero emojis.
 * Compatibility: CentOS 7 (Firefox 60 ESR, Chrome 60~70)
 */

(function () {
  "use strict";

  function t(key) {
    if (window.i18n && window.i18n.t) {
      return window.i18n.t(key);
    }
    return key;
  }

  // Single backup path for the whole app — Record data included.
  function backupAllData() {
    var data = {
      version: "3.0",
      exportDate: new Date().toISOString(),
      theme: Storage.get("theme", "paper"),
      lang: localStorage.getItem("bl_toolkit_lang") || "ko",
      history: Storage.get("calc_history", []),
      record: {
        sessions: Storage.get("record_sessions", []),
        current: Storage.get("record_current", ""),
        logs: Storage.get("record_logs", [])
      }
    };

    var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8;" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "beamline_toolkit_backup_" + new Date().toISOString().slice(0, 10) + ".json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (window.showToast) window.showToast(t("toast_backup_downloaded"), "info");
  }

  function restoreAllData(event) {
    var file = event.target.files[0];
    if (!file) return;

    var reader = new FileReader();
    reader.onload = function (e) {
      try {
        var parsed = JSON.parse(e.target.result);
        if (parsed.history) Storage.set("calc_history", parsed.history);
        if (parsed.theme) Storage.set("theme", parsed.theme);

        if (parsed.record) {
          if (parsed.record.sessions) Storage.set("record_sessions", parsed.record.sessions);
          if (parsed.record.logs) Storage.set("record_logs", parsed.record.logs);
          Storage.set("record_current", parsed.record.current || "");
        }

        if (window.showToast) window.showToast(t("toast_backup_restored"), "info");
        setTimeout(function () {
          window.location.reload();
        }, 800);
      } catch (err) {
        alert(t("alert_backup_invalid"));
      }
    };
    reader.readAsText(file);
  }

  window.backupAllData = backupAllData;
  window.restoreAllData = restoreAllData;

  function renderSettings() {
    // Settings is static markup; nothing to paint.
  }

  window.renderSettings = renderSettings;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderSettings);
  } else {
    renderSettings();
  }
})();
