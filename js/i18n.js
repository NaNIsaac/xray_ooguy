/**
 * BEAMLINE TOOLKIT — Bilingual Internationalization (i18n: Korean / English)
 * 100% Offline-Native, Zero-dependency, Compatible with CentOS 7 Firefox 60 ESR
 */
(function (window) {
  "use strict";

  var dict = {
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
      
      // Theme
      mode_light: "종이 모드",
      mode_dark: "다크 모드 (Invert)",
      mode_current_light: "현재 모드: 종이 모드 (Paper Light #fdfcf8)",
      mode_current_dark: "현재 모드: 흑백 반전 다크 모드 (Dark Ink #121417)",
      btn_switch_light: "종이 모드 (Light)",
      btn_switch_dark: "흑백 반전 (Dark)",
      
      // Language Card
      lang_title: "언어 설정 (Language Selection)",
      lang_desc: "한국어와 영어(English) 다국어 인터페이스를 전환합니다. 모든 광학 단위 및 계산기는 즉시 반영됩니다.",
      lang_current: "현재 언어: 한국어 (Korean)",
      
      // Banners
      banner_dashboard_title: "빔라인 래피드 대시보드 (Quick Dashboard)",
      banner_dashboard_desc: "자주 사용하는 광학 계산기, 물리량 분석기 및 최근 계산 히스토리 바로가기",
      banner_optics_title: "X선 광학 및 회절/투과율 정밀 계산기 (X-ray Optics Suite)",
      banner_optics_desc: "에너지-파장 변환, 브래그 법칙, 회절격자, 복소 굴절률, Chi-Phi 틸트, 임계각 및 Q-space 변환",
      banner_beamline_title: "빔라인 물리량 및 기하학적 파라미터 계산기 (Beamline Suite)",
      banner_beamline_desc: "빔 풋프린트, 광자 플럭스, 단색기/디텍터 분해능, CDI 결맞음 오버샘플링 및 열팽창 보정",
      banner_logbook_title: "빔라인 실험 전자 로그북 (Electronic Logbook)",
      banner_logbook_desc: "실험 조건 수동 기록, 조건 변경 히스토리 스냅샷, 태그 검색 및 CSV/JSON/마크다운 내보내기",
      banner_experiment_title: "실험 및 워크플로우 보조 도구 (Experiment & Workflow)",
      banner_experiment_desc: "실시간 자동 저장 노트, 빔라인 체크리스트, 시료 관리 테이블, DAQ 수집 용량 산출 및 칸반 보드",
      banner_reference_title: "참고 자료 및 결정 격자 DB (Reference & Crystal DB)",
      banner_reference_desc: "다차원 단위 변환기, 주요 결정면(Si, Ge, Diamond, Al2O3, GaAs) d-spacing 데이터베이스 및 시설 링크",
      banner_settings_title: "설정 및 히스토리 관리 (Settings & History)",
      banner_settings_desc: "한영 언어 전환, 테마 설정, 계산 기록 관리, 단축키 안내 및 전체 데이터 백업/복원",
      banner_about_title: "제작자 소개 및 연구 포트폴리오 (About the Creator)",
      banner_about_desc: "연구자 프로필, X선 광학·결맞음 회절 이미징(BCDI) 연구 분야 및 프로젝트 후원",
      
      // Common buttons
      btn_calculate: "계산 실행 (Calculate)",
      btn_reset: "초기화 (Reset)",
      btn_copy: "클립보드 복사",
      btn_download: "다운로드",
      btn_export_csv: "CSV 내보내기",
      btn_export_json: "JSON 내보내기",
      btn_export_md: "마크다운 복사"
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
      
      // Theme
      mode_light: "Paper Mode",
      mode_dark: "Dark Invert",
      mode_current_light: "Current Mode: Paper Light (#fdfcf8)",
      mode_current_dark: "Current Mode: Dark Inverted Ink (#121417)",
      btn_switch_light: "Paper Light",
      btn_switch_dark: "Dark Invert",
      
      // Language Card
      lang_title: "Language Selection (한/영 언어 설정)",
      lang_desc: "Switch between Korean and English interface. All physical calculation units and tools update instantaneously.",
      lang_current: "Current Language: English",
      
      // Banners
      banner_dashboard_title: "Beamline Rapid Dashboard",
      banner_dashboard_desc: "Quick shortcuts to frequent optics calculators, physics estimators, and recent calculation history",
      banner_optics_title: "X-ray Optics & Diffraction Suite",
      banner_optics_desc: "Energy-wavelength conversion, Bragg's law, grating diffraction, complex refractive index, Chi-Phi tilt, critical angle & Q-space",
      banner_beamline_title: "Beamline Physics & Geometric Parameters",
      banner_beamline_desc: "Beam footprint, photon flux, energy/angular resolution, CDI coherent oversampling & thermal expansion shift",
      banner_logbook_title: "Beamline Electronic Logbook",
      banner_logbook_desc: "Manual condition logging, condition snapshot rollback, tag search, and CSV/JSON/Markdown export",
      banner_experiment_title: "Experiment & Workflow Assistant",
      banner_experiment_desc: "Debounced live scratchpad, beamline checklist, sample table, DAQ data rate estimator, and Kanban board",
      banner_reference_title: "Reference & Crystal d-spacing Database",
      banner_reference_desc: "Multi-unit converter, precision crystal d-spacing database (Si, Ge, Diamond, Al2O3, GaAs), and synchrotron links",
      banner_settings_title: "Settings & History Management",
      banner_settings_desc: "Language selection, display theme mode, calculation history archive, shortcuts, and full data backup/restore",
      banner_about_title: "About the Creator & Research Portfolio",
      banner_about_desc: "Researcher biography, X-ray optics & Bragg coherent diffraction imaging (BCDI) domain, and project sponsorship",
      
      // Common buttons
      btn_calculate: "Calculate",
      btn_reset: "Reset",
      btn_copy: "Copy to Clipboard",
      btn_download: "Download",
      btn_export_csv: "Export CSV",
      btn_export_json: "Export JSON",
      btn_export_md: "Copy Markdown"
    }
  };

  var I18n = {
    lang: "ko",
    
    init: function () {
      var savedLang = (window.Storage && window.Storage.get) ? window.Storage.get("lang", "ko") : (localStorage.getItem("bl_toolkit_lang") || "ko");
      this.setLang(savedLang, false);
    },
    
    t: function (key) {
      var currentDict = dict[this.lang] || dict.ko;
      return currentDict[key] || dict.ko[key] || key;
    },
    
    setLang: function (lang, showNotification) {
      if (lang !== "ko" && lang !== "en") lang = "ko";
      this.lang = lang;
      document.documentElement.setAttribute("lang", lang);
      if (window.Storage && window.Storage.set) {
        window.Storage.set("lang", lang);
      } else {
        localStorage.setItem("bl_toolkit_lang", lang);
      }
      
      this.updateDOM();
      
      var langText = document.getElementById("settings-lang-current");
      if (langText) {
        langText.textContent = lang === "en" ? "Current Language: English" : "현재 언어: 한국어 (Korean)";
      }
      
      var langBtn = document.getElementById("btn-lang-toggle");
      if (langBtn) {
        langBtn.textContent = lang === "en" ? "Language: English" : "언어: 한국어";
      }

      if (showNotification && window.showToast) {
        window.showToast(lang === "en" ? "Language switched to English." : "언어가 한국어로 변경되었습니다.", "info");
      }
    },
    
    toggleLang: function () {
      var nextLang = this.lang === "ko" ? "en" : "ko";
      this.setLang(nextLang, true);
    },
    
    updateDOM: function () {
      var elements = document.querySelectorAll("[data-i18n]");
      for (var i = 0; i < elements.length; i++) {
        var el = elements[i];
        var key = el.getAttribute("data-i18n");
        if (key && dict[this.lang] && dict[this.lang][key]) {
          el.textContent = dict[this.lang][key];
        }
      }
    }
  };

  window.i18n = I18n;
})(window);
