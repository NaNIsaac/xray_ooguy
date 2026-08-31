/**
 * XRAY.OOGUY — Main Application Controller & Hash Router
 * Compatibility: CentOS 7 (Firefox 60 ESR, Chrome 60~70)
 * Note: No optional chaining (?.), no CSS Grid, no external libraries.
 */

(function () {
  "use strict";

  // Global State
  var App = {
    currentRoute: "radiometry",
    theme: "light"
  };

  // Safe localStorage helper
  var Storage = {
    get: function (key, defaultVal) {
      try {
        var val = localStorage.getItem("bl_toolkit_" + key);
        if (val === null || val === undefined) return defaultVal;
        return JSON.parse(val);
      } catch (e) {
        console.warn("localStorage read failed:", e);
        return defaultVal;
      }
    },
    set: function (key, value) {
      try {
        localStorage.setItem("bl_toolkit_" + key, JSON.stringify(value));
      } catch (e) {
        console.warn("localStorage write failed:", e);
      }
    }
  };

  // ------------------------------------------------------------------
  // Calculator input persistence
  // ------------------------------------------------------------------
  // Every calculator ships with working defaults in the markup, so a card
  // always shows a real result the first time it is opened. Once the user
  // edits a field the value is remembered, and the next visit restores it and
  // recalculates, so the tool reopens exactly where they left it.
  // v2: energy inputs are keV throughout and the eV / Å converter twins are gone,
  //     so values stored under the old key no longer mean the same thing.
  var CALC_INPUT_KEY = "calc_inputs_v2";

  // Results carry one customary unit. When a figure runs past what fixed
  // notation reads well it switches to exponent form, rather than growing a
  // second unit beside it.
  function fmt(value, digits) {
    if (!isFinite(value)) return "-";
    var size = Math.abs(value);
    if (size !== 0 && (size >= 1e5 || size < 1e-3)) return value.toExponential(3);
    return value.toFixed(digits === undefined ? 3 : digits);
  }

  // A field is only worth reading if it is inside the domain declared on the
  // element itself. Out-of-range input yields NaN, which every calculator
  // already treats as "no result" — so a negative thickness or a 400% mirror
  // reflectivity stops producing a plausible-looking number.
  function readField(id) {
    var el = document.getElementById(id);
    if (!el) return NaN;

    var v = parseFloat(el.value);
    if (isNaN(v)) return NaN;

    var min = parseFloat(el.getAttribute("min"));
    var max = parseFloat(el.getAttribute("max"));
    if (!isNaN(min) && v < min) return NaN;
    if (!isNaN(max) && v > max) return NaN;

    return v;
  }

  // Search boxes filter a list rather than feed a calculation; restoring them
  // would hide rows for no reason.
  var CALC_INPUT_SKIP = { "crystal-search-input": true, "log-search-query": true };

  var calcSaveTimer = null;

  function calcInputElements() {
    var out = [];
    // Every view that holds a calculator. The record, data and settings views
    // keep their own state elsewhere, so they are deliberately not listed.
    var scopes = document.querySelectorAll("#view-radiometry, #view-optics, #view-geometry, #view-coherence");

    for (var i = 0; i < scopes.length; i++) {
      var els = scopes[i].querySelectorAll("input, select");
      for (var j = 0; j < els.length; j++) {
        var el = els[j];
        var type = (el.type || "").toLowerCase();
        if (!el.id || CALC_INPUT_SKIP[el.id]) continue;
        if (type === "checkbox" || type === "radio" || type === "file") continue;
        out.push(el);
      }
    }
    return out;
  }

  function saveCalcInputs() {
    var store = {};
    var els = calcInputElements();
    for (var i = 0; i < els.length; i++) {
      store[els[i].id] = els[i].value;
    }
    Storage.set(CALC_INPUT_KEY, store);
  }

  function scheduleCalcInputSave() {
    clearTimeout(calcSaveTimer);
    calcSaveTimer = setTimeout(saveCalcInputs, 400);
  }

  function restoreCalcInputs() {
    var saved = Storage.get(CALC_INPUT_KEY, {});
    var els = calcInputElements();
    var restored = 0;

    for (var i = 0; i < els.length; i++) {
      var el = els[i];

      if (!el.getAttribute("data-calc-bound")) {
        el.setAttribute("data-calc-bound", "1");
        el.addEventListener("input", scheduleCalcInputSave);
        el.addEventListener("change", scheduleCalcInputSave);
      }

      var val = saved[el.id];
      if (val === undefined || val === null || val === "") continue;

      // A <select> whose options are built at runtime can only take the value
      // once those options exist; skip silently rather than blanking it.
      if (el.tagName === "SELECT") {
        var match = false;
        for (var o = 0; o < el.options.length; o++) {
          if (el.options[o].value === val) { match = true; break; }
        }
        if (!match) continue;
      }

      el.value = val;
      restored++;
    }

    return restored;
  }

  // Re-run every calculator so restored values are reflected in the results.
  function recalcAll() {
    var fns = ["initOpticsView", "initBeamlineView", "initLattice", "renderValidity", "renderMiniPlots"];
    for (var i = 0; i < fns.length; i++) {
      if (window[fns[i]]) {
        try {
          window[fns[i]]();
        } catch (e) {
          console.warn("Recalculation failed for " + fns[i] + ":", e);
        }
      }
    }
  }

  // Toast Notification System
  function showToast(message, type) {
    var container = document.getElementById("toast-container");
    if (!container) return;

    type = type || "info";
    var toast = document.createElement("div");
    toast.className = "toast toast-" + type;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(function () {
      if (toast && toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 3200);
  }

  // ------------------------------------------------------------------
  // Clipboard Copy & Universal Result Box Copy System
  // ------------------------------------------------------------------
  function copyTextToClipboard(text, successMsg) {
    if (!text) return;
    var trimmed = String(text).trim();
    if (!trimmed || trimmed === "-") return;

    var msg = successMsg || (window.i18n ? window.i18n.t("rec_copied") : "클립보드에 복사되었습니다.");

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(trimmed).then(function () {
        if (window.showToast) window.showToast(msg, "info");
      }).catch(function () {
        fallbackCopyText(trimmed, msg);
      });
      return;
    }
    fallbackCopyText(trimmed, msg);
  }

  function fallbackCopyText(text, msg) {
    try {
      var temp = document.createElement("textarea");
      temp.value = text;
      temp.style.position = "fixed";
      temp.style.top = "-9999px";
      temp.style.left = "-9999px";
      temp.style.opacity = "0";
      temp.setAttribute("readonly", "");
      document.body.appendChild(temp);
      temp.select();
      document.execCommand("copy");
      document.body.removeChild(temp);
      if (window.showToast) window.showToast(msg, "info");
    } catch (e) {
      console.warn("Fallback copy failed:", e);
    }
  }

  function cleanElementText(el) {
    if (!el) return "";
    var clone = el.cloneNode(true);
    var copyBtns = clone.querySelectorAll(".result-box-copy-btn, button, .badge");
    for (var b = 0; b < copyBtns.length; b++) {
      if (copyBtns[b].parentNode) {
        copyBtns[b].parentNode.removeChild(copyBtns[b]);
      }
    }
    var sups = clone.querySelectorAll("sup");
    for (var s = 0; s < sups.length; s++) {
      sups[s].textContent = "^" + sups[s].textContent;
    }
    var subs = clone.querySelectorAll("sub");
    for (var u = 0; u < subs.length; u++) {
      subs[u].textContent = "_" + subs[u].textContent;
    }
    return (clone.innerText || clone.textContent || "").replace(/\s+/g, " ").trim();
  }

  function findClosest(el, selector) {
    if (!el) return null;
    if (el.closest) return el.closest(selector);
    var parent = el.parentElement;
    while (parent) {
      if (parent.matches && parent.matches(selector)) return parent;
      parent = parent.parentElement;
    }
    return null;
  }

  function extractResultBoxText(box) {
    if (!box) return "";
    var lines = [];

    // 1. Bragg calc row
    var braggRow = findClosest(box, ".bragg-calc-row");
    if (braggRow) {
      var headerEl = braggRow.querySelector("div");
      var titleText = headerEl ? cleanElementText(headerEl) : "Bragg Calc";
      var inLabels = braggRow.querySelectorAll(".form-label");
      var inInputs = braggRow.querySelectorAll("input.form-control");
      var rVal = box.querySelector(".result-value");
      var rSub = box.querySelector("[id*='-res-sub']");

      lines.push("[" + titleText + "]");
      var inParts = [];
      for (var i = 0; i < inInputs.length; i++) {
        var lbl = inLabels[i] ? cleanElementText(inLabels[i]) : ("Input " + (i + 1));
        inParts.push(lbl + ": " + inInputs[i].value);
      }
      if (inParts.length) lines.push("• Inputs: " + inParts.join(", "));
      if (rVal) lines.push("• Result: " + cleanElementText(rVal));
      if (rSub) lines.push("• Detail: " + cleanElementText(rSub));
      return lines.join("\n");
    }

    // 2. Card title context
    var card = findClosest(box, ".card");
    var cardTitle = card ? card.querySelector(".card-title") : null;
    if (cardTitle) {
      var tText = cleanElementText(cardTitle);
      if (tText) lines.push("[" + tText + "]");
    }

    // 3. Single summary (e.g. optics-conv-summary)
    var singleSummary = box.querySelector("#optics-conv-summary");
    if (singleSummary) {
      lines.push(cleanElementText(singleSummary));
      return lines.join("\n");
    }

    // 4. Result grid items
    var items = box.querySelectorAll(".result-item");
    if (items.length > 0) {
      for (var j = 0; j < items.length; j++) {
        var labelEl = items[j].querySelector(".result-label");
        var valEl = items[j].querySelector(".result-value");
        if (valEl) {
          var label = labelEl ? cleanElementText(labelEl) : "";
          var val = cleanElementText(valEl);
          if (val && val !== "-") {
            lines.push("• " + (label ? label + ": " : "") + val);
          }
        }
      }
    } else {
      var rVals = box.querySelectorAll(".result-value");
      for (var v = 0; v < rVals.length; v++) {
        var valT = cleanElementText(rVals[v]);
        if (valT && valT !== "-") lines.push("• " + valT);
      }
    }

    // 5. Result formula and notes
    var formula = box.querySelector(".result-formula");
    if (formula) {
      var fText = cleanElementText(formula);
      if (fText && fText !== "-") lines.push("  " + fText);
    }
    var note = box.querySelector(".result-note");
    if (note) {
      var nText = cleanElementText(note);
      if (nText && nText !== "-") lines.push("  " + nText);
    }

    return lines.join("\n");
  }

  function initResultBoxCopy() {
    var boxes = document.querySelectorAll(".result-box");
    var copyTitle = (window.i18n ? window.i18n.t("btn_copy_results") : "결과값 전체 복사") || "Copy Results";

    for (var i = 0; i < boxes.length; i++) {
      var box = boxes[i];

      // Insert copy button if not present
      if (!box.querySelector(".result-box-copy-btn")) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "result-box-copy-btn";
        btn.setAttribute("title", copyTitle);
        btn.setAttribute("aria-label", copyTitle);
        btn.innerHTML =
          '<svg class="icon-copy" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter">' +
            '<rect x="9" y="9" width="13" height="13"></rect>' +
            '<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>' +
          '</svg>' +
          '<svg class="icon-copied" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square" stroke-linejoin="miter">' +
            '<polyline points="20 6 9 17 4 12"></polyline>' +
          '</svg>';

        (function (b, targetBox) {
          b.addEventListener("click", function (e) {
            e.stopPropagation();
            var text = extractResultBoxText(targetBox);
            if (text) {
              copyTextToClipboard(text);
              b.classList.add("copied");
              setTimeout(function () {
                b.classList.remove("copied");
              }, 1400);
            }
          });
        })(btn, box);

        box.appendChild(btn);
      } else {
        var existingBtn = box.querySelector(".result-box-copy-btn");
        if (existingBtn) {
          existingBtn.setAttribute("title", copyTitle);
          existingBtn.setAttribute("aria-label", copyTitle);
        }
      }

      // Add click-to-copy handler on individual result items
      var items = box.querySelectorAll(".result-item");
      for (var k = 0; k < items.length; k++) {
        var item = items[k];
        if (!item.hasAttribute("data-copy-bound")) {
          item.setAttribute("data-copy-bound", "true");
          item.setAttribute("title", "클릭하여 값 복사 / Click to copy");
          (function (resItem) {
            resItem.addEventListener("click", function (e) {
              if (e.target && findClosest(e.target, ".result-box-copy-btn")) return;
              var valEl = resItem.querySelector(".result-value");
              var labelEl = resItem.querySelector(".result-label");
              if (valEl) {
                var valText = cleanElementText(valEl);
                if (valText && valText !== "-") {
                  var lblText = labelEl ? cleanElementText(labelEl) : "";
                  var toastMsg = (lblText ? lblText + ": " : "") + valText;
                  copyTextToClipboard(valText, toastMsg);
                  resItem.classList.add("result-item-flash");
                  setTimeout(function () {
                    resItem.classList.remove("result-item-flash");
                  }, 400);
                }
              }
            });
          })(item);
        }
      }
    }
  }

  // ------------------------------------------------------------------
  // Recently used
  // ------------------------------------------------------------------
  // What every calculator writes when it runs, and the only thing anything
  // reads back: the id of the card, newest first. The dashboard turns the top
  // few into the line that names what this reader was last doing.
  //
  // The id, never a printed label. A label freezes the section number and the
  // language at the moment of the calculation, and both move — the number
  // follows the card's position and the wording follows the interface
  // language. An entry made this morning in Korean names itself this
  // afternoon in English under its current number.
  //
  // Engines still call this with the inputs and the result after the id. Those
  // arguments went to a calculation-history table that is gone; they are not
  // in the signature any more and are simply dropped, which was a smaller
  // change than editing forty-eight call sites to say the same thing.
  //
  // Eight is generous: the dashboard shows three, and only needs the spare in
  // case the top of the list names a card that has since been renamed away.
  var RECENT_LIMIT = 8;

  // Every calculator runs once on load to fill its result box with a default
  // answer, and again when the theme or the language changes. That is the page
  // talking to itself, and it used to be written down — so a first visit met a
  // "recently used" line naming three tools it had never opened.
  //
  // A run counts only if a person caused it. The events that count are the
  // ones raised inside a card body: a field edited, a preset or a material
  // chosen. Navigation, theme and language all happen elsewhere in the
  // document, so the recalculations they trigger pass through unrecorded. The
  // window is wide enough for a calculator that redraws on a timer after the
  // keystroke that caused it.
  var USER_EDIT_WINDOW_MS = 1500;
  var lastUserEdit = 0;

  function noteUserEdit(e) {
    if (!e || e.isTrusted === false) return;
    var el = e.target;
    if (!el || !el.closest || !el.closest(".card-body")) return;
    lastUserEdit = Date.now();
  }

  function recordCalculation(cardId) {
    if (Date.now() - lastUserEdit > USER_EDIT_WINDOW_MS) return;
    try {
      var list = Storage.get("recent_cards", []);
      // One entry per card: running a calculator again moves it to the front
      // rather than adding a second mention of it to a list three items long.
      var kept = [cardId];
      for (var i = 0; i < list.length; i++) {
        if (list[i] && list[i] !== cardId) kept.push(list[i]);
      }
      Storage.set("recent_cards", kept.slice(0, RECENT_LIMIT));
    } catch (e) {
      console.error("Failed to record calculation:", e);
    }
  }

  // Router logic — one route per view section, no aliases.
  //
  // The suites follow the order a beamtime actually runs: work out what the
  // beam can afford (RADIOMETRY), set the energy and check the optics (OPTICS),
  // place the crystal and the detector (GEOMETRY), confirm the beam is coherent
  // enough for the experiment (COHERENCE), read the data back (DATA), write it
  // down (RECORD). The previous split was by physics discipline, which had
  // nowhere to put a scan-time budget or a dose limit.
  //
  // No `title` field: the breadcrumb reads the nav_<route> key so the suite is
  // named in one place. It used to be duplicated here and drift was a matter of
  // time.
  var routes = {
    radiometry: {
      seoTitle: "Photon Flux, Dose & Attenuation Calculators | xray.ooguy",
      seoDesc: "Photons per second delivered to the sample, slit acceptance for a Gaussian beam, absorber stacks, radiation dose and the exposure time a sample can take."
    },
    optics: {
      seoTitle: "Energy, Wavelength & X-ray Transmittance Calculators | xray.ooguy",
      seoDesc: "Convert photon energy to wavelength, compute the complex refractive index and transmittance with absorption-edge warnings, the critical angle, grating dispersion, monochromator resolution and thermal drift."
    },
    geometry: {
      seoTitle: "Bragg Angle, d-spacing & Scattering Vector Q Calculators | xray.ooguy",
      seoDesc: "Bragg diffraction angle, lattice d-spacing from Miller indices for all seven crystal systems, reciprocal-space scattering vector Q, beam footprint, detector angular resolution and Eulerian cradle corrections."
    },
    coherence: {
      seoTitle: "BCDI Oversampling & Coherence Length Calculators | xray.ooguy",
      seoDesc: "Transverse and longitudinal coherence lengths at the sample, the Nyquist oversampling ratio for Bragg coherent diffraction imaging, and the real-space resolution a detector geometry can reach."
    },
    data: {
      seoTitle: "Scan Data Viewer & XRR Stitching | xray.ooguy",
      seoDesc: "Open two-column scan files in the browser, plot them on a linear or log axis, normalise, crop the range and stitch overlapping XRR segments into one curve."
    },
    record: {
      seoTitle: "Beamtime Logbook Headers & Event Snippets | xray.ooguy",
      seoDesc: "Plain-text beamtime logbook headers to paste into an existing lab notebook, and one-click in-situ event snippets with real-time timestamps."
    },
    // The landing route. Deliberately carries no strings: applyRouteMeta keeps
    // the head the page was authored with, which is already this language's
    // title and description.
    dashboard: {},
    index: {
      seoTitle: "All Calculators — Index | xray.ooguy",
      seoDesc: "Index of every synchrotron X-ray calculator in the toolkit: Bragg's law, d-spacing, Q-space, refraction, beam geometry and detector parameters."
    },
    settings: {
      seoTitle: "Settings | xray.ooguy",
      seoDesc: "Language, display theme and keyboard shortcuts for xray.ooguy."
    },
    about: {
      seoTitle: "About | xray.ooguy",
      seoDesc: "A lightweight, offline-first toolkit of synchrotron X-ray calculators and session logging, built for beamline researchers."
    }
  };

  // Where an address with no route lands, and what an unknown one falls back
  // to. The dashboard rather than the first suite: someone arriving without a
  // fragment has not told us what they came for, and asking them to pick a
  // discipline is a worse first question than asking what they are doing.
  // index.html marks the first suite active in the markup so a reader without
  // JavaScript still gets calculators; this runs on load and switches to it.
  var DEFAULT_ROUTE = "dashboard";

  // Links and bookmarks made before the suites were reorganised. A hash is the
  // only address a card ever had, so dropping these would break every link
  // anyone has saved or published. Each card moved to a known suite, so the
  // redirect is exact rather than a guess at the nearest section.
  var LEGACY_ROUTES = {
    // #dashboard is still a route — it is the action view now — so this entry
    // redirects only the card that moved out of it into the contents, and
    // deliberately has no "" fallback: a bare #dashboard stays where it is.
    dashboard: {
      "card-physical-constants": "index"
    },
    spectroscopy: {
      "card-optics-energy": "optics",
      "card-optics-refraction": "optics",
      "card-optics-reflection": "optics",
      "card-optics-grating": "optics",
      "card-beamline-resolution": "optics",
      "card-beamline-drift": "optics",
      "card-lattice-dspacing": "geometry",
      "card-beamline-flux": "radiometry",
      "": "optics"
    },
    goniometry: {
      "card-optics-bragg": "geometry",
      "card-optics-qspace": "geometry",
      "card-optics-scaling": "geometry",
      "card-beamline-footprint": "geometry",
      "card-beamline-detector": "geometry",
      "card-optics-euler": "geometry",
      "card-beamline-slit": "radiometry",
      "card-beamline-cdi": "coherence",
      "": "geometry"
    }
  };

  // The suite's own name, from the one key that holds it.
  function routeLabel(route) {
    var key = "nav_" + route;
    if (window.i18n && window.i18n.t) {
      var s = window.i18n.t(key);
      if (s !== key) return s;
    }
    return route.toUpperCase();
  }

  // Where a retired route and card now live, or null if the route is current.
  function legacyRoute(route, cardId) {
    var table = LEGACY_ROUTES[route];
    if (!table) return null;
    var moved = table[cardId || ""];
    return moved || table[""] || null;
  }

  // ------------------------------------------------------------------
  // Document metadata per route
  // ------------------------------------------------------------------
  // Hash fragments are not indexed as separate URLs, so this exists for the
  // browser tab, bookmarks, shared links and social unfurls rather than for
  // ranking. Pure DOM, no ES6, so it behaves the same on Firefox 60 ESR.
  function setPageMeta(titleText, descText) {
    document.title = titleText;

    var head = document.getElementsByTagName("head")[0];
    if (!head) return;

    var metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      head.appendChild(metaDesc);
    }
    metaDesc.setAttribute("content", descText);

    // Keep the social preview in step with the tab.
    var ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", titleText);

    var ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", descText);
  }

  // The head as it was authored: this page's own language, and the title the
  // search result is meant to carry. The per-route strings above are English
  // literals, so the landing route restores this instead of overwriting it —
  // otherwise arriving at /ko/ renamed the Korean page in English before the
  // reader had clicked anything.
  var homeMeta = null;

  function captureHomeMeta() {
    var desc = document.querySelector('meta[name="description"]');
    homeMeta = {
      title: document.title,
      desc: desc ? desc.getAttribute("content") : ""
    };
  }

  function applyRouteMeta(route) {
    if (route === DEFAULT_ROUTE && homeMeta) {
      setPageMeta(homeMeta.title, homeMeta.desc);
      return;
    }
    var meta = routes[route];
    if (!meta || !meta.seoTitle) return;
    setPageMeta(meta.seoTitle, meta.seoDesc);
  }

  function navigateTo(route, targetCardId) {
    if (!routes[route]) {
      route = DEFAULT_ROUTE;
      targetCardId = "";
    }
    App.currentRoute = route;

    var sectionId = route;

    // Update URL hash without breaking
    var targetHash = "#" + route + (targetCardId ? "/" + targetCardId : "");
    if (window.location.hash !== targetHash && !targetCardId) {
      window.location.hash = "#" + route;
    } else if (targetCardId && window.location.hash !== targetHash) {
      try {
        history.replaceState ? history.replaceState(null, "", targetHash) : (window.location.hash = targetHash);
      } catch (e) {
        window.location.hash = targetHash;
      }
    }

    // Update Views
    var sections = document.querySelectorAll(".view-section");
    for (var i = 0; i < sections.length; i++) {
      sections[i].classList.remove("active");
    }
    var targetSection = document.getElementById("view-" + sectionId);
    if (targetSection) {
      targetSection.classList.add("active");
    }

    // The recently-used line reads the calculation history, which changes
    // while the reader is on another view.
    if (route === "dashboard" && window.renderDashboard) window.renderDashboard();

    // Update Sidebar Navigation active status
    var navLinks = document.querySelectorAll(".nav-item");
    for (var j = 0; j < navLinks.length; j++) {
      var link = navLinks[j];
      var target = link.getAttribute("data-route");
      if (target === route) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    }

    // Update Top Navigation Tabs active status (Tab Pills & Tab Buttons)
    var tabPills = document.querySelectorAll(".tab-pill");
    for (var k = 0; k < tabPills.length; k++) {
      var tBtn = tabPills[k];
      var tabTarget = tBtn.getAttribute("data-route");
      if (tabTarget === route) {
        tBtn.classList.add("active");
        // Safe container-scoped scroll without ever shifting the parent window/body
        var tabStrip = document.querySelector(".tab-strip-scroll");
        if (tabStrip && tBtn) {
          try {
            var scrollPos = tBtn.offsetLeft - (tabStrip.clientWidth / 2) + (tBtn.clientWidth / 2);
            if (typeof tabStrip.scrollTo === "function") {
              tabStrip.scrollTo({ left: scrollPos, behavior: "smooth" });
            } else {
              tabStrip.scrollLeft = scrollPos;
            }
          } catch (e) {
            tabStrip.scrollLeft = tBtn.offsetLeft - 20;
          }
        }
      } else {
        tBtn.classList.remove("active");
      }
    }

    // Always reset any accidental window/body horizontal displacement
    if (document.documentElement) document.documentElement.scrollLeft = 0;
    if (document.body) document.body.scrollLeft = 0;
    var mainWrapper = document.getElementById("main-wrapper");
    if (mainWrapper) mainWrapper.scrollLeft = 0;
    var appLayout = document.getElementById("app-layout");
    if (appLayout) appLayout.scrollLeft = 0;

    applyRouteMeta(route);

    // Update Header Breadcrumb. The suite name lives in the nav_<route> key
    // and nowhere else — applyTranslations writes the same string here on a
    // language switch, so a second copy in the routes table would only be one
    // more thing to keep in step.
    var breadcrumbTitle = document.getElementById("breadcrumb-current");
    if (breadcrumbTitle) breadcrumbTitle.textContent = routeLabel(route);

    // Scroll handling: either open the requested card or go to the top
    var contentArea = document.getElementById("content-area");
    if (targetCardId) {
      setTimeout(function () {
        var cardEl = document.getElementById(targetCardId);
        if (cardEl) {
          scrollCardIntoView(cardEl);
          // Add pulse highlight animation
          cardEl.classList.remove("card-highlight-pulse");
          void cardEl.offsetWidth; // trigger reflow
          cardEl.classList.add("card-highlight-pulse");
          setTimeout(function () {
            cardEl.classList.remove("card-highlight-pulse");
          }, 2200);
        } else if (contentArea) {
          contentArea.scrollTop = 0;
        }
      }, 60);
    } else {
      scrollToTop();
    }
  }

  // ------------------------------------------------------------------
  // Scrolling
  // ------------------------------------------------------------------
  // html and body are both height:100% and overflow-x is hidden, which makes
  // <body> the scroll container rather than the viewport. Against that layout
  // window.scrollTo does nothing, window.pageYOffset stays 0 forever, and a
  // smooth scrollIntoView silently no-ops — the jump-to-card links looked
  // dead. So move whichever element genuinely scrolls, and verify it moved
  // before trying the next candidate.
  function scrollBy(delta) {
    if (!delta) return;

    var candidates = [
      document.getElementById("content-area"),
      document.body,
      document.documentElement
    ];

    for (var i = 0; i < candidates.length; i++) {
      var el = candidates[i];
      if (!el || el.scrollHeight <= el.clientHeight) continue;
      var before = el.scrollTop;
      el.scrollTop = before + delta;
      if (el.scrollTop !== before) return;
    }
  }

  // Where the first line a reader can actually see begins. Below 900px the
  // header and the tab strip stay put and #content-area scrolls beneath them,
  // so a card parked 12px from y=0 would be behind both. Where <body> scrolls
  // instead, the header goes with it and this is 0.
  function scrollTargetTop() {
    var contentArea = document.getElementById("content-area");
    if (contentArea && contentArea.scrollHeight > contentArea.clientHeight) {
      return contentArea.getBoundingClientRect().top;
    }
    return 0;
  }

  // The calculators redraw their plots just after a view opens, which changes
  // the height of everything above the target and leaves a single scroll short
  // of the mark. Re-measure a couple of times and close the gap.
  function scrollCardIntoView(cardEl, attempt) {
    scrollBy(cardEl.getBoundingClientRect().top - scrollTargetTop() - 12);

    attempt = attempt || 1;
    if (attempt >= 4) return;

    setTimeout(function () {
      if (Math.abs(cardEl.getBoundingClientRect().top - scrollTargetTop() - 12) > 4) {
        scrollCardIntoView(cardEl, attempt + 1);
      }
    }, 120 * attempt);
  }

  function scrollToTop() {
    var contentArea = document.getElementById("content-area");
    if (contentArea) contentArea.scrollTop = 0;
    document.body.scrollTop = 0;
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (window.scrollTo) window.scrollTo(0, 0);
  }

  function jumpToSection(route, targetCardId) {
    if (targetCardId) {
      window.location.hash = "#" + route + "/" + targetCardId;
    } else {
      window.location.hash = "#" + route;
    }
  }

  function handleHashChange() {
    var rawHash = window.location.hash.replace(/^#\/?/, "");
    var parts = rawHash.split("/");
    var route = parts[0] || DEFAULT_ROUTE;
    var targetCardId = parts[1] || "";

    // An address from before the suites were reorganised: send it on to where
    // the card lives now, rewriting the hash so the link the user copies next
    // is the current one.
    var moved = legacyRoute(route, targetCardId);
    if (moved) {
      var fresh = "#" + moved + (targetCardId ? "/" + targetCardId : "");
      try {
        if (history.replaceState) history.replaceState(null, "", fresh);
      } catch (e) {
        // Opened off disk in a browser that refuses replaceState on file://.
        // The view still changes; only the address bar keeps the old text.
      }
      navigateTo(moved, targetCardId);
      return;
    }

    navigateTo(route, targetCardId);
  }

  // Theme Management — seven palettes sharing one variable contract
  var THEMES = ["paper", "parchment", "datasheet", "blueprint", "crt", "tokyo", "console"];
  var DARK_THEMES = ["blueprint", "crt", "tokyo", "console"];

  function normalizeTheme(themeName) {
    // Migrate the pre-refactor light/dark pair onto the named palettes
    if (themeName === "light") return "paper";
    if (themeName === "dark") return "tokyo";
    for (var i = 0; i < THEMES.length; i++) {
      if (THEMES[i] === themeName) return themeName;
    }
    // Falling back silently here once hid a stale-cache bug: fresh markup
    // offered a palette this (cached) script had never heard of, so the click
    // quietly produced the default theme instead.
    if (themeName) {
      console.warn('Unknown theme "' + themeName + '" — falling back to paper. ' +
        'If this palette exists in the picker, the cached script is out of date.');
    }
    return "paper";
  }

  function isDarkTheme(themeName) {
    for (var i = 0; i < DARK_THEMES.length; i++) {
      if (DARK_THEMES[i] === themeName) return true;
    }
    return false;
  }

  function applyTheme(themeName) {
    themeName = normalizeTheme(themeName);
    App.theme = themeName;

    document.documentElement.setAttribute("data-theme", themeName);
    document.body.setAttribute("data-theme", themeName);

    // Legacy hook kept for any rule still scoped to .theme-dark
    if (isDarkTheme(themeName)) {
      document.documentElement.classList.add("theme-dark");
      document.body.classList.add("theme-dark");
    } else {
      document.documentElement.classList.remove("theme-dark");
      document.body.classList.remove("theme-dark");
    }

    Storage.set("theme", themeName);

    if (window.i18n && window.i18n.applyTranslations) {
      window.i18n.applyTranslations();
    }
  }

  // Live Real-time Clock
  function startClock() {
    var clockEl = document.getElementById("header-live-time");
    function tick() {
      if (clockEl) {
        var now = new Date();
        var yyyy = now.getFullYear();
        var mm = String(now.getMonth() + 1);
        if (mm.length === 1) mm = "0" + mm;
        var dd = String(now.getDate());
        if (dd.length === 1) dd = "0" + dd;
        var hh = String(now.getHours());
        if (hh.length === 1) hh = "0" + hh;
        var min = String(now.getMinutes());
        if (min.length === 1) min = "0" + min;
        var ss = String(now.getSeconds());
        if (ss.length === 1) ss = "0" + ss;
        clockEl.textContent = yyyy + "-" + mm + "-" + dd + " " + hh + ":" + min + ":" + ss;
      }
    }
    tick();
    setInterval(tick, 1000);
  }

  // Keyboard Shortcuts Setup
  function setupShortcuts() {
    document.addEventListener("keydown", function (e) {
      // Alt + 1 ~ 0 for tab switching
      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        var keyMap = {
          "1": "radiometry",
          "2": "optics",
          "3": "geometry",
          "4": "coherence",
          "5": "data",
          "6": "record",
          "7": "settings",
          "8": "about",
          "9": "dashboard",
          "0": "index"
        };
        if (keyMap[e.key]) {
          e.preventDefault();
          window.location.hash = "#" + keyMap[e.key];
        }
      }
    });
  }

  // ------------------------------------------------------------------
  // Section numbers
  // ------------------------------------------------------------------
  // The § number used to be typed into three separate places: the card title
  // string in both languages, the contents markup, and the label passed to
  // recordCalculation. Three copies of one fact, kept in step by hand.
  //
  // They drifted. When the two original suites were reorganised into
  // spectroscopy and goniometry, twelve of the thirteen history labels kept the
  // old numbering and pointed at sections that no longer existed.
  //
  // The position of a card inside its view section is the only source now.
  // Everything that displays a number asks for it here, so a card can be moved
  // or inserted and the numbering follows on the next load.
  var cardNumbers = {};   // card id -> "§ 3."

  function renumberCards() {
    cardNumbers = {};

    var views = document.querySelectorAll(".view-section");
    for (var v = 0; v < views.length; v++) {
      var cards = views[v].querySelectorAll(".card[id]");
      for (var c = 0; c < cards.length; c++) {
        var label = "§ " + (c + 1) + ".";
        cardNumbers[cards[c].id] = label;

        // An attribute, not text: applyTranslations writes textContent onto the
        // element holding the key, which would wipe any child node on every
        // language switch. CSS draws it from the attribute instead.
        var title = cards[c].querySelector(".card-title");
        if (title) title.setAttribute("data-num", label);
      }
    }

    // The contents entries keep the number as real text — it is a numbered list
    // and the number is part of what the eye scans down. The literal sitting in
    // the markup is a pre-JavaScript fallback only, like the untranslated inline
    // text everywhere else; this overwrites it.
    var links = document.querySelectorAll(".toc-item-link[href]");
    for (var i = 0; i < links.length; i++) {
      var m = /^#?[a-z]+\/([a-z0-9-]+)$/.exec(links[i].getAttribute("href") || "");
      if (!m) continue;
      var numEl = links[i].querySelector(".toc-item-num");
      if (numEl && cardNumbers[m[1]]) numEl.textContent = cardNumbers[m[1]];
    }

    return cardNumbers;
  }

  // Every input already carries an id and every label already sits beside it,
  // but nothing connected the two: a screen reader read 111 unnamed number
  // fields, and clicking a label focused nothing. The pairing is positional,
  // which is exactly why it is done here instead of writing for="" into the
  // markup 111 times and again into every card added after this one.
  function linkLabels() {
    var CONTROL = /^(INPUT|SELECT|TEXTAREA)$/;
    var labels = document.querySelectorAll("label:not([for])");

    for (var i = 0; i < labels.length; i++) {
      var el = labels[i].nextElementSibling;
      while (el && !CONTROL.test(el.tagName)) el = el.nextElementSibling;

      // Labels wrapped a level up from their control — the unit span pattern
      // puts a couple of elements between them — resolve inside the group.
      if (!el && labels[i].parentNode) {
        el = labels[i].parentNode.querySelector("input[id], select[id], textarea[id]");
      }

      if (el && el.id) labels[i].setAttribute("for", el.id);
    }
  }

  // "§ 3." for a card id, empty string for anything not in a numbered section.
  function cardNumber(cardId) {
    return cardNumbers[cardId] || "";
  }

  // Expose global helpers to window
  window.App = App;
  window.Storage = Storage;
  window.showToast = showToast;
  window.recordCalculation = recordCalculation;
  window.navigateTo = navigateTo;
  window.jumpToSection = jumpToSection;
  window.renumberCards = renumberCards;
  window.cardNumber = cardNumber;
  window.setPageMeta = setPageMeta;
  window.applyTheme = applyTheme;
  window.THEMES = THEMES;
  window.isDarkTheme = isDarkTheme;
  window.readField = readField;
  window.fmt = fmt;
  window.copyTextToClipboard = copyTextToClipboard;
  window.initResultBoxCopy = initResultBoxCopy;
  window.extractResultBoxText = extractResultBoxText;

  // Initialize application
  function init() {
    // Initialize i18n
    if (window.i18n && window.i18n.init) {
      window.i18n.init();
    }

    // The calculation history this build no longer keeps. Nothing reads it and
    // a reader who cleared it would not expect to still have it. Delete this
    // line once no one is arriving from a build that wrote it.
    try { localStorage.removeItem("bl_toolkit_calc_history"); } catch (e) {}

    // Capture phase, so the mark is set before the inline oninput handler on
    // the field runs its calculator and asks to be recorded.
    document.addEventListener("input", noteUserEdit, true);
    document.addEventListener("change", noteUserEdit, true);
    document.addEventListener("click", noteUserEdit, true);

    // Numbering runs before anything asks for a number. nav.js builds the
    // sidebar out of the contents block from its own DOMContentLoaded handler,
    // registered after this one, so the map is filled by the time it looks.
    renumberCards();
    linkLabels();

    // The dashboard reads the contents block, which is static markup, but it
    // reads the translated text out of it — so it runs after i18n.init above.
    if (window.renderDashboard) window.renderDashboard();

    // Load theme (migrates old "light"/"dark" values on the way in)
    var savedTheme = Storage.get("theme", "paper");
    applyTheme(savedTheme);

    // Read before the first route is applied: after that the head belongs to
    // whichever view is open.
    captureHomeMeta();

    // Setup routes & listeners
    window.addEventListener("hashchange", handleHashChange);
    handleHashChange();

    // Setup Navigation click handlers (Sidebar, Top Tab Strip & Tab Buttons)
    var navItems = document.querySelectorAll(".nav-item[data-route], .tab-pill[data-route]");
    for (var i = 0; i < navItems.length; i++) {
      (function (item) {
        item.addEventListener("click", function (e) {
          e.preventDefault();
          var route = item.getAttribute("data-route");
          window.location.hash = "#" + route;
        });
      })(navItems[i]);
    }

    startClock();
    setupShortcuts();
    initResultBoxCopy();

    // Deferred by a tick so the calculator modules have registered their
    // runtime-built <select> options before saved values are written back.
    setTimeout(function () {
      if (restoreCalcInputs() > 0) recalcAll();
      initResultBoxCopy();
    }, 0);
  }

  // Run when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
