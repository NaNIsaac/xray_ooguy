/**
 * XRAY.OOGUY — RECORD
 *
 * Plain-text logbook headers and WYSIWYG memo-style in-situ timestamped event snippets.
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
  // Three built-in headers, plus any the user writes. Their own presets live in
  // localStorage next to the rest of the toolkit's state and are edited in
  // place; the built-ins stay read-only and can be used as a starting point.
  var BUILTIN_NAMES = {
    standard: "Standard Beamtime",
    shift: "Shift Handover",
    runs: "Run Sequence Matrix"
  };
  var BUILTIN_ORDER = ["standard", "shift", "runs"];
  var CUSTOM_KEY = "record_headers";

  var currentTab = "standard";
  var saveTimer = null;

  function loadCustom() {
    var list = window.Storage ? window.Storage.get(CUSTOM_KEY, []) : [];
    return Object.prototype.toString.call(list) === "[object Array]" ? list : [];
  }

  function storeCustom(list) {
    if (window.Storage) window.Storage.set(CUSTOM_KEY, list);
  }

  function findCustom(id) {
    var list = loadCustom();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return null;
  }

  function isCustom(id) {
    return String(id).indexOf("own-") === 0;
  }

  // Placeholders are expanded when the header is shown or copied, so a saved
  // preset does not carry a stale date around.
  function expandTokens(text) {
    return String(text)
      .replace(/\{datetime\}/g, getFormattedTimestamp())
      .replace(/\{date\}/g, getDateStr())
      .replace(/\{time\}/g, getFormattedTimestamp().slice(11));
  }

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

  // The body behind the active tab, before token expansion.
  function activeBody() {
    if (isCustom(currentTab)) {
      var own = findCustom(currentTab);
      return own ? own.body : "";
    }
    var tpls = getTemplates();
    return tpls[currentTab] || tpls.standard;
  }

  function renderTabs() {
    var bar = document.getElementById("rec-tpl-tabs");
    if (!bar) return;

    var frag = document.createDocumentFragment();

    function tab(id, label) {
      var b = document.createElement("button");
      b.className = "btn btn-sm " + (id === currentTab ? "btn-primary active" : "btn-secondary");
      b.textContent = label;
      b.onclick = function () { selectLogbookTab(id); };
      frag.appendChild(b);
    }

    for (var i = 0; i < BUILTIN_ORDER.length; i++) {
      tab(BUILTIN_ORDER[i], BUILTIN_NAMES[BUILTIN_ORDER[i]]);
    }

    var own = loadCustom();
    for (var j = 0; j < own.length; j++) {
      tab(own[j].id, own[j].name || "Untitled preset");
    }

    var add = document.createElement("button");
    add.className = "btn btn-sm btn-secondary rec-tpl-add";
    add.textContent = "+ New Preset";
    add.title = "Start a new preset from the header shown now";
    add.onclick = addPreset;
    frag.appendChild(add);

    bar.innerHTML = "";
    bar.appendChild(frag);
  }

  function selectLogbookTab(tabId) {
    currentTab = tabId || "standard";
    if (isCustom(currentTab) && !findCustom(currentTab)) currentTab = "standard";

    renderTabs();

    var previewEl = document.getElementById("logbook-tpl-preview");
    var editBox = document.getElementById("rec-tpl-edit");
    var nameEl = document.getElementById("rec-tpl-name");
    var bodyEl = document.getElementById("rec-tpl-body");
    var delBtn = document.getElementById("rec-tpl-delete");
    var own = isCustom(currentTab) ? findCustom(currentTab) : null;

    if (own) {
      if (previewEl) previewEl.style.display = "none";
      if (editBox) editBox.style.display = "block";
      if (delBtn) delBtn.style.display = "inline-block";
      if (nameEl && nameEl.value !== own.name) nameEl.value = own.name;
      if (bodyEl && bodyEl.value !== own.body) bodyEl.value = own.body;
    } else {
      if (previewEl) {
        previewEl.style.display = "block";
        previewEl.innerText = expandTokens(activeBody());
      }
      if (editBox) editBox.style.display = "none";
      if (delBtn) delBtn.style.display = "none";
    }
  }

  function addPreset() {
    var list = loadCustom();
    var seed = activeBody();          // start from whatever is on screen
    var preset = {
      // The timestamp alone collides when two presets are added in the same
      // millisecond, and a duplicate id would delete both at once.
      id: "own-" + String(new Date().getTime()) + "-" + String(Math.floor(Math.random() * 1000000)),
      name: "My Header " + (list.length + 1),
      body: seed
    };
    list.push(preset);
    storeCustom(list);

    selectLogbookTab(preset.id);

    var nameEl = document.getElementById("rec-tpl-name");
    if (nameEl) {
      nameEl.focus();
      nameEl.select();
    }
  }

  // Both editors write straight into localStorage, debounced like the
  // calculator inputs, so nothing has to be explicitly saved.
  function scheduleSave(mutate) {
    var list = loadCustom();
    var preset = null;
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === currentTab) { preset = list[i]; break; }
    }
    if (!preset) return;

    mutate(preset);
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () { storeCustom(list); }, 300);
  }

  function renamePreset() {
    var nameEl = document.getElementById("rec-tpl-name");
    if (!nameEl) return;
    scheduleSave(function (p) { p.name = nameEl.value; });
    renderTabs();
  }

  function editPresetBody() {
    var bodyEl = document.getElementById("rec-tpl-body");
    if (!bodyEl) return;
    scheduleSave(function (p) { p.body = bodyEl.value; });
  }

  function deletePreset() {
    if (!isCustom(currentTab)) return;
    var preset = findCustom(currentTab);
    if (!preset) return;
    if (!window.confirm('Delete the preset "' + (preset.name || "Untitled preset") + '"?')) return;

    var list = loadCustom();
    var kept = [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].id !== currentTab) kept.push(list[i]);
    }
    storeCustom(kept);
    selectLogbookTab("standard");
    if (window.showToast) window.showToast("Preset deleted.", "info");
  }

  function copyActiveTemplate() {
    copyToClipboard(expandTokens(activeBody()), "Logbook header copied to clipboard.");
  }

  // --- 2. In-Situ Quick Snippets (WYSIWYG Memo Cards) ---
  var SNIPPET_TEMPLATES = {
    beam_dump: function (ts) {
      return "[" + ts + "] BEAM DUMP: Storage ring beam lost (0 mA). Beamline standby.";
    },
    beam_restored: function (ts) {
      return "[" + ts + "] BEAM RESTORED: Top-up injection nominal (300 mA). Hutch shutter opened.";
    },
    sample_mount: function (ts) {
      return "[" + ts + "] SAMPLE MOUNT: Sample [            ] mounted on stage.";
    },
    beam_align: function (ts) {
      return "[" + ts + "] ALIGNMENT: Direct beam, pinhole, and slits centered. Counts: [      ] ph/s.";
    },
    calibration: function (ts) {
      return "[" + ts + "] CALIBRATION: Standard (LaB6 / AgBh / CeO2) calibration measured.";
    },
    scan_start: function (ts) {
      return "[" + ts + "] SCAN START: Run #[    ] started (Exp: [  ] s, Attn: [  ] dB).";
    },
    scan_finish: function (ts) {
      return "[" + ts + "] SCAN FINISH: Run #[    ] completed. 2D frames saved.";
    },
    interlock: function (ts) {
      return "[" + ts + "] INTERLOCK: Hutch search / Interlock / Motor error / Alarm triggered.";
    }
  };

  function triggerSnippet(key, cardEl) {
    var ts = getFormattedTimestamp();
    var fn = SNIPPET_TEMPLATES[key];
    if (!fn) return;
    var line = fn(ts);

    if (cardEl) {
      cardEl.classList.add("copied");
      setTimeout(function () {
        cardEl.classList.remove("copied");
      }, 700);
    }

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

  function updateLiveTimestamps() {
    var ts = getFormattedTimestamp();
    var nodes = document.querySelectorAll(".snip-live-time");
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].textContent = ts;
    }
  }

  // Global Exposure
  window.selectLogbookTab = selectLogbookTab;
  window.addPreset = addPreset;
  window.renamePreset = renamePreset;
  window.editPresetBody = editPresetBody;
  window.deletePreset = deletePreset;
  window.copyActiveTemplate = copyActiveTemplate;
  window.triggerSnippet = triggerSnippet;
  window.addCustomNote = addCustomNote;

  function init() {
    selectLogbookTab("standard");
    updateLiveTimestamps();
    setInterval(updateLiveTimestamps, 1000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
