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

  function renderSettingsHistory() {
    var tbody = document.getElementById("settings-history-body");
    var countEl = document.getElementById("history-total-count");
    if (!tbody) return;

    var history = Storage.get("calc_history", []);
    if (countEl) countEl.textContent = history.length + " runs";

    tbody.innerHTML = "";

    if (history.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:var(--ink-muted); padding:16px;">' + t("history_empty") + '</td></tr>';
      return;
    }

    for (var i = 0; i < history.length; i++) {
      var item = history[i];
      var tr = document.createElement("tr");
      tr.innerHTML =
        '<td class="mono" style="color:var(--ink-muted); font-size:11px;">' + item.timestamp + '</td>' +
        '<td><strong>' + escapeHtml(item.tool) + '</strong></td>' +
        '<td class="mono" style="font-size:11px;">' + escapeHtml(item.inputs) + '</td>' +
        '<td class="mono" style="color:var(--accent-ink); font-weight:700;">' + escapeHtml(item.result) + '</td>';
      tbody.appendChild(tr);
    }
  }

  function clearCalculationHistory() {
    if (!confirm(t("history_clear_confirm"))) return;
    Storage.set("calc_history", []);
    renderSettingsHistory();
    if (window.renderDashboardHistory) window.renderDashboardHistory();
    if (window.showToast) window.showToast(t("history_cleared_toast"), "info");
  }

  function backupAllData() {
    var data = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      theme: Storage.get("theme", "light"),
      history: Storage.get("calc_history", []),
      logs: Storage.get("logbook_entries", []),
      notes: Storage.get("lab_notes", ""),
      checklists: Storage.get("checklists", []),
      samples: Storage.get("sample_list", []),
      kanban: Storage.get("kanban_tasks", [])
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
        if (parsed.logs) Storage.set("logbook_entries", parsed.logs);
        if (parsed.notes) Storage.set("lab_notes", parsed.notes);
        if (parsed.checklists) Storage.set("checklists", parsed.checklists);
        if (parsed.samples) Storage.set("sample_list", parsed.samples);
        if (parsed.kanban) Storage.set("kanban_tasks", parsed.kanban);

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

  function escapeHtml(str) {
    return (str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  window.renderSettingsHistory = renderSettingsHistory;
  window.clearCalculationHistory = clearCalculationHistory;
  window.backupAllData = backupAllData;
  window.restoreAllData = restoreAllData;

  function renderSettings() {
    renderSettingsHistory();
  }

  window.renderSettings = renderSettings;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderSettings);
  } else {
    renderSettings();
  }
})();
