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
    dashboard: { title: "0. DASHBOARD (목차)", subtitle: "연구 툴킷 종합 목차 및 세부 모듈 색인" },
    optics: { title: "I. OPTICS", subtitle: "X선 광학 및 회절/투과율 정밀 계산기" },
    beamline: { title: "II. BEAMLINE", subtitle: "빔라인 물리량 및 기하학적 파라미터 계산기" },
    logbook: { title: "III. LOGBOOK", subtitle: "실험 조건 수동 기록 및 히스토리 스냅샷" },
    experiment: { title: "IV. EXPERIMENT", subtitle: "실험 노트, 체크리스트, 샘플 관리, DAQ & 칸반" },
    reference: { title: "V. REFERENCE", subtitle: "단위 변환기, 결정 d-spacing DB, 유용한 연구 링크" },
    settings: { title: "VI. SETTINGS", subtitle: "테마 설정, 계산 히스토리 및 단축키 안내" },
    about: { title: "VII. ABOUT", subtitle: "제작자 소개, 연구 포트폴리오 및 프로젝트 후원" }
  };

  function navigateTo(route, targetCardId) {
    if (!routes[route]) {
      route = "dashboard";
    }
    App.currentRoute = route;

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

    // Update Header Breadcrumb
    var breadcrumbTitle = document.getElementById("breadcrumb-current");
    if (breadcrumbTitle) {
      breadcrumbTitle.textContent = routes[route].title;
    }

    // Scroll handling: either scroll to specific card or top
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
    var route = parts[0] || "dashboard";
    var targetCardId = parts[1] || "";
    navigateTo(route, targetCardId);
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
    
    if (window.i18n && window.i18n.applyTranslations) {
      window.i18n.applyTranslations();
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
  window.jumpToSection = jumpToSection;
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
