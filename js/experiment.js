/**
 * BEAMLINE TOOLKIT — Experiment Management (Notes, Checklist, Samples, DAQ, Kanban)
 * Academic Print Specification: Consolas numbers, booktabs styling, zero emojis.
 * Compatibility: CentOS 7 (Firefox 60 ESR, Chrome 60~70)
 */

(function () {
  "use strict";

  // --- 4.1 Auto-saving Lab Notes ---
  var noteSaveTimer = null;

  function initLabNotes() {
    var noteArea = document.getElementById("exp-notes-textarea");
    var noteStatus = document.getElementById("exp-notes-status");
    if (!noteArea) return;

    var savedNote = Storage.get("lab_notes", "BEAMLINE EXPERIMENTAL PROTOCOL & OBSERVATION LOG\n\n- Date: 2026-08-08\n- Incident Beam Energy: 10.000 keV\n- Target: Reciprocal space mapping & phase transition analysis\n");
    noteArea.value = savedNote;

    noteArea.addEventListener("input", function () {
      if (noteStatus) noteStatus.textContent = "저장 중...";
      clearTimeout(noteSaveTimer);
      noteSaveTimer = setTimeout(function () {
        Storage.set("lab_notes", noteArea.value);
        if (noteStatus) {
          var now = new Date();
          var timeStr = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0") + ":" + String(now.getSeconds()).padStart(2, "0");
          noteStatus.textContent = "자동 저장 완료 (" + timeStr + ")";
        }
      }, 500);
    });
  }

  function exportNotesTxt() {
    var text = document.getElementById("exp-notes-textarea").value;
    var blob = new Blob([text], { type: "text/plain;charset=utf-8;" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "beamline_notes_" + new Date().toISOString().slice(0, 10) + ".txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (window.showToast) window.showToast("실험 노트 텍스트 파일이 다운로드되었습니다.", "info");
  }

  // --- 4.2 Interactive Checklist ---
  function getChecklists() {
    return Storage.get("checklists", DEFAULT_CHECKLISTS);
  }

  function saveChecklists(data) {
    Storage.set("checklists", data);
    renderChecklists();
  }

  function toggleCheckItem(groupIndex, itemIndex) {
    var lists = getChecklists();
    if (lists[groupIndex] && lists[groupIndex].items[itemIndex]) {
      lists[groupIndex].items[itemIndex].done = !lists[groupIndex].items[itemIndex].done;
      saveChecklists(lists);
    }
  }

  function addCheckItem(groupIndex) {
    var input = document.getElementById("check-new-input-" + groupIndex);
    if (!input || !input.value.trim()) return;
    var lists = getChecklists();
    if (lists[groupIndex]) {
      lists[groupIndex].items.push({ text: input.value.trim(), done: false });
      input.value = "";
      saveChecklists(lists);
    }
  }

  function resetChecklists() {
    if (!confirm("체크리스트를 기본 프로토콜 템플릿으로 초기화하시겠습니까?")) return;
    saveChecklists(DEFAULT_CHECKLISTS);
    if (window.showToast) window.showToast("체크리스트가 초기화되었습니다.", "info");
  }

  function renderChecklists() {
    var container = document.getElementById("exp-checklist-container");
    if (!container) return;

    var lists = getChecklists();
    container.innerHTML = "";

    for (var g = 0; g < lists.length; g++) {
      var group = lists[g];
      var total = group.items.length;
      var doneCount = 0;
      for (var k = 0; k < total; k++) {
        if (group.items[k].done) doneCount++;
      }
      var pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;

      var groupDiv = document.createElement("div");
      groupDiv.className = "card";
      groupDiv.style.marginBottom = "14px";

      var itemsHtml = "";
      for (var i = 0; i < group.items.length; i++) {
        var it = group.items[i];
        var isChecked = it.done ? "checked" : "";
        var strikeStyle = it.done ? "text-decoration: line-through; color: var(--ink-muted);" : "";
        itemsHtml +=
          '<div style="display:flex; align-items:center; padding: 6px 0; border-bottom: 1px solid var(--rule-light);">' +
            '<input type="checkbox" ' + isChecked + ' onchange="toggleCheckItem(' + g + ', ' + i + ')" style="margin-right: 10px; cursor:pointer;" id="chk_' + g + '_' + i + '">' +
            '<label for="chk_' + g + '_' + i + '" style="flex:1; cursor:pointer; font-size:12px; ' + strikeStyle + '">' + escapeHtml(it.text) + '</label>' +
          '</div>';
      }

      groupDiv.innerHTML =
        '<div class="card-header">' +
          '<span class="card-title">' + escapeHtml(group.title) + '</span>' +
          '<span class="badge">' + doneCount + ' / ' + total + ' (' + pct + '%)</span>' +
        '</div>' +
        '<div class="card-body">' +
          itemsHtml +
          '<div style="display:flex; margin-top: 10px;">' +
            '<input type="text" class="form-control form-control-sm" id="check-new-input-' + g + '" placeholder="새 점검 항목 추가..." style="margin-right: 6px;" onkeydown="if(event.keyCode===13) addCheckItem(' + g + ')">' +
            '<button class="btn btn-sm btn-secondary" onclick="addCheckItem(' + g + ')">추가</button>' +
          '</div>' +
        '</div>';

      container.appendChild(groupDiv);
    }
  }

  // --- 4.3 Sample List Manager ---
  function getSampleList() {
    return Storage.get("sample_list", [
      { id: 1, name: "LaB6_Std_01", material: "LaB6", thickness: "100 μm", pos: "X: 0.0, Y: 12.5, Z: 0.0, Th: 0.0", notes: "표준 분말 교정용 캡슐" },
      { id: 2, name: "ThinFilm_STO_02", material: "SrTiO3", thickness: "50 nm", pos: "X: 15.2, Y: 10.0, Z: -2.1, Th: 15.4", notes: "기판 위에 에피택셜 성장 시료" },
      { id: 3, name: "Protein_Crystal_A", material: "Lysozyme", thickness: "200 μm", pos: "X: -5.0, Y: 8.2, Z: 1.4, Th: 45.0", notes: "극저온 100K 윈도우 유지 측정" }
    ]);
  }

  function saveSampleList(list) {
    Storage.set("sample_list", list);
    renderSampleList();
  }

  function addSample() {
    var name = document.getElementById("sample-add-name").value.trim();
    var mat = document.getElementById("sample-add-mat").value.trim();
    var thick = document.getElementById("sample-add-thick").value.trim();
    var pos = document.getElementById("sample-add-pos").value.trim();
    var notes = document.getElementById("sample-add-notes").value.trim();

    if (!name) {
      alert("시료명을 입력하십시오.");
      return;
    }

    var list = getSampleList();
    list.push({
      id: Date.now(),
      name: name,
      material: mat || "-",
      thickness: thick || "-",
      pos: pos || "-",
      notes: notes || "-"
    });

    saveSampleList(list);

    document.getElementById("sample-add-name").value = "";
    document.getElementById("sample-add-mat").value = "";
    document.getElementById("sample-add-thick").value = "";
    document.getElementById("sample-add-pos").value = "";
    document.getElementById("sample-add-notes").value = "";

    if (window.showToast) window.showToast("시료가 등록되었습니다.", "info");
  }

  function deleteSample(id) {
    if (!confirm("선택한 시료를 목록에서 삭제하시겠습니까?")) return;
    var list = getSampleList();
    var filtered = [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].id !== id) filtered.push(list[i]);
    }
    saveSampleList(filtered);
    if (window.showToast) window.showToast("시료가 삭제되었습니다.", "info");
  }

  function renderSampleList() {
    var tbody = document.getElementById("sample-table-body");
    var countEl = document.getElementById("sample-total-count");
    if (!tbody) return;

    var list = getSampleList();
    if (countEl) countEl.textContent = list.length + " samples";

    tbody.innerHTML = "";

    if (list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:var(--ink-muted); padding:20px;">등록된 시료가 없습니다.</td></tr>';
      return;
    }

    for (var i = 0; i < list.length; i++) {
      var s = list[i];
      var tr = document.createElement("tr");
      tr.innerHTML =
        '<td><strong>' + escapeHtml(s.name) + '</strong></td>' +
        '<td>' + escapeHtml(s.material) + '</td>' +
        '<td class="mono">' + escapeHtml(s.thickness) + '</td>' +
        '<td class="mono">' + escapeHtml(s.pos) + '</td>' +
        '<td>' + escapeHtml(s.notes) + '</td>' +
        '<td><button class="btn btn-sm btn-danger" style="padding:1px 5px;" onclick="deleteSample(' + s.id + ')">삭제</button></td>';
      tbody.appendChild(tr);
    }
  }

  // --- 4.4 DAQ Setting Calculator ---
  function calcDAQ() {
    var detSelect = document.getElementById("daq-detector").value;
    var fps = parseFloat(document.getElementById("daq-fps").value);
    var runTime_s = parseFloat(document.getElementById("daq-runtime").value);
    var bitDepth = parseInt(document.getElementById("daq-bitdepth").value, 10);

    var pixelCount = 1024 * 1024;
    if (detSelect === "eiger4m") pixelCount = 2070 * 2167;
    else if (detSelect === "eiger9m") pixelCount = 3110 * 3269;
    else if (detSelect === "eiger16m") pixelCount = 4150 * 4371;
    else if (detSelect === "pilatus2m") pixelCount = 1475 * 1679;
    else if (detSelect === "pilatus6m") pixelCount = 2463 * 2527;
    else if (detSelect === "custom2k") pixelCount = 2048 * 2048;

    if (isNaN(fps) || fps <= 0 || isNaN(runTime_s) || runTime_s <= 0) return;

    var bytesPerPixel = bitDepth / 8;
    var bytesPerFrame = pixelCount * bytesPerPixel;
    var dataRate_MB_s = (bytesPerFrame * fps) / (1024 * 1024);
    var totalFrames = Math.round(fps * runTime_s);
    var totalData_GB = (dataRate_MB_s * runTime_s) / 1024;

    document.getElementById("daq-res-rate").innerHTML = dataRate_MB_s.toFixed(2) + " MB/s (" + (dataRate_MB_s * 8).toFixed(1) + " Mbit/s)";
    document.getElementById("daq-res-frames").innerHTML = totalFrames.toLocaleString() + " frames";
    document.getElementById("daq-res-size").innerHTML = totalData_GB.toFixed(2) + " GB (" + (totalData_GB / 1024).toFixed(3) + " TB)";

    if (window.recordCalculation) {
      window.recordCalculation("4.4 DAQ Estimator", detSelect + " @ " + fps + " Hz, " + runTime_s + " s", dataRate_MB_s.toFixed(1) + " MB/s, Total " + totalData_GB.toFixed(2) + " GB");
    }
  }

  // --- 4.5 Kanban Board ---
  function getKanbanTasks() {
    return Storage.get("kanban_tasks", [
      { id: 1, title: "빔라인 정렬 & 캘리브레이션", status: "done", desc: "LaB6 표준 시료 측정 및 빔센터 보정" },
      { id: 2, title: "배치 1 시료 저온 스캔", status: "in_progress", desc: "100K 진공 챔버 온도 안정화 후 측정" },
      { id: 3, title: "데이터 원격 자동 백업 확인", status: "in_progress", desc: "NAS 서버와 실시간 rsync 체크" },
      { id: 4, title: "배치 2 방위각 스캔 및 흡수 보정", status: "todo", desc: "Chi-Phi 모터 틸트 회절 스캔" }
    ]);
  }

  function saveKanbanTasks(tasks) {
    Storage.set("kanban_tasks", tasks);
    renderKanban();
  }

  function addKanbanTask() {
    var title = prompt("새로운 작업 제목을 입력하십시오:");
    if (!title || !title.trim()) return;
    var desc = prompt("작업 설명 또는 메모 (선택사항):") || "";

    var tasks = getKanbanTasks();
    tasks.push({
      id: Date.now(),
      title: title.trim(),
      status: "todo",
      desc: desc.trim()
    });

    saveKanbanTasks(tasks);
    if (window.showToast) window.showToast("새 작업 항목이 등록되었습니다.", "info");
  }

  function moveKanbanTask(id, nextStatus) {
    var tasks = getKanbanTasks();
    for (var i = 0; i < tasks.length; i++) {
      if (tasks[i].id === id) {
        tasks[i].status = nextStatus;
        break;
      }
    }
    saveKanbanTasks(tasks);
  }

  function deleteKanbanTask(id) {
    var tasks = getKanbanTasks();
    var filtered = [];
    for (var i = 0; i < tasks.length; i++) {
      if (tasks[i].id !== id) filtered.push(tasks[i]);
    }
    saveKanbanTasks(filtered);
  }

  function renderKanban() {
    var colTodo = document.getElementById("kanban-col-todo");
    var colProg = document.getElementById("kanban-col-in_progress");
    var colDone = document.getElementById("kanban-col-done");

    if (!colTodo || !colProg || !colDone) return;

    var tasks = getKanbanTasks();
    colTodo.innerHTML = "";
    colProg.innerHTML = "";
    colDone.innerHTML = "";

    var countTodo = 0, countProg = 0, countDone = 0;

    for (var i = 0; i < tasks.length; i++) {
      var t = tasks[i];
      var card = document.createElement("div");
      card.className = "kanban-task-card";

      var moveButtons = "";
      if (t.status === "todo") {
        countTodo++;
        moveButtons = '<button class="btn btn-sm btn-secondary" onclick="moveKanbanTask(' + t.id + ', \'in_progress\')">진행중 ➔</button>';
      } else if (t.status === "in_progress") {
        countProg++;
        moveButtons =
          '<button class="btn btn-sm btn-secondary" onclick="moveKanbanTask(' + t.id + ', \'todo\')">⬅ 대기</button> ' +
          '<button class="btn btn-sm btn-primary" onclick="moveKanbanTask(' + t.id + ', \'done\')">완료 ➔</button>';
      } else if (t.status === "done") {
        countDone++;
        moveButtons = '<button class="btn btn-sm btn-secondary" onclick="moveKanbanTask(' + t.id + ', \'in_progress\')">⬅ 재개</button>';
      }

      card.innerHTML =
        '<div class="kanban-task-title">' + escapeHtml(t.title) + '</div>' +
        (t.desc ? '<div style="font-size:11px; color:var(--ink-secondary); margin-bottom:8px;">' + escapeHtml(t.desc) + '</div>' : '') +
        '<div style="display:flex; justify-content:space-between; align-items:center;">' +
          '<div>' + moveButtons + '</div>' +
          '<button class="btn btn-sm btn-danger" style="padding:1px 5px;" onclick="deleteKanbanTask(' + t.id + ')">✕</button>' +
        '</div>';

      if (t.status === "todo") colTodo.appendChild(card);
      else if (t.status === "in_progress") colProg.appendChild(card);
      else if (t.status === "done") colDone.appendChild(card);
    }

    var countTodoEl = document.getElementById("kanban-count-todo");
    var countProgEl = document.getElementById("kanban-count-prog");
    var countDoneEl = document.getElementById("kanban-count-done");
    if (countTodoEl) countTodoEl.textContent = countTodo;
    if (countProgEl) countProgEl.textContent = countProg;
    if (countDoneEl) countDoneEl.textContent = countDone;
  }

  function escapeHtml(str) {
    return (str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  window.initLabNotes = initLabNotes;
  window.exportNotesTxt = exportNotesTxt;
  window.toggleCheckItem = toggleCheckItem;
  window.addCheckItem = addCheckItem;
  window.resetChecklists = resetChecklists;
  window.renderChecklists = renderChecklists;
  window.addSample = addSample;
  window.deleteSample = deleteSample;
  window.renderSampleList = renderSampleList;
  window.calcDAQ = calcDAQ;
  window.addKanbanTask = addKanbanTask;
  window.moveKanbanTask = moveKanbanTask;
  window.deleteKanbanTask = deleteKanbanTask;
  window.renderKanban = renderKanban;

  function renderExperiment() {
    initLabNotes();
    renderChecklists();
    renderSampleList();
    calcDAQ();
    renderKanban();
  }

  window.renderExperiment = renderExperiment;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderExperiment);
  } else {
    renderExperiment();
  }
})();
