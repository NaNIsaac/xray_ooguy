/**
 * BEAMLINE TOOLKIT — Main Application Controller & Hash Router
 * Compatibility: CentOS 7 (Firefox 60 ESR, Chrome 60~70)
 * Note: No optional chaining (?.), no CSS Grid, no external libraries.
 */

(function () {
  "use strict";

  // Global State
  var App = {
    currentRoute: "dashboard",
    history: [],
    favorites: ["optics_energy", "optics_bragg", "beamline_footprint", "ref_units"],
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

      // Refresh settings history table if view is active
      if (window.renderSettingsHistory) {
        window.renderSettingsHistory();
      }
      if (window.renderDashboardHistory) {
        window.renderDashboardHistory();
      }
    } catch (e) {
      console.error("Failed to record calculation:", e);
    }
  }

  // Router logic
  var routes = {
    dashboard: { title: "DASHBOARD", subtitle: "빠른 도구 바로가기 및 계산 현황" },
    optics: { title: "OPTICS", subtitle: "X선 광학 및 회절/투과율 정밀 계산기" },
    beamline: { title: "BEAMLINE", subtitle: "빔라인 물리량 및 기하학적 파라미터 계산기" },
    logbook: { title: "LOGBOOK", subtitle: "실험 조건 수동 기록 및 히스토리 스냅샷" },
    experiment: { title: "EXPERIMENT", subtitle: "실험 노트, 체크리스트, 샘플 관리, DAQ & 칸반" },
    reference: { title: "REFERENCE", subtitle: "단위 변환기, 결정 d-spacing DB, 유용한 연구 링크" },
    settings: { title: "SETTINGS", subtitle: "테마 설정, 계산 히스토리 및 단축키 안내" },
    about: { title: "ABOUT", subtitle: "제작자 소개, 연구 포트폴리오 및 프로젝트 후원" }
  };

  function navigateTo(route) {
    if (!routes[route]) {
      route = "dashboard";
    }
    App.currentRoute = route;

    // Update URL hash without breaking
    if (window.location.hash !== "#" + route) {
      window.location.hash = "#" + route;
    }

    // Update Views
    var sections = document.querySelectorAll(".view-section");
    for (var i = 0; i < sections.length; i++) {
      sections[i].classList.remove("active");
    }
    var targetSection = document.getElementById("view-" + route);
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
    var tabPills = document.querySelectorAll(".tab-pill, .tab-btn");
    for (var k = 0; k < tabPills.length; k++) {
      var tBtn = tabPills[k];
      var tabTarget = tBtn.getAttribute("data-route");
      if (tabTarget === route) {
        tBtn.classList.add("active");
        // Scroll the active tab into view smoothly within the horizontal strip
        try {
          tBtn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
        } catch (err) {}
      } else {
        tBtn.classList.remove("active");
      }
    }

    // Update Header Breadcrumb
    var breadcrumbTitle = document.getElementById("breadcrumb-current");
    if (breadcrumbTitle) {
      breadcrumbTitle.textContent = routes[route].title;
    }

    // Scroll main view and window to top
    var contentArea = document.getElementById("content-area");
    if (contentArea) {
      contentArea.scrollTop = 0;
    }
    window.scrollTo(0, 0);

    // Trigger tab specific on-show handlers
    if (route === "dashboard" && window.renderDashboard) {
      window.renderDashboard();
    } else if (route === "logbook" && window.renderLogbook) {
      window.renderLogbook();
    } else if (route === "experiment" && window.renderExperiment) {
      window.renderExperiment();
    } else if (route === "reference" && window.renderReference) {
      window.renderReference();
    } else if (route === "settings" && window.renderSettings) {
      window.renderSettings();
    }
  }

  function handleHashChange() {
    var rawHash = window.location.hash.replace(/^#\/?/, "");
    var route = rawHash.split("/")[0] || "dashboard";
    navigateTo(route);
  }

  // Theme Management (Robust CSS Variables & ClassList Toggle)
  function applyTheme(themeName) {
    App.theme = themeName;
    document.documentElement.setAttribute("data-theme", themeName);
    document.body.setAttribute("data-theme", themeName);
    if (themeName === "dark") {
      document.documentElement.classList.add("theme-dark");
      document.body.classList.add("theme-dark");
    } else {
      document.documentElement.classList.remove("theme-dark");
      document.body.classList.remove("theme-dark");
    }
    Storage.set("theme", themeName);
    
    var themeBtn = document.getElementById("btn-theme-toggle");
    if (themeBtn) {
      themeBtn.textContent = themeName === "dark" ? "종이 모드" : "다크 모드";
    }
    var settingsThemeText = document.getElementById("settings-theme-current");
    if (settingsThemeText) {
      settingsThemeText.textContent = themeName === "dark" ? "현재 모드: 흑백 반전 다크 모드 (Dark Ink #121417)" : "현재 모드: 종이 모드 (Paper Light #fdfcf8)";
    }
    var settingsThemeBtn = document.getElementById("btn-settings-theme");
    if (settingsThemeBtn) {
      settingsThemeBtn.textContent = themeName === "dark" ? "종이 모드로 전환" : "다크 모드로 전환";
    }
  }

  function toggleTheme() {
    var nextTheme = App.theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
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
      // Alt + 1 ~ 8 for tab switching
      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        var keyMap = {
          "1": "dashboard",
          "2": "optics",
          "3": "beamline",
          "4": "logbook",
          "5": "experiment",
          "6": "reference",
          "7": "settings",
          "8": "about"
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
  window.applyTheme = applyTheme;
  window.toggleTheme = toggleTheme;

  // Initialize application
  function init() {
    // Initialize i18n
    if (window.i18n && window.i18n.init) {
      window.i18n.init();
    }

    // Load theme
    var savedTheme = Storage.get("theme", "light");
    applyTheme(savedTheme);

    // Setup routes & listeners
    window.addEventListener("hashchange", handleHashChange);
    handleHashChange();

    // Setup Navigation click handlers (Sidebar, Top Tab Strip & Tab Buttons)
    var navItems = document.querySelectorAll(".nav-item[data-route], .tab-pill[data-route], .tab-btn[data-route]");
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
  }

  // Run when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
