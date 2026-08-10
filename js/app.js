/**
 * BEAMLINE TOOLKIT — Main Application Controller & Hash Router
 * Compatibility: CentOS 7 (Firefox 60 ESR, Chrome 60~70)
 * Note: No optional chaining (?.), no CSS Grid, no external libraries.
 */

(function () {
  "use strict";

  // Global State
  var App = {
    currentRoute: "spectroscopy",
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

  // Search boxes filter a list rather than feed a calculation; restoring them
  // would hide rows for no reason.
  var CALC_INPUT_SKIP = { "crystal-search-input": true, "log-search-query": true };

  var calcSaveTimer = null;

  function calcInputElements() {
    var out = [];
    var scopes = document.querySelectorAll("#view-spectroscopy, #view-goniometry");

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

  // Record calculation to local history
  function recordCalculation(toolName, inputsStr, resultStr) {
    try {
      var item = {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        tool: toolName,
        inputs: inputsStr,
        result: resultStr
      };

      var list = Storage.get("calc_history", []);
      list.unshift(item);
      if (list.length > 25) {
        list = list.slice(0, 25);
      }
      Storage.set("calc_history", list);

    } catch (e) {
      console.error("Failed to record calculation:", e);
    }
  }

  // Router logic — one route per view section, no aliases.
  var routes = {
    spectroscopy: {
      title: "I. SPECTROSCOPY", subtitle: "에너지·파장·물질 상호작용 계산",
      seoTitle: "Energy, Wavelength & d-spacing Calculators | X-Ray Beamline Toolkit",
      seoDesc: "Convert photon energy to wavelength, find lattice d-spacing from Miller indices, and compute X-ray transmittance, critical angle, energy resolution and photon flux."
    },
    goniometry: {
      title: "II. GONIOMETRY", subtitle: "각도 및 기하 배치 계산",
      seoTitle: "Bragg Angle & Scattering Vector Q Calculators | X-Ray Beamline Toolkit",
      seoDesc: "Calculate the Bragg diffraction angle, reciprocal-space scattering vector Q, beam footprint, detector angular resolution, slit acceptance and Eulerian cradle corrections."
    },
    record: {
      title: "III. RECORD", subtitle: "실험 세션 기록",
      seoTitle: "Beamtime Session Log & Logbook Header | X-Ray Beamline Toolkit",
      seoDesc: "Log beamtime events in one click and generate a formatted session header to paste into your own logbook. Everything stays in your browser."
    },
    dashboard: {
      title: "0. CONTENTS", subtitle: "연구 툴킷 종합 목차 및 세부 모듈 색인",
      seoTitle: "All Calculators — Contents | X-Ray Beamline Toolkit",
      seoDesc: "Index of every synchrotron X-ray calculator in the toolkit: Bragg's law, d-spacing, Q-space, refraction, beam geometry and detector parameters."
    },
    settings: {
      title: "IV. SETTINGS", subtitle: "언어, 테마, 데이터 백업 및 단축키",
      seoTitle: "Settings | X-Ray Beamline Toolkit",
      seoDesc: "Language, display theme, local data backup and keyboard shortcuts for the X-Ray Beamline Toolkit."
    },
    about: {
      title: "V. ABOUT", subtitle: "프로젝트 정보 및 제작자",
      seoTitle: "About | X-Ray Beamline Toolkit",
      seoDesc: "A lightweight, offline-first toolkit of synchrotron X-ray calculators and session logging, built for beamline researchers."
    }
  };

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

  function applyRouteMeta(route) {
    var meta = routes[route];
    if (!meta || !meta.seoTitle) return;
    setPageMeta(meta.seoTitle, meta.seoDesc);
  }

  function navigateTo(route, targetCardId) {
    if (!routes[route]) {
      route = "spectroscopy";
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

    // Update Header Breadcrumb
    var breadcrumbTitle = document.getElementById("breadcrumb-current");
    if (breadcrumbTitle) {
      breadcrumbTitle.textContent = routes[route].title;
    }

    // Scroll handling: either open the requested card or go to the top
    var contentArea = document.getElementById("content-area");
    if (targetCardId) {
      setTimeout(function () {
        var cardEl = document.getElementById(targetCardId);
        if (cardEl) {
          try {
            cardEl.scrollIntoView({ behavior: "smooth", block: "start" });
          } catch (e) {
            if (contentArea) contentArea.scrollTop = cardEl.offsetTop - 10;
          }
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
      if (contentArea) {
        contentArea.scrollTop = 0;
      }
      if (window.scrollTo) {
        window.scrollTo(0, 0);
      }
    }

    // Trigger tab specific on-show handlers
    if (route === "record" && window.renderRecord) {
      window.renderRecord();
    } else if (route === "dashboard" && window.renderDashboard) {
      window.renderDashboard();
    } else if (route === "reference" && window.renderReference) {
      window.renderReference();
    } else if (route === "settings" && window.renderSettings) {
      window.renderSettings();
    }
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
    var route = parts[0] || "spectroscopy";
    var targetCardId = parts[1] || "";
    navigateTo(route, targetCardId);
  }

  // Theme Management — four palettes sharing one variable contract
  var THEMES = ["paper", "parchment", "blueprint", "crt", "tokyo", "console"];
  var DARK_THEMES = ["crt", "tokyo", "console"];

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

  function toggleTheme() {
    var idx = 0;
    for (var i = 0; i < THEMES.length; i++) {
      if (THEMES[i] === App.theme) {
        idx = i;
        break;
      }
    }
    applyTheme(THEMES[(idx + 1) % THEMES.length]);
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
      // Alt + 1 ~ 6 for tab switching
      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        var keyMap = {
          "1": "spectroscopy",
          "2": "goniometry",
          "3": "record",
          "4": "settings",
          "5": "about",
          "6": "dashboard"
        };
        if (keyMap[e.key]) {
          e.preventDefault();
          window.location.hash = "#" + keyMap[e.key];
        }
      }
    });
  }

  // Expose global helpers to window
  window.App = App;
  window.Storage = Storage;
  window.showToast = showToast;
  window.recordCalculation = recordCalculation;
  window.navigateTo = navigateTo;
  window.jumpToSection = jumpToSection;
  window.setPageMeta = setPageMeta;
  window.applyTheme = applyTheme;
  window.toggleTheme = toggleTheme;
  window.THEMES = THEMES;
  window.isDarkTheme = isDarkTheme;

  // Initialize application
  function init() {
    // Initialize i18n
    if (window.i18n && window.i18n.init) {
      window.i18n.init();
    }

    // Load theme (migrates old "light"/"dark" values on the way in)
    var savedTheme = Storage.get("theme", "paper");
    applyTheme(savedTheme);

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

    // Setup Theme Toggle Button
    var themeToggleBtn = document.getElementById("btn-theme-toggle");
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener("click", toggleTheme);
    }

    startClock();
    setupShortcuts();

    // Deferred by a tick so the calculator modules have registered their
    // runtime-built <select> options before saved values are written back.
    setTimeout(function () {
      if (restoreCalcInputs() > 0) recalcAll();
    }, 0);
  }

  // Run when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
