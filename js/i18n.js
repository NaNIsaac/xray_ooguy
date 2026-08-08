/**
 * BEAMLINE TOOLKIT — Direct Full-Page Bilingual Translation System (Korean / English)
 * 100% Offline-Native, Zero-dependency, Compatible with CentOS 7 Firefox 60 ESR
 */
(function (window) {
  "use strict";

  var translations = {
    ko: {
      // Navigation
      nav_dashboard: "0. DASHBOARD",
      nav_optics: "1. OPTICS (8 Tools)",
      nav_beamline: "2. BEAMLINE (7 Tools)",
      nav_logbook: "3. LOGBOOK",
      nav_experiment: "4. EXPERIMENT",
      nav_reference: "5. REFERENCE",
      nav_settings: "6. SETTINGS",
      nav_about: "7. ABOUT (제작자)",
      
      // Sidebar
      sidebar_main_menu: "메인 메뉴",
      sidebar_exp_menu: "실험 및 기록",
      sidebar_data_menu: "데이터 & 도구",
      sidebar_offline: "Client Offline-Ready",
      
      // Theme
      mode_light: "라이트 모드",
      mode_dark: "다크 모드",
      theme_current_light: "현재 모드: 라이트 모드 (Light Paper #fdfcf8)",
      theme_current_dark: "현재 모드: 다크 모드 (Dark Ink #121417)",
      theme_desc: "라이트 모드(#fdfcf8)와 고대비 흑백 반전 다크 모드(#121417)를 전환합니다.",
      
      // Language
      lang_current: "현재 언어: 한국어 (Korean)",
      lang_desc: "한국어와 영어(English) 인터페이스를 즉시 전환합니다. 모든 물리량 및 계산기가 실시간으로 갱신됩니다.",
      
      // Banners
      b_dash_title: "빔라인 래피드 대시보드 (Quick Dashboard)",
      b_dash_desc: "자주 사용하는 광학 계산기, 물리량 분석기 및 최근 계산 히스토리 바로가기",
      b_opt_title: "X선 광학 및 회절/투과율 정밀 계산기 (X-ray Optics Suite)",
      b_opt_desc: "에너지-파장 변환, 브래그 법칙, 회절격자, 복소 굴절률, Chi-Phi 틸트, 임계각 및 Q-space 변환",
      b_beam_title: "빔라인 물리량 및 기하학적 파라미터 계산기 (Beamline Suite)",
      b_beam_desc: "빔 풋프린트, 광자 플럭스, 단색기/디텍터 분해능, CDI 결맞음 오버샘플링 및 열팽창 보정",
      b_log_title: "빔라인 실험 전자 로그북 (Electronic Logbook)",
      b_log_desc: "실험 조건 수동 기록, 조건 변경 히스토리 스냅샷, 태그 검색 및 CSV/JSON/마크다운 내보내기",
      b_exp_title: "실험 및 워크플로우 보조 도구 (Experiment & Workflow)",
      b_exp_desc: "실시간 자동 저장 노트, 빔라인 체크리스트, 시료 관리 테이블, DAQ 수집 용량 산출 및 칸반 보드",
      b_ref_title: "참고 자료 및 결정 격자 DB (Reference & Crystal DB)",
      b_ref_desc: "다차원 단위 변환기, 주요 결정면(Si, Ge, Diamond, Al2O3, GaAs) d-spacing 데이터베이스 및 시설 링크",
      b_set_title: "설정 및 히스토리 관리 (Settings & History)",
      b_set_desc: "언어 설정, 테마 변경, 계산 기록 관리, 단축키 안내 및 전체 데이터 백업/복원",
      b_about_title: "제작자 소개 및 연구 포트폴리오 (About the Creator)",
      b_about_desc: "연구자 프로필, X선 광학·결맞음 회절 이미징(BCDI) 연구 분야 및 프로젝트 후원",
      
      // Buttons & Titles
      calc_history_title: "전체 계산 히스토리",
      calc_history_clear: "히스토리 전체 삭제",
      backup_title: "로컬스토리지 데이터 백업 및 복원",
      backup_desc: "모든 로그북, 실험 노트, 시료 목록, 체크리스트 및 계산 히스토리는 브라우저의 localStorage에 안전하게 저장됩니다. 다른 PC로 이동할 때 JSON 파일로 내보내거나 가져올 수 있습니다.",
      backup_btn: "전체 백업 다운로드",
      restore_btn: "백업 파일 복원",
      shortcuts_title: "키보드 단축키 안내 (Keyboard Shortcuts)",
      shortcuts_desc: "Alt + 1 ~ 8 단축키로 원하는 탭으로 즉시 이동할 수 있습니다."
    },
    en: {
      // Navigation
      nav_dashboard: "0. DASHBOARD",
      nav_optics: "1. OPTICS (8 Tools)",
      nav_beamline: "2. BEAMLINE (7 Tools)",
      nav_logbook: "3. LOGBOOK",
      nav_experiment: "4. EXPERIMENT",
      nav_reference: "5. REFERENCE",
      nav_settings: "6. SETTINGS",
      nav_about: "7. ABOUT (Author)",
      
      // Sidebar
      sidebar_main_menu: "MAIN MENU",
      sidebar_exp_menu: "EXPERIMENT & LOGS",
      sidebar_data_menu: "DATA & UTILITIES",
      sidebar_offline: "Client Offline-Ready",
      
      // Theme
      mode_light: "Light Mode",
      mode_dark: "Dark Mode",
      theme_current_light: "Current Mode: Light Mode (Paper #fdfcf8)",
      theme_current_dark: "Current Mode: Dark Mode (Dark Ink #121417)",
      theme_desc: "Switch between clean Light Mode (#fdfcf8) and high-contrast Dark Mode (#121417).",
      
      // Language
      lang_current: "Current Language: English",
      lang_desc: "Instantaneously switch between Korean and English interface across all tools and calculations.",
      
      // Banners
      b_dash_title: "Beamline Rapid Dashboard",
      b_dash_desc: "Quick shortcuts to frequent optics calculators, physics estimators, and recent calculation history",
      b_opt_title: "X-ray Optics & Diffraction Suite",
      b_opt_desc: "Energy-wavelength conversion, Bragg's law, grating diffraction, complex refractive index, Chi-Phi tilt, critical angle & Q-space",
      b_beam_title: "Beamline Physics & Geometric Parameters",
      b_beam_desc: "Beam footprint, photon flux, energy/angular resolution, CDI coherent oversampling & thermal expansion shift",
      b_log_title: "Beamline Electronic Logbook",
      b_log_desc: "Manual condition logging, condition snapshot rollback, tag search, and CSV/JSON/Markdown export",
      b_exp_title: "Experiment & Workflow Assistant",
      b_exp_desc: "Debounced live scratchpad, beamline checklist, sample table, DAQ data rate estimator, and Kanban board",
      b_ref_title: "Reference & Crystal d-spacing Database",
      b_ref_desc: "Multi-unit converter, precision crystal d-spacing database (Si, Ge, Diamond, Al2O3, GaAs), and synchrotron links",
      b_set_title: "Settings & History Management",
      b_set_desc: "Language selection, display theme mode, calculation history archive, shortcuts, and full data backup/restore",
      b_about_title: "About the Creator & Research Portfolio",
      b_about_desc: "Researcher biography, X-ray optics & Bragg coherent diffraction imaging (BCDI) domain, and project sponsorship",
      
      // Buttons & Titles
      calc_history_title: "Calculation History Archive",
      calc_history_clear: "Clear All History",
      backup_title: "LocalStorage Backup & Restore",
      backup_desc: "All logbook entries, notes, sample catalogs, checklists, and calculation logs are stored locally in your browser. Export or import JSON files seamlessly across machines.",
      backup_btn: "Download Full Backup",
      restore_btn: "Restore from JSON",
      shortcuts_title: "Keyboard Shortcuts",
      shortcuts_desc: "Press Alt + 1 ~ 8 to switch between views instantly."
    }
  };

  var I18n = {
    lang: "ko",
    
    init: function () {
      var saved = localStorage.getItem("bl_toolkit_lang") || "ko";
      this.setLang(saved);
    },
    
    t: function (key) {
      var current = translations[this.lang] || translations.ko;
      return current[key] || translations.ko[key] || key;
    },
    
    setLang: function (lang) {
      if (lang !== "ko" && lang !== "en") lang = "ko";
      this.lang = lang;
      localStorage.setItem("bl_toolkit_lang", lang);
      document.documentElement.setAttribute("lang", lang);
      
      this.applyTranslations();
    },
    
    applyTranslations: function () {
      var t = translations[this.lang] || translations.ko;
      
      // Settings Language Card
      var langCur = document.getElementById("settings-lang-current");
      if (langCur) langCur.textContent = t.lang_current;
      
      var langDesc = document.getElementById("settings-lang-desc");
      if (langDesc) langDesc.textContent = t.lang_desc;
      
      // Settings Theme Card
      var themeCur = document.getElementById("settings-theme-current");
      if (themeCur) {
        var isDark = (document.documentElement.getAttribute("data-theme") === "dark");
        themeCur.textContent = isDark ? t.theme_current_dark : t.theme_current_light;
      }
      var themeDesc = document.getElementById("settings-theme-desc");
      if (themeDesc) themeDesc.textContent = t.theme_desc;
      
      // Banners
      function setTxt(id, text) {
        var el = document.getElementById(id);
        if (el) el.textContent = text;
      }
      
      setTxt("banner-dash-title", t.b_dash_title);
      setTxt("banner-dash-desc", t.b_dash_desc);
      setTxt("banner-opt-title", t.b_opt_title);
      setTxt("banner-opt-desc", t.b_opt_desc);
      setTxt("banner-beam-title", t.b_beam_title);
      setTxt("banner-beam-desc", t.b_beam_desc);
      setTxt("banner-log-title", t.b_log_title);
      setTxt("banner-log-desc", t.b_log_desc);
      setTxt("banner-exp-title", t.b_exp_title);
      setTxt("banner-exp-desc", t.b_exp_desc);
      setTxt("banner-ref-title", t.b_ref_title);
      setTxt("banner-ref-desc", t.b_ref_desc);
      setTxt("banner-set-title", t.b_set_title);
      setTxt("banner-set-desc", t.b_set_desc);
      setTxt("banner-about-title", t.b_about_title);
      setTxt("banner-about-desc", t.b_about_desc);
      
      // Sidebar Nav Section Titles
      var secTitles = document.querySelectorAll(".nav-section-title");
      if (secTitles.length >= 3) {
        secTitles[0].textContent = t.sidebar_main_menu;
        secTitles[1].textContent = t.sidebar_exp_menu;
        secTitles[2].textContent = t.sidebar_data_menu;
      }
      
      // Top Tab Pills
      var pills = document.querySelectorAll(".tab-pill");
      var pillKeys = ["nav_dashboard", "nav_optics", "nav_beamline", "nav_logbook", "nav_experiment", "nav_reference", "nav_settings", "nav_about"];
      for (var i = 0; i < pills.length && i < pillKeys.length; i++) {
        pills[i].textContent = t[pillKeys[i]];
      }
      
      // Sidebar Nav Items
      var navItems = document.querySelectorAll(".sidebar-nav .nav-item");
      for (var j = 0; j < navItems.length && j < pillKeys.length; j++) {
        var span = navItems[j].querySelector("span:first-child");
        if (span) {
          span.textContent = t[pillKeys[j]].replace(/^[0-9]\.\s*/, "");
        }
      }
    }
  };

  window.i18n = I18n;
  window.setLanguage = function (lang) {
    I18n.setLang(lang);
  };
})(window);
