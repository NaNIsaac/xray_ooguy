/**
 * BEAMLINE TOOLKIT — Electronic Logbook & Snapshot System
 * Compatibility: CentOS 7 (Firefox 60 ESR, Chrome 60~70)
 * Note: No optional chaining (?.), no fetch API, uses localStorage.
 */

(function () {
  "use strict";

  var currentTagFilter = "";
  var currentSearchQuery = "";

  function getLogs() {
    return Storage.get("logbook_entries", [
      {
        id: 1,
        timestamp: "2026-08-08 09:30:15",
        sample: "Si(111)_Std",
        energy: "10.000",
        distance: "500",
        exposure: "1.0",
        tags: ["#calib", "#Si", "#detector"],
        memo: "디텍터 500mm 기준 CeO2 캘리브레이션 링 정렬 완료. 빔센터 (1024.5, 1021.2) px 확정."
      },
      {
        id: 2,
        timestamp: "2026-08-08 11:15:40",
        sample: "Au_Nanoparticle_01",
        energy: "12.400",
        distance: "750",
        exposure: "5.0",
        tags: ["#SAXS", "#Au", "#good"],
        memo: "금 나노입자 액상 산란 측정. 폼팩터 진동 명확히 관측됨. 백그라운드 버퍼 10회 평균 측정 완료."
      }
    ]);
  }

  function saveLogs(logs) {
    Storage.set("logbook_entries", logs);
    renderLogbook();
  }

  function addLogEntry() {
    var sample = document.getElementById("log-input-sample").value.trim() || "Untitled_Sample";
    var energy = document.getElementById("log-input-energy").value.trim() || "-";
    var distance = document.getElementById("log-input-distance").value.trim() || "-";
    var exposure = document.getElementById("log-input-exposure").value.trim() || "-";
    var tagsRaw = document.getElementById("log-input-tags").value.trim();
    var memo = document.getElementById("log-input-memo").value.trim();

    if (!memo) {
      alert("로그 메모 내용을 입력해주세요.");
      return;
    }

    var tags = [];
    if (tagsRaw) {
      var splitTags = tagsRaw.split(/[\s,]+/);
      for (var i = 0; i < splitTags.length; i++) {
        var t = splitTags[i];
        if (t) {
          if (t.charAt(0) !== "#") t = "#" + t;
          tags.push(t);
        }
      }
    }

    var now = new Date();
    var timestamp = now.getFullYear() + "-" +
      String(now.getMonth() + 1).padStart(2, "0") + "-" +
      String(now.getDate()).padStart(2, "0") + " " +
      String(now.getHours()).padStart(2, "0") + ":" +
      String(now.getMinutes()).padStart(2, "0") + ":" +
      String(now.getSeconds()).padStart(2, "0");

    var newEntry = {
      id: Date.now(),
      timestamp: timestamp,
      sample: sample,
      energy: energy,
      distance: distance,
      exposure: exposure,
      tags: tags,
      memo: memo
    };

    var logs = getLogs();
    logs.unshift(newEntry);
    saveLogs(logs);

    // Clear form
    document.getElementById("log-input-memo").value = "";
    document.getElementById("log-input-tags").value = "";

    if (window.showToast) {
      window.showToast("새 로그 항목이 저장되었습니다.", "success");
    }
  }

  function deleteLogEntry(id) {
    if (!confirm("이 로그 항목을 삭제하시겠습니까?")) return;
    var logs = getLogs();
    var filtered = [];
    for (var i = 0; i < logs.length; i++) {
      if (logs[i].id !== id) {
        filtered.push(logs[i]);
      }
    }
    saveLogs(filtered);
    if (window.showToast) {
      window.showToast("로그 항목이 삭제되었습니다.", "info");
    }
  }

  function filterByTag(tag) {
    currentTagFilter = tag;
    renderLogbook();
  }

  function clearTagFilter() {
    currentTagFilter = "";
    renderLogbook();
  }

  function renderLogbook() {
    var container = document.getElementById("logbook-list");
    var countEl = document.getElementById("logbook-total-count");
    var activeFilterBadge = document.getElementById("logbook-active-filter");

    if (!container) return;

    var logs = getLogs();
    if (countEl) countEl.textContent = logs.length + " entries";

    if (activeFilterBadge) {
      if (currentTagFilter) {
        activeFilterBadge.innerHTML = '태그 필터: <strong>' + currentTagFilter + '</strong> <button class="btn btn-sm btn-secondary" onclick="clearTagFilter()" style="padding:1px 5px; margin-left:4px;">해제</button>';
        activeFilterBadge.style.display = "inline-block";
      } else {
        activeFilterBadge.style.display = "none";
      }
    }

    var searchInput = document.getElementById("log-search-query");
    var searchStr = searchInput ? searchInput.value.toLowerCase().trim() : "";

    var displayLogs = [];
    for (var i = 0; i < logs.length; i++) {
      var item = logs[i];
      var matchTag = !currentTagFilter || (item.tags && item.tags.indexOf(currentTagFilter) !== -1);
      var matchSearch = !searchStr ||
        item.sample.toLowerCase().indexOf(searchStr) !== -1 ||
        item.memo.toLowerCase().indexOf(searchStr) !== -1 ||
        item.timestamp.indexOf(searchStr) !== -1;

      if (matchTag && matchSearch) {
        displayLogs.push(item);
      }
    }

    container.innerHTML = "";

    if (displayLogs.length === 0) {
      container.innerHTML = '<div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 13px;">일치하는 로그 항목이 없습니다.</div>';
      return;
    }

    for (var j = 0; j < displayLogs.length; j++) {
      var entry = displayLogs[j];
      var itemDiv = document.createElement("div");
      itemDiv.className = "log-item";

      var tagsHtml = "";
      if (entry.tags && entry.tags.length > 0) {
        for (var k = 0; k < entry.tags.length; k++) {
          var tag = entry.tags[k];
          tagsHtml += '<span class="log-tag" onclick="filterByTag(\'' + tag + '\')">' + tag + '</span>';
        }
      }

      itemDiv.innerHTML =
        '<div class="log-meta">' +
          '<div>' +
            '<strong style="color:var(--text-main); font-size:12px;">' + entry.sample + '</strong> ' +
            '<span class="badge badge-subtle">' + entry.energy + ' keV</span> ' +
            '<span class="badge badge-subtle">' + entry.distance + ' mm</span> ' +
            '<span class="badge badge-subtle">' + entry.exposure + ' s</span>' +
          '</div>' +
          '<div>' +
            '<span style="font-family:var(--font-mono); margin-right:8px;">' + entry.timestamp + '</span>' +
            '<button class="btn btn-sm btn-danger" style="padding:1px 5px;" onclick="deleteLogEntry(' + entry.id + ')">삭제</button>' +
          '</div>' +
        '</div>' +
        '<div class="log-content">' + escapeHtml(entry.memo) + '</div>' +
        (tagsHtml ? '<div class="log-tags">' + tagsHtml + '</div>' : '');

      container.appendChild(itemDiv);
    }
  }

  function escapeHtml(str) {
    return (str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // Export functions
  function exportLogsCSV() {
    var logs = getLogs();
    var csvContent = "\uFEFFID,Timestamp,Sample,Energy(keV),Distance(mm),Exposure(s),Tags,Memo\n";

    for (var i = 0; i < logs.length; i++) {
      var row = logs[i];
      var tagsStr = (row.tags || []).join(" ");
      var memoClean = (row.memo || "").replace(/"/g, '""');
      csvContent += row.id + ',"' + row.timestamp + '","' + row.sample + '","' + row.energy + '","' + row.distance + '","' + row.exposure + '","' + tagsStr + '","' + memoClean + '"\n';
    }

    var blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "beamline_logbook_" + new Date().toISOString().slice(0, 10) + ".csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (window.showToast) window.showToast("CSV 파일이 다운로드되었습니다.", "success");
  }

  function exportLogsJSON() {
    var logs = getLogs();
    var blob = new Blob([JSON.stringify(logs, null, 2)], { type: "application/json;charset=utf-8;" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "beamline_logbook_" + new Date().toISOString().slice(0, 10) + ".json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (window.showToast) window.showToast("JSON 파일이 다운로드되었습니다.", "success");
  }

  function copyLogsMarkdown() {
    var logs = getLogs();
    var md = "| 일시 | 시료명 | 에너지(keV) | 거리(mm) | 노출(s) | 태그 | 메모 |\n";
    md += "|:---|:---|:---|:---|:---|:---|:---|\n";

    for (var i = 0; i < logs.length; i++) {
      var row = logs[i];
      var tagsStr = (row.tags || []).join(" ");
      var memoClean = (row.memo || "").replace(/\|/g, "\\|").replace(/\n/g, " ");
      md += "| " + row.timestamp + " | " + row.sample + " | " + row.energy + " | " + row.distance + " | " + row.exposure + " | " + tagsStr + " | " + memoClean + " |\n";
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(md).then(function () {
        if (window.showToast) window.showToast("클립보드에 마크다운 표가 복사되었습니다.", "success");
      });
    } else {
      var temp = document.createElement("textarea");
      temp.value = md;
      document.body.appendChild(temp);
      temp.select();
      document.execCommand("copy");
      document.body.removeChild(temp);
      if (window.showToast) window.showToast("클립보드에 마크다운 표가 복사되었습니다.", "success");
    }
  }

  // Expose to global
  window.addLogEntry = addLogEntry;
  window.deleteLogEntry = deleteLogEntry;
  window.filterByTag = filterByTag;
  window.clearTagFilter = clearTagFilter;
  window.renderLogbook = renderLogbook;
  window.exportLogsCSV = exportLogsCSV;
  window.exportLogsJSON = exportLogsJSON;
  window.copyLogsMarkdown = copyLogsMarkdown;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderLogbook);
  } else {
    renderLogbook();
  }
})();
