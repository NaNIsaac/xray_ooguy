/**
 * BEAMLINE TOOLKIT — Main Application Controller & Hash Router
 * Academic Print Specification: Numbered sections, zero emojis, exact state control.
 * Compatibility: CentOS 7 (Firefox 60 ESR, Chrome 60~70)
 */

(function () {
  "use strict";

  // Global State
  var App = {
    currentRoute: "dashboard",
    history: [],
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

  // Toast Notification System (Academic Minimal Banner)
  function showToast(message, type) {
    var container = document.getElementById("toast-container");
    if (!container) return;

    type = type || "info";
    var toast = document.createElement("div");
    toast.className = "toast toast-" + type;
    toast.textContent = "[시스템] " + message;

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
      if (list.length > 30) {
        list = list.slice(0, 30);
      }
      Storage.set("calc_history", list);

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

  // Router logic with Academic Section Numbering
  var routes = {
    dashboard: { title: "0. DASHBOARD", subtitle: "종합 현황 및 주요 도구 색인" },
    optics: { title: "1. OPTICS", subtitle: "X선 광학 및 회절·투과율 계산 수트" },
    beamline: { title: "2. BEAMLINE", subtitle: "빔라인 물리량 및 기하학적 파라미터" },
    logbook: { title: "3. LOGBOOK", subtitle: "실험 전자 기록 및 히스토리 스냅샷" },
    experiment: { title: "4. EXPERIMENT", subtitle: "실험 종합 관리 및 워크플로우" },
    reference: { title: "5. REFERENCE", subtitle: "결정 격자 DB & 연구자 참고 데이터" },
    settings: { title: "6. SETTINGS", subtitle: "계산 이력 및 데이터 아카이브" }
  };

  function navigateTo(route) {
    if (!routes[route]) {
      route = "dashboard";
    }
    App.currentRoute = route;

    if (window.location.hash !== "#" + route) {
      window.location.hash = "#" + route;
    }

    var sections = document.querySelectorAll(".view-section");
    for (var i = 0; i < sections.length; i++) {
      sections[i].classList.remove("active");
    }
    var targetSection = document.getElementById("view-" + route);
    if (targetSection) {
      targetSection.classList.add("active");
    }

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

    var breadcrumbTitle = document.getElementById("breadcrumb-current");
    if (breadcrumbTitle) {
      breadcrumbTitle.textContent = routes[route].title;
    }

    var contentArea = document.getElementById("content-area");
    if (contentArea) {
      contentArea.scrollTop = 0;
    }
    window.scrollTo(0, 0);

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

  // Theme Management (Paper vs Dark Ink Inversion)
  function applyTheme(themeName) {
    App.theme = themeName;
    document.documentElement.setAttribute("data-theme", themeName);
    Storage.set("theme", themeName);
    var themeBtn = document.getElementById("btn-theme-toggle");
    if (themeBtn) {
      themeBtn.textContent = themeName === "dark" ? "종이 모드 (Light)" : "흑백 반전 (Dark)";
    }
  }

  function toggleTheme() {
    var nextTheme = App.theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    showToast((nextTheme === "dark" ? "흑백 반전" : "종이") + " 모드로 전환되었습니다.", "info");
  }

  // Live Clock
  function startClock() {
    var clockEl = document.getElementById("header-live-time");
    function tick() {
      if (clockEl) {
        var now = new Date();
        var yyyy = now.getFullYear();
        var mm = String(now.getMonth() + 1).padStart(2, "0");
        var dd = String(now.getDate()).padStart(2, "0");
        var hh = String(now.getHours()).padStart(2, "0");
        var min = String(now.getMinutes()).padStart(2, "0");
        var ss = String(now.getSeconds()).padStart(2, "0");
        clockEl.textContent = yyyy + "-" + mm + "-" + dd + " " + hh + ":" + min + ":" + ss;
      }
    }
    tick();
    setInterval(tick, 1000);
  }

  // Keyboard Shortcuts Setup
  function setupShortcuts() {
    document.addEventListener("keydown", function (e) {
      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        var keyMap = {
          "1": "dashboard",
          "2": "optics",
          "3": "beamline",
          "4": "logbook",
          "5": "experiment",
          "6": "reference",
          "7": "settings"
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
  window.toggleTheme = toggleTheme;

  function init() {
    var savedTheme = Storage.get("theme", "light");
    applyTheme(savedTheme);

    window.addEventListener("hashchange", handleHashChange);
    handleHashChange();

    var navItems = document.querySelectorAll(".nav-item[data-route]");
    for (var i = 0; i < navItems.length; i++) {
      (function (item) {
        item.addEventListener("click", function (e) {
          e.preventDefault();
          var route = item.getAttribute("data-route");
          window.location.hash = "#" + route;
        });
      })(navItems[i]);
    }

    var themeToggleBtn = document.getElementById("btn-theme-toggle");
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener("click", toggleTheme);
    }

    startClock();
    setupShortcuts();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
