/**
 * BEAMLINE TOOLKIT — RECORD
 *
 * Two jobs that deliberately do not overlap:
 *   QUICK LOG        — the time axis. What happened, one click per entry.
 *   SESSION TEMPLATE — the document structure. The header a researcher pastes
 *                      into their own logbook once per session.
 *
 * Session context sits between them as a single compact line: it feeds both,
 * but never asks to be filled in. An empty session is a valid session, and a
 * log with no session at all is still a valid log.
 *
 * Compatibility: CentOS 7 (Firefox 60 ESR, Chrome 60~70) — ES5 syntax only.
 */

(function () {
  "use strict";

  function t(key) {
    if (window.i18n && window.i18n.t) return window.i18n.t(key);
    return key;
  }

  function pad2(n) {
    var s = String(n);
    return s.length === 1 ? "0" + s : s;
  }

  function todayStr() {
    var d = new Date();
    return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
  }

  function timeStr() {
    var d = new Date();
    return pad2(d.getHours()) + ":" + pad2(d.getMinutes());
  }

  function escapeHtml(str) {
    return String(str === undefined || str === null ? "" : str)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function trim(str) {
    return String(str === undefined || str === null ? "" : str).replace(/^\s+|\s+$/g, "");
  }

  // ------------------------------------------------------------------
  // Model
  // ------------------------------------------------------------------
  // `group` decides which block a field lands in for the Beamtime template.
  var CONTEXT_FIELDS = [
    { key: "beamline", label: "rec_f_beamline", group: "head", out: "Beamline" },
    { key: "experiment", label: "rec_f_experiment", group: "experiment", out: "Experiment" },
    { key: "sample", label: "rec_f_sample", group: "sample", out: "Sample" },
    { key: "energy", label: "rec_f_energy", group: "beam", out: "Energy" },
    { key: "reflection", label: "rec_f_reflection", group: "beam", out: "Reflection" },
    { key: "detector", label: "rec_f_detector", group: "beam", out: "Detector" },
    { key: "operator", label: "rec_f_operator", group: "operator", out: "Operator" },
    { key: "environment", label: "rec_f_environment", group: "sample", out: "Environment" }
  ];

  // Fields ticked by default in the template — the ones a header usually needs.
  var TEMPLATE_DEFAULT = {
    beamline: true, experiment: true, sample: true, energy: true,
    reflection: true, operator: true, detector: false, environment: false
  };

  var LOG_TYPES = ["EVENT", "OBSERVATION", "ISSUE", "RESULT", "DECISION", "CALCULATION"];
  var SEVERITIES = ["normal", "important", "critical"];

  var QUICK_PRESETS = [
    { key: "rec_q_beamdown", type: "ISSUE" },
    { key: "rec_q_mounted", type: "EVENT" },
    { key: "rec_q_scan", type: "EVENT" },
    { key: "rec_q_peak", type: "RESULT" },
    { key: "rec_q_issue", type: "ISSUE" }
  ];

  function getSessions() { return Storage.get("record_sessions", []); }
  function saveSessions(list) { Storage.set("record_sessions", list); }
  function getCurrentSessionId() { return Storage.get("record_current", ""); }
  function setCurrentSessionId(id) { Storage.set("record_current", id || ""); }

  function getCurrentSession() {
    var id = getCurrentSessionId();
    if (!id) return null;
    var list = getSessions();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return null;
  }

  function updateSession(session) {
    if (!session || !session.id) return;
    var list = getSessions();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === session.id) { list[i] = session; break; }
    }
    saveSessions(list);
  }

  function getLogs() { return Storage.get("record_logs", []); }

  function saveLogs(list) {
    if (list.length > 500) list = list.slice(0, 500);
    Storage.set("record_logs", list);
  }

  // Logs of the active session; with no session, the loose (sid === "") ones.
  function getVisibleLogs() {
    var sid = getCurrentSessionId();
    var all = getLogs();
    var out = [];
    for (var i = 0; i < all.length; i++) {
      if ((all[i].sid || "") === sid) out.push(all[i]);
    }
    return out;
  }

  // ------------------------------------------------------------------
  // Session
  // ------------------------------------------------------------------
  var sessionOpen = false;

  function newSession(name) {
    var session = { id: "sess_" + Date.now(), name: name || "", date: todayStr() };
    for (var i = 0; i < CONTEXT_FIELDS.length; i++) {
      session[CONTEXT_FIELDS[i].key] = "";
    }
    return session;
  }

  function startSession() {
    var input = document.getElementById("rec-session-name");
    var session = newSession(input ? trim(input.value) : "");

    var list = getSessions();
    list.unshift(session);
    saveSessions(list);
    setCurrentSessionId(session.id);

    sessionOpen = true;
    renderRecord();
    if (window.showToast) window.showToast(t("rec_session_started"), "info");
  }

  function endSession() {
    setCurrentSessionId("");
    sessionOpen = false;
    renderRecord();
  }

  function resumeSession() {
    var picker = document.getElementById("rec-session-pick");
    if (!picker || !picker.value) return;
    setCurrentSessionId(picker.value);
    sessionOpen = false;
    renderRecord();
  }

  function deleteSession(id) {
    if (!confirm(t("rec_session_del_confirm"))) return;

    var kept = [];
    var list = getSessions();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id !== id) kept.push(list[i]);
    }
    saveSessions(kept);

    // Logs outlive their session; they simply become loose logs.
    var all = getLogs();
    for (var j = 0; j < all.length; j++) {
      if (all[j].sid === id) all[j].sid = "";
    }
    saveLogs(all);

    if (getCurrentSessionId() === id) setCurrentSessionId("");
    sessionOpen = false;
    renderRecord();
  }

  function toggleSessionEditor() {
    sessionOpen = !sessionOpen;
    renderSessionBar();
  }

  function saveContext() {
    var session = getCurrentSession();
    if (!session) return;

    var nameEl = document.getElementById("rec-ctx-name");
    if (nameEl) session.name = trim(nameEl.value);

    for (var i = 0; i < CONTEXT_FIELDS.length; i++) {
      var el = document.getElementById("rec-ctx-" + CONTEXT_FIELDS[i].key);
      if (el) session[CONTEXT_FIELDS[i].key] = trim(el.value);
    }

    updateSession(session);
    sessionOpen = false;
    renderRecord();
    if (window.showToast) window.showToast(t("rec_context_saved"), "info");
  }

  function sessionSummary(session) {
    var parts = [];
    if (session.beamline) parts.push(session.beamline);
    if (session.sample) parts.push(session.sample);
    if (session.energy) parts.push(session.energy + " keV");
    if (session.reflection) parts.push(session.reflection);
    return parts;
  }

  function renderSessionBar() {
    var bar = document.getElementById("rec-session-bar");
    if (!bar) return;

    var session = getCurrentSession();
    var sessions = getSessions();

    if (!session) {
      var picker = "";
      if (sessions.length) {
        var opts = "";
        for (var s = 0; s < sessions.length; s++) {
          opts += '<option value="' + sessions[s].id + '">' +
            escapeHtml(sessions[s].name || t("rec_untitled_session")) +
            " (" + sessions[s].date + ")</option>";
        }
        picker =
          '<select id="rec-session-pick" class="form-control form-control-sm">' + opts + '</select>' +
          '<button class="btn btn-sm btn-secondary" onclick="resumeSession()">' + t("rec_btn_resume") + '</button>';
      }

      bar.innerHTML =
        '<span class="rec-session-label">' + t("rec_no_session") + '</span>' +
        '<span class="rec-session-controls">' +
          '<input type="text" id="rec-session-name" class="form-control form-control-sm" placeholder="' +
            escapeHtml(t("rec_session_name_ph")) + '" onkeydown="if(event.keyCode===13) startSession()">' +
          '<button class="btn btn-sm btn-primary" onclick="startSession()">' + t("rec_btn_start") + '</button>' +
          picker +
        '</span>';
      return;
    }

    if (!sessionOpen) {
      var summary = sessionSummary(session);
      bar.innerHTML =
        '<span class="rec-session-label">' +
          '<strong>' + escapeHtml(session.name || t("rec_untitled_session")) + '</strong>' +
          '<span class="rec-session-meta mono">' + session.date +
            (summary.length ? "  ·  " + escapeHtml(summary.join("  ·  ")) : "") +
          '</span>' +
        '</span>' +
        '<span class="rec-session-controls">' +
          '<button class="btn btn-sm btn-secondary" onclick="toggleSessionEditor()">' + t("rec_btn_edit_ctx") + '</button>' +
          '<button class="btn btn-sm btn-secondary" onclick="endSession()">' + t("rec_btn_end") + '</button>' +
        '</span>';
      return;
    }

    var fields =
      '<div class="rec-ctx-field">' +
        '<label class="form-label">' + t("rec_f_name") + '</label>' +
        '<input type="text" id="rec-ctx-name" class="form-control form-control-sm" value="' +
          escapeHtml(session.name) + '">' +
      '</div>';

    for (var f = 0; f < CONTEXT_FIELDS.length; f++) {
      var field = CONTEXT_FIELDS[f];
      fields +=
        '<div class="rec-ctx-field">' +
          '<label class="form-label">' + t(field.label) + '</label>' +
          '<input type="text" id="rec-ctx-' + field.key + '" class="form-control form-control-sm" value="' +
            escapeHtml(session[field.key] || "") + '">' +
        '</div>';
    }

    bar.innerHTML =
      '<div class="rec-ctx-editor">' +
        '<div class="rec-ctx-note">' + t("rec_no_context") + '</div>' +
        '<div class="rec-ctx-grid">' + fields + '</div>' +
        '<div class="rec-ctx-actions">' +
          '<button class="btn btn-sm btn-primary" onclick="saveContext()">' + t("rec_btn_save_ctx") + '</button> ' +
          '<button class="btn btn-sm btn-secondary" onclick="toggleSessionEditor()">' + t("rec_btn_cancel") + '</button> ' +
          '<button class="btn btn-sm btn-danger" onclick="deleteSession(\'' + session.id + '\')">' + t("btn_delete") + '</button>' +
        '</div>' +
      '</div>';
  }

  // ------------------------------------------------------------------
  // Quick log
  // ------------------------------------------------------------------
  function contextSnapshot(session) {
    if (!session) return [];
    var parts = [];
    if (session.sample) parts.push(session.sample);
    if (session.energy) parts.push(session.energy + " keV");
    if (session.beamline) parts.push(session.beamline);
    return parts;
  }

  function pushLog(text, type) {
    var session = getCurrentSession();
    var log = {
      id: Date.now(),
      date: todayStr(),
      time: timeStr(),
      sid: session ? session.id : "",
      type: type || "EVENT",
      severity: "normal",
      text: text,
      note: "",
      author: session ? (session.operator || "") : "",
      ctx: contextSnapshot(session)
    };

    var all = getLogs();
    all.unshift(log);
    saveLogs(all);
    renderLogList();
    return log;
  }

  function quickLog(index) {
    var preset = QUICK_PRESETS[index];
    if (!preset) return;
    pushLog(t(preset.key), preset.type);
    if (window.showToast) window.showToast(t("rec_log_added"), "info");
  }

  var customOpen = false;

  function toggleCustomLog() {
    customOpen = !customOpen;
    renderQuickCard();
    if (customOpen) {
      var el = document.getElementById("rec-custom-text");
      if (el) el.focus();
    }
  }

  function saveCustomLog() {
    var el = document.getElementById("rec-custom-text");
    var text = el ? trim(el.value) : "";
    if (!text) return;

    pushLog(text, "OBSERVATION");
    customOpen = false;
    renderQuickCard();
    if (window.showToast) window.showToast(t("rec_log_added"), "info");
  }

  // Public hook — a calculator pushes its result only when the user asks.
  function addToRecord(tool, inputs, result) {
    var text = (tool || "-") + " — " + (result || "");
    if (inputs) text += " (" + inputs + ")";
    pushLog(text, "CALCULATION");
    if (window.showToast) window.showToast(t("rec_log_added"), "info");
    return true;
  }

  var expandedLogId = "";

  function toggleLogDetail(id) {
    expandedLogId = (String(expandedLogId) === String(id)) ? "" : String(id);
    renderLogList();
  }

  function updateLogField(id, field, value) {
    var all = getLogs();
    for (var i = 0; i < all.length; i++) {
      if (String(all[i].id) === String(id)) { all[i][field] = value; break; }
    }
    saveLogs(all);
    renderLogList();
  }

  function saveLogNote(id) {
    var el = document.getElementById("rec-note-" + id);
    updateLogField(id, "note", el ? trim(el.value) : "");
    if (window.showToast) window.showToast(t("rec_note_saved"), "info");
  }

  function deleteLog(id) {
    if (!confirm(t("rec_log_del_confirm"))) return;
    var all = getLogs();
    var kept = [];
    for (var i = 0; i < all.length; i++) {
      if (String(all[i].id) !== String(id)) kept.push(all[i]);
    }
    saveLogs(kept);
    renderLogList();
  }

  function renderQuickCard() {
    var box = document.getElementById("rec-quick-buttons");
    if (!box) return;

    var html = "";
    for (var i = 0; i < QUICK_PRESETS.length; i++) {
      html += '<button type="button" class="rec-quick-btn" onclick="quickLog(' + i + ')">' +
        escapeHtml(t(QUICK_PRESETS[i].key)) + '</button>';
    }
    html += '<button type="button" class="rec-quick-btn rec-quick-other" onclick="toggleCustomLog()">' +
      escapeHtml(t("rec_q_other")) + '</button>';

    box.innerHTML = html;

    var custom = document.getElementById("rec-custom-box");
    if (!custom) return;

    if (!customOpen) {
      custom.innerHTML = "";
      custom.style.display = "none";
      return;
    }

    custom.style.display = "block";
    custom.innerHTML =
      '<input type="text" id="rec-custom-text" class="form-control form-control-sm" placeholder="' +
        escapeHtml(t("rec_custom_ph")) + '" onkeydown="if(event.keyCode===13) saveCustomLog()">' +
      '<button class="btn btn-sm btn-primary" onclick="saveCustomLog()">' + t("rec_btn_save") + '</button> ' +
      '<button class="btn btn-sm btn-secondary" onclick="toggleCustomLog()">' + t("rec_btn_cancel") + '</button>';
  }

  function renderLogList() {
    var box = document.getElementById("rec-log-list");
    if (!box) return;

    var logs = getVisibleLogs();
    var countEl = document.getElementById("rec-log-count");
    if (countEl) countEl.textContent = logs.length + " logs";

    if (!logs.length) {
      box.innerHTML = '<div class="rec-empty">' + t("rec_log_empty") + '</div>';
      return;
    }

    var html = "";
    for (var i = 0; i < logs.length; i++) {
      var log = logs[i];
      var expanded = (String(expandedLogId) === String(log.id));

      var ctxHtml = (log.ctx && log.ctx.length)
        ? '<div class="rec-log-ctx mono">' + escapeHtml(log.ctx.join(" · ")) + '</div>' : '';
      var noteHtml = log.note
        ? '<div class="rec-log-note">' + escapeHtml(log.note) + '</div>' : '';

      var detailHtml = "";
      if (expanded) {
        var typeOpts = "";
        for (var ti = 0; ti < LOG_TYPES.length; ti++) {
          typeOpts += '<option value="' + LOG_TYPES[ti] + '"' +
            (LOG_TYPES[ti] === log.type ? ' selected' : '') + '>' + LOG_TYPES[ti] + '</option>';
        }

        var sevOpts = "";
        for (var si = 0; si < SEVERITIES.length; si++) {
          sevOpts += '<option value="' + SEVERITIES[si] + '"' +
            (SEVERITIES[si] === log.severity ? ' selected' : '') + '>' +
            t("rec_sev_" + SEVERITIES[si]) + '</option>';
        }

        detailHtml =
          '<div class="rec-log-detail">' +
            '<div class="rec-detail-row">' +
              '<label class="form-label">' + t("rec_d_type") + '</label>' +
              '<select class="form-control form-control-sm" onchange="updateLogField(\'' + log.id + '\', \'type\', this.value)">' + typeOpts + '</select>' +
            '</div>' +
            '<div class="rec-detail-row">' +
              '<label class="form-label">' + t("rec_d_severity") + '</label>' +
              '<select class="form-control form-control-sm" onchange="updateLogField(\'' + log.id + '\', \'severity\', this.value)">' + sevOpts + '</select>' +
            '</div>' +
            '<div class="rec-detail-row rec-detail-wide">' +
              '<label class="form-label">' + t("rec_d_note") + '</label>' +
              '<input type="text" id="rec-note-' + log.id + '" class="form-control form-control-sm" value="' +
                escapeHtml(log.note) + '" placeholder="' + escapeHtml(t("rec_note_ph")) + '">' +
            '</div>' +
            '<div class="rec-detail-actions">' +
              '<button class="btn btn-sm btn-primary" onclick="saveLogNote(\'' + log.id + '\')">' + t("rec_btn_save_note") + '</button> ' +
              '<button class="btn btn-sm btn-danger" onclick="deleteLog(\'' + log.id + '\')">' + t("btn_delete") + '</button>' +
            '</div>' +
          '</div>';
      }

      html +=
        '<div class="rec-log-item rec-sev-' + escapeHtml(log.severity) + '">' +
          '<div class="rec-log-head" onclick="toggleLogDetail(\'' + log.id + '\')">' +
            '<span class="rec-log-time mono">' + log.time + '</span>' +
            '<span class="rec-log-type">' + escapeHtml(log.type) + '</span>' +
            '<span class="rec-log-text">' + escapeHtml(log.text) + '</span>' +
            '<span class="rec-log-toggle">' + (expanded ? "&minus;" : "&#8943;") + '</span>' +
          '</div>' +
          noteHtml + ctxHtml + detailHtml +
        '</div>';
    }

    box.innerHTML = html;
  }

  // ------------------------------------------------------------------
  // Session template
  // ------------------------------------------------------------------
  var templateOpen = false;
  var templateFormat = "standard";
  var templateInclude = null;

  function includeMap() {
    if (!templateInclude) {
      templateInclude = {};
      for (var i = 0; i < CONTEXT_FIELDS.length; i++) {
        var key = CONTEXT_FIELDS[i].key;
        templateInclude[key] = !!TEMPLATE_DEFAULT[key];
      }
    }
    return templateInclude;
  }

  function toggleTemplate() {
    templateOpen = !templateOpen;
    renderTemplate();
  }

  function setTemplateFormat(format) {
    templateFormat = format;
    renderTemplate();
  }

  function toggleTemplateField(key) {
    var inc = includeMap();
    inc[key] = !inc[key];
    renderTemplatePreview();
  }

  function fieldValue(session, key) {
    return session ? (session[key] || "") : "";
  }

  // Only fields that are both ticked and filled in reach the output; a header
  // full of blank labels is worse than a short one.
  function activeFields(session) {
    var inc = includeMap();
    var out = [];
    for (var i = 0; i < CONTEXT_FIELDS.length; i++) {
      var field = CONTEXT_FIELDS[i];
      if (!inc[field.key]) continue;
      out.push({ field: field, value: fieldValue(session, field.key) });
    }
    return out;
  }

  function buildTemplate() {
    var session = getCurrentSession();
    var rows = activeFields(session);
    var date = session ? session.date : todayStr();
    var name = session ? session.name : "";

    if (templateFormat === "compact") {
      var bits = [date];
      for (var c = 0; c < rows.length; c++) {
        if (rows[c].value) bits.push(rows[c].value);
      }
      var line = bits.join(" · ");
      var operator = fieldValue(session, "operator");
      if (operator && includeMap().operator) line += "\nOperator: " + operator;
      return line;
    }

    if (templateFormat === "beamtime") {
      var out = "BEAMTIME SESSION\n————————————————————————\n\n";
      var beamline = fieldValue(session, "beamline");
      if (includeMap().beamline && beamline) out += "Beamline: " + beamline + "\n";
      out += "Date: " + date + "\n";

      var groups = [
        { id: "experiment", title: "Experiment" },
        { id: "sample", title: "Sample" },
        { id: "beam", title: "Beam" },
        { id: "operator", title: "Operator" }
      ];

      for (var g = 0; g < groups.length; g++) {
        var lines = [];
        for (var r = 0; r < rows.length; r++) {
          var row = rows[r];
          if (row.field.group !== groups[g].id || !row.value) continue;
          // The group title already names a single-field block.
          lines.push(groups[g].id === "beam" && row.field.key !== "energy"
            ? row.field.out + ": " + row.value
            : row.value);
        }
        if (!lines.length) continue;
        out += "\n" + groups[g].title + "\n";
        for (var l = 0; l < lines.length; l++) out += "  " + lines[l] + "\n";
      }

      if (name) out = out.replace("\nExperiment\n", "\nExperiment\n  " + name + "\n");
      return out;
    }

    // Standard — a labelled block, blanks kept so it can be filled by hand.
    var std = "BEAMLINE SESSION\n\nDate: " + date + "\n";
    if (name) std += "Experiment: " + name + "\n";
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].field.key === "experiment" && name) continue;
      std += rows[i].field.out + ": " + rows[i].value + "\n";
    }
    return std;
  }

  function buildSessionLog() {
    var session = getCurrentSession();
    var logs = getVisibleLogs();

    var header = session ? (session.date + " — " + (session.name || t("rec_untitled_session"))) : todayStr();
    var out = header + "\n\n";
    if (!logs.length) return out + t("rec_log_empty");

    // Oldest first: that is the order it will be read in the logbook.
    for (var i = logs.length - 1; i >= 0; i--) {
      var log = logs[i];
      out += log.time + "  " + log.type;
      if (log.severity && log.severity !== "normal") out += " [" + log.severity.toUpperCase() + "]";
      out += "\n" + log.text + "\n";
      if (log.note) out += "Note: " + log.note + "\n";
      out += "\n";
    }
    return out;
  }

  function copyText(text, toastKey) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        if (window.showToast) window.showToast(t(toastKey), "info");
      });
      return;
    }
    var temp = document.createElement("textarea");
    temp.value = text;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand("copy");
    document.body.removeChild(temp);
    if (window.showToast) window.showToast(t(toastKey), "info");
  }

  function copyTemplate() { copyText(buildTemplate(), "rec_copied"); }
  function copySessionLog() { copyText(buildSessionLog(), "rec_copied"); }

  function renderTemplatePreview() {
    var box = document.getElementById("rec-tpl-preview");
    if (box) box.textContent = buildTemplate();
  }

  function renderTemplate() {
    var caret = document.getElementById("rec-tpl-caret");
    var panel = document.getElementById("rec-tpl-panel");
    if (!panel) return;

    if (caret) caret.innerHTML = templateOpen ? "&#9662;" : "&#9656;";

    if (!templateOpen) {
      panel.style.display = "none";
      panel.innerHTML = "";
      return;
    }

    var formats = [
      { key: "compact", label: "Compact" },
      { key: "standard", label: "Standard" },
      { key: "beamtime", label: "Beamtime" }
    ];

    var formatHtml = "";
    for (var f = 0; f < formats.length; f++) {
      formatHtml +=
        '<label class="rec-tpl-check">' +
          '<input type="radio" name="rec-tpl-format" value="' + formats[f].key + '"' +
            (templateFormat === formats[f].key ? ' checked' : '') +
            ' onchange="setTemplateFormat(\'' + formats[f].key + '\')"> ' +
          formats[f].label +
        '</label>';
    }

    var inc = includeMap();
    var includeHtml = "";
    for (var i = 0; i < CONTEXT_FIELDS.length; i++) {
      var field = CONTEXT_FIELDS[i];
      includeHtml +=
        '<label class="rec-tpl-check">' +
          '<input type="checkbox"' + (inc[field.key] ? ' checked' : '') +
            ' onchange="toggleTemplateField(\'' + field.key + '\')"> ' +
          escapeHtml(t(field.label)) +
        '</label>';
    }

    panel.style.display = "block";
    panel.innerHTML =
      '<p class="rec-tpl-note">' + t("rec_tpl_note") + '</p>' +
      '<div class="rec-tpl-row">' +
        '<span class="rec-tpl-row-label">' + t("rec_tpl_format") + '</span>' +
        '<span class="rec-tpl-row-body">' + formatHtml + '</span>' +
      '</div>' +
      '<div class="rec-tpl-row">' +
        '<span class="rec-tpl-row-label">' + t("rec_tpl_include") + '</span>' +
        '<span class="rec-tpl-row-body">' + includeHtml + '</span>' +
      '</div>' +
      '<pre class="rec-tpl-preview mono" id="rec-tpl-preview"></pre>' +
      '<button class="btn btn-sm btn-primary" onclick="copyTemplate()">' + t("rec_btn_copy_tpl") + '</button>';

    renderTemplatePreview();
  }

  function renderRecord() {
    renderSessionBar();
    renderQuickCard();
    renderLogList();
    renderTemplate();
  }

  window.startSession = startSession;
  window.endSession = endSession;
  window.resumeSession = resumeSession;
  window.deleteSession = deleteSession;
  window.toggleSessionEditor = toggleSessionEditor;
  window.saveContext = saveContext;
  window.quickLog = quickLog;
  window.toggleCustomLog = toggleCustomLog;
  window.saveCustomLog = saveCustomLog;
  window.addToRecord = addToRecord;
  window.toggleLogDetail = toggleLogDetail;
  window.updateLogField = updateLogField;
  window.saveLogNote = saveLogNote;
  window.deleteLog = deleteLog;
  window.toggleTemplate = toggleTemplate;
  window.setTemplateFormat = setTemplateFormat;
  window.toggleTemplateField = toggleTemplateField;
  window.renderTemplatePreview = renderTemplatePreview;
  window.copyTemplate = copyTemplate;
  window.copySessionLog = copySessionLog;
  window.renderRecord = renderRecord;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderRecord);
  } else {
    renderRecord();
  }
})();
